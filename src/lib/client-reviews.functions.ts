import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createPublicSupabaseClient } from "@/lib/supabase-public";
import {
  clientReviewSchema,
  REVIEW_PHOTO_MAX_BYTES,
} from "@/lib/client-reviews.schemas";

export type PublicReview = {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  photo_url: string;
  published_at: string;
};

/** Публичное чтение: только опубликованные отзывы, без служебных полей. */
export const listPublishedReviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicReview[]> => {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase.rpc("published_client_reviews");
    if (error) {
      throw new Error(`Не удалось загрузить отзывы: ${error.message}`);
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      location: r.location,
      rating: r.rating,
      text: r.text,
      photo_url: r.photo_path ? `/api/public/photo/${r.photo_path}` : "",
      published_at: r.published_at,
    }));
  },
);

/** Публичная отправка отзыва. Всегда сохраняется со статусом «на модерации». */
export const submitClientReview = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => clientReviewSchema.parse(data))
  .handler(async ({ data }) => {
    const {
      sanitizeReviewText,
      hashIp,
      base64ToBytes,
      notifyTelegramReview,
    } = await import("@/lib/client-reviews.server");

    // 1. Анти-бот: ловушка и слишком быстрое заполнение.
    if ((data.website ?? "").length > 0 || data.elapsedMs < 4000) {
      throw new Error("Не удалось отправить отзыв. Попробуйте ещё раз.");
    }

    const name = sanitizeReviewText(data.name).slice(0, 80);
    const location = sanitizeReviewText(data.location).slice(0, 80);
    const text = sanitizeReviewText(data.text);
    if (name.length < 2 || location.length < 2 || text.length < 30) {
      throw new Error("Проверьте имя, район и текст отзыва.");
    }

    const ip =
      getRequestIP({ xForwardedFor: true }) ??
      getRequestHeader("cf-connecting-ip") ??
      "unknown";
    const ipHash = await hashIp(ip);

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // 2. Ограничение частоты: не более 3 отзывов в час с одного отправителя.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("client_reviews")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if ((count ?? 0) >= 3) {
      throw new Error(
        "Вы уже отправили отзыв. Попробуйте позже — каждый отзыв проверяется вручную.",
      );
    }

    // 3. Фотография — необязательна, только изображения до 5 МБ.
    let photoPath = "";
    if (data.photo) {
      const bytes = base64ToBytes(data.photo.dataBase64);
      if (bytes.byteLength > REVIEW_PHOTO_MAX_BYTES) {
        throw new Error("Фотография больше 5 МБ.");
      }
      const ext =
        data.photo.type === "image/png"
          ? "png"
          : data.photo.type === "image/webp"
            ? "webp"
            : "jpg";
      const path = `reviews/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("projects")
        .upload(path, bytes, { contentType: data.photo.type, upsert: false });
      if (uploadError) {
        console.error("REVIEW_PHOTO_ERROR", uploadError.message);
      } else {
        photoPath = path;
      }
    }

    const { error } = await supabaseAdmin.from("client_reviews").insert({
      name,
      location,
      rating: data.rating,
      text,
      photo_path: photoPath,
      status: "pending",
      consent: true,
      ip_hash: ipHash,
    });
    if (error) throw new Error(error.message);

    await notifyTelegramReview({
      name,
      location,
      rating: data.rating,
      text,
      hasPhoto: Boolean(photoPath),
    });

    return { ok: true };
  });

/** Удаление отзыва администратором вместе с фотографией в хранилище. */
export const deleteClientReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: row } = await supabaseAdmin
      .from("client_reviews")
      .select("photo_path")
      .eq("id", data.id)
      .maybeSingle();

    if (row?.photo_path) {
      await supabaseAdmin.storage.from("projects").remove([row.photo_path]);
    }

    const { error } = await supabaseAdmin
      .from("client_reviews")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

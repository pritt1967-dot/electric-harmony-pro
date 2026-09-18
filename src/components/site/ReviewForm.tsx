import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StarPicker } from "./ReviewStars";
import { submitClientReview } from "@/lib/client-reviews.functions";
import {
  REVIEW_PHOTO_MAX_BYTES,
  REVIEW_PHOTO_TYPES,
} from "@/lib/client-reviews.schemas";

export function ReviewForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const send = useServerFn(submitClientReview);
  const openedAt = useRef(Date.now());
  const [rating, setRating] = useState(5);
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(
    null,
  );
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    setRating(5);
    setPhoto(null);
    setDone(false);
    openedAt.current = Date.now();
  }

  function pickPhoto(file: File | undefined) {
    if (!file) return;
    if (!REVIEW_PHOTO_TYPES.includes(file.type as (typeof REVIEW_PHOTO_TYPES)[number])) {
      toast.error("Можно загрузить только JPEG, PNG или WebP");
      return;
    }
    if (file.size > REVIEW_PHOTO_MAX_BYTES) {
      toast.error("Фотография больше 5 МБ");
      return;
    }
    setPhoto({ file, preview: URL.createObjectURL(file) });
  }

  async function fileToBase64(file: File): Promise<string> {
    const buf = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i += 0x8000) {
      binary += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    }
    return btoa(binary);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const consent = form.get("consent") === "on";
    if (!consent) {
      toast.error("Нужно согласие на публикацию отзыва");
      return;
    }

    setSending(true);
    try {
      await send({
        data: {
          name: String(form.get("name") ?? "").trim(),
          location: String(form.get("location") ?? "").trim(),
          rating,
          text: String(form.get("text") ?? "").trim(),
          consent: true as const,
          website: String(form.get("website") ?? ""),
          elapsedMs: Date.now() - openedAt.current,
          photo: photo
            ? {
                type: photo.file.type as (typeof REVIEW_PHOTO_TYPES)[number],
                dataBase64: await fileToBase64(photo.file),
              }
            : null,
        },
      });
      setDone(true);
    } catch (err) {
      toast.error((err as Error).message || "Не удалось отправить отзыв");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (v) reset();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {done ? (
          <div className="py-6 text-center">
            <DialogHeader>
              <DialogTitle className="text-center">Спасибо!</DialogTitle>
            </DialogHeader>
            <p className="mt-3 text-sm text-muted-foreground">
              Ваш отзыв отправлен на проверку и после модерации появится на
              сайте.
            </p>
            <Button className="mt-6 w-full" onClick={() => onOpenChange(false)}>
              Закрыть
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Оставить отзыв</DialogTitle>
              <DialogDescription>
                Отзыв публикуется после проверки. Телефон и адрес мы не
                показываем на сайте.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="space-y-4">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
              />

              <div className="space-y-1.5">
                <Label htmlFor="rv-name">Имя *</Label>
                <Input id="rv-name" name="name" required minLength={2} maxLength={80} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rv-location">Посёлок / район *</Label>
                <Input
                  id="rv-location"
                  name="location"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Всеволожск, Приморский район…"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Оценка *</Label>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rv-text">Текст отзыва *</Label>
                <Textarea
                  id="rv-text"
                  name="text"
                  required
                  minLength={30}
                  maxLength={2000}
                  rows={5}
                  placeholder="Какие работы выполняли, что понравилось"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Фото работы (необязательно)</Label>
                {photo ? (
                  <div className="relative w-fit">
                    <img
                      src={photo.preview}
                      alt="Выбранное фото"
                      className="h-28 rounded-lg border border-border object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Убрать фото"
                      onClick={() => setPhoto(null)}
                      className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-foreground text-background"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-24 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-brand">
                    <ImagePlus className="size-5" />
                    JPEG, PNG или WebP, до 5 МБ
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => pickPhoto(e.target.files?.[0])}
                    />
                  </label>
                )}
              </div>

              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-1 size-4 accent-[var(--brand,currentColor)]"
                />
                <span className="text-muted-foreground">
                  Согласен на публикацию отзыва на сайте S&amp;M Electric *
                </span>
              </label>

              <Button type="submit" className="w-full" disabled={sending}>
                {sending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Отправить отзыв
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

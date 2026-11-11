import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, RefreshCw, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/browser-client";
import { checkVideoFile, formatBytes, VIDEO_ACCEPT } from "@/lib/work-videos";
import { projectRequestError } from "@/lib/project-request-error";

type ProjectVideo = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  poster_url: string;
  poster_path: string;
  sort_order: number;
};

const rand = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Grabs a frame from the local file as a JPEG poster; null if the browser can't decode it. */
async function makePoster(file: File): Promise<Blob | null> {
  const url = URL.createObjectURL(file);
  try {
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.src = url;
    await new Promise<void>((res, rej) => {
      const t = setTimeout(() => rej(new Error("timeout")), 15000);
      v.onloadeddata = () => {
        v.currentTime = Math.min(1, (v.duration || 2) / 2);
      };
      v.onseeked = () => {
        clearTimeout(t);
        res();
      };
      v.onerror = () => {
        clearTimeout(t);
        rej(new Error("decode"));
      };
    });
    const scale = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(v.videoWidth * scale);
    c.height = Math.round(v.videoHeight * scale);
    const ctx = c.getContext("2d");
    if (!ctx || !c.width) return null;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    return await new Promise((r) => c.toBlob(r, "image/jpeg", 0.8));
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function uploadVideoFiles(projectId: string, file: File) {
  const chk = checkVideoFile(file);
  if (!chk.ok) throw new Error(`${file.name}: ${chk.error}`);
  const path = `${projectId}/${rand()}.${chk.ext}`;
  const up = await supabase.storage
    .from("work-videos")
    .upload(path, file, { contentType: chk.mime, upsert: false });
  if (up.error) throw up.error;
  let poster_url = "";
  let poster_path = "";
  const poster = await makePoster(file);
  if (poster) {
    const p = `${projectId}/video-posters/${rand()}.jpg`;
    const pu = await supabase.storage
      .from("projects")
      .upload(p, poster, { contentType: "image/jpeg", upsert: false });
    if (!pu.error) {
      poster_path = p;
      poster_url = `/api/public/photo/${p}`;
    }
  }
  return { storage_path: path, file_name: file.name, mime_type: chk.mime, size_bytes: file.size, poster_url, poster_path };
}

export function ProjectVideos({ projectId, onChanged }: { projectId: string; onChanged: () => void }) {
  const qc = useQueryClient();
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = useState<ProjectVideo | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const key = ["admin-project-videos", projectId];

  const { data: videos = [] } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_videos")
        .select("id, storage_path, file_name, mime_type, size_bytes, poster_url, poster_path, sort_order")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ProjectVideo[];
    },
  });

  const done = () => {
    qc.invalidateQueries({ queryKey: key });
    onChanged();
  };

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    for (const f of list) {
      const chk = checkVideoFile(f);
      if (!chk.ok) {
        toast.error(`${f.name}: ${chk.error}`);
        if (addRef.current) addRef.current.value = "";
        return;
      }
    }
    try {
      let order = videos.reduce((m, v) => Math.max(m, v.sort_order), 0);
      for (const f of list) {
        setBusy(`${f.name} · ${formatBytes(f.size)}`);
        const meta = await uploadVideoFiles(projectId, f);
        order += 1;
        const ins = await supabase.from("project_videos").insert({ project_id: projectId, sort_order: order, ...meta });
        if (ins.error) {
          await supabase.storage.from("work-videos").remove([meta.storage_path]);
          throw ins.error;
        }
      }
      toast.success("Видео загружено");
    } catch (e) {
      toast.error(projectRequestError(e));
    } finally {
      setBusy(null);
      if (addRef.current) addRef.current.value = "";
      done();
    }
  };

  const replace = async (files: FileList | null) => {
    const f = files?.[0];
    const old = replacing;
    setReplacing(null);
    if (replaceRef.current) replaceRef.current.value = "";
    if (!f || !old) return;
    const chk = checkVideoFile(f);
    if (!chk.ok) return toast.error(chk.error);
    try {
      setBusy(`${f.name} · ${formatBytes(f.size)}`);
      const meta = await uploadVideoFiles(projectId, f);
      const { error } = await supabase.from("project_videos").update(meta).eq("id", old.id);
      if (error) {
        await supabase.storage.from("work-videos").remove([meta.storage_path]);
        throw error;
      }
      await supabase.storage.from("work-videos").remove([old.storage_path]);
      if (old.poster_path) await supabase.storage.from("projects").remove([old.poster_path]);
      toast.success("Видео заменено");
    } catch (e) {
      toast.error(projectRequestError(e));
    } finally {
      setBusy(null);
      done();
    }
  };

  const remove = async (v: ProjectVideo) => {
    if (!confirm(`Удалить видео «${v.file_name}»?`)) return;
    const { error } = await supabase.from("project_videos").delete().eq("id", v.id);
    if (error) return toast.error(error.message);
    await supabase.storage.from("work-videos").remove([v.storage_path]);
    if (v.poster_path) await supabase.storage.from("projects").remove([v.poster_path]);
    toast.success("Видео удалено");
    done();
  };

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <Label className="min-w-0">Видео ({videos.length})</Label>
        <Button type="button" variant="outline" size="sm" className="shrink-0" disabled={!!busy} onClick={() => addRef.current?.click()}>
          {busy ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Video className="mr-1 size-4" />}
          Загрузить видео
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">MP4 (рекомендуется), WebM или MOV, до 100 МБ на файл.</p>
      <input ref={addRef} type="file" accept={VIDEO_ACCEPT} multiple hidden onChange={(e) => add(e.target.files)} />
      <input ref={replaceRef} type="file" accept={VIDEO_ACCEPT} hidden onChange={(e) => replace(e.target.files)} />
      {busy && (
        <div className="mt-2 flex items-center gap-2 rounded-md border p-2 text-xs" role="status">
          <Loader2 className="size-4 animate-spin" /> Загрузка: {busy}
        </div>
      )}
      <div className="mt-3 space-y-2">
        {videos.map((v) => (
          <div key={v.id} className="flex items-center gap-3 rounded-lg border p-2">
            {v.poster_url ? (
              <img src={v.poster_url} alt="" className="h-14 w-24 shrink-0 rounded object-cover" />
            ) : (
              <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded bg-muted">
                <Video className="size-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1 text-sm">
              <div className="truncate font-medium">{v.file_name || "Видео"}</div>
              <div className="text-xs text-muted-foreground">{formatBytes(v.size_bytes)}</div>
            </div>
            <Button variant="ghost" size="icon" aria-label="Заменить видео" disabled={!!busy}
              onClick={() => { setReplacing(v); replaceRef.current?.click(); }}>
              <RefreshCw className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Удалить видео" disabled={!!busy} onClick={() => remove(v)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Removes stored video files and posters of a project before it is deleted. */
export async function removeProjectVideoFiles(projectId: string) {
  const { data } = await supabase.from("project_videos").select("storage_path, poster_path").eq("project_id", projectId);
  const vids = (data ?? []).map((v) => v.storage_path).filter(Boolean);
  const posters = (data ?? []).map((v) => v.poster_path).filter(Boolean);
  if (vids.length) await supabase.storage.from("work-videos").remove(vids);
  if (posters.length) await supabase.storage.from("projects").remove(posters);
}

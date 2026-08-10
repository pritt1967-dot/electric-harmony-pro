import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

type ProjectImage = {
  id: string;
  project_id: string;
  image_url: string;
  storage_path: string;
  caption: string;
  sort_order: number;
};

type Project = {
  id: string;
  title: string;
  description: string;
  location: string;
  work_date: string | null;
  cover_image: string;
  sort_order: number;
  is_published: boolean;
  project_images: ProjectImage[];
};

const MAX_SIDE = 1600;

async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export function ProjectsEditor() {
  const qc = useQueryClient();
  const [dragId, setDragId] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, title, description, location, work_date, cover_image, sort_order, is_published, project_images(id, project_id, image_url, storage_path, caption, sort_order)",
        )
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as Project[]).map((p) => ({
        ...p,
        project_images: [...(p.project_images ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
      }));
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
    qc.invalidateQueries({ queryKey: ["site-data"] });
  };

  const createProject = useMutation({
    mutationFn: async () => {
      const max = projects.reduce((m, p) => Math.max(m, p.sort_order), 0);
      const { error } = await supabase.from("projects").insert({
        title: "Новый объект",
        description: "",
        location: "",
        sort_order: max + 1,
        is_published: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Объект создан");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: async (ordered: Project[]) => {
      await Promise.all(
        ordered.map((p, i) =>
          supabase.from("projects").update({ sort_order: i + 1 }).eq("id", p.id),
        ),
      );
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const move = (id: string, delta: number) => {
    const idx = projects.findIndex((p) => p.id === id);
    const next = idx + delta;
    if (idx < 0 || next < 0 || next >= projects.length) return;
    const copy = [...projects];
    const [item] = copy.splice(idx, 1);
    copy.splice(next, 0, item);
    reorder.mutate(copy);
  };

  const dropOn = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = projects.findIndex((p) => p.id === dragId);
    const to = projects.findIndex((p) => p.id === targetId);
    if (from < 0 || to < 0) return;
    const copy = [...projects];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    setDragId(null);
    reorder.mutate(copy);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Загрузка объектов…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="min-w-0 text-sm text-muted-foreground">
          Перетаскивайте объекты за ручку или используйте стрелки, чтобы изменить
          порядок на сайте.
        </p>
        <Button onClick={() => createProject.mutate()} className="shrink-0">
          <Plus className="mr-1 size-4" /> Объект
        </Button>
      </div>

      {projects.map((project, i) => (
        <div
          key={project.id}
          draggable
          onDragStart={() => setDragId(project.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => dropOn(project.id)}
          className={`rounded-xl border bg-card p-4 ${
            dragId === project.id ? "opacity-60" : ""
          }`}
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
            <GripVertical className="size-5 shrink-0 cursor-grab text-muted-foreground" />
            <p className="min-w-0 truncate font-semibold">{project.title}</p>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => move(project.id, -1)}
                disabled={i === 0}
                aria-label="Выше"
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => move(project.id, 1)}
                disabled={i === projects.length - 1}
                aria-label="Ниже"
              >
                <ArrowDown className="size-4" />
              </Button>
            </div>
          </div>

          <ProjectCard project={project} onChanged={refresh} />
        </div>
      ))}

      {projects.length === 0 && (
        <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          Объектов пока нет. Нажмите «Объект», чтобы добавить первый.
        </p>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  onChanged,
}: {
  project: Project;
  onChanged: () => void;
}) {
  const [form, setForm] = useState({
    title: project.title,
    description: project.description,
    location: project.location,
    work_date: project.work_date ?? "",
    is_published: project.is_published,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const images = useMemo(() => project.project_images, [project.project_images]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("projects")
      .update({
        title: form.title,
        description: form.description,
        location: form.location,
        work_date: form.work_date || null,
        is_published: form.is_published,
      })
      .eq("id", project.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Сохранено");
      onChanged();
    }
  };

  const removeProject = async () => {
    if (!confirm(`Удалить объект «${project.title}» вместе с фото?`)) return;
    const paths = images.map((im) => im.storage_path).filter(Boolean);
    if (paths.length) await supabase.storage.from("projects").remove(paths);
    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Объект удалён");
      onChanged();
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      let order = images.reduce((m, im) => Math.max(m, im.sort_order), 0);
      for (const file of Array.from(files)) {
        const blob = await compressImage(file);
        const path = `${project.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.jpg`;
        const up = await supabase.storage
          .from("projects")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (up.error) throw up.error;
        order += 1;
        const url = `/api/public/photo/${path}`;
        const ins = await supabase.from("project_images").insert({
          project_id: project.id,
          image_url: url,
          storage_path: path,
          sort_order: order,
        });
        if (ins.error) throw ins.error;
        if (!project.cover_image && order === 1) {
          await supabase
            .from("projects")
            .update({ cover_image: url })
            .eq("id", project.id);
        }
      }
      toast.success("Фото загружены");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = async (img: ProjectImage) => {
    if (!confirm("Удалить фото?")) return;
    if (img.storage_path)
      await supabase.storage.from("projects").remove([img.storage_path]);
    const { error } = await supabase.from("project_images").delete().eq("id", img.id);
    if (error) return toast.error(error.message);
    if (project.cover_image === img.image_url) {
      const next = images.find((x) => x.id !== img.id);
      await supabase
        .from("projects")
        .update({ cover_image: next?.image_url ?? "" })
        .eq("id", project.id);
    }
    onChanged();
  };

  const setCover = async (img: ProjectImage) => {
    const { error } = await supabase
      .from("projects")
      .update({ cover_image: img.image_url })
      .eq("id", project.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Главное фото обновлено");
      onChanged();
    }
  };

  const moveImage = async (img: ProjectImage, delta: number) => {
    const idx = images.findIndex((x) => x.id === img.id);
    const next = idx + delta;
    if (next < 0 || next >= images.length) return;
    const copy = [...images];
    const [item] = copy.splice(idx, 1);
    copy.splice(next, 0, item);
    await Promise.all(
      copy.map((x, i) =>
        supabase.from("project_images").update({ sort_order: i + 1 }).eq("id", x.id),
      ),
    );
    onChanged();
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Название</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Локация</Label>
          <Input
            value={form.location}
            placeholder="СПб, Приморский район"
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Дата работ</Label>
          <Input
            type="date"
            value={form.work_date}
            onChange={(e) => setForm({ ...form, work_date: e.target.value })}
          />
        </div>
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_published}
              onCheckedChange={(v) => setForm({ ...form, is_published: v })}
              id={`pub-${project.id}`}
            />
            <Label htmlFor={`pub-${project.id}`} className="flex items-center gap-1.5">
              {form.is_published ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
              {form.is_published ? "Показан на сайте" : "Скрыт"}
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Описание</Label>
        <Textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <Label className="min-w-0">Фотографии ({images.length})</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-1 size-4" />
            )}
            Загрузить
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => upload(e.target.files)}
        />

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <div key={img.id} className="overflow-hidden rounded-lg border">
              <img
                src={img.image_url}
                alt={img.caption || project.title}
                className="aspect-square w-full object-cover"
              />
              <div className="flex items-center justify-between gap-1 p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Сделать главным"
                  onClick={() => setCover(img)}
                >
                  <Star
                    className={`size-4 ${
                      project.cover_image === img.image_url
                        ? "fill-brand text-brand"
                        : ""
                    }`}
                  />
                </Button>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Левее"
                    disabled={i === 0}
                    onClick={() => moveImage(img, -1)}
                  >
                    <ArrowUp className="size-4 -rotate-90" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Правее"
                    disabled={i === images.length - 1}
                    onClick={() => moveImage(img, 1)}
                  >
                    <ArrowDown className="size-4 -rotate-90" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Удалить фото"
                  onClick={() => removeImage(img)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="mr-1 size-4 animate-spin" />} Сохранить
        </Button>
        <Button variant="outline" onClick={removeProject}>
          <Trash2 className="mr-1 size-4" /> Удалить объект
        </Button>
      </div>
    </div>
  );
}

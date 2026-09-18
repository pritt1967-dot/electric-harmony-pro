import { Star } from "lucide-react";

export function ReviewStars({
  value,
  size = 16,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`Оценка ${value} из 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={
            i <= value
              ? "fill-brand text-brand"
              : "text-muted-foreground/40"
          }
          aria-hidden
        />
      ))}
    </span>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`Поставить ${i} из 5`}
          aria-pressed={value === i}
          onClick={() => onChange(i)}
          className="grid size-11 place-items-center rounded-lg border border-border transition-colors hover:border-brand"
        >
          <Star
            className={`size-6 ${i <= value ? "fill-brand text-brand" : "text-muted-foreground/40"}`}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}

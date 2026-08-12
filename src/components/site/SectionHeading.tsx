import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]",
        tone === "light" ? "text-muted-foreground" : "text-ink-muted",
        className,
      )}
    >
      <span className="h-px w-6 bg-brand" aria-hidden />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = "light",
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2
        className={cn(
          "mt-4 text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold leading-[1.08]",
          tone === "dark" && "text-ink-foreground",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed",
            tone === "dark" ? "text-ink-muted" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

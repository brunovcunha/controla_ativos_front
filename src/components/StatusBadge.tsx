import { cn } from "@/lib/utils";
import { STATUS_TONE } from "@/lib/resources";

const tones = {
  success: "bg-success/12 text-success ring-success/25",
  warning: "bg-warning/15 text-warning ring-warning/30",
  info: "bg-info/12 text-info ring-info/25",
  destructive: "bg-destructive/12 text-destructive ring-destructive/25",
  muted: "bg-muted text-muted-foreground ring-border",
};

export function StatusBadge({ value, label }: { value: string; label: string }) {
  const tone = STATUS_TONE[value] ?? "muted";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone])}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

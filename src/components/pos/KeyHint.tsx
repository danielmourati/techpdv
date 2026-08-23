import { cn } from "@/lib/utils";

export function KeyHint({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "rounded border border-current/25 bg-current/10 px-1.5 py-0.5 font-display text-[11px] font-semibold uppercase leading-none tracking-wide",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

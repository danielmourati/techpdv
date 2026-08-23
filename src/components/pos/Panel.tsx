import { cn } from "@/lib/utils";

export function Panel({
  title,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-md border border-border bg-card",
        className,
      )}
    >
      {title && (
        <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-primary px-3 py-2">
          <h2 className="truncate font-display text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground">
            {title}
          </h2>
          {action}
        </header>
      )}
      <div className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}>{children}</div>
    </section>
  );
}

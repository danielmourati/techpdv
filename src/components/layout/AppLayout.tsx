import React, { type ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/pos/AppSidebar";
import { AppTopBar } from "@/components/pos/AppTopBar";

interface AppLayoutProps {
  title: string;
  subtitle?: string | undefined;
  cashTotal?: number;
  showCashPill?: boolean;
  children: ReactNode;
  actions?: ReactNode;
}

export function AppLayout({
  title,
  subtitle,
  cashTotal = 0,
  showCashPill = true,
  children,
  actions,
}: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen max-h-screen w-full overflow-hidden bg-background">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppTopBar
            title={title}
            {...(subtitle ? { store: subtitle } : {})}
            cashTotal={cashTotal}
            showCashPill={showCashPill}
          />

          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
            {actions && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground md:text-sm">{subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">{actions}</div>
              </div>
            )}

            <div className="flex-1">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

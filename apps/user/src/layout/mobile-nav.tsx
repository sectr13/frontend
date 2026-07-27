"use client";
import { Link, useLocation } from "@tanstack/react-router";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslation } from "react-i18next";

const TABS = [
  {
    url: "/dashboard",
    icon: "uil:dashboard",
    labelKey: "menu.dashboard",
    label: "Dashboard",
  },
  {
    url: "/subscribe",
    icon: "lucide:network",
    labelKey: "menu.network",
    label: "Network",
  },
  {
    url: "/amraanet",
    icon: "uil:wifi",
    labelKey: "menu.amraanet",
    label: "AmraaNet",
  },
  {
    url: "/order",
    icon: "uil:receipt",
    labelKey: "menu.order",
    label: "Orders",
  },
  {
    url: "/profile",
    icon: "uil:user-circle",
    labelKey: "menu.profile",
    label: "Account",
  },
] as const;

export function MobileNav() {
  const { t } = useTranslation("components");
  const location = useLocation();

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-50 h-16 border-t bg-card lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-full">
        {TABS.map((tab) => {
          const active = location.pathname === tab.url;
          return (
            <Link
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                active
                  ? "text-orange-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
              key={tab.url}
              to={tab.url}
            >
              <Icon className="h-5 w-5" icon={tab.icon} />
              <span className="text-[10px] leading-none">
                {t(tab.labelKey, tab.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

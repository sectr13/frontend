import { Link, useLocation } from "@tanstack/react-router";
import { Icon } from "@workspace/ui/composed/icon";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";
import { UserNav } from "./user-nav";

export default function Header() {
  const { t } = useTranslation(["components", "main"]);
  const location = useLocation();

  const { common, user } = useGlobalStore();
  const { site } = common;
  const isHomepage = location.pathname === "/";
  const siteName = site.site_name || "Amraa Nets";
  const Logo = (
    <Link className="flex min-w-0 items-center gap-2 font-bold text-lg" to="/">
      {site.site_logo && (
        <img
          alt="logo"
          className="size-9 shrink-0"
          height={36}
          src={site.site_logo}
          width={36}
        />
      )}
      <span className="max-w-36 truncate sm:max-w-none">{siteName}</span>
    </Link>
  );
  return (
    <header
      className={
        isHomepage
          ? "sticky top-0 z-50 border-slate-200 border-b bg-[#F8FAFC]/90 text-slate-950 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100"
          : "sticky top-0 z-50 border-b backdrop-blur-md"
      }
    >
      <div
        className={
          isHomepage
            ? "container flex h-14 items-center justify-between gap-3 sm:h-16"
            : "container flex h-16 items-center justify-between gap-3"
        }
      >
        <nav className="flex min-w-0 items-center font-medium text-lg md:text-sm">
          {Logo}
        </nav>
        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          <LanguageSwitch />
          <ThemeSwitch />
          <UserNav />
          {!user && (
            <>
              {/* Desktop */}
              <Link
                className="hidden h-9 items-center justify-center rounded-xl bg-orange-500 px-4 font-medium text-sm text-white transition-colors duration-150 hover:bg-orange-600 sm:inline-flex"
                to="/auth"
              >
                {t("loginRegister", "Login / Register")}
              </Link>
              {/* Mobile — icon only so it doesn't overflow the header */}
              <Link
                aria-label={t("loginRegister", "Login / Register")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white transition-colors duration-150 hover:bg-orange-600 active:bg-orange-700 sm:hidden"
                to="/auth"
              >
                <Icon className="size-4" icon="uil:user" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

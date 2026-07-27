"use client";

import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";

export default function Footer() {
  const { t } = useTranslation("components");
  const { common } = useGlobalStore();
  const { site } = common;
  const siteName = site.site_name || "Amraa Nets";

  return (
    <footer className="bg-[#F8FAFC] text-slate-500 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-6 border-slate-200 border-t py-5 sm:mx-10 sm:py-6 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <Link
            className="flex min-w-0 shrink-0 items-center justify-center gap-2 font-semibold text-[16px] text-slate-900 leading-none sm:gap-3 sm:text-lg dark:text-slate-100"
            to="/"
          >
            {site.site_logo && (
              <img
                alt="logo"
                className="size-6 shrink-0 sm:size-7"
                height={36}
                src={site.site_logo}
                width={36}
              />
            )}
            <span>{siteName}</span>
          </Link>

          <nav className="flex min-w-0 flex-wrap items-center justify-end gap-x-1.5 gap-y-1 text-right font-normal text-[11px] text-slate-500 leading-none tracking-normal sm:gap-x-2 sm:text-xs dark:text-slate-400">
            <span className="whitespace-nowrap">
              © {new Date().getFullYear()} {siteName}
            </span>
            <span aria-hidden="true">·</span>
            <Link
              className="transition-colors hover:text-slate-700 dark:hover:text-slate-200"
              to="/privacy-policy"
            >
              {t("footer.privacy", "Privacy")}
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              className="transition-colors hover:text-slate-700 dark:hover:text-slate-200"
              to="/tos"
            >
              {t("footer.terms", "Terms")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";
import { Icon } from "@workspace/ui/composed/icon";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";

const PLATFORMS = [
  { label: "macOS", icon: "uil:apple" },
  { label: "Windows", icon: "mdi:microsoft-windows" },
  { label: "Linux", icon: "uil:linux" },
  { label: "iPhone", icon: "simple-icons:ios" },
  { label: "Android", icon: "uil:android" },
] as const;

export function Hero() {
  const { t } = useTranslation("main");
  const { user } = useGlobalStore();

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 pt-14 pb-2 text-center sm:gap-8 sm:pt-20 sm:pb-4"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* eyebrow badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-normal text-[11px] text-slate-600 shadow-sm sm:text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <Icon className="size-3 text-orange-500" icon="uil:link-alt" />
        {t("poweredBy", "Powered by Tailscale & Headscale")}
      </div>

      <h1 className="max-w-3xl font-semibold text-[34px] text-slate-950 leading-[1.12] tracking-tight sm:text-5xl sm:leading-[1.08] lg:text-[56px] dark:text-slate-50">
        {t("heroTitle", "Your devices, one private network.")}
      </h1>

      <p className="max-w-xl text-[14px] text-slate-600 leading-relaxed sm:text-base dark:text-slate-400">
        {t(
          "heroSubtitle",
          "Amraa Nets connects everything you own — securely, anywhere."
        )}
      </p>

      {/* CTAs */}
      <div className="flex w-full flex-row items-stretch justify-center gap-3 sm:w-auto sm:items-center">
        <Link
          className="inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl bg-orange-500 px-3 font-semibold text-sm text-white transition-colors duration-150 hover:bg-orange-600 active:bg-orange-700 sm:h-11 sm:flex-none sm:px-8"
          to={user ? "/dashboard" : "/auth"}
        >
          {t("started", "Get started")}
        </Link>
        <button
          className="inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-950 text-sm transition-colors duration-150 hover:bg-slate-100 sm:h-11 sm:flex-none sm:px-8 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          onClick={() =>
            document
              .getElementById("pricing")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          type="button"
        >
          {t("viewPlans", "View plans")}
        </button>
      </div>

      {/* Platform chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {PLATFORMS.map((p) => (
          <div
            className="flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-[11px] text-slate-600 shadow-sm sm:text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            key={p.label}
          >
            <Icon className="size-3.5" icon={p.icon} />
            {p.label}
          </div>
        ))}
      </div>
    </motion.section>
  );
}

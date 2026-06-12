import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@workspace/ui/components/button";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";

export function Hero() {
  const { t } = useTranslation("main");
  const { common, user } = useGlobalStore();
  const { site } = common;

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-8 pt-20 pb-4 text-center"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-3 py-1 font-medium text-muted-foreground text-xs">
        <Icon className="size-3 text-primary" icon="uil:signal" />
        {site.site_name}
      </div>

      <h1 className="max-w-3xl font-bold text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
        {t("heroTitle", "Private network access, made simple")}
      </h1>

      <p className="max-w-xl text-lg text-muted-foreground">
        {site.site_desc ||
          t(
            "heroSubtitle",
            "Connect your devices to any network, anywhere. Reliable, fast, and easy to set up."
          )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          className={buttonVariants({ size: "lg" })}
          to={user ? "/dashboard" : "/auth"}
        >
          {t("started", "Get Started")}
        </Link>
        <a
          className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          href="#plans"
        >
          {t("viewPlans", "View Plans")}
        </a>
      </div>
    </motion.section>
  );
}

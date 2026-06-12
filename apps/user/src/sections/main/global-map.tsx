import { Icon } from "@workspace/ui/composed/icon";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const COVERAGE_ICONS = [
  "uil:server-network",
  "uil:signal-alt-3",
  "uil:wifi",
  "uil:lock-alt",
] as const;

export function GlobalMap() {
  const { t } = useTranslation("main");

  return (
    <motion.section
      className="relative overflow-hidden rounded-2xl border bg-muted/20 px-8 py-16 text-center"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1 }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.07)_0%,transparent_65%)]"
      />
      <div className="relative flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          {COVERAGE_ICONS.map((icon) => (
            <div
              className="flex size-10 items-center justify-center rounded-xl border bg-background shadow-sm"
              key={icon}
            >
              <Icon className="size-5 text-muted-foreground" icon={icon} />
            </div>
          ))}
        </div>

        <div>
          <h2 className="mb-3 font-bold text-2xl tracking-tight sm:text-3xl">
            {t("global_map_title", "Built for global connectivity")}
          </h2>
          <p className="mx-auto max-w-lg text-base text-muted-foreground">
            {t(
              "global_map_description",
              "Access your network from anywhere with consistent performance and enterprise-grade reliability."
            )}
          </p>
        </div>
      </div>
    </motion.section>
  );
}

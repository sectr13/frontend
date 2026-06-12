import { Icon } from "@workspace/ui/composed/icon";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function Stats() {
  const { t } = useTranslation("main");

  const items = [
    {
      icon: "uil:shield-check",
      name: t("trustSecure", "Secure Access"),
      description: t("trustSecureDesc", "End-to-end encrypted connections"),
    },
    {
      icon: "uil:globe",
      name: t("trustGlobal", "Global Routes"),
      description: t("trustGlobalDesc", "Low-latency worldwide network"),
    },
    {
      icon: "uil:bolt",
      name: t("trustSetup", "Easy Setup"),
      description: t(
        "trustSetupDesc",
        "Connect in minutes, no expertise needed"
      ),
    },
  ];

  return (
    <motion.section
      className="grid grid-cols-1 divide-y divide-muted rounded-xl border bg-muted/30 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {items.map((item) => (
        <div className="flex items-start gap-3 px-6 py-5" key={item.name}>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" icon={item.icon} />
          </div>
          <div>
            <p className="font-semibold text-sm">{item.name}</p>
            <p className="text-muted-foreground text-xs">{item.description}</p>
          </div>
        </div>
      ))}
    </motion.section>
  );
}

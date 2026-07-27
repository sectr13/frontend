import { Icon } from "@workspace/ui/composed/icon";
import { useTranslation } from "react-i18next";

export function Stats() {
  const { t } = useTranslation("main");

  const items = [
    {
      icon: "uil:shield-check",
      name: t("trustSecure", "Secure access"),
      description: t(
        "trustSecureDesc",
        "WireGuard-based encryption between every device. No traffic ever touches a shared relay unencrypted."
      ),
    },
    {
      icon: "uil:globe",
      name: t("trustGlobal", "Global connectivity"),
      description: t(
        "trustGlobalDesc",
        "Reach your devices from Ulaanbaatar, Beijing, or anywhere else — your network follows you."
      ),
    },
    {
      icon: "uil:bolt",
      name: t("trustSetup", "Easy setup"),
      description: t(
        "trustSetupDesc",
        "Install, sign in, done. Your devices find each other automatically."
      ),
    },
  ];

  return (
    <section id="features">
      <h2 className="mb-7 text-center font-bold text-2xl text-slate-950 tracking-tight sm:mb-9 sm:text-[32px] dark:text-slate-50">
        {t("featuresTitle", "Built for every device you own")}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {items.map((item) => (
          <div
            className="rounded-[20px] border border-slate-200 bg-white p-5 text-slate-950 shadow-sm transition-shadow duration-200 hover:shadow-lg sm:p-6 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            key={item.name}
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 sm:mb-4 dark:bg-orange-950/20 dark:text-orange-400">
              <Icon className="size-[22px]" icon={item.icon} />
            </div>
            <h3 className="mb-2 font-semibold text-[17px] leading-snug sm:text-lg">
              {item.name}
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed sm:text-sm dark:text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

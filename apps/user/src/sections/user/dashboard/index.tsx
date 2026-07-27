import { cn } from "@workspace/ui/lib/utils";
import { useTranslation } from "react-i18next";
import Announcement from "../announcement";
import Content from "./content";

export default function Dashboard() {
  const { t, i18n } = useTranslation("dashboard");
  const subtitleSize = i18n.language?.startsWith("mn")
    ? "text-[13px]"
    : "text-sm";

  return (
    <div className="flex min-h-[calc(100vh-64px-58px-32px-114px)] w-full flex-col gap-4 overflow-hidden">
      <div>
        <h1 className="font-bold text-slate-950 text-xl tracking-tight dark:text-slate-50">
          {t("myNetwork", "My Network")}
        </h1>
        <p
          className={cn(
            "mt-0.5 text-slate-500 dark:text-slate-400",
            subtitleSize
          )}
        >
          {t(
            "myNetworkSubtitle",
            "Manage your devices, usage, and active plan."
          )}
        </p>
      </div>
      <Announcement type="pinned" />
      <Content />
    </div>
  );
}

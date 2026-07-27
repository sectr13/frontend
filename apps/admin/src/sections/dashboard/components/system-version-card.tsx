"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Icon } from "@workspace/ui/composed/icon";
import { getVersion, restartSystem } from "@workspace/ui/services/admin/tool";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function SystemVersionCard() {
  const { t } = useTranslation("tool");
  const [openRestart, setOpenRestart] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const { data: versionInfo } = useQuery({
    queryKey: ["amraanet-version"],
    queryFn: async () => {
      const { data } = await getVersion({ skipErrorHandler: true });
      return data.data;
    },
    staleTime: 60_000,
  });

  const rows: { label: string; value: string | undefined }[] = [
    {
      label: t("product", "Product"),
      value: versionInfo?.product ?? "AmraaNet",
    },
    {
      label: t("edition", "Edition"),
      value: versionInfo?.edition ?? "Community Edition",
    },
    { label: t("version", "Version"), value: versionInfo?.version ?? "—" },
    { label: t("build", "Build"), value: versionInfo?.build ?? "—" },
    { label: t("commit", "Commit"), value: versionInfo?.commit ?? "—" },
    {
      label: t("buildTime", "Build Time"),
      value: versionInfo?.build_time ?? "—",
    },
  ];

  return (
    <Card className="gap-0 p-3">
      <CardHeader className="mb-2 p-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-orange-500" icon="uil:wifi" />
            {t("systemVersion", "System Version")}
          </div>
          <AlertDialog onOpenChange={setOpenRestart} open={openRestart}>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                {t("systemReboot", "System Reboot")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("confirmSystemReboot", "Confirm System Reboot")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t(
                    "rebootDescription",
                    "Are you sure you want to reboot the system? This action cannot be undone."
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel", "Cancel")}</AlertDialogCancel>
                <Button
                  disabled={isRestarting}
                  onClick={async () => {
                    setIsRestarting(true);
                    await restartSystem();
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    setIsRestarting(false);
                    setOpenRestart(false);
                  }}
                >
                  {isRestarting && (
                    <Icon className="mr-2 animate-spin" icon="mdi:loading" />
                  )}
                  {isRestarting
                    ? t("rebooting", "Rebooting...")
                    : t("confirmReboot", "Confirm Reboot")}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-0">
        {rows.map((row, i) => (
          <div key={row.label}>
            {i > 0 && <Separator className="my-2" />}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{row.label}</span>
              <Badge className="font-mono text-xs" variant="secondary">
                {row.value}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

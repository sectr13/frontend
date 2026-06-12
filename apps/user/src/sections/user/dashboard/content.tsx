import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { getClient, getStat } from "@workspace/ui/services/common/common";
import {
  queryUserSubscribe,
  resetUserSubscribeToken,
} from "@workspace/ui/services/user/user";
import { differenceInDays, formatDate } from "@workspace/ui/utils/formatting";
import { isBrowser } from "@workspace/ui/utils/index";
import { QRCodeCanvas } from "qrcode.react";
import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { Display } from "@/components/display";
import { useGlobalStore } from "@/stores/global";
import { getPlatform } from "@/utils/common";
import Renewal from "../../subscribe/renewal";
import ResetTraffic from "../../subscribe/reset-traffic";

const PLATFORMS: (keyof API.DownloadLink)[] = [
  "windows",
  "mac",
  "linux",
  "ios",
  "android",
  "harmony",
];

const PLATFORM_ICONS: Record<keyof API.DownloadLink, string> = {
  windows: "mdi:microsoft-windows",
  mac: "uil:apple",
  linux: "uil:linux",
  ios: "simple-icons:ios",
  android: "uil:android",
  harmony: "simple-icons:harmonyos",
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function Content() {
  const { t } = useTranslation("dashboard");

  const {
    data: userSubscribe = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["queryUserSubscribe"],
    queryFn: async () => {
      const { data } = await queryUserSubscribe();
      return data.data?.list || [];
    },
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["getClient"],
    queryFn: async () => {
      const { data } = await getClient();
      return data.data?.list || [];
    },
  });

  const { data: stat } = useQuery({
    queryKey: ["getStat"],
    queryFn: async () => {
      const { data } = await getStat({ skipErrorHandler: true });
      return data.data;
    },
    refetchOnWindowFocus: false,
  });

  const protocols: string[] = stat?.protocol ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  // status 4 = deducted → always hidden
  const visible = userSubscribe.filter((s) => s.status !== 4);

  if (visible.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Icon
              className="h-7 w-7 text-muted-foreground"
              icon="uil:network-chart"
            />
          </div>
          <div className="text-center">
            <p className="font-medium text-base">
              {t("noActiveServices", "No active services")}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {t("noActiveServicesDesc", "Subscribe to get started.")}
            </p>
          </div>
          <Button asChild>
            <Link to="/subscribe">
              {t("purchaseSubscription", "Purchase Subscription")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 font-semibold">
          <Icon className="size-5" icon="uil:servers" />
          {t("mySubscriptions", "My Subscriptions")}
        </h2>
        <Button
          className={isLoading ? "animate-pulse" : ""}
          onClick={() => refetch()}
          size="sm"
          variant="outline"
        >
          <Icon icon="uil:sync" />
        </Button>
      </div>

      {visible.map((item) => (
        <ServiceCard
          applications={applications}
          item={item}
          key={item.id}
          onRefetch={refetch}
          protocols={protocols}
        />
      ))}

      <div className="flex justify-center">
        <Button asChild size="sm" variant="outline">
          <Link to="/subscribe">
            <Icon className="mr-1.5 h-4 w-4" icon="uil:plus" />
            {t("purchaseSubscription", "Purchase Subscription")}
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ServiceCard
// ---------------------------------------------------------------------------

interface ServiceCardProps {
  item: API.UserSubscribe;
  applications: API.SubscribeClient[];
  protocols: string[];
  onRefetch: () => void;
}

function ServiceCard({
  item,
  applications,
  protocols,
  onRefetch,
}: ServiceCardProps) {
  const { t } = useTranslation("dashboard");
  const [subSheetOpen, setSubSheetOpen] = useState(false);

  // status 3 with expire_time 0 means "permanent" — treat as active
  const isActuallyExpired = item.status === 3 && item.expire_time !== 0;
  const isFinished = item.status === 2;
  const isActive =
    item.status === 1 || (item.status === 3 && item.expire_time === 0);
  const isPending = item.status === 0;

  return (
    <Card className={cn({ "opacity-60": isActuallyExpired || isFinished })}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate font-semibold text-base">
              {item.subscribe.name}
            </CardTitle>
            <ExpiryLine expireTime={item.expire_time} />
          </div>
          <StatusBadge expireTime={item.expire_time} status={item.status} />
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 pt-0">
        <TrafficSection
          download={item.download}
          traffic={item.traffic}
          upload={item.upload}
        />

        {/* Primary + secondary actions */}
        {!(isFinished || isActuallyExpired) && (
          <div className="flex flex-wrap gap-2">
            {isActive && (
              <Button onClick={() => setSubSheetOpen(true)} size="sm">
                <Icon className="mr-1.5 h-4 w-4" icon="uil:link" />
                {t("connect", "Connect")}
              </Button>
            )}

            {item.expire_time !== 0 && item.subscribe.sell && (
              <Renewal id={item.id} subscribe={item.subscribe} />
            )}

            {!!item.subscribe.replacement && (
              <ResetTraffic
                id={item.id}
                replacement={item.subscribe.replacement}
              />
            )}

            <MoreMenu id={item.id} onRefetch={onRefetch} />
          </div>
        )}

        {/* Expired — only show renew */}
        {isActuallyExpired && item.expire_time !== 0 && item.subscribe.sell && (
          <Renewal id={item.id} subscribe={item.subscribe} />
        )}

        {isPending && (
          <p className="text-muted-foreground text-sm">
            {t("pendingActivation", "Pending activation")}
          </p>
        )}
      </CardContent>

      <SubURLSheet
        applications={applications}
        item={item}
        onOpenChange={setSubSheetOpen}
        open={subSheetOpen}
        protocols={protocols}
      />
    </Card>
  );
}

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

function StatusBadge({
  status,
  expireTime,
}: {
  status: number;
  expireTime: number;
}) {
  const { t } = useTranslation("dashboard");
  const isActuallyExpired = status === 3 && expireTime !== 0;

  if (status === 0) {
    return (
      <Badge className="shrink-0" variant="outline">
        {t("pending", "Pending")}
      </Badge>
    );
  }
  if (status === 1 || (status === 3 && expireTime === 0)) {
    return (
      <Badge
        className="shrink-0 border-green-600 text-green-600"
        variant="outline"
      >
        {t("active", "Active")}
      </Badge>
    );
  }
  if (status === 2) {
    return (
      <Badge className="shrink-0" variant="secondary">
        {t("finished", "Finished")}
      </Badge>
    );
  }
  if (isActuallyExpired) {
    return (
      <Badge className="shrink-0" variant="destructive">
        {t("expired", "Expired")}
      </Badge>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// ExpiryLine
// ---------------------------------------------------------------------------

function ExpiryLine({ expireTime }: { expireTime: number }) {
  const { t } = useTranslation("dashboard");

  if (!expireTime || expireTime === 0) {
    return (
      <p className="mt-0.5 text-muted-foreground text-xs">
        {t("noExpiry", "No expiry")}
      </p>
    );
  }

  const days = Number(differenceInDays(new Date(expireTime), new Date()));

  if (days <= 0) {
    return (
      <p className="mt-0.5 text-destructive text-xs">
        {t("expired", "Expired")}
      </p>
    );
  }

  if (days <= 7) {
    return (
      <p className="mt-0.5 text-amber-500 text-xs">
        {t("expiringSoon", "Expiring soon")} — {Math.floor(days)}d
      </p>
    );
  }

  if (days <= 30) {
    return (
      <p className="mt-0.5 text-muted-foreground text-xs">
        {t("expiresInDays", "Expires in")} {Math.floor(days)}d
      </p>
    );
  }

  return (
    <p className="mt-0.5 text-muted-foreground text-xs">
      {t("expireAt", "Expires")} {formatDate(expireTime, false)}
    </p>
  );
}

// ---------------------------------------------------------------------------
// TrafficSection
// ---------------------------------------------------------------------------

function TrafficSection({
  upload,
  download,
  traffic,
}: {
  upload: number;
  download: number;
  traffic: number;
}) {
  const { t } = useTranslation("dashboard");
  const used = upload + download;
  const unlimited = !traffic;
  const percent = unlimited
    ? 0
    : Math.min(100, Math.round((used / traffic) * 100));

  const barColor =
    percent >= 90
      ? "bg-destructive"
      : percent >= 70
        ? "bg-amber-500"
        : "bg-primary";

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {t("used", "Traffic")}
        </span>
        <span className="text-muted-foreground text-xs">
          {unlimited ? (
            t("noLimit", "Unlimited")
          ) : (
            <>
              <Display type="traffic" unlimited={false} value={used} />
              {" / "}
              <Display type="traffic" unlimited={false} value={traffic} />
              {" · "}
              {percent}%
            </>
          )}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-primary/20">
        {!unlimited && (
          <div
            className={cn("h-full rounded-full transition-all", barColor)}
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MoreMenu — ··· dropdown for token reset
// ---------------------------------------------------------------------------

function MoreMenu({ id, onRefetch }: { id: number; onRefetch: () => void }) {
  const { t } = useTranslation("dashboard");
  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  return (
    <>
      <DropdownMenu onOpenChange={setOpen} open={open}>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost">
            <Icon className="h-4 w-4" icon="uil:ellipsis-h" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              setOpen(false);
              setAlertOpen(true);
            }}
          >
            <Icon className="mr-2 h-4 w-4" icon="uil:redo" />
            {t("resetSubscription", "Reset Token")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog onOpenChange={setAlertOpen} open={alertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("prompt", "Confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "confirmResetSubscription",
                "Are you sure you want to reset your subscription?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await resetUserSubscribeToken({ user_subscribe_id: id });
                await onRefetch();
                toast.success(t("resetSuccess", "Reset Success"));
                setAlertOpen(false);
              }}
            >
              {t("confirm", "Confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// SubURLSheet — subscription URLs in a bottom sheet
// ---------------------------------------------------------------------------

interface SubURLSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: API.UserSubscribe;
  applications: API.SubscribeClient[];
  protocols: string[];
}

function SubURLSheet({
  open,
  onOpenChange,
  item,
  applications,
  protocols,
}: SubURLSheetProps) {
  const { t } = useTranslation("dashboard");
  const { getUserSubscribe, getAppSubLink } = useGlobalStore();

  const [platform, setPlatform] = useState<keyof API.DownloadLink>(() => {
    const detected = getPlatform();
    return (detected === "macos" ? "mac" : detected) as keyof API.DownloadLink;
  });
  const [protocol, setProtocol] = useState("");

  const availablePlatforms = React.useMemo(() => {
    if (!applications.length) return PLATFORMS;
    const set = new Set<keyof API.DownloadLink>();
    for (const app of applications) {
      for (const p of PLATFORMS) {
        if (app.download_link?.[p]) set.add(p);
      }
    }
    const found = PLATFORMS.filter((p) => set.has(p));
    return found.length > 0 ? found : PLATFORMS;
  }, [applications]);

  const urls = getUserSubscribe(item.short, item.token, protocol) ?? [];

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-4 py-4">
          <DialogTitle className="text-base">
            {t("subscriptionUrl", "Subscription URL")} — {item.subscribe.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Platform selector */}
          {availablePlatforms.length > 0 && (
            <div className="mb-4">
              <Tabs
                onValueChange={(v) => setPlatform(v as keyof API.DownloadLink)}
                value={platform}
              >
                <TabsList className="flex *:flex-auto">
                  {availablePlatforms.map((p) => (
                    <TabsTrigger key={p} value={p}>
                      <Icon className="size-4" icon={PLATFORM_ICONS[p]} />
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Protocol selector */}
          {protocols.length > 1 && (
            <div className="mb-4">
              <Tabs onValueChange={setProtocol} value={protocol}>
                <TabsList className="flex *:flex-auto">
                  {["all", ...protocols].map((p) => (
                    <TabsTrigger
                      className="uppercase"
                      key={p}
                      value={p === "all" ? "" : p}
                    >
                      {p}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* URL blocks */}
          <div className="grid gap-6">
            {urls.map((url, index) => (
              <SubscriptionURLBlock
                applications={applications}
                getAppSubLink={getAppSubLink}
                index={index}
                key={url}
                platform={platform}
                url={url}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// SubscriptionURLBlock — one URL row + app grid + QR
// ---------------------------------------------------------------------------

interface URLBlockProps {
  url: string;
  index: number;
  platform: keyof API.DownloadLink;
  applications: API.SubscribeClient[];
  getAppSubLink: (url: string, schema?: string) => string;
}

function SubscriptionURLBlock({
  url,
  index,
  platform,
  applications,
  getAppSubLink,
}: URLBlockProps) {
  const { t } = useTranslation("dashboard");

  const compatibleApps = applications.filter(
    (app) => !!(app.download_link?.[platform] && app.scheme)
  );

  return (
    <div className="grid gap-3">
      {/* Label + copy */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">
          {t("subscriptionUrl", "Subscription URL")} {index + 1}
        </span>
        <CopyButton
          copiedLabel={t("copied", "Copied!")}
          copyLabel={t("copy", "Copy")}
          text={url}
        />
      </div>

      {/* URL text */}
      <div className="break-all rounded-lg bg-muted px-3 py-2 font-mono text-xs">
        {url}
      </div>

      {/* App grid */}
      {compatibleApps.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {compatibleApps.map((app) => {
            const downloadUrl = app.download_link?.[platform];

            const handleImport = (_: string, result: boolean) => {
              if (!result) return;
              const href = getAppSubLink(url, app.scheme);
              const showManual = () =>
                toast.success(
                  <>
                    <p>{t("copySuccess", "Copy Success")}</p>
                    <br />
                    <p>{t("manualImportMessage", "Please import manually")}</p>
                  </>
                );
              if (isBrowser() && href) {
                window.location.href = href;
                const timer = setTimeout(() => {
                  if (window.location.href !== href) showManual();
                  clearTimeout(timer);
                }, 1000);
                return;
              }
              showManual();
            };

            return (
              <div
                className="flex flex-col items-center gap-1.5 text-center"
                key={app.name}
              >
                {app.icon && (
                  <img
                    alt={app.name}
                    className="h-10 w-10 p-0.5"
                    height={40}
                    src={app.icon}
                    width={40}
                  />
                )}
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {app.name}
                </span>
                <div className="flex w-full gap-1">
                  {downloadUrl && (
                    <Button
                      asChild
                      className={cn(
                        "h-7 flex-1 px-1 text-xs",
                        app.scheme && "rounded-r-none"
                      )}
                      size="sm"
                      variant="secondary"
                    >
                      <a
                        href={downloadUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {t("download", "Download")}
                      </a>
                    </Button>
                  )}
                  {app.scheme && (
                    <CopyToClipboard
                      onCopy={handleImport}
                      text={getAppSubLink(url, app.scheme)}
                    >
                      <Button
                        className={cn(
                          "h-7 flex-1 px-1 text-xs",
                          downloadUrl && "rounded-l-none"
                        )}
                        size="sm"
                      >
                        {t("import", "Import")}
                      </Button>
                    </CopyToClipboard>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR code */}
      <div className="flex flex-col items-center gap-2 py-2">
        <QRCodeCanvas
          bgColor="transparent"
          fgColor="rgb(59, 130, 246)"
          size={120}
          value={url}
        />
        <span className="text-muted-foreground text-xs">
          {t("scanToSubscribe", "Scan to Subscribe")}
        </span>
      </div>
    </div>
  );
}

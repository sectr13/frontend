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
import { Separator } from "@workspace/ui/components/separator";
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
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { Display } from "@/components/display";
import { useGlobalStore } from "@/stores/global";
import { getPlatform } from "@/utils/common";
import Renewal from "../../subscribe/renewal";
import ResetTraffic from "../../subscribe/reset-traffic";

// ---------------------------------------------------------------------------
// Platform display order and icon mapping for SubURLSheet.
// Keys match the DownloadLink fields returned by GET /v1/common/client.
// ---------------------------------------------------------------------------

const PLATFORM_ORDER: Array<keyof API.DownloadLink> = [
  "windows",
  "mac",
  "ios",
  "android",
  "linux",
  "harmony",
];

const PLATFORM_ICONS: Record<keyof API.DownloadLink, string> = {
  windows: "mdi:microsoft-windows",
  mac: "uil:apple",
  ios: "simple-icons:ios",
  android: "uil:android",
  linux: "uil:linux",
  harmony: "simple-icons:harmonyos",
};

// ---------------------------------------------------------------------------
// useDensity — dashboard-only text size helper for Mongolian locale.
// Mongolian Cyrillic is visually denser; slightly smaller body/caption text
// keeps the layout from feeling heavy.
// Matches mn, mn-MN, mn-Cyrl, and any future mn-* variants.
// ---------------------------------------------------------------------------

function useDensity() {
  const { i18n } = useTranslation();
  const mn = i18n.language?.startsWith("mn");
  return {
    body: mn ? "text-[13px]" : "text-sm",
    caption: mn ? "text-[11px]" : "text-xs",
  } as const;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function Content() {
  const { t } = useTranslation("dashboard");
  const d = useDensity();

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
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  // status 4 = deducted → always hidden
  const visible = userSubscribe.filter((s) => s.status !== 4);

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white py-12 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/20">
          <Icon className="h-7 w-7 text-orange-500" icon="lucide:network" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-base text-slate-900 dark:text-slate-100">
            {t("noActiveServices", "No active service")}
          </p>
          <p className={cn("mt-1 text-slate-500 dark:text-slate-400", d.body)}>
            {t(
              "noActiveServicesDesc",
              "Choose a plan and connect all your devices to one private network."
            )}
          </p>
        </div>
        <Button
          asChild
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          <Link to="/subscribe">{t("choosePlan", "Choose a plan")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Services Section */}
      <div className="order-2 flex flex-col gap-4 md:order-1">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            {t("myServices", "My Services")}
          </h2>
          <Button
            className={cn(
              "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",
              isLoading && "animate-pulse"
            )}
            onClick={() => refetch()}
            size="sm"
            variant="ghost"
          >
            <Icon icon="uil:sync" />
          </Button>
        </div>

        {visible.map((item) => (
          <ServiceCard
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

      {/* Quick Actions Section */}
      <div className="order-1 md:order-2">
        <QuickActions />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ServiceCard
// ---------------------------------------------------------------------------

interface ServiceCardProps {
  item: API.UserSubscribe;
  protocols: string[];
  onRefetch: () => void;
}

function ServiceCard({ item, protocols, onRefetch }: ServiceCardProps) {
  const { t } = useTranslation("dashboard");
  const d = useDensity();
  const [subSheetOpen, setSubSheetOpen] = useState(false);

  // status 3 with expire_time 0 means "permanent" — treat as active
  const isActuallyExpired = item.status === 3 && item.expire_time !== 0;
  const isFinished = item.status === 2;
  const isActive =
    item.status === 1 || (item.status === 3 && item.expire_time === 0);
  const isPending = item.status === 0;

  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        { "opacity-60": isActuallyExpired || isFinished }
      )}
    >
      {/* ── Plan name + status ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-base text-slate-900 dark:text-slate-100">
            {item.subscribe.name}
          </h3>
          <ExpiryLine expireTime={item.expire_time} />
        </div>
        <StatusBadge expireTime={item.expire_time} status={item.status} />
      </div>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div className="my-4 border-slate-100 border-t dark:border-slate-800" />

      {/* ── Traffic ────────────────────────────────────────────────────── */}
      <TrafficSection
        download={item.download}
        traffic={item.traffic}
        upload={item.upload}
      />

      {/* ── Actions (active / pending) ─────────────────────────────────── */}
      {!(isFinished || isActuallyExpired) && (
        <div className="mt-5 flex flex-col gap-2">
          {isActive && (
            <Button
              className="w-full bg-orange-500 text-white hover:bg-orange-600"
              onClick={() => setSubSheetOpen(true)}
            >
              <Icon className="mr-2 h-4 w-4" icon="uil:link" />
              {t("connect", "Connect")}
            </Button>
          )}
          <div className="flex items-center gap-1.5">
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
        </div>
      )}

      {/* ── Expired — only show renew ──────────────────────────────────── */}
      {isActuallyExpired && item.expire_time !== 0 && item.subscribe.sell && (
        <div className="mt-4">
          <Renewal id={item.id} subscribe={item.subscribe} />
        </div>
      )}

      {isPending && (
        <p className={cn("mt-4 text-muted-foreground", d.body)}>
          {t("pendingActivation", "Pending activation")}
        </p>
      )}

      <SubURLSheet
        item={item}
        onOpenChange={setSubSheetOpen}
        open={subSheetOpen}
        protocols={protocols}
      />
    </div>
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
  const d = useDensity();

  if (!expireTime || expireTime === 0) {
    return (
      <p className={cn("mt-0.5 text-muted-foreground", d.caption)}>
        {t("noExpiry", "No expiry")}
      </p>
    );
  }

  const days = Number(differenceInDays(new Date(expireTime), new Date()));

  if (days <= 0) {
    return (
      <p className={cn("mt-0.5 text-destructive", d.caption)}>
        {t("expired", "Expired")}
      </p>
    );
  }

  if (days <= 7) {
    return (
      <p className={cn("mt-0.5 text-amber-500", d.caption)}>
        {t("expiringSoon", "Expiring soon")} — {Math.floor(days)}d
      </p>
    );
  }

  if (days <= 30) {
    return (
      <p className={cn("mt-0.5 text-muted-foreground", d.caption)}>
        {t("expiresInDays", "Expires in")} {Math.floor(days)}d
      </p>
    );
  }

  return (
    <p className={cn("mt-0.5 text-muted-foreground", d.caption)}>
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
  const d = useDensity();
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
        : "bg-orange-500";

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-medium text-muted-foreground uppercase tracking-wide",
            d.caption
          )}
        >
          {t("used", "Traffic")}
        </span>
        <span className={cn("text-muted-foreground", d.caption)}>
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
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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
// QuickActions — shortcuts to key app sections
// ---------------------------------------------------------------------------

function QuickActions() {
  const { t } = useTranslation("dashboard");

  const ACTIONS = [
    {
      label: t("openAmraaNet", "AmraaNet"),
      icon: "uil:wifi",
      to: "/amraanet",
      orange: true,
    },
    {
      label: t("viewOrders", "Orders"),
      icon: "uil:receipt",
      to: "/order",
      orange: false,
    },
    {
      label: t("viewWallet", "Wallet"),
      icon: "uil:wallet",
      to: "/wallet",
      orange: false,
    },
    {
      label: t("getSupport", "Support"),
      icon: "uil:headphones",
      to: "/ticket",
      orange: false,
    },
  ];

  return (
    <div className="grid gap-2">
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {t("quickActions", "Quick actions")}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {ACTIONS.map((action) => (
          <Link
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white px-2 py-3 text-center transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800/50"
            key={action.to}
            to={action.to}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                action.orange
                  ? "text-orange-500"
                  : "text-slate-400 dark:text-slate-500"
              )}
              icon={action.icon}
            />
            <span className="text-[11px] text-slate-500 leading-tight dark:text-slate-400">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AppBadge — client app avatar.
// Shows the backend-provided icon image when available; falls back to
// two-letter initials on a neutral badge so unknown apps still look clean.
// ---------------------------------------------------------------------------

function AppBadge({ name, icon }: { name: string; icon?: string }) {
  if (icon) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
        <img
          alt={name}
          className="h-7 w-7 object-contain"
          height={28}
          src={icon}
          width={28}
        />
      </div>
    );
  }
  const initials = name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 font-bold text-slate-700 text-xs dark:bg-slate-700 dark:text-slate-200">
      {initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SubURLSheet — Connect dialog with 3-section onboarding flow
// ---------------------------------------------------------------------------

interface SubURLSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: API.UserSubscribe;
  protocols: string[];
}

function SubURLSheet({
  open,
  onOpenChange,
  item,
  protocols,
}: SubURLSheetProps) {
  const { t } = useTranslation("dashboard");
  const { getUserSubscribe, getAppSubLink } = useGlobalStore();

  // ── Fetch admin-configured client list ─────────────────────────────────
  const { data: clientList = [] } = useQuery({
    queryKey: ["getClient"],
    queryFn: async () => {
      const { data } = await getClient();
      return data.data?.list ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Platform state (detected once on mount) ────────────────────────────
  const [platform, setPlatform] = useState<string>(() => {
    const detected = getPlatform();
    return detected === "macos" ? "mac" : detected;
  });
  const [protocol, setProtocol] = useState("");

  // Platforms that have at least one configured client with a download URL,
  // kept in the canonical display order defined by PLATFORM_ORDER.
  const availablePlatforms = PLATFORM_ORDER.filter((p) =>
    clientList.some((c) => c.download_link?.[p])
  );

  // If the detected platform has no clients, fall back to the first available.
  const activePlatform: keyof API.DownloadLink = availablePlatforms.includes(
    platform as keyof API.DownloadLink
  )
    ? (platform as keyof API.DownloadLink)
    : (availablePlatforms[0] ?? "windows");

  // Clients that ship a download URL for the active platform.
  const apps = clientList.filter((c) => c.download_link?.[activePlatform]);
  // Subset that also carry a URI scheme — shown in the Import section.
  const appsWithImport = apps.filter((c) => !!c.scheme);

  const urls = getUserSubscribe(item.short, item.token, protocol) ?? [];
  const primaryUrl = urls[0] ?? "";

  const handleImport = (app: API.SubscribeClient) => {
    if (!(app.scheme && primaryUrl)) return;
    const importUrl = getAppSubLink(primaryUrl, app.scheme);
    if (isBrowser() && importUrl) {
      window.location.href = importUrl;
      setTimeout(() => {
        toast.info(t("manualImportMessage", "Please import manually"));
      }, 1500);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-4 py-4">
          <DialogTitle className="text-base">
            {t("connect", "Connect")} — {item.subscribe.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Platform tabs — only shown when there are clients to display */}
          {availablePlatforms.length > 0 && (
            <Tabs onValueChange={setPlatform} value={activePlatform}>
              <TabsList className="flex *:flex-auto">
                {availablePlatforms.map((p) => (
                  <TabsTrigger key={p} value={p}>
                    <Icon className="size-4" icon={PLATFORM_ICONS[p]} />
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* Protocol tabs — only shown when server exposes multiple protocols */}
          {protocols.length > 1 && (
            <div className="mt-3">
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

          <div className="mt-5 grid gap-5">
            {/* ── Section 1: Client Apps ──────────────────────────────────── */}
            <div className="grid gap-3">
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                {t("clientApps", "Client Apps")}
              </p>
              {apps.map((app) => (
                <div
                  className="flex items-center justify-between gap-3"
                  key={app.id}
                >
                  <div className="flex items-center gap-3">
                    <AppBadge icon={app.icon} name={app.name} />
                    <span className="font-medium text-sm">{app.name}</span>
                  </div>
                  <Button asChild size="sm" variant="secondary">
                    <a
                      href={app.download_link?.[activePlatform]}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Icon
                        className="mr-1.5 h-3.5 w-3.5"
                        icon="uil:external-link-alt"
                      />
                      {t("download", "Download")}
                    </a>
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            {/* ── Section 2: Import ───────────────────────────────────────── */}
            <div className="grid gap-2">
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                {t("import", "Import")}
              </p>
              {appsWithImport.map((app) => (
                <CopyToClipboard
                  key={app.id}
                  onCopy={(_, result) => {
                    if (result) handleImport(app);
                  }}
                  text={getAppSubLink(primaryUrl, app.scheme!)}
                >
                  <Button
                    className="w-full justify-start gap-2"
                    size="sm"
                    variant="outline"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
                    {t("openIn", "Open in {{name}}", { name: app.name })}
                  </Button>
                </CopyToClipboard>
              ))}
              <CopyButton
                className="w-full justify-start"
                copiedLabel={t("copied", "Copied!")}
                copyLabel={t("copy", "Copy URL")}
                text={primaryUrl}
                variant="outline"
              />
            </div>

            <Separator />

            {/* ── Section 3: QR Code ──────────────────────────────────────── */}
            <div className="grid gap-3">
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                {t("qrCode", "QR Code")}
              </p>
              <div className="flex flex-col items-center gap-2 py-2">
                {primaryUrl && (
                  <QRCodeCanvas
                    bgColor="transparent"
                    fgColor="#F97316"
                    size={148}
                    value={primaryUrl}
                  />
                )}
                <span className="text-muted-foreground text-xs">
                  {t("scanToSubscribe", "Scan to Subscribe")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

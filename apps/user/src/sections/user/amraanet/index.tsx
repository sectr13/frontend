"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import {
  getAmraaNetProfile,
  getUserAmraaNetDevices,
} from "@workspace/ui/services/user/amraanet";
import { formatBytes } from "@workspace/ui/utils/formatting";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { CopyButton } from "@/components/copy-button";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isOnline(lastSeen?: string): boolean {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < 5 * 60 * 1000;
}

function relativeTime(
  dateStr: string | undefined,
  t: (key: string, opts: object) => string
): string {
  if (!dateStr) return "—";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (diffMs < 0) return t("justNow", { defaultValue: "Just now" });
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return t("justNow", { defaultValue: "Just now" });
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60)
    return t("minutesAgo", { n: diffMin, defaultValue: "{{n}}m ago" });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)
    return t("hoursAgo", { n: diffHr, defaultValue: "{{n}}h ago" });
  const diffDays = Math.floor(diffHr / 24);
  return t("daysAgo", { n: diffDays, defaultValue: "{{n}}d ago" });
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AmraaNet() {
  const { t } = useTranslation("amraanet");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["amraanet-profile"],
    queryFn: async () => {
      const res = await getAmraaNetProfile();
      return res.data.data as API.AmraaNetProfile;
    },
  });

  const { data: devicesData, isLoading: devicesLoading } = useQuery({
    queryKey: ["amraanet-devices"],
    enabled: data?.activated === true,
    queryFn: async () => {
      const res = await getUserAmraaNetDevices({ page: 1, size: 50 });
      return res.data.data as API.AmraaNetDevicesResponse;
    },
  });

  if (isLoading) {
    return <AmraaNetSkeleton />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">
            {t(
              "loadError",
              "Failed to load AmraaNet profile. Make sure the service is enabled."
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data.activated) {
    return <NotActivatedView plans={data.plans ?? []} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Credentials card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" icon="uil:wifi" />
            <CardTitle>{t("title", "AmraaNet Service")}</CardTitle>
            <Badge
              className="ml-auto border-green-600 text-green-600"
              variant="outline"
            >
              {t("active", "Active")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <CredentialBlock
            label={t("loginServer", "Login Server")}
            value={data.login_server}
          />

          <Separator />

          <CredentialBlock
            label={t("authKey", "Auth Key")}
            secret
            value={data.auth_key}
          />

          {/* Default Exit Node — shown only if the API returns one */}
          {data.default_exit_node && (
            <>
              <Separator />
              <CredentialBlock
                label={t("defaultExitNode", "Default Exit Node")}
                value={data.default_exit_node}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Platform instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("connectDevice", "Connect Your Device")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="desktop">
            <TabsList className="mb-4">
              <TabsTrigger value="desktop">
                <Icon className="mr-1.5 h-4 w-4" icon="uil:desktop" />
                {t("desktop", "Mac / Linux")}
              </TabsTrigger>
              <TabsTrigger value="windows">
                <Icon className="mr-1.5 h-4 w-4" icon="uil:windows" />
                {t("windows", "Windows")}
              </TabsTrigger>
              <TabsTrigger value="ios">
                <Icon className="mr-1.5 h-4 w-4" icon="uil:apple" />
                iOS
              </TabsTrigger>
              <TabsTrigger value="android">
                <Icon className="mr-1.5 h-4 w-4" icon="uil:android" />
                Android
              </TabsTrigger>
            </TabsList>

            {/* Mac / Linux */}
            <TabsContent className="grid gap-3" value="desktop">
              <p className="text-muted-foreground text-sm">
                {t("desktopStep1", "1. Install Tailscale:")}
              </p>
              <code className="rounded bg-muted px-3 py-2 font-mono text-xs">
                curl -fsSL https://tailscale.com/install.sh | sh
              </code>
              <p className="text-muted-foreground text-sm">
                {t("desktopStep2", "2. Join the network (run once):")}
              </p>
              <DarkCodeBlock code={data.setup_command} />
            </TabsContent>

            {/* Windows */}
            <TabsContent className="grid gap-3" value="windows">
              <p className="text-muted-foreground text-sm">
                {t(
                  "windowsStep1",
                  "1. Download and install Tailscale for Windows from tailscale.com/download"
                )}
              </p>
              <p className="text-muted-foreground text-sm">
                {t(
                  "windowsStep2",
                  "2. Open a Command Prompt or PowerShell as administrator and run:"
                )}
              </p>
              <DarkCodeBlock code={data.setup_command} />
            </TabsContent>

            {/* iOS */}
            <TabsContent className="grid gap-3 text-sm" value="ios">
              <ol className="grid list-inside list-decimal gap-2 text-muted-foreground">
                <li>
                  {t(
                    "iosStep1",
                    "Install the Tailscale app from the App Store."
                  )}
                </li>
                <li>{t("iosStep2", 'Open the app, tap "Add Account".')}</li>
                <li>
                  <p className="mb-2">
                    {t("iosStep3", "Enter custom control server:")}
                  </p>
                  <CredentialBlock
                    label={t("loginServer", "Login Server")}
                    value={data.login_server}
                  />
                </li>
                <li>
                  <p className="mb-2">
                    {t("iosStep4", "When prompted for an auth key, paste:")}
                  </p>
                  <CredentialBlock
                    label={t("authKey", "Auth Key")}
                    secret
                    value={data.auth_key}
                  />
                </li>
              </ol>
            </TabsContent>

            {/* Android */}
            <TabsContent className="grid gap-3 text-sm" value="android">
              <ol className="grid list-inside list-decimal gap-2 text-muted-foreground">
                <li>
                  {t(
                    "androidStep1",
                    "Install the Tailscale app from Google Play."
                  )}
                </li>
                <li>{t("androidStep2", 'Open the app, tap "Add Account".')}</li>
                <li>
                  <p className="mb-2">
                    {t("androidStep3", "Enter custom control server:")}
                  </p>
                  <CredentialBlock
                    label={t("loginServer", "Login Server")}
                    value={data.login_server}
                  />
                </li>
                <li>
                  <p className="mb-2">
                    {t("androidStep4", "When prompted for an auth key, paste:")}
                  </p>
                  <CredentialBlock
                    label={t("authKey", "Auth Key")}
                    secret
                    value={data.auth_key}
                  />
                </li>
              </ol>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* My Devices — always shown when activated */}
      <DeviceSection devices={devicesData?.list} isLoading={devicesLoading} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DeviceSection
// ---------------------------------------------------------------------------

function DeviceSection({
  devices,
  isLoading,
}: {
  devices: API.AmraaNetDevice[] | undefined;
  isLoading: boolean;
}) {
  const { t } = useTranslation("amraanet");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" icon="uil:monitor" />
          <CardTitle className="text-base">
            {t("myDevices", "My Devices")}
          </CardTitle>
          {!isLoading && devices && devices.length > 0 && (
            <Badge className="ml-auto" variant="secondary">
              {devices.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <DeviceCardSkeleton />
            <DeviceCardSkeleton />
          </div>
        ) : !devices || devices.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Icon
                className="h-6 w-6 text-muted-foreground"
                icon="uil:desktop"
              />
            </div>
            <div>
              <p className="font-medium text-sm">
                {t("noDevices", "No devices connected")}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                {t(
                  "noDevicesDesc",
                  "Run the setup command on a device to connect it."
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {devices.map((device) => (
              <DeviceCard device={device} key={device.Id} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// DeviceCard
// ---------------------------------------------------------------------------

function DeviceCard({ device }: { device: API.AmraaNetDevice }) {
  const { t } = useTranslation("amraanet");
  const online = isOnline(device.LastSeen);
  const name = device.GivenName || device.Hostname || "—";
  const showTraffic = device.RxBytes > 0 || device.TxBytes > 0;

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      {/* Top row: status dot + name + IP */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              online ? "bg-green-500" : "bg-muted-foreground/40"
            )}
          />
          <span className="truncate font-medium text-sm">{name}</span>
        </div>
        {device.TailscaleIp && (
          <Badge className="shrink-0 font-mono text-xs" variant="secondary">
            {device.TailscaleIp}
          </Badge>
        )}
      </div>

      {/* Bottom row: last seen + traffic */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-xs",
            online ? "font-medium text-green-600" : "text-muted-foreground"
          )}
        >
          {online
            ? t("online", "Online")
            : relativeTime(
                device.LastSeen,
                t as (key: string, opts: object) => string
              )}
        </span>
        {showTraffic && (
          <span className="shrink-0 font-mono text-muted-foreground text-xs">
            ↓{formatBytes(device.RxBytes) ?? "0 B"} ↑
            {formatBytes(device.TxBytes) ?? "0 B"}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DeviceCardSkeleton
// ---------------------------------------------------------------------------

function DeviceCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NotActivatedView — unchanged logic, kept exactly as before
// ---------------------------------------------------------------------------

function NotActivatedView({ plans }: { plans: API.AmraaNetPlan[] }) {
  const { t } = useTranslation("amraanet");

  return (
    <div className="flex flex-col gap-4">
      {/* Hero explanation card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" icon="uil:wifi" />
            <CardTitle>{t("title", "AmraaNet Service")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <p className="text-muted-foreground text-sm">
            {t(
              "notActivatedDesc",
              "Subscribe to AmraaNet to get a secure VPN powered by Tailscale and Headscale. You will receive a personal auth key and one-command setup for all your devices."
            )}
          </p>
          <ul className="grid gap-1.5 text-muted-foreground text-sm">
            <li className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" icon="uil:check-circle" />
              {t("feature1", "Encrypted mesh VPN — no central relay")}
            </li>
            <li className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" icon="uil:check-circle" />
              {t("feature2", "Works on macOS, Windows, Linux, iOS, Android")}
            </li>
            <li className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" icon="uil:check-circle" />
              {t("feature3", "One-command setup")}
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Plans */}
      {plans.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground text-sm">
              {t(
                "noPlansAvailable",
                "No plans are currently available. Please check back later."
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PlanCard — unchanged logic
// ---------------------------------------------------------------------------

function PlanCard({ plan }: { plan: API.AmraaNetPlan }) {
  const { t } = useTranslation("amraanet");

  const price = (plan.unit_price / 100).toFixed(2);
  const period =
    plan.unit_time === "month"
      ? t("perMonth", "/ month")
      : plan.unit_time === "year"
        ? t("perYear", "/ year")
        : `/ ${plan.unit_time}`;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">{plan.name}</CardTitle>
        {plan.description && (
          <p className="text-muted-foreground text-sm">{plan.description}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="font-semibold text-2xl">
          ${price}
          <span className="ml-1 font-normal text-muted-foreground text-sm">
            {period}
          </span>
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to="/subscribe">{t("subscribeNow", "Subscribe Now")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// CredentialBlock — label + monospace value display + copy (+ optional show/hide)
// ---------------------------------------------------------------------------

function CredentialBlock({
  label,
  value,
  secret = false,
}: {
  label: string;
  value: string | undefined;
  secret?: boolean;
}) {
  const { t } = useTranslation("amraanet");
  const [visible, setVisible] = useState(!secret);

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {label}
        </span>
        <div className="flex items-center gap-1">
          {secret && (
            <Button
              className="gap-1.5"
              onClick={() => setVisible((v) => !v)}
              size="sm"
              variant="ghost"
            >
              <Icon
                className="h-3.5 w-3.5"
                icon={visible ? "uil:eye-slash" : "uil:eye"}
              />
              {visible ? t("hide", "Hide") : t("show", "Show")}
            </Button>
          )}
          <CopyButton
            copiedLabel={t("copied", "Copied!")}
            copyLabel={t("copy", "Copy")}
            text={value ?? ""}
          />
        </div>
      </div>
      <div className="break-all rounded-lg bg-muted px-4 py-3 font-mono text-sm">
        {secret && !visible ? "••••••••••••••••" : (value ?? "—")}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DarkCodeBlock — dark-themed code display for setup commands
// ---------------------------------------------------------------------------

function DarkCodeBlock({ code }: { code: string | undefined }) {
  const { t } = useTranslation("amraanet");
  const [copied, setCopied] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl">
      <div className="flex h-10 items-center justify-between bg-slate-800 px-4">
        <span className="font-mono text-slate-400 text-xs">SHELL</span>
        <CopyToClipboard
          onCopy={() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          text={code ?? ""}
        >
          <button
            className="flex cursor-pointer items-center gap-1.5 text-slate-400 text-xs transition-colors hover:text-slate-200"
            type="button"
          >
            <Icon
              className="h-3.5 w-3.5"
              icon={copied ? "uil:check" : "uil:copy"}
            />
            {copied ? t("copied", "Copied!") : t("copy", "Copy")}
          </button>
        </CopyToClipboard>
      </div>
      <div className="break-all bg-slate-900 px-5 py-4 font-mono text-slate-100 text-sm leading-relaxed">
        {code ?? "—"}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AmraaNetSkeleton — skeleton loading state (replaces full-page spinner)
// ---------------------------------------------------------------------------

function AmraaNetSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Separator />
          <div className="grid gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Separator />
          <div className="grid gap-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

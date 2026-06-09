"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Icon } from "@workspace/ui/composed/icon";
import { getAmraaNetProfile } from "@workspace/ui/services/user/amraanet";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function AmraaNet() {
  const { t } = useTranslation("amraanet");
  const [showKey, setShowKey] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["amraanet-profile"],
    queryFn: async () => {
      const res = await getAmraaNetProfile();
      return res.data.data as API.AmraaNetProfile;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icon
          className="h-8 w-8 animate-spin"
          icon="svg-spinners:ring-resize"
        />
      </div>
    );
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

  return (
    <div className="flex flex-col gap-4">
      {/* Profile card */}
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
          {/* Login Server */}
          <div className="grid gap-1.5">
            <p className="font-medium text-muted-foreground text-sm">
              {t("loginServer", "Login Server")}
            </p>
            <div className="flex items-center gap-2">
              <Input
                className="font-mono text-sm"
                readOnly
                value={data.login_server}
              />
              <CopyToClipboard
                onCopy={() => toast.success(t("copied", "Copied!"))}
                text={data.login_server}
              >
                <Button size="icon" title={t("copy", "Copy")} variant="outline">
                  <Icon className="h-4 w-4" icon="uil:copy" />
                </Button>
              </CopyToClipboard>
            </div>
          </div>

          <Separator />

          {/* Auth Key */}
          <div className="grid gap-1.5">
            <p className="font-medium text-muted-foreground text-sm">
              {t("authKey", "Auth Key")}
            </p>
            <div className="flex items-center gap-2">
              <Input
                className="font-mono text-sm"
                readOnly
                type={showKey ? "text" : "password"}
                value={data.auth_key}
              />
              <Button
                onClick={() => setShowKey((v) => !v)}
                size="icon"
                title={showKey ? t("hide", "Hide") : t("show", "Show")}
                variant="outline"
              >
                <Icon
                  className="h-4 w-4"
                  icon={showKey ? "uil:eye-slash" : "uil:eye"}
                />
              </Button>
              <CopyToClipboard
                onCopy={() => toast.success(t("copied", "Copied!"))}
                text={data.auth_key}
              >
                <Button size="icon" title={t("copy", "Copy")} variant="outline">
                  <Icon className="h-4 w-4" icon="uil:copy" />
                </Button>
              </CopyToClipboard>
            </div>
          </div>

          <Separator />

          {/* Setup command */}
          <div className="grid gap-1.5">
            <p className="font-medium text-muted-foreground text-sm">
              {t("setupCommand", "Setup Command")}
            </p>
            <div className="flex items-center gap-2">
              <Input
                className="font-mono text-xs"
                readOnly
                value={data.setup_command}
              />
              <CopyToClipboard
                onCopy={() => toast.success(t("copied", "Copied!"))}
                text={data.setup_command}
              >
                <Button size="icon" title={t("copy", "Copy")} variant="outline">
                  <Icon className="h-4 w-4" icon="uil:copy" />
                </Button>
              </CopyToClipboard>
            </div>
          </div>
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
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded bg-muted px-3 py-2 font-mono text-xs">
                  {data.setup_command}
                </code>
                <CopyToClipboard
                  onCopy={() => toast.success(t("copied", "Copied!"))}
                  text={data.setup_command}
                >
                  <Button size="icon" variant="outline">
                    <Icon className="h-4 w-4" icon="uil:copy" />
                  </Button>
                </CopyToClipboard>
              </div>
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
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded bg-muted px-3 py-2 font-mono text-xs">
                  {data.setup_command}
                </code>
                <CopyToClipboard
                  onCopy={() => toast.success(t("copied", "Copied!"))}
                  text={data.setup_command}
                >
                  <Button size="icon" variant="outline">
                    <Icon className="h-4 w-4" icon="uil:copy" />
                  </Button>
                </CopyToClipboard>
              </div>
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
                  {t("iosStep3", "Enter custom control server:")}
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-xs">
                      {data.login_server}
                    </code>
                    <CopyToClipboard
                      onCopy={() => toast.success(t("copied", "Copied!"))}
                      text={data.login_server}
                    >
                      <Button size="icon" variant="outline">
                        <Icon className="h-4 w-4" icon="uil:copy" />
                      </Button>
                    </CopyToClipboard>
                  </div>
                </li>
                <li>
                  {t("iosStep4", "When prompted for an auth key, paste:")}
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 break-all rounded bg-muted px-3 py-2 font-mono text-xs">
                      {showKey ? data.auth_key : "••••••••••••"}
                    </code>
                    <Button
                      onClick={() => setShowKey((v) => !v)}
                      size="icon"
                      variant="outline"
                    >
                      <Icon
                        className="h-4 w-4"
                        icon={showKey ? "uil:eye-slash" : "uil:eye"}
                      />
                    </Button>
                    <CopyToClipboard
                      onCopy={() => toast.success(t("copied", "Copied!"))}
                      text={data.auth_key}
                    >
                      <Button size="icon" variant="outline">
                        <Icon className="h-4 w-4" icon="uil:copy" />
                      </Button>
                    </CopyToClipboard>
                  </div>
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
                  {t("androidStep3", "Enter custom control server:")}
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-xs">
                      {data.login_server}
                    </code>
                    <CopyToClipboard
                      onCopy={() => toast.success(t("copied", "Copied!"))}
                      text={data.login_server}
                    >
                      <Button size="icon" variant="outline">
                        <Icon className="h-4 w-4" icon="uil:copy" />
                      </Button>
                    </CopyToClipboard>
                  </div>
                </li>
                <li>
                  {t("androidStep4", "When prompted for an auth key, paste:")}
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 break-all rounded bg-muted px-3 py-2 font-mono text-xs">
                      {showKey ? data.auth_key : "••••••••••••"}
                    </code>
                    <Button
                      onClick={() => setShowKey((v) => !v)}
                      size="icon"
                      variant="outline"
                    >
                      <Icon
                        className="h-4 w-4"
                        icon={showKey ? "uil:eye-slash" : "uil:eye"}
                      />
                    </Button>
                    <CopyToClipboard
                      onCopy={() => toast.success(t("copied", "Copied!"))}
                      text={data.auth_key}
                    >
                      <Button size="icon" variant="outline">
                        <Icon className="h-4 w-4" icon="uil:copy" />
                      </Button>
                    </CopyToClipboard>
                  </div>
                </li>
              </ol>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

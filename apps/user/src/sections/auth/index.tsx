"use client";

import { Link } from "@tanstack/react-router";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";
import EmailAuthForm from "./email/auth-form";
import { OAuthMethods } from "./oauth-methods";
import PhoneAuthForm from "./phone/auth-form";

export default function Main() {
  const { t } = useTranslation("auth");
  const { common } = useGlobalStore();
  const { site, auth } = common;

  const AUTH_METHODS = [
    {
      key: "email",
      enabled: auth.email.enable,
      children: <EmailAuthForm />,
    },
    {
      key: "mobile",
      enabled: auth.mobile.enable,
      children: <PhoneAuthForm />,
    },
  ].filter((method) => method.enabled);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <Link className="mb-8 flex flex-col items-center gap-2" to="/">
          {site.site_logo && (
            <img alt="logo" height={40} src={site.site_logo} width={40} />
          )}
          <span className="font-bold text-xl">{site.site_name}</span>
        </Link>

        <div className="rounded-2xl border bg-background px-8 py-8 shadow-sm">
          <div className="mb-6">
            <h1 className="font-bold text-xl">
              {t("verifyAccount", "Welcome back")}
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              {t(
                "verifyAccountDesc",
                "Sign in or create an account to continue"
              )}
            </p>
          </div>

          {AUTH_METHODS.length === 1
            ? AUTH_METHODS[0]?.children
            : AUTH_METHODS[0] && (
                <Tabs defaultValue={AUTH_METHODS[0].key}>
                  <TabsList className="mb-6 flex w-full *:flex-1">
                    {AUTH_METHODS.map((item) => (
                      <TabsTrigger key={item.key} value={item.key}>
                        {t(`methods.${item.key}`)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {AUTH_METHODS.map((item) => (
                    <TabsContent key={item.key} value={item.key}>
                      {item.children}
                    </TabsContent>
                  ))}
                </Tabs>
              )}

          <div className="mt-6">
            <OAuthMethods />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
            <LanguageSwitch />
            <ThemeSwitch />
          </div>
          <div className="flex gap-3 text-muted-foreground text-xs">
            <Link className="hover:text-foreground" to="/tos">
              {t("tos", "Terms of Service")}
            </Link>
            <span>·</span>
            <Link className="hover:text-foreground" to="/privacy-policy">
              {t("privacyPolicy", "Privacy Policy")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

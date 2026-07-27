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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";
import EmailAuthForm from "./email/auth-form";
import { OAuthMethods } from "./oauth-methods";
import PhoneAuthForm from "./phone/auth-form";

type AuthFormType = "login" | "register" | "reset";

export default function Main() {
  const { t } = useTranslation("auth");
  const { common } = useGlobalStore();
  const { site, auth } = common;
  const siteName = site.site_name || "Amraa Nets";
  const [formType, setFormType] = useState<AuthFormType>("login");

  const authCopy = {
    login: {
      title: t("login.title", "Login"),
      subtitle: t(
        "login.subtitle",
        "Sign in to your Amraa Nets private network"
      ),
    },
    register: {
      title: t("register.title", "Register"),
      subtitle: t(
        "register.subtitle",
        "Create your Amraa Nets account and connect securely"
      ),
    },
    reset: {
      title: t("reset.title", "Reset Password"),
      subtitle: t(
        "reset.subtitle",
        "Enter your email to recover access to your network"
      ),
    },
  } satisfies Record<AuthFormType, { subtitle: string; title: string }>;

  const AUTH_METHODS = [
    {
      key: "email",
      enabled: auth.email.enable,
      children: <EmailAuthForm onTypeChange={setFormType} />,
    },
    {
      key: "mobile",
      enabled: auth.mobile.enable,
      children: <PhoneAuthForm onTypeChange={setFormType} />,
    },
  ].filter((method) => method.enabled);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="flex w-full max-w-[1180px] flex-col items-center gap-12 lg:flex-row lg:items-start lg:pt-10">
        {/* ── Left brand area — transparent, no card ─────────────────── */}
        <section className="hidden flex-1 flex-col gap-7 lg:flex">
          <Link className="flex items-center gap-2.5" to="/">
            {site.site_logo && (
              <img
                alt="logo"
                className="size-9 shrink-0"
                height={36}
                src={site.site_logo}
                width={36}
              />
            )}
            <span className="font-semibold text-slate-950 text-xl dark:text-slate-50">
              {siteName}
            </span>
          </Link>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-medium text-orange-700 text-xs dark:border-orange-500/30 dark:bg-orange-950/20 dark:text-orange-300">
            {t("panel.kicker", "Private Network Service")}
          </span>

          <h2 className="max-w-[460px] font-semibold text-[26px] text-slate-950 leading-snug tracking-tight dark:text-slate-50">
            {t("panel.title", "Secure access for every device you own.")}
          </h2>

          <p className="max-w-[420px] text-slate-600 text-sm leading-6 dark:text-slate-400">
            {t(
              "panel.description",
              "Amraa Nets keeps your devices connected through one clean, private network experience."
            )}
          </p>

          <div className="flex flex-col gap-2.5">
            {[
              t("panel.bullets.secure", "Аюулгүй холболт"),
              t("panel.bullets.access", "Хаанаас ч нэвтрэх"),
              t("panel.bullets.setup", "Хэдхэн минутын тохиргоо"),
            ].map((item) => (
              <div
                className="flex items-center gap-3 text-slate-700 text-sm dark:text-slate-300"
                key={item}
              >
                <span className="size-1.5 rounded-full bg-orange-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Light chips — replaces heavy 3-column footer bar */}
          <div className="flex gap-2">
            {[
              t("panel.footer.secure", "Аюулгүй"),
              t("panel.footer.fast", "Хурдан"),
              t("panel.footer.reliable", "Найдвартай"),
            ].map((item) => (
              <span
                className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 text-xs dark:border-slate-700 dark:text-slate-400"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── Right login card ────────────────────────────────────────── */}
        <div className="w-full max-w-[420px] shrink-0">
          {/* Mobile-only logo */}
          <Link
            className="mb-7 flex items-center justify-center gap-2 lg:hidden"
            to="/"
          >
            {site.site_logo && (
              <img
                alt="logo"
                className="size-8 shrink-0"
                height={32}
                src={site.site_logo}
                width={32}
              />
            )}
            <span className="font-semibold text-slate-950 text-xl dark:text-slate-50">
              {siteName}
            </span>
          </Link>

          {/* Card */}
          <div className="rounded-[24px] border border-slate-200 bg-white px-8 py-9 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 text-center">
              <h1 className="font-semibold text-2xl text-slate-950 tracking-tight dark:text-slate-50">
                {authCopy[formType].title}
              </h1>
              <p className="mt-2 text-slate-600 text-sm dark:text-slate-400">
                {authCopy[formType].subtitle}
              </p>
            </div>

            {AUTH_METHODS.length === 1
              ? AUTH_METHODS[0]?.children
              : AUTH_METHODS[0] && (
                  <Tabs defaultValue={AUTH_METHODS[0].key}>
                    <TabsList className="mb-6 flex h-10 w-full rounded-xl bg-slate-100 p-1 *:flex-1 dark:bg-slate-800">
                      {AUTH_METHODS.map((item) => (
                        <TabsTrigger
                          className="rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-950 dark:text-slate-400 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-50"
                          key={item.key}
                          value={item.key}
                        >
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

          {/* Language / theme + legal links */}
          <div className="mt-6 flex items-center justify-between gap-4 px-1">
            <div className="flex items-center gap-2">
              <LanguageSwitch />
              <ThemeSwitch />
            </div>
            <div className="flex flex-wrap justify-end gap-2 text-slate-500 text-xs dark:text-slate-400">
              <Link
                className="transition-colors hover:text-slate-950 dark:hover:text-slate-100"
                to="/tos"
              >
                {t("tos", "Terms of Service")}
              </Link>
              <span>·</span>
              <Link
                className="transition-colors hover:text-slate-950 dark:hover:text-slate-100"
                to="/privacy-policy"
              >
                {t("privacyPolicy", "Privacy Policy")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

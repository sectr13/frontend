"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { querySubscribeList } from "@workspace/ui/services/user/subscribe";
import { queryUserSubscribe } from "@workspace/ui/services/user/user";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import Purchase from "./purchase";

// ---------------------------------------------------------------------------
// Plan name mapping — 30days / 90days / 365days → friendly Mongolian labels
// Safe: only affects display, backend ID is untouched.
// ---------------------------------------------------------------------------

interface PlanMeta {
  title: (t: (key: string, fallback: string) => string) => string;
  subtitle: (t: (key: string, fallback: string) => string) => string;
  cta: (t: (key: string, fallback: string) => string) => string;
  recommended: boolean;
}

const PLAN_MAP: Record<string, PlanMeta> = {
  "30days": {
    title: (t) => t("monthlyPlan", "Monthly Plan"),
    subtitle: (t) => t("duration30", "30 days"),
    cta: (t) => t("chooseMonthly", "Choose Monthly"),
    recommended: false,
  },
  "90days": {
    title: (t) => t("quarterlyPlan", "Quarterly Plan"),
    subtitle: (t) => t("duration90", "90 days"),
    cta: (t) => t("chooseQuarterly", "Choose Quarterly"),
    recommended: true,
  },
  "365days": {
    title: (t) => t("annualPlan", "Annual Plan"),
    subtitle: (t) => t("duration365", "365 days"),
    cta: (t) => t("chooseAnnual", "Choose Annual"),
    recommended: false,
  },
};

function getPlanMeta(name: string): PlanMeta | null {
  return PLAN_MAP[name] ?? null;
}

// ---------------------------------------------------------------------------
// useDensity — text size helper for Mongolian locale
// ---------------------------------------------------------------------------

function useDensity() {
  const { i18n } = useTranslation();
  const mn = i18n.language?.startsWith("mn");
  return {
    body: mn ? "text-[13px]" : "text-sm",
    caption: mn ? "text-[11px]" : "text-xs",
    subtitle: mn ? "text-[13px]" : "text-sm",
  } as const;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function Subscribe() {
  const { t, i18n } = useTranslation("subscribe");
  const locale = i18n.language;
  const d = useDensity();
  const [subscribe, setSubscribe] = useState<API.Subscribe>();

  const unitTimeMap: Record<string, string> = {
    Day: t("Day", "Day"),
    Hour: t("Hour", "Hour"),
    Minute: t("Minute", "Minute"),
    Month: t("Month", "Month"),
    NoLimit: t("NoLimit", "No Limit"),
    Year: t("Year", "Year"),
  };

  const { data: subscribeList, isLoading: subscribeLoading } = useQuery({
    queryKey: ["querySubscribeList", locale],
    queryFn: async () => {
      const { data } = await querySubscribeList({ language: locale });
      return data.data?.list || [];
    },
  });

  const { data: userSubscriptions } = useQuery({
    queryKey: ["queryUserSubscribe"],
    queryFn: async () => {
      const { data } = await queryUserSubscribe();
      return data.data?.list || [];
    },
  });

  // Preserve: show plan if (1) show is true, or (2) user has already purchased it
  const purchasedPlanIds = new Set(
    userSubscriptions?.map((sub) => sub.subscribe_id) || []
  );
  const filteredData = subscribeList?.filter(
    (item) => item.show || purchasedPlanIds.has(item.id)
  );

  return (
    <>
      <div className="flex min-h-[calc(100vh-64px-58px-32px-114px)] w-full flex-col gap-6">
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 font-medium text-orange-600 text-xs dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
              <Icon className="h-3 w-3" icon="lucide:network" />
              {t("pageBadge", "Amraa Nets Network")}
            </span>
          </div>
          <h1 className="font-medium text-slate-950 text-xl tracking-tight dark:text-slate-50">
            {t("pageTitle", "Choose your plan")}
          </h1>
          <p className={cn("text-slate-500 dark:text-slate-400", d.subtitle)}>
            {t(
              "pageSubtitle",
              "Connect all your devices to one private network with the right plan."
            )}
          </p>
        </div>

        {/* ── Plan grid ──────────────────────────────────────────────── */}
        {subscribeLoading ? (
          <SkeletonGrid />
        ) : filteredData && filteredData.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredData.map((item) => (
              <PlanCard
                d={d}
                item={item}
                key={item.id}
                onSelect={() => setSubscribe(item)}
                t={t}
                unitTimeMap={unitTimeMap}
              />
            ))}
          </div>
        ) : (
          <EmptyPlans d={d} t={t} />
        )}
      </div>

      {/* Purchase modal — unchanged logic */}
      <Purchase setSubscribe={setSubscribe} subscribe={subscribe} />
    </>
  );
}

// ---------------------------------------------------------------------------
// PlanCard
// ---------------------------------------------------------------------------

interface PlanCardProps {
  item: API.Subscribe;
  unitTimeMap: Record<string, string>;
  onSelect: () => void;
  t: (key: string, fallback: string, opts?: Record<string, unknown>) => string;
  d: { body: string; caption: string; subtitle: string };
}

function PlanCard({ item, unitTimeMap, onSelect, t, d }: PlanCardProps) {
  const meta = getPlanMeta(item.name);
  const isRecommended = meta?.recommended ?? false;

  // Price + unit time — preserve exact existing logic
  const hasDiscount = item.discount && item.discount.length > 0;
  const shouldShowOriginal = item.show_original_price !== false;

  const displayPrice =
    shouldShowOriginal || !hasDiscount
      ? item.unit_price
      : Math.round(
          item.unit_price *
            (item.discount?.[0]?.quantity ?? 1) *
            ((item.discount?.[0]?.discount ?? 100) / 100)
        );

  const displayQuantity =
    shouldShowOriginal || !hasDiscount
      ? 1
      : (item.discount?.[0]?.quantity ?? 1);

  const unitTime =
    unitTimeMap[item.unit_time!] ||
    t(item.unit_time || "Month", item.unit_time || "Month");

  // Feature list from parsed description
  let parsedDescription: {
    description: string;
    features: Array<{
      icon: string;
      label: string;
      type: "default" | "success" | "destructive";
    }>;
  } = { description: "", features: [] };
  try {
    parsedDescription = JSON.parse(item.description);
  } catch {
    // keep defaults
  }
  const { description, features } = parsedDescription;

  // Friendly CTA button text
  const ctaLabel = meta ? meta.cta(t) : t("choosePlan", "Choose Plan");

  // Friendly plan title + subtitle
  const planTitle = meta ? meta.title(t) : item.name;
  const planSubtitle = meta ? meta.subtitle(t) : null;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900",
        isRecommended
          ? "border-orange-500 dark:border-orange-500/60"
          : "border-slate-200 dark:border-slate-800"
      )}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-start justify-between gap-2 p-4",
          isRecommended
            ? "bg-orange-50/70 dark:bg-orange-950/10"
            : "bg-slate-50 dark:bg-slate-800/40"
        )}
      >
        <div>
          <p className="font-semibold text-base text-slate-950 leading-tight dark:text-slate-50">
            {planTitle}
          </p>
          {(planSubtitle || description) && (
            <p
              className={cn(
                "mt-0.5 text-slate-500 dark:text-slate-400",
                d.caption
              )}
            >
              {planSubtitle ?? description}
            </p>
          )}
        </div>
        {isRecommended && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-200 bg-orange-100 px-2 py-0.5 text-[10px] text-orange-700 dark:border-orange-500/40 dark:bg-orange-950/30 dark:text-orange-300">
            <Icon className="h-3 w-3" icon="uil:star" />
            {t("recommended", "Most Popular")}
          </span>
        )}
      </div>

      {/* ── Feature list ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        <ul className="flex flex-col gap-2">
          <FeatureRow
            icon="uil:signal"
            label={t("traffic", "Available Traffic")}
            value={<Display type="traffic" unlimited value={item.traffic} />}
          />
          <FeatureRow
            icon="uil:bolt"
            label={t("speed", "Connection Speed")}
            value={
              <Display type="trafficSpeed" unlimited value={item.speed_limit} />
            }
          />
          <FeatureRow
            icon="uil:laptop"
            label={t("devices", "Connected Devices")}
            value={
              <Display type="number" unlimited value={item.device_limit} />
            }
          />
          {features?.map(
            (
              feature: {
                icon: string;
                label: string;
                type: "default" | "success" | "destructive";
              },
              index: number
            ) => (
              <li
                className={cn("flex items-center gap-2", {
                  "text-slate-400 line-through dark:text-slate-500":
                    feature.type === "destructive",
                })}
                key={index}
              >
                {feature.icon ? (
                  <Icon
                    className={cn("h-4 w-4 shrink-0", {
                      "text-orange-500": feature.type === "success",
                      "text-slate-400": feature.type === "default",
                      "text-slate-300 dark:text-slate-600":
                        feature.type === "destructive",
                    })}
                    icon={feature.icon}
                  />
                ) : (
                  <Icon
                    className="h-4 w-4 shrink-0 text-orange-500"
                    icon="uil:check"
                  />
                )}
                <span
                  className={cn(d.body, "text-slate-600 dark:text-slate-400")}
                >
                  {feature.label}
                </span>
              </li>
            )
          )}
        </ul>
      </div>

      {/* ── Separator ──────────────────────────────────────────────────── */}
      <div className="mx-4 border-slate-200 border-t dark:border-slate-800" />

      {/* ── Price + CTA ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4">
        <p className="font-bold text-2xl text-slate-950 tracking-tight dark:text-slate-50">
          <Display type="currency" value={displayPrice} />
          <span
            className={cn(
              "ml-1 font-normal text-slate-500 dark:text-slate-400",
              d.caption
            )}
          >
            {displayQuantity === 1
              ? `/${unitTime}`
              : `/${displayQuantity} ${unitTime}`}
          </span>
        </p>
        <button
          className={cn(
            "h-11 w-full rounded-xl font-medium text-sm transition-colors duration-150",
            isRecommended
              ? "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700"
              : "border border-slate-200 bg-white text-slate-950 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          )}
          onClick={onSelect}
          type="button"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FeatureRow — icon + label + value row inside a plan card
// ---------------------------------------------------------------------------

function FeatureRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-orange-500" icon={icon} />
        <span className="text-slate-600 text-sm dark:text-slate-400">
          {label}
        </span>
      </div>
      <span className="font-medium text-slate-950 text-sm dark:text-slate-50">
        {value}
      </span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// SkeletonGrid — loading state
// ---------------------------------------------------------------------------

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          key={i}
        >
          <div className="flex flex-col gap-3 bg-slate-50 p-4 dark:bg-slate-800/40">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-4 w-3/5 rounded" />
          </div>
          <div className="mx-4 border-slate-200 border-t dark:border-slate-800" />
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-7 w-24 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyPlans — no plans state
// ---------------------------------------------------------------------------

function EmptyPlans({
  t,
  d,
}: {
  t: (key: string, fallback: string) => string;
  d: { body: string; caption: string; subtitle: string };
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
        <Icon className="h-7 w-7 text-orange-500" icon="uil:package" />
      </div>
      <div>
        <p className="font-medium text-slate-900 dark:text-slate-100">
          {t("noPlansTitle", "No plans available")}
        </p>
        <p className={cn("mt-1 text-slate-500 dark:text-slate-400", d.body)}>
          {t(
            "noPlansDescription",
            "Please check back later or contact support."
          )}
        </p>
      </div>
    </div>
  );
}

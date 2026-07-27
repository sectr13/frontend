import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import type { Key, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { SubscribeDetail } from "@/sections/subscribe/detail";
import { useGlobalStore } from "@/stores/global";

interface ProductShowcaseProps {
  subscriptionData: API.Subscribe[];
}

export function Content({ subscriptionData }: ProductShowcaseProps) {
  const { t } = useTranslation("main");
  const { user } = useGlobalStore();

  const unitTimeMap: Record<string, string> = {
    Day: t("Day", "Day"),
    Hour: t("Hour", "Hour"),
    Minute: t("Minute", "Minute"),
    Month: t("Month", "Month"),
    NoLimit: t("NoLimit", "No Limit"),
    Year: t("Year", "Year"),
  };

  return (
    <motion.section
      className="scroll-mt-20"
      id="pricing"
      initial={false}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1 }}
    >
      <motion.h2
        className="mb-7 text-center font-bold text-2xl text-slate-950 tracking-tight sm:mb-9 sm:text-[32px] dark:text-slate-50"
        initial={false}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {t("product_showcase_title", "Simple pricing")}
      </motion.h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {subscriptionData?.map((item, index) => {
          const rawKey = item.name.toLowerCase().replace(/\s/g, "");
          const isHighlighted = rawKey === "365days";

          // Fully localized plan label — never uses English string as display value
          const label = (() => {
            if (rawKey === "30days") return t("planLabel30days", "Monthly");
            if (rawKey === "90days") return t("planLabel90days", "Quarterly");
            if (rawKey === "365days") return t("planLabel365days", "Annual");
            return item.name;
          })();

          const duration = (() => {
            if (rawKey === "30days") return t("planDuration30days", "30 Days");
            if (rawKey === "90days") return t("planDuration90days", "90 Days");
            if (rawKey === "365days")
              return t("planDuration365days", "365 Days");
            return "";
          })();

          const chooseText = (() => {
            if (rawKey === "30days")
              return t("choosePlan30days", "Choose monthly");
            if (rawKey === "90days")
              return t("choosePlan90days", "Choose quarterly");
            if (rawKey === "365days")
              return t("choosePlan365days", "Choose annual");
            return label;
          })();

          return (
            <motion.div
              className="w-full"
              initial={false}
              key={item.id}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Card
                className={cn(
                  "flex flex-col gap-0 overflow-hidden rounded-[20px] border-slate-200 bg-white py-0 text-slate-950 transition-shadow duration-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
                  isHighlighted
                    ? "border-orange-400 shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.1)] dark:border-orange-500 dark:bg-slate-900"
                    : "shadow-sm hover:shadow-lg dark:shadow-none"
                )}
              >
                <CardHeader
                  className={cn(
                    "p-4",
                    isHighlighted
                      ? "bg-orange-50/70 dark:bg-orange-950/10"
                      : "bg-slate-50 dark:bg-slate-800/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-base leading-tight sm:text-lg">
                        {label}
                      </p>
                      {duration && (
                        <p className="mt-0.5 font-normal text-[11px] text-slate-500 sm:text-xs dark:text-slate-500">
                          {duration}
                        </p>
                      )}
                    </div>
                    {isHighlighted && (
                      <Badge className="shrink-0 border-orange-200 bg-orange-100 text-[10px] text-orange-700 sm:text-[11px] dark:border-orange-500/40 dark:bg-orange-950/30 dark:text-orange-300">
                        {t("bestValue", "Best value")}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent
                  className={cn(
                    "flex flex-col gap-3 p-4 [&>div.font-semibold]:uppercase [&>div.font-semibold]:tracking-wide [&>ul]:gap-2",
                    "text-xs sm:text-sm [&>div.font-semibold]:text-[10px] sm:[&>div.font-semibold]:text-xs",
                    "[&>div.font-semibold]:text-slate-950 dark:[&>div.font-semibold]:text-slate-100"
                  )}
                >
                  <ul className="flex flex-col gap-2">
                    {(() => {
                      let parsedDescription: {
                        description: string;
                        features: Array<{
                          icon: string;
                          label: ReactNode;
                          type: "default" | "success" | "destructive";
                        }>;
                      };
                      try {
                        parsedDescription = JSON.parse(item.description);
                      } catch {
                        parsedDescription = { description: "", features: [] };
                      }

                      const { description, features } = parsedDescription;
                      return (
                        <>
                          {description && (
                            <li className="text-slate-600 dark:text-slate-400">
                              {description}
                            </li>
                          )}
                          {features?.map(
                            (
                              feature: {
                                type: string;
                                icon: string;
                                label: ReactNode;
                              },
                              featureIndex: Key
                            ) => (
                              <li
                                className={cn("flex items-center gap-2", {
                                  "text-slate-500 line-through dark:text-slate-500":
                                    feature.type === "destructive",
                                })}
                                key={featureIndex}
                              >
                                {feature.icon && (
                                  <Icon
                                    className={cn("size-4 text-orange-500", {
                                      "text-green-500":
                                        feature.type === "success",
                                      "text-destructive":
                                        feature.type === "destructive",
                                    })}
                                    icon={feature.icon}
                                  />
                                )}
                                {feature.label}
                              </li>
                            )
                          )}
                        </>
                      );
                    })()}
                  </ul>
                  <SubscribeDetail
                    subscribe={{
                      ...item,
                      name: undefined,
                    }}
                  />
                </CardContent>

                <Separator className="bg-slate-200 dark:bg-slate-800" />

                <CardFooter className="flex flex-col items-stretch p-4">
                  {(() => {
                    const hasDiscount =
                      item.discount && item.discount.length > 0;
                    const shouldShowOriginal =
                      item.show_original_price !== false;

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

                    return (
                      <motion.h2
                        animate={{ opacity: 1 }}
                        className="pb-3 font-bold text-2xl tracking-tight"
                        initial={false}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <Display type="currency" value={displayPrice} />
                        <span className="ml-1 font-normal text-slate-500 text-xs tracking-normal sm:text-[13px] dark:text-slate-500">
                          {displayQuantity === 1
                            ? `/${unitTime}`
                            : `/${displayQuantity} ${unitTime}`}
                        </span>
                      </motion.h2>
                    );
                  })()}
                  <motion.div>
                    <Button
                      asChild
                      className={cn(
                        "h-11 w-full rounded-xl font-semibold",
                        "text-xs sm:text-sm",
                        isHighlighted
                          ? "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700"
                          : "border border-slate-200 bg-white text-slate-950 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <Link to={user ? "/subscribe" : "/auth"}>
                        {chooseText}
                      </Link>
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

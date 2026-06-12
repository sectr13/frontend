"use client";

import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { buttonVariants } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import {
  ProList,
  type ProListActions,
} from "@workspace/ui/composed/pro-list/pro-list";
import { cn } from "@workspace/ui/lib/utils";
import { queryOrderList } from "@workspace/ui/services/user/order";
import { formatDate } from "@workspace/ui/utils/formatting";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { EmptyState } from "@/components/empty-state";

function OrderStatusBadge({ status }: { status: number }) {
  const { t } = useTranslation("order");
  const isPositive = status === 2 || status === 5;
  const config: Record<
    number,
    { label: string; variant: "outline" | "secondary" | "destructive" }
  > = {
    1: { label: t("status.1", "Pending"), variant: "outline" },
    2: { label: t("status.2", "Paid"), variant: "outline" },
    3: { label: t("status.3", "Cancelled"), variant: "secondary" },
    4: { label: t("status.4", "Closed"), variant: "secondary" },
    5: { label: t("status.5", "Completed"), variant: "outline" },
  };
  const entry = config[status];
  if (!entry) return null;
  return (
    <Badge
      className={cn(
        "shrink-0",
        isPositive && "border-green-600 text-green-600"
      )}
      variant={entry.variant}
    >
      {entry.label}
    </Badge>
  );
}

export default function Order() {
  const { t } = useTranslation("order");
  const typeMap: Record<number, string> = {
    0: t("type.0", "Type"),
    1: t("type.1", "New Purchase"),
    2: t("type.2", "Renewal"),
    3: t("type.3", "Reset Traffic"),
    4: t("type.4", "Recharge"),
  };

  const ref = useRef<ProListActions>(null);
  return (
    <ProList<API.OrderDetail, Record<string, unknown>>
      action={ref}
      empty={
        <EmptyState
          description={t(
            "noOrdersDesc",
            "Orders will appear here after you make a purchase."
          )}
          icon="uil:receipt"
          title={t("noOrders", "No orders yet")}
        />
      }
      renderItem={(item) => (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <div>
              <p className="text-muted-foreground text-xs">
                {t("orderNo", "Order No")}
              </p>
              <p className="font-medium font-mono text-sm">{item.order_no}</p>
            </div>
            <div className="flex gap-2">
              <Link
                className={buttonVariants({ size: "sm" })}
                key={item.status === 1 ? "payment" : "detail"}
                search={{ order_no: item.order_no }}
                to="/payment"
              >
                {item.status === 1
                  ? t("payment", "Payment")
                  : t("detail", "Detail")}
              </Link>
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="grid grid-cols-2 gap-3 *:flex *:flex-col lg:grid-cols-4">
              <li>
                <span className="text-muted-foreground">
                  {t("name", "Product Name")}
                </span>
                <span>
                  {item.subscribe.name ||
                    typeMap[item.type] ||
                    t(`type.${item.type}`, "Unknown Type")}
                </span>
              </li>
              <li className="font-semibold">
                <span className="text-muted-foreground">
                  {t("paymentAmount", "Amount")}
                </span>
                <span>
                  <Display type="currency" value={item.amount} />
                </span>
              </li>
              <li className="font-semibold">
                <span className="text-muted-foreground">
                  {t("status.0", "Status")}
                </span>
                <OrderStatusBadge status={item.status} />
              </li>
              <li className="font-semibold">
                <span className="text-muted-foreground">
                  {t("createdAt", "Created At")}
                </span>
                <time>{formatDate(item.created_at)}</time>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
      request={async (pagination, filter) => {
        const response = await queryOrderList({ ...pagination, ...filter });
        return {
          list: response.data.data?.list || [],
          total: response.data.data?.total || 0,
        };
      }}
    />
  );
}

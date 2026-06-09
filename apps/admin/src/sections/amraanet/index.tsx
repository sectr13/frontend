import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Icon } from "@workspace/ui/composed/icon";
import {
  ProTable,
  type ProTableActions,
} from "@workspace/ui/composed/pro-table/pro-table";
import {
  getAmraaNetDevices,
  syncAmraaNetDevices,
} from "@workspace/ui/services/admin/amraanet";
import { formatBytes } from "@workspace/ui/utils/formatting";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { formatDate } from "@/utils/common";

export default function AmraaNetDevices() {
  const { t } = useTranslation("amraanet");
  const ref = useRef<ProTableActions>(null);
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await syncAmraaNetDevices();
      const count = res.data.data?.synced ?? 0;
      toast.success(t("syncSuccess", "Synced {{count}} device(s)", { count }));
      ref.current?.refresh();
    } catch {
      toast.error(t("syncError", "Sync failed"));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <ProTable<API.AmraaNetDevice, Record<string, unknown>>
      action={ref}
      header={{
        title: t("devices", "AmraaNet Devices"),
        toolbar: (
          <Button
            disabled={syncing}
            onClick={handleSync}
            size="sm"
            variant="outline"
          >
            <Icon
              className={`mr-1.5 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
              icon={syncing ? "svg-spinners:ring-resize" : "uil:sync"}
            />
            {syncing
              ? t("syncing", "Syncing…")
              : t("syncDevices", "Sync Devices")}
          </Button>
        ),
      }}
      columns={[
        {
          accessorKey: "hostname",
          header: t("hostname", "Hostname"),
          cell: ({ row }) => {
            const d = row.original as API.AmraaNetDevice;
            return (
              <span className="font-medium">
                {d.given_name || d.hostname || "—"}
              </span>
            );
          },
        },
        {
          accessorKey: "user_id",
          header: t("userId", "User ID"),
        },
        {
          accessorKey: "tailscale_ip",
          header: t("tailscaleIp", "Tailscale IP"),
          cell: ({ row }) => {
            const ip = (row.original as API.AmraaNetDevice).tailscale_ip;
            return ip ? (
              <Badge className="font-mono text-xs" variant="secondary">
                {ip}
              </Badge>
            ) : (
              "—"
            );
          },
        },
        {
          accessorKey: "last_seen",
          header: t("lastSeen", "Last Seen"),
          cell: ({ row }) => {
            const d = row.original as API.AmraaNetDevice;
            if (!d.last_seen) return "—";
            return formatDate(new Date(d.last_seen));
          },
        },
        {
          accessorKey: "rx_bytes",
          header: t("rxBytes", "RX"),
          cell: ({ row }) => {
            const v = (row.original as API.AmraaNetDevice).rx_bytes;
            return v ? formatBytes(v) : "0 B";
          },
        },
        {
          accessorKey: "tx_bytes",
          header: t("txBytes", "TX"),
          cell: ({ row }) => {
            const v = (row.original as API.AmraaNetDevice).tx_bytes;
            return v ? formatBytes(v) : "0 B";
          },
        },
      ]}
      request={async (pagination) => {
        const { data } = await getAmraaNetDevices({
          page: pagination.page,
          size: pagination.size,
        });
        return {
          list: data.data?.list || [],
          total: data.data?.total || 0,
        };
      }}
    />
  );
}

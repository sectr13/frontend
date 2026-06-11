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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Icon } from "@workspace/ui/composed/icon";
import {
  ProTable,
  type ProTableActions,
} from "@workspace/ui/composed/pro-table/pro-table";
import {
  deleteAmraaNetDevice,
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
  const [drawer, setDrawer] = useState<API.AmraaNetDevice | null>(null);
  const [deleting, setDeleting] = useState<API.AmraaNetDevice | null>(null);

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

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteAmraaNetDevice(deleting.Id);
      toast.success(t("deleteSuccess", "Device deleted"));
      ref.current?.refresh();
    } catch {
      toast.error(t("deleteError", "Delete failed"));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <ProTable<API.AmraaNetDevice, Record<string, unknown>>
        action={ref}
        columns={[
          {
            accessorKey: "GivenName",
            header: t("hostname", "Hostname"),
            cell: ({ row }) => {
              const d = row.original as API.AmraaNetDevice;
              return (
                <span className="font-medium">
                  {d.GivenName || d.Hostname || "—"}
                </span>
              );
            },
          },
          {
            accessorKey: "UserId",
            header: t("userId", "User ID"),
          },
          {
            accessorKey: "TailscaleIp",
            header: t("tailscaleIp", "Tailscale IP"),
            cell: ({ row }) => {
              const ip = (row.original as API.AmraaNetDevice).TailscaleIp;
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
            accessorKey: "LastSeen",
            header: t("lastSeen", "Last Seen"),
            cell: ({ row }) => {
              const d = row.original as API.AmraaNetDevice;
              if (!d.LastSeen) return "—";
              return formatDate(new Date(d.LastSeen));
            },
          },
          {
            accessorKey: "RxBytes",
            header: t("rxBytes", "RX"),
            cell: ({ row }) => {
              const v = (row.original as API.AmraaNetDevice).RxBytes;
              return v ? formatBytes(v) : "0 B";
            },
          },
          {
            accessorKey: "TxBytes",
            header: t("txBytes", "TX"),
            cell: ({ row }) => {
              const v = (row.original as API.AmraaNetDevice).TxBytes;
              return v ? formatBytes(v) : "0 B";
            },
          },
          {
            id: "actions",
            header: "",
            cell: ({ row }) => {
              const d = row.original as API.AmraaNetDevice;
              return (
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => setDrawer(d)}
                    size="icon"
                    title={t("viewDetails", "View Details")}
                    variant="ghost"
                  >
                    <Icon className="h-4 w-4" icon="uil:info-circle" />
                  </Button>
                  <Button
                    onClick={() => setDeleting(d)}
                    size="icon"
                    title={t("delete", "Delete")}
                    variant="ghost"
                  >
                    <Icon
                      className="h-4 w-4 text-destructive"
                      icon="uil:trash-alt"
                    />
                  </Button>
                </div>
              );
            },
          },
        ]}
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

      {/* Device detail drawer */}
      <Sheet onOpenChange={(open) => !open && setDrawer(null)} open={!!drawer}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {drawer?.GivenName ||
                drawer?.Hostname ||
                t("deviceDetails", "Device Details")}
            </SheetTitle>
          </SheetHeader>
          {drawer && (
            <dl className="mt-4 grid gap-3 text-sm">
              <DetailRow
                label={t("hostname", "Hostname")}
                value={drawer.Hostname}
              />
              <DetailRow
                label={t("givenName", "Given Name")}
                value={drawer.GivenName}
              />
              <DetailRow
                label={t("userId", "User ID")}
                value={String(drawer.UserId)}
              />
              <DetailRow
                label={t("nodeId", "Node ID")}
                value={
                  drawer.HeadscaleNodeId != null
                    ? String(drawer.HeadscaleNodeId)
                    : "—"
                }
              />
              <DetailRow
                label={t("tailscaleIp", "Tailscale IP")}
                mono
                value={drawer.TailscaleIp || "—"}
              />
              <DetailRow
                label={t("machineKey", "Machine Key")}
                mono
                value={drawer.MachineKey || "—"}
              />
              <DetailRow
                label={t("lastSeen", "Last Seen")}
                value={
                  drawer.LastSeen ? formatDate(new Date(drawer.LastSeen)) : "—"
                }
              />
              <DetailRow
                label={t("rxBytes", "RX")}
                value={drawer.RxBytes ? formatBytes(drawer.RxBytes) : "0 B"}
              />
              <DetailRow
                label={t("txBytes", "TX")}
                value={drawer.TxBytes ? formatBytes(drawer.TxBytes) : "0 B"}
              />
            </dl>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog
        onOpenChange={(open) => !open && setDeleting(null)}
        open={!!deleting}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteDevice", "Delete Device")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "deleteDeviceConfirm",
                "This will remove the device from Headscale and the local database. This cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | undefined;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`break-all ${mono ? "font-mono text-xs" : ""}`}>
        {value ?? "—"}
      </dd>
    </div>
  );
}

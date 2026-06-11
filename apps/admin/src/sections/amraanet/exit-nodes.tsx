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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Icon } from "@workspace/ui/composed/icon";
import {
  ProTable,
  type ProTableActions,
} from "@workspace/ui/composed/pro-table/pro-table";
import {
  deleteAmraaNetExitNode,
  getAmraaNetExitNodes,
  upsertAmraaNetExitNode,
} from "@workspace/ui/services/admin/amraanet";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const EMPTY_FORM: API.UpsertExitNodeRequest = {
  name: "",
  region: "",
  country: "",
  hostname: "",
  tailscale_ip: "",
  public_ip: "",
  enabled: true,
  is_default: false,
};

export default function AmraaNetExitNodes() {
  const { t } = useTranslation("amraanet");
  const ref = useRef<ProTableActions>(null);
  const [form, setForm] = useState<
    (API.UpsertExitNodeRequest & { id?: number }) | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<API.AmraaNetExitNode | null>(null);

  function openCreate() {
    setForm({ ...EMPTY_FORM });
  }

  function openEdit(node: API.AmraaNetExitNode) {
    setForm({
      id: node.Id,
      name: node.Name,
      region: node.Region,
      country: node.Country,
      hostname: node.Hostname,
      tailscale_ip: node.TailscaleIp,
      public_ip: node.PublicIp,
      headscale_node_id: node.HeadscaleNodeId,
      enabled: node.Enabled,
      is_default: node.IsDefault,
    });
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      await upsertAmraaNetExitNode(form);
      toast.success(t("exitNodeSaved", "Exit node saved"));
      setForm(null);
      ref.current?.refresh();
    } catch {
      toast.error(t("exitNodeSaveError", "Failed to save exit node"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteAmraaNetExitNode(deleting.Id);
      toast.success(t("exitNodeDeleted", "Exit node deleted"));
      ref.current?.refresh();
    } catch {
      toast.error(t("exitNodeDeleteError", "Failed to delete exit node"));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <ProTable<API.AmraaNetExitNode, Record<string, unknown>>
        action={ref}
        columns={[
          {
            accessorKey: "Name",
            header: t("exitNodeName", "Name"),
            cell: ({ row }) => {
              const n = row.original as API.AmraaNetExitNode;
              return (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{n.Name || "—"}</span>
                  {n.IsDefault && (
                    <Badge className="text-xs" variant="secondary">
                      {t("default", "Default")}
                    </Badge>
                  )}
                </div>
              );
            },
          },
          { accessorKey: "Region", header: t("region", "Region") },
          { accessorKey: "Country", header: t("country", "Country") },
          {
            accessorKey: "TailscaleIp",
            header: t("tailscaleIp", "Tailscale IP"),
            cell: ({ row }) => {
              const ip = (row.original as API.AmraaNetExitNode).TailscaleIp;
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
            accessorKey: "Enabled",
            header: t("enabled", "Enabled"),
            cell: ({ row }) => {
              const enabled = (row.original as API.AmraaNetExitNode).Enabled;
              return enabled ? (
                <Badge
                  className="border-green-600 text-green-600"
                  variant="outline"
                >
                  {t("active", "Active")}
                </Badge>
              ) : (
                <Badge variant="outline">{t("disabled", "Disabled")}</Badge>
              );
            },
          },
          {
            id: "actions",
            header: "",
            cell: ({ row }) => {
              const n = row.original as API.AmraaNetExitNode;
              return (
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => openEdit(n)}
                    size="icon"
                    title={t("edit", "Edit")}
                    variant="ghost"
                  >
                    <Icon className="h-4 w-4" icon="uil:edit" />
                  </Button>
                  <Button
                    onClick={() => setDeleting(n)}
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
          title: t("exitNodes", "Exit Nodes"),
          toolbar: (
            <Button onClick={openCreate} size="sm" variant="outline">
              <Icon className="mr-1.5 h-4 w-4" icon="uil:plus" />
              {t("addExitNode", "Add Exit Node")}
            </Button>
          ),
        }}
        request={async () => {
          const { data } = await getAmraaNetExitNodes();
          const list = data.data?.list || [];
          return { list, total: list.length };
        }}
      />

      {/* Create / Edit dialog */}
      <Dialog onOpenChange={(open) => !open && setForm(null)} open={!!form}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {form?.id
                ? t("editExitNode", "Edit Exit Node")
                : t("addExitNode", "Add Exit Node")}
            </DialogTitle>
          </DialogHeader>
          {form && (
            <div className="grid gap-4 py-2">
              <FormField
                label={t("exitNodeName", "Name")}
                onChange={(v) => setForm({ ...form, name: v })}
                value={form.name}
              />
              <FormField
                label={t("region", "Region")}
                onChange={(v) => setForm({ ...form, region: v })}
                value={form.region}
              />
              <FormField
                label={t("country", "Country")}
                onChange={(v) => setForm({ ...form, country: v })}
                value={form.country}
              />
              <FormField
                label={t("hostname", "Hostname")}
                onChange={(v) => setForm({ ...form, hostname: v })}
                value={form.hostname}
              />
              <FormField
                label={t("tailscaleIp", "Tailscale IP")}
                onChange={(v) => setForm({ ...form, tailscale_ip: v })}
                value={form.tailscale_ip}
              />
              <FormField
                label={t("publicIp", "Public IP")}
                onChange={(v) => setForm({ ...form, public_ip: v })}
                value={form.public_ip}
              />
              <div className="flex items-center justify-between">
                <Label>{t("enabled", "Enabled")}</Label>
                <Switch
                  checked={form.enabled}
                  onCheckedChange={(v) => setForm({ ...form, enabled: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>{t("isDefault", "Default Exit Node")}</Label>
                <Switch
                  checked={form.is_default}
                  onCheckedChange={(v) => setForm({ ...form, is_default: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setForm(null)} variant="outline">
              {t("cancel", "Cancel")}
            </Button>
            <Button disabled={saving} onClick={handleSave}>
              {saving ? (
                <Icon
                  className="mr-1.5 h-4 w-4 animate-spin"
                  icon="svg-spinners:ring-resize"
                />
              ) : null}
              {t("save", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        onOpenChange={(open) => !open && setDeleting(null)}
        open={!!deleting}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteExitNode", "Delete Exit Node")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "deleteExitNodeConfirm",
                "This will permanently remove the exit node. This cannot be undone."
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

function FormField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input onChange={(e) => onChange(e.target.value)} value={value} />
    </div>
  );
}

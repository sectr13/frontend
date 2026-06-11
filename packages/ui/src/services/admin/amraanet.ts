// @ts-nocheck
/* eslint-disable */
import request from "@workspace/ui/lib/request";

/** List AmraaNet devices (admin) GET /v1/admin/amraanet/devices */
export async function getAmraaNetDevices(
  params: { page?: number; size?: number },
  options?: { [key: string]: any }
) {
  return request<API.Response & { data?: API.AmraaNetDevicesResponse }>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/amraanet/devices`,
    {
      method: "GET",
      params: { ...params },
      ...(options || {}),
    }
  );
}

/** Sync AmraaNet devices from Headscale POST /v1/admin/amraanet/devices/sync */
export async function syncAmraaNetDevices(options?: { [key: string]: any }) {
  return request<API.Response & { data?: API.AmraaNetSyncResponse }>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/amraanet/devices/sync`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...(options || {}),
    }
  );
}

/** Delete an AmraaNet device by ID DELETE /v1/admin/amraanet/devices/:id */
export async function deleteAmraaNetDevice(
  id: number,
  options?: { [key: string]: any }
) {
  return request<API.Response>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/amraanet/devices/${id}`,
    {
      method: "DELETE",
      ...(options || {}),
    }
  );
}

/** Force-regenerate AmraaNet auth key for a user POST /v1/admin/amraanet/users/:userId/regenerate */
export async function regenerateAmraaNetAuthKey(
  userId: number,
  options?: { [key: string]: any }
) {
  return request<API.Response>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/amraanet/users/${userId}/regenerate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      ...(options || {}),
    }
  );
}

/** List AmraaNet exit nodes GET /v1/admin/amraanet/exit-nodes */
export async function getAmraaNetExitNodes(options?: { [key: string]: any }) {
  return request<API.Response & { data?: API.AmraaNetExitNodesResponse }>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/amraanet/exit-nodes`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

/** Create or update an AmraaNet exit node POST /v1/admin/amraanet/exit-nodes */
export async function upsertAmraaNetExitNode(
  body: API.UpsertExitNodeRequest,
  options?: { [key: string]: any }
) {
  return request<API.Response & { data?: API.AmraaNetExitNode }>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/amraanet/exit-nodes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: body,
      ...(options || {}),
    }
  );
}

/** Delete an AmraaNet exit node DELETE /v1/admin/amraanet/exit-nodes/:id */
export async function deleteAmraaNetExitNode(
  id: number,
  options?: { [key: string]: any }
) {
  return request<API.Response>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/admin/amraanet/exit-nodes/${id}`,
    {
      method: "DELETE",
      ...(options || {}),
    }
  );
}

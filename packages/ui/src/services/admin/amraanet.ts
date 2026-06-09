// @ts-nocheck
/* eslint-disable */
import request from "@workspace/ui/lib/request";

/** List AmraaNet devices GET /v1/admin/amraanet/devices */
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
      headers: {
        "Content-Type": "application/json",
      },
      ...(options || {}),
    }
  );
}

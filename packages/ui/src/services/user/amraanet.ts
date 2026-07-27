// @ts-nocheck
/* eslint-disable */
import request from "@workspace/ui/lib/request";

/** Get AmraaNet join profile GET /v1/public/amraanet/profile */
export async function getAmraaNetProfile(options?: { [key: string]: any }) {
  return request<API.Response & { data?: API.AmraaNetProfile }>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/amraanet/profile`,
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

/** List the authenticated user's AmraaNet devices GET /v1/public/amraanet/devices */
export async function getUserAmraaNetDevices(
  params: { page?: number; size?: number },
  options?: { [key: string]: any }
) {
  return request<API.Response & { data?: API.AmraaNetDevicesResponse }>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/amraanet/devices`,
    {
      method: "GET",
      params: { ...params },
      ...(options || {}),
    }
  );
}

/** Rename an authenticated user's AmraaNet device PUT /v1/public/amraanet/devices/:id/name */
export async function renameUserAmraaNetDevice(
  id: number,
  customName: string,
  options?: { [key: string]: any }
) {
  return request<API.Response>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/amraanet/devices/${id}/name`,
    {
      method: "PUT",
      data: { custom_name: customName },
      ...(options || {}),
    }
  );
}

/** Delete an authenticated user's AmraaNet device DELETE /v1/public/amraanet/device/:id */
export async function deleteUserAmraaNetDevice(
  id: number,
  options?: { [key: string]: any }
) {
  return request<API.Response>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/amraanet/device/${id}`,
    {
      method: "DELETE",
      ...(options || {}),
    }
  );
}

/** Regenerate a fresh pre-auth key for the authenticated user POST /v1/public/amraanet/authkey/regenerate */
export async function regenerateUserAmraaNetAuthKey(options?: {
  [key: string]: any;
}) {
  return request<API.Response & { data?: API.AmraaNetProfile }>(
    `${import.meta.env.VITE_API_PREFIX || ""}/v1/public/amraanet/authkey/regenerate`,
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

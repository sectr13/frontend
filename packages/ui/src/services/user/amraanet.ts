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

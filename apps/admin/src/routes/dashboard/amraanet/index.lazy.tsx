import { createLazyFileRoute } from "@tanstack/react-router";
import AmraaNetDevices from "@/sections/amraanet";

export const Route = createLazyFileRoute("/dashboard/amraanet/")({
  component: AmraaNetDevices,
});

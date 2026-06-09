import { createLazyFileRoute } from "@tanstack/react-router";

import AmraaNet from "@/sections/user/amraanet";

export const Route = createLazyFileRoute("/(main)/(user)/amraanet")({
  component: AmraaNet,
});

import { createLazyFileRoute } from "@tanstack/react-router";
import AmraaNetExitNodes from "@/sections/amraanet/exit-nodes";

export const Route = createLazyFileRoute("/dashboard/amraanet/exit-nodes")({
  component: AmraaNetExitNodes,
});

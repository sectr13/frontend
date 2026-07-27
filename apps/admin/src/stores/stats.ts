import { create } from "zustand";

// Stats reporting disabled in AmraaNet builds.
export const REQUIRED_HEADER_NAME = "stats";
export const REQUIRED_HEADER_VALUE = "";

interface StatsState {
  loading: boolean;
  loaded: boolean;
  stats: () => Promise<void>;
}

export const useStatsStore = create<StatsState>(() => ({
  loading: false,
  loaded: true,
  stats: async () => {
    // no-op: stats reporting disabled in AmraaNet builds
  },
}));

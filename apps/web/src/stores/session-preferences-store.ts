import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionPreferencesState {
  showSubagentSessions: boolean;
  setShowSubagentSessions: (show: boolean) => void;
  toggleShowSubagentSessions: () => void;
}

export const useSessionPreferencesStore = create<SessionPreferencesState>()(
  persist(
    (set, get) => ({
      showSubagentSessions: true,
      setShowSubagentSessions: (show) => set({ showSubagentSessions: show }),
      toggleShowSubagentSessions: () =>
        set({ showSubagentSessions: !get().showSubagentSessions }),
    }),
    {
      name: "session-preferences",
    },
  ),
);

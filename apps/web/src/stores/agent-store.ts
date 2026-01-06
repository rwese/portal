import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AgentState {
  selectedAgent: string | null;
  isInitialized: boolean;
  setSelectedAgent: (agent: string | null) => void;
  resetAgent: () => void;
}

const DEFAULT_AGENT: string | null = null;

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      selectedAgent: DEFAULT_AGENT,
      isInitialized: true,
      setSelectedAgent: (agent) => {
        // Validate agent name is not empty
        if (agent !== null && agent.trim() === "") {
          agent = null;
        }
        set({ selectedAgent: agent });
      },
      resetAgent: () => {
        set({ selectedAgent: DEFAULT_AGENT });
      },
      getSelectedAgent: () => {
        return get().selectedAgent;
      },
    }),
    {
      name: "opencode-selected-agent",
    },
  ),
);

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { useAgentStore } from "@/stores/agent-store";
import { useAgents } from "@/hooks/use-opencode";
import { getAgentColor } from "@/lib/agent-colors";
import { Loader } from "@/components/ui/loader";

interface AgentData {
  name: string;
  description?: string;
  mode?: string;
}

export function AgentSelect() {
  const { data: agents, isLoading, error } = useAgents() as { data: AgentData[] | undefined; isLoading: boolean; error: Error | undefined };
  const selectedAgent = useAgentStore((s) => s.selectedAgent);
  const setSelectedAgent = useAgentStore((s) => s.setSelectedAgent);

  if (isLoading) {
    return (
      <Select aria-label="Agent" isDisabled>
        <SelectTrigger className="w-56">
          <Loader />
        </SelectTrigger>
      </Select>
    );
  }

  if (error || !agents) {
    return (
      <Select aria-label="Agent" isDisabled>
        <SelectTrigger className="w-56">
          <span className="text-muted-fg">No agents available</span>
        </SelectTrigger>
      </Select>
    );
  }

  // Filter to only show primary agents (mode === "primary" or no mode specified)
  const primaryAgents = agents.filter((agent) => agent.mode === "primary" || !agent.mode);

  if (primaryAgents.length === 0) {
    return (
      <Select aria-label="Agent" isDisabled>
        <SelectTrigger className="w-56">
          <span className="text-muted-fg">No primary agents</span>
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      aria-label="Agent"
      selectedKey={selectedAgent}
      onSelectionChange={(key) => {
        if (key) {
          setSelectedAgent(String(key));
        } else {
          setSelectedAgent(null);
        }
      }}
    >
      <SelectTrigger className="w-56">
        {selectedAgent ? (
          <span 
            className="font-medium"
            style={{ color: `var(${getAgentColor(selectedAgent).var})` }}
          >
            {selectedAgent}
          </span>
        ) : (
          <span className="text-muted-fg">Select agent</span>
        )}
      </SelectTrigger>
      <SelectContent className="max-h-80 overflow-y-auto p-1">
        {primaryAgents.map((agent) => {
          const agentColor = getAgentColor(agent.name);
          return (
            <SelectItem
              key={agent.name}
              id={agent.name}
              textValue={agent.name}
              className="py-3 px-3 rounded-md cursor-pointer hover:bg-overlay/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span 
                  className="font-semibold text-sm"
                  style={{ color: `var(${agentColor.var})` }}
                >
                  {agent.name}
                </span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

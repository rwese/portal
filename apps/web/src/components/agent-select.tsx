import {
  Select,
  SelectItem,
  SelectSection,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { useAgentStore } from "@/stores/agent-store";
import { useAgents } from "@/hooks/use-opencode";
import { getAgentColor } from "@/lib/agent-colors";
import { Loader } from "@/components/ui/loader";

interface AgentData {
  name: string;
  mode?: string;
}

export function AgentSelect() {
  const { data: agents, isLoading, error } = useAgents() as { data: AgentData[] | undefined; isLoading: boolean; error: Error | undefined };
  const selectedAgent = useAgentStore((s) => s.selectedAgent);
  const setSelectedAgent = useAgentStore((s) => s.setSelectedAgent);

  if (isLoading) {
    return (
      <Select aria-label="Agent" isDisabled>
        <SelectTrigger className="w-48">
          <Loader />
        </SelectTrigger>
      </Select>
    );
  }

  if (error || !agents) {
    return (
      <Select aria-label="Agent" isDisabled>
        <SelectTrigger className="w-48">
          <span className="text-muted-fg">No agents</span>
        </SelectTrigger>
      </Select>
    );
  }

  // Group agents by mode for better organization
  const primaryAgents = agents.filter((agent: AgentData) => agent.mode === "primary" || !agent.mode);
  const subAgents = agents.filter((agent: AgentData) => agent.mode === "subagent");
  const otherAgents = agents.filter((agent: AgentData) => agent.mode !== "primary" && agent.mode !== "subagent");

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
      <SelectTrigger className="w-48">
        {selectedAgent ? (
          <span style={{ color: `var(${getAgentColor(selectedAgent).var})` }}>
            {selectedAgent}
          </span>
        ) : (
          <span className="text-muted-fg">Agent</span>
        )}
      </SelectTrigger>
      <SelectContent className="max-h-80 overflow-y-auto">
        {primaryAgents.length > 0 && (
          <SelectSection title="Primary">
            {primaryAgents.map((agent: AgentData) => {
              const agentColor = getAgentColor(agent.name);
              return (
                <SelectItem
                  key={agent.name}
                  id={agent.name}
                  textValue={agent.name}
                >
                  <span style={{ color: `var(${agentColor.var})` }}>
                    {agent.name}
                  </span>
                </SelectItem>
              );
            })}
          </SelectSection>
        )}

        {subAgents.length > 0 && (
          <SelectSection title="Subagents">
            {subAgents.map((agent: AgentData) => {
              const agentColor = getAgentColor(agent.name);
              return (
                <SelectItem
                  key={agent.name}
                  id={agent.name}
                  textValue={agent.name}
                >
                  <span style={{ color: `var(${agentColor.var})` }}>
                    {agent.name}
                  </span>
                </SelectItem>
              );
            })}
          </SelectSection>
        )}

        {otherAgents.length > 0 && (
          <SelectSection title="Other">
            {otherAgents.map((agent: AgentData) => {
              const agentColor = getAgentColor(agent.name);
              return (
                <SelectItem
                  key={agent.name}
                  id={agent.name}
                  textValue={agent.name}
                >
                  <span style={{ color: `var(${agentColor.var})` }}>
                    {agent.name}
                  </span>
                </SelectItem>
              );
            })}
          </SelectSection>
        )}
      </SelectContent>
    </Select>
  );
}

import { Checkbox } from "@/components/ui/checkbox";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";

interface SessionFilterProps {
  className?: string;
}

export function SessionFilter({ className }: SessionFilterProps) {
  const { showSubagentSessions, setShowSubagentSessions } = useSessionPreferencesStore();

  return (
    <Checkbox
      className={className}
      isSelected={showSubagentSessions}
      onChange={(e) => setShowSubagentSessions(e.target.checked)}
    >
      Show subagent sessions
    </Checkbox>
  );
}

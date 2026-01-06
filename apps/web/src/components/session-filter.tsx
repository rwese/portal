import { Checkbox } from "@/components/ui/checkbox";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";

interface SessionFilterProps {
  className?: string;
}

export function SessionFilter({ className }: SessionFilterProps) {
  const { showSubagentSessions, setShowSubagentSessions } = useSessionPreferencesStore();

  return (
    <div className={className}>
      <Checkbox
        isSelected={showSubagentSessions}
        onChange={(isSelected) => setShowSubagentSessions(isSelected)}
      >
        Show subagent sessions
      </Checkbox>
    </div>
  );
}

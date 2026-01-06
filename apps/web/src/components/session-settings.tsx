import { Checkbox } from "@/components/ui/checkbox";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";

export function SessionSettings() {
  const { showSubagentSessions, setShowSubagentSessions } = useSessionPreferencesStore();

  return (
    <div className="space-y-3">
      <Checkbox
        isSelected={showSubagentSessions}
        onChange={(isSelected) => setShowSubagentSessions(isSelected)}
      >
        Show subagent sessions
      </Checkbox>
      <p className="text-xs text-muted-fg pl-6">
        When enabled, sessions created by AI subagents will be visible in the sidebar.
      </p>
    </div>
  );
}

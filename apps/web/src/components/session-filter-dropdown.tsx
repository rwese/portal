import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { useSessionPreferencesStore } from "@/stores/session-preferences-store";
import { FunnelIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

export function SessionFilterDropdown() {
  const { showSubagentSessions, setShowSubagentSessions } = useSessionPreferencesStore();

  return (
    <Menu>
      <MenuTrigger
        aria-label="Session filter"
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-fg hover:bg-muted hover:text-fg transition-colors"
      >
        <FunnelIcon className="size-4" />
        <span className="flex-1 text-left">Filter</span>
        <span className="text-xs text-muted-fg">
          {showSubagentSessions ? "All" : "User only"}
        </span>
      </MenuTrigger>
      <MenuContent
        placement="bottom end"
        className="min-w-[180px]"
      >
        <MenuItem
          onAction={() => setShowSubagentSessions(true)}
          intent={showSubagentSessions ? "primary" : "default"}
        >
          {showSubagentSessions && <CheckIcon className="size-4 mr-2" />}
          Show all sessions
        </MenuItem>
        <MenuItem
          onAction={() => setShowSubagentSessions(false)}
          intent={!showSubagentSessions ? "primary" : "default"}
        >
          {!showSubagentSessions && <CheckIcon className="size-4 mr-2" />}
          Show user sessions only
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

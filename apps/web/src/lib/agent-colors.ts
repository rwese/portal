/**
 * Agent color utility providing deterministic color assignment for agents.
 * Based on OpenChamber's proven implementation pattern.
 */

interface AgentColorEntry {
  var: string;      // CSS variable name (e.g., '--color-success')
  class: string;    // CSS class name (e.g., 'agent-success')
}

/**
 * Color palette for agents using portal's existing semantic CSS variables.
 * The 'build' agent always gets the first color (success/green).
 * Other agents are assigned colors deterministically based on their name hash.
 */
const AGENT_COLOR_PALETTE: AgentColorEntry[] = [
  { var: '--color-success', class: 'agent-success' },      // build agent (always)
  { var: '--color-primary', class: 'agent-primary' },
  { var: '--color-info', class: 'agent-info' },
  { var: '--color-warning', class: 'agent-warning' },
  { var: '--color-secondary', class: 'agent-secondary' },
  { var: '--color-muted', class: 'agent-muted' },
  { var: '--color-border', class: 'agent-border' },
  { var: '--color-danger', class: 'agent-danger' },
];

/**
 * Get the color entry for a given agent name.
 * Uses deterministic hashing to ensure the same agent always gets the same color.
 * 
 * @param agentName - The name of the agent (e.g., 'build', 'plan', 'explore')
 * @returns AgentColorEntry with CSS variable and class name
 */
export function getAgentColor(agentName: string | undefined): AgentColorEntry {
  if (!agentName) {
    return AGENT_COLOR_PALETTE[0]!; // Default to success color
  }

  // Special case: 'build' agent always gets success color
  if (agentName.toLowerCase() === 'build') {
    return AGENT_COLOR_PALETTE[0]!;
  }

  // Generate hash from agent name for deterministic color assignment
  let hash = 0;
  for (let i = 0; i < agentName.length; i++) {
    const char = agentName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Select color from palette (skip index 0 since it's reserved for 'build')
  const maxIndex = AGENT_COLOR_PALETTE.length - 1;
  const paletteIndex = 1 + (Math.abs(hash) % maxIndex);
  
  // Ensure index is within bounds with explicit fallback
  const safeIndex = Math.min(Math.max(paletteIndex, 1), maxIndex);
  return AGENT_COLOR_PALETTE[safeIndex] ?? AGENT_COLOR_PALETTE[1]!;
}

/**
 * Get the full color palette for agents.
 * Useful for debugging or generating CSS dynamically.
 * 
 * @returns Array of all color entries in the palette
 */
export function getAgentColorPalette(): AgentColorEntry[] {
  return AGENT_COLOR_PALETTE;
}

/**
 * Generate inline styles for agent-colored elements.
 * Provides a convenient way to apply agent colors directly.
 * 
 * @param agentName - The name of the agent
 * @returns Object with color and backgroundColor styles
 */
export function getAgentColorStyles(agentName: string | undefined) {
  const colorEntry = getAgentColor(agentName);
  return {
    color: `var(${colorEntry.var})`,
    backgroundColor: `rgb(from var(${colorEntry.var}) r g b / 0.1)`,
    borderColor: `rgb(from var(${colorEntry.var}) r g b / 0.2)`,
  };
}

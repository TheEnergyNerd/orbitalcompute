"use client";

import { useSandboxStore, SandboxMode } from "../store/sandboxStore";

export default function SandboxModeSwitcher() {
  const { sandboxMode, setSandboxMode, activeMissionId } = useSandboxStore();
  
  // Hide mode switcher when a mission is active (missions handle their own mode)
  if (activeMissionId) {
    return null;
  }
  
  return null; // Removed mode switcher - always freeplay
}


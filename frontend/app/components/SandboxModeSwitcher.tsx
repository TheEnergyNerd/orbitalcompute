"use client";

import { useSandboxStore, SandboxMode } from "../store/sandboxStore";

export default function SandboxModeSwitcher() {
  const { sandboxMode, setSandboxMode, activeMissionId } = useSandboxStore();
  
  // Hide mode switcher when a mission is active (missions handle their own mode)
  if (activeMissionId) {
    return null;
  }
  
  return (
    <div className="fixed top-2 left-2 sm:top-[70px] sm:left-[340px] z-[99] flex gap-2 max-w-[calc(100vw-12px)]">
      <button
        onClick={() => setSandboxMode("freeplay")}
        className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all border ${
          sandboxMode === "freeplay"
            ? "bg-accent-blue text-dark-bg border-accent-blue"
            : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border-gray-700/50"
        }`}
      >
        Freeplay
      </button>
      <button
        onClick={() => setSandboxMode("missions")}
        className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all border ${
          sandboxMode === "missions"
            ? "bg-accent-blue text-dark-bg border-accent-blue"
            : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border-gray-700/50"
        }`}
      >
        Missions
      </button>
    </div>
  );
}


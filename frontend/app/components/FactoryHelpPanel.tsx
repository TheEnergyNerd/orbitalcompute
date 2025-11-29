"use client";

import { useState, useEffect } from "react";

export default function FactoryHelpPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true);

  useEffect(() => {
    // Check if user has seen tutorial
    const seen = localStorage.getItem("hasSeenFactoryTutorial");
    if (!seen) {
      setHasSeenTutorial(false);
      setIsOpen(true);
      localStorage.setItem("hasSeenFactoryTutorial", "true");
    }
  }, []);

  if (!isOpen && hasSeenTutorial) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[280px] left-6 z-40 w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition"
        title="Show factory help"
      >
        ?
      </button>
    );
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div
            className="panel-glass rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-accent-blue">How to read your factory</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <p>
                This screen is your orbital compute factory. The bottom map shows how raw materials flow through your buildings: Silicon and Steel become Chips and Racks, which become Pods. Methane and LOX become Fuel. Pods + Fuel are launched to orbit as compute units. Each building box is a machine; each colored line is a belt carrying one resource. When a box is outlined red it's starved; when it's orange it's constrained; green means healthy.
              </p>

              <p>
                The left panel shows the numbers behind the map. Buffers tell you how much of each resource is stored, and the "/min" rates tell you if you're gaining or losing that resource. Click any building in the factory map to inspect it: you'll see its inputs, outputs, and utilization, and you can add or remove lines to fix bottlenecks. Your goal is to keep upstream resources flowing, avoid red starved nodes, and push Pods and Fuel through to the Launch pad so pods in orbit – and orbital share – climb.
              </p>

              <div className="mt-6 pt-4 border-t border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Legend</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-gray-400 mb-2">Belt Colors (Resources):</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-cyan-400"></div>
                        <span>Chips</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-yellow-400"></div>
                        <span>Racks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-pink-400"></div>
                        <span>Pods</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-red-400"></div>
                        <span>Fuel</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-2">Node Border Colors:</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-gray-500"></div>
                        <span>Idle</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-green-500"></div>
                        <span>Healthy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-orange-500"></div>
                        <span>Constrained</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-red-500"></div>
                        <span>Starved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


/**
 * factoryEngine
 *
 * Factorio-style production model for orbital compute.
 * Owns:
 *  - resources
 *  - facilities
 *  - recipes
 *  - bottlenecks
 *  - random events (stubbed)
 *
 * Produces per-tick:
 *  - podsReadyOnGround
 *  - launchSlots
 *  - bottleneck summaries
 *
 * NOTE: This engine is intentionally pure and side-effect free.
 */

// ---------- Core resource & facility types ----------

export type ResourceId =
  | "cash"
  | "chips"
  | "racks"
  | "podShells"
  | "launchSlots"
  | "fuel"
  | "rdPoints";

export type ResourceInventory = Record<ResourceId, number>;

export type FacilityType =
  | "chipFab"
  | "rackLine"
  | "podFactory"
  | "launchComplex"
  | "fuelDepot";

export type FacilityState = {
  type: FacilityType;
  count: number;       // number of parallel lines
  level: number;       // upgrade level 1..N
  efficiency: number;  // 0–1, modified by events
};

export type RecipeId =
  | "makeChips"
  | "buildRacks"
  | "buildPodShells"
  | "integratePods"
  | "produceFuel"
  | "prepareLaunch";

export type Recipe = {
  id: RecipeId;
  label: string;
  facility: FacilityType;
  durationDays: number;
  baseInputs: Partial<ResourceInventory>;
  baseOutputs: Partial<ResourceInventory>;
};

export type ActiveRecipe = {
  recipeId: RecipeId;
  facilityType: FacilityType;
  progressDays: number;
};

export type FactoryState = {
  inventory: ResourceInventory;
  facilities: FacilityState[];   // one per FacilityType
  activeRecipes: ActiveRecipe[]; // at least one per facility type
  podsBuiltTotal: number;
  podsReadyOnGround: number;
  podsBuiltThisTick: number;
};

// ---------- Static recipes ----------

export const RECIPES: Record<RecipeId, Recipe> = {
  makeChips: {
    id: "makeChips",
    label: "Fabricate AI chips",
    facility: "chipFab",
    durationDays: 10,
    baseInputs: { cash: 5 },
    baseOutputs: { chips: 10 },
  },
  buildRacks: {
    id: "buildRacks",
    label: "Assemble racks",
    facility: "rackLine",
    durationDays: 5,
    baseInputs: { chips: 5, cash: 2 },
    baseOutputs: { racks: 5 },
  },
  buildPodShells: {
    id: "buildPodShells",
    label: "Build pod shells",
    facility: "podFactory",
    durationDays: 6,
    baseInputs: { racks: 5, cash: 6 },
    baseOutputs: { podShells: 1 },
  },
  integratePods: {
    id: "integratePods",
    label: "Integrate compute pods",
    facility: "podFactory",
    durationDays: 8,
    baseInputs: { podShells: 1, chips: 10, cash: 10 },
    baseOutputs: {}, // yields 1 completed pod (special case)
  },
  produceFuel: {
    id: "produceFuel",
    label: "Produce launch fuel",
    facility: "fuelDepot",
    durationDays: 4,
    baseInputs: { cash: 1 },
    baseOutputs: { fuel: 10 },
  },
  prepareLaunch: {
    id: "prepareLaunch",
    label: "Prepare launch slot",
    facility: "launchComplex",
    durationDays: 7,
    baseInputs: { fuel: 10, cash: 5 },
    baseOutputs: { launchSlots: 1 },
  },
};

// ---------- Throughput & bottlenecks ----------

export type BottleneckStage = "chips" | "racks" | "pods" | "launch";

export type BottleneckSummary = {
  stage: BottleneckStage;
  requiredPerMonth: number;
  actualPerMonth: number;
  utilization: number; // actual / required
  limitingResource?: ResourceId;
};

export type FactoryTickResult = {
  nextFactory: FactoryState;
  podsCompletedThisTick: number;
  launchSlotsCreatedThisTick: number;
  bottlenecks: BottleneckSummary[];
};

/**
 * Compute a throughput multiplier for a facility based on
 * number of lines, upgrade level, and efficiency.
 */
export function facilityThroughputMultiplier(f: FacilityState): number {
  const countFactor = Math.max(0, f.count);
  const levelFactor = Math.pow(1.5, Math.max(0, f.level - 1)); // diminishing returns
  const efficiency = Math.max(0, Math.min(1, f.efficiency));
  return countFactor * levelFactor * efficiency;
}

// ---------- Helpers ----------

function getFacility(state: FactoryState, type: FacilityType): FacilityState {
  let facility = state.facilities.find((f) => f.type === type);
  if (!facility) {
    facility = { type, count: 0, level: 1, efficiency: 1 };
    state.facilities.push(facility);
  }
  return facility;
}

function getActiveRecipe(state: FactoryState, type: FacilityType): ActiveRecipe {
  let active = state.activeRecipes.find((r) => r.facilityType === type);
  if (!active) {
    // Default recipe for each facility type
    const defaultRecipeId: Record<FacilityType, RecipeId> = {
      chipFab: "makeChips",
      rackLine: "buildRacks",
      podFactory: "buildPodShells",
      fuelDepot: "produceFuel",
      launchComplex: "prepareLaunch",
    };
    active = {
      recipeId: defaultRecipeId[type],
      facilityType: type,
      progressDays: 0,
    };
    state.activeRecipes.push(active);
  }
  return active;
}

function cloneInventory(inv: ResourceInventory): ResourceInventory {
  return { ...inv };
}

// ---------- Core tick ----------

export function runFactoryTick(
  factory: FactoryState,
  days: number,
  requiredThroughput: { targetPodsPerMonth: number }
): FactoryTickResult {
  const next: FactoryState = {
    ...factory,
    inventory: cloneInventory(factory.inventory),
    facilities: factory.facilities.map((f) => ({ ...f })),
    activeRecipes: factory.activeRecipes.map((r) => ({ ...r })),
    podsBuiltTotal: factory.podsBuiltTotal,
    podsReadyOnGround: factory.podsReadyOnGround,
    podsBuiltThisTick: 0,
  };

  let podsCompletedThisTick = 0;
  let launchSlotsCreatedThisTick = 0;

  const facilityTypes: FacilityType[] = [
    "chipFab",
    "rackLine",
    "podFactory",
    "fuelDepot",
    "launchComplex",
  ];

  facilityTypes.forEach((type) => {
    const facility = getFacility(next, type);
    if (facility.count <= 0 || facility.efficiency <= 0) return;

    const active = getActiveRecipe(next, type);
    const recipe = RECIPES[active.recipeId];

    const batchesPerMonth =
      (30 / recipe.durationDays) * facilityThroughputMultiplier(facility);

    // Convert the requested days into monthly fraction
    const monthFraction = days / 30;
    let idealBatches = batchesPerMonth * monthFraction;

    if (idealBatches <= 0) return;

    // Determine input-limited batches
    const inv = next.inventory;
    let maxBatchesByInputs = Infinity;
    (Object.keys(recipe.baseInputs) as ResourceId[]).forEach((rid) => {
      const requiredPerBatch = recipe.baseInputs[rid] ?? 0;
      if (requiredPerBatch <= 0) return;
      const available = inv[rid] ?? 0;
      maxBatchesByInputs = Math.min(
        maxBatchesByInputs,
        available / requiredPerBatch
      );
    });

    if (maxBatchesByInputs === Infinity) {
      maxBatchesByInputs = idealBatches;
    }

    const actualBatches = Math.max(
      0,
      Math.min(idealBatches, maxBatchesByInputs)
    );

    if (actualBatches <= 0) return;

    // Apply inputs
    (Object.keys(recipe.baseInputs) as ResourceId[]).forEach((rid) => {
      const requiredPerBatch = recipe.baseInputs[rid] ?? 0;
      if (requiredPerBatch <= 0) return;
      const totalRequired = requiredPerBatch * actualBatches;
      inv[rid] = (inv[rid] ?? 0) - totalRequired;
    });

    // Apply outputs
    (Object.keys(recipe.baseOutputs) as ResourceId[]).forEach((rid) => {
      const producedPerBatch = recipe.baseOutputs[rid] ?? 0;
      if (producedPerBatch <= 0) return;
      const totalProduced = producedPerBatch * actualBatches;
      inv[rid] = (inv[rid] ?? 0) + totalProduced;
      if (rid === "launchSlots") {
        launchSlotsCreatedThisTick += totalProduced;
      }
    });

    // Special case: integratePods creates whole pods, not inventory items
    if (recipe.id === "integratePods") {
      const podsThisTick = actualBatches; // 1 pod per batch
      podsCompletedThisTick += podsThisTick;
      next.podsBuiltThisTick += podsThisTick;
      next.podsBuiltTotal += podsThisTick;
      next.podsReadyOnGround += podsThisTick;
    }
  });

  const bottlenecks = getBottlenecksSummary(next, requiredThroughput);

  return {
    nextFactory: next,
    podsCompletedThisTick,
    launchSlotsCreatedThisTick,
    bottlenecks,
  };
}

// ---------- Bottleneck summary ----------

export function getBottlenecksSummary(
  factory: FactoryState,
  requiredThroughput: { targetPodsPerMonth: number }
): BottleneckSummary[] {
  const { targetPodsPerMonth } = requiredThroughput;

  // For now, approximate stage throughput from facility counts & recipes only.
  // Later we can refine this using a more detailed flow model.
  const stageFromFacility = (type: FacilityType, recipeId: RecipeId): number => {
    const facility =
      factory.facilities.find((f) => f.type === type) ??
      ({ type, count: 0, level: 1, efficiency: 1 } as FacilityState);
    const recipe = RECIPES[recipeId];
    const batchesPerMonth =
      (30 / recipe.durationDays) * facilityThroughputMultiplier(facility);
    // Stage throughput measured in "pods per month equivalent"
    // For chip/rack stages this is a rough proxy.
    return batchesPerMonth;
  };

  const chipsPerMonth = stageFromFacility("chipFab", "makeChips");
  const racksPerMonth = stageFromFacility("rackLine", "buildRacks");
  const podsPerMonth = stageFromFacility("podFactory", "integratePods");
  const launchesPerMonth = stageFromFacility("launchComplex", "prepareLaunch");

  const makeStage = (
    stage: BottleneckStage,
    actual: number
  ): BottleneckSummary => ({
    stage,
    requiredPerMonth: targetPodsPerMonth,
    actualPerMonth: actual,
    utilization:
      targetPodsPerMonth > 0 ? actual / targetPodsPerMonth : actual > 0 ? 1 : 0,
  });

  return [
    makeStage("chips", chipsPerMonth),
    makeStage("racks", racksPerMonth),
    makeStage("pods", podsPerMonth),
    makeStage("launch", launchesPerMonth),
  ];
}

// ---------- Factory initialisation ----------

export function createDefaultFactoryState(): FactoryState {
  const inventory: ResourceInventory = {
    cash: 100,
    chips: 0,
    racks: 0,
    podShells: 0,
    launchSlots: 0,
    fuel: 0,
    rdPoints: 0,
  };

  const facilities: FacilityState[] = [
    { type: "chipFab", count: 1, level: 1, efficiency: 1 },
    { type: "rackLine", count: 1, level: 1, efficiency: 1 },
    { type: "podFactory", count: 1, level: 1, efficiency: 1 },
    { type: "fuelDepot", count: 1, level: 1, efficiency: 1 },
    { type: "launchComplex", count: 1, level: 1, efficiency: 1 },
  ];

  const activeRecipes: ActiveRecipe[] = [
    { recipeId: "makeChips", facilityType: "chipFab", progressDays: 0 },
    { recipeId: "buildRacks", facilityType: "rackLine", progressDays: 0 },
    { recipeId: "buildPodShells", facilityType: "podFactory", progressDays: 0 },
    { recipeId: "produceFuel", facilityType: "fuelDepot", progressDays: 0 },
    { recipeId: "prepareLaunch", facilityType: "launchComplex", progressDays: 0 },
  ];

  return {
    inventory,
    facilities,
    activeRecipes,
    podsBuiltTotal: 0,
    podsReadyOnGround: 0,
    podsBuiltThisTick: 0,
  };
}



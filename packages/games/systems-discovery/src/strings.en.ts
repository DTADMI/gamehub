export const sysStrings = {
  b1: {
    title: "B1 — Loop Puzzle (Kitchen→Compost→Soil→Herbs)",
    prompt: "Complete today’s loop in order. Select each step in sequence.",
    steps: {
      kitchen: "Kitchen scraps",
      compost: "Compost bin",
      soil: "Soil mix",
      herbs: "Herb planter",
    },
    hint: "Hint: Kitchen → Compost → Soil → Herbs.",
    continue: "Continue",
  },
  b2: {
    title: "B2 — Route Planner (Bus/Bike)",
    prompt: "Plan an efficient route:",
    busFirst: "Bus then Bike",
    bikeFirst: "Bike then Bus",
  },
  b3: {
    title: "B3 — Waste Sorting",
    prompt: "Sort items correctly. Toggle ‘Hints’ for guidance.",
    hintsOn: "Hints: On",
    hintsOff: "Hints: Off",
    items: { banana: "Banana peel", bottle: "Plastic bottle", paper: "Paper scrap" },
    reveal: "Finish sorting",
  },
  wrap: {
    title: "Wrap — Systems Scout Badge",
    done: "Core pack complete — Systems Scout badge awarded.",
    b1: "B1 route",
    b2: "B2 plan",
    b3: "B3 result",
  },
} as const;

export type SysStrings = typeof sysStrings;

/**
 * Dungeon Delver Achievements System
 *
 * Tracked in localStorage alongside titles.
 * Checked on death, persist across runs.
 */

import type { RunStats } from "./types";

export interface Achievement {
  id: string;
  nameEn: string;
  nameFr: string;
  descEn: string;
  descFr: string;
  icon: string;
  hidden?: boolean;   // Hidden until unlocked
  condition: (stats: RunStats, allAchievements: string[]) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_run",
    nameEn: "First Steps",
    nameFr: "Premiers Pas",
    descEn: "Complete your first run",
    descFr: "Terminer votre première partie",
    icon: "👣",
    condition: () => true,
  },
  {
    id: "floor_5",
    nameEn: "Dungeon Scout",
    nameFr: "Éclaireur de Donjon",
    descEn: "Reach floor 5",
    descFr: "Atteindre l'étage 5",
    icon: "🏔️",
    condition: (r) => r.deepestFloor >= 5,
  },
  {
    id: "floor_10",
    nameEn: "Abyss Walker",
    nameFr: "Marcheur des Abysses",
    descEn: "Reach floor 10",
    descFr: "Atteindre l'étage 10",
    icon: "🌑",
    condition: (r) => r.deepestFloor >= 10,
  },
  {
    id: "floor_15",
    nameEn: "Dragon's Bane",
    nameFr: "Fléau du Dragon",
    descEn: "Reach floor 15 and slay the Ancient Dragon",
    descFr: "Atteindre l'étage 15 et terrasser le Dragon Ancien",
    icon: "🐉",
    condition: (r) => r.deepestFloor >= 15 && r.bossKills.includes("dragon"),
  },
  {
    id: "kills_50",
    nameEn: "Monster Slayer",
    nameFr: "Tueur de Monstres",
    descEn: "Kill 50 enemies in a single run",
    descFr: "Tuer 50 ennemis en une seule partie",
    icon: "⚔️",
    condition: (r) => r.totalKills >= 50,
  },
  {
    id: "kills_100",
    nameEn: "Exterminator",
    nameFr: "Exterminateur",
    descEn: "Kill 100 enemies in a single run",
    descFr: "Tuer 100 ennemis en une seule partie",
    icon: "💀",
    condition: (r) => r.totalKills >= 100,
  },
  {
    id: "items_10",
    nameEn: "Collector",
    nameFr: "Collectionneur",
    descEn: "Collect 10 items in a single run",
    descFr: "Collecter 10 objets en une seule partie",
    icon: "🎒",
    condition: (r) => r.totalItems >= 10,
  },
  {
    id: "items_25",
    nameEn: "Hoarder",
    nameFr: "Amasseur",
    descEn: "Collect 25 items in a single run",
    descFr: "Collecter 25 objets en une seule partie",
    icon: "💰",
    condition: (r) => r.totalItems >= 25,
  },
  {
    id: "all_races",
    nameEn: "Versatile",
    nameFr: "Polyvalent",
    descEn: "Win with every race",
    descFr: "Gagner avec chaque race",
    icon: "🌈",
    condition: (_r, all) => {
      const races = ["human", "elf", "dwarf", "vampire", "demon", "golem", "celestial"];
      return races.every((race) => all.includes(`race_${race}`));
    },
  },
  {
    id: "all_classes",
    nameEn: "Master of All",
    nameFr: "Maître de Tout",
    descEn: "Win with every class",
    descFr: "Gagner avec chaque classe",
    icon: "👑",
    condition: (_r, all) => {
      const classes = ["warrior", "mage", "rogue", "paladin", "necromancer"];
      return classes.every((cls) => all.includes(`class_${cls}`));
    },
  },
  {
    id: "daily_5",
    nameEn: "Daily Grinder",
    nameFr: "Bosseur Quotidien",
    descEn: "Complete 5 daily challenges",
    descFr: "Compléter 5 défis quotidiens",
    icon: "📅",
    condition: (_r, all) => (all.filter((a) => a === "daily_complete").length) >= 5,
  },
  {
    id: "floor1_death",
    nameEn: "Embarrassing...",
    nameFr: "Gênant...",
    descEn: "Die on the first floor",
    descFr: "Mourir au premier étage",
    icon: "🤦",
    hidden: true,
    condition: (r) => r.diedOnFloor1,
  },
];

const ACHIEVEMENTS_KEY = "dungeon-delver-achievements";

export function loadAchievements(): string[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveAchievements(ids: string[]): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ids));
  } catch { /* ignore */ }
}

/** Check and return newly unlocked achievements */
export function checkAchievements(
  runStats: RunStats,
  currentAchievements: string[],
  raceId: string,
  classId: string,
  isDaily: boolean,
): Achievement[] {
  const unlocked: Achievement[] = [];

  // Track race/class usage
  const raceKey = `race_${raceId}`;
  const classKey = `class_${classId}`;

  // Build expanded list for cross-run checks
  const expanded = [...currentAchievements];

  for (const ach of ACHIEVEMENTS) {
    if (expanded.includes(ach.id)) {continue;}
    if (ach.condition(runStats, expanded)) {
      expanded.push(ach.id);
      unlocked.push(ach);
    }
  }

  // Always track race/class for future cross-run achievements
  if (!currentAchievements.includes(raceKey)) {
    currentAchievements.push(raceKey);
    saveAchievements(currentAchievements);
  }
  if (!currentAchievements.includes(classKey)) {
    currentAchievements.push(classKey);
    saveAchievements(currentAchievements);
  }

  // Track daily completions
  if (isDaily && !currentAchievements.includes("daily_complete")) {
    currentAchievements.push("daily_complete");
    saveAchievements(currentAchievements);
  }

  return unlocked;
}
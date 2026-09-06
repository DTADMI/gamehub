// Shared types for Dungeon Delver
// Extracted from main component for reuse across decorators, audio, particles

export type RaceId = "human" | "elf" | "dwarf" | "vampire" | "demon" | "golem" | "celestial";
export type ClassId = "warrior" | "mage" | "rogue" | "paladin" | "necromancer";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type GameScreen = "title" | "dungeon" | "death" | "inventory" | "shop";
export type ElementId = "fire" | "ice" | "poison" | "lightning" | "none";

export interface Stats {
  str: number;
  sta: number;
  wil: number;
  int: number;
}

export interface Resistances {
  fire: number;
  ice: number;
  poison: number;
  lightning: number;
}

export interface Race {
  id: RaceId;
  nameEn: string;
  nameFr: string;
  descEn: string;
  descFr: string;
  stats: Partial<Stats>;
  resists: Partial<Resistances>;
  abilityEn: string;
  abilityFr: string;
  icon?: string;
}

export interface ClassDef {
  id: ClassId;
  nameEn: string;
  nameFr: string;
  descEn: string;
  descFr: string;
  stats: Partial<Stats>;
  attackType: "melee" | "ranged" | "hybrid";
  skillEn: string;
  skillFr: string;
  icon?: string;
}

export interface Monster {
  id: string;
  nameEn: string;
  nameFr: string;
  emoji: string;
  hp: number;
  damage: number;
  xp: number;
  element?: ElementId;
  minFloor: number;
  isBoss?: boolean;
  bossLoot?: string;
}

export interface FloorMonster {
  monster: Monster;
  x: number;
  y: number;
  hp: number;
}

export interface Item {
  id: string;
  nameEn: string;
  nameFr: string;
  type: "weapon" | "armor" | "accessory" | "consumable";
  slot?: "mainhand" | "offhand" | "body" | "head" | "hands" | "feet" | "ring" | "amulet";
  statBonus: Partial<Stats>;
  resistBonus: Partial<Resistances>;
  healAmount?: number;
  emoji: string;
  setId?: string;           // For set bonuses (e.g. "iron", "arcane", "shadow", "plate")
  floorRange: [number, number];
  rarity?: Rarity;
}

export interface Title {
  id: string;
  nameEn: string;
  nameFr: string;
  descEn: string;
  descFr: string;
  bonus: Partial<Stats>;
  condition: (run: RunStats) => boolean;
}

export interface RunStats {
  deepestFloor: number;
  totalKills: number;
  totalItems: number;
  bossKills: string[];
  diedOnFloor1: boolean;
}

export interface EquippedItems {
  head: Item | null;
  body: Item | null;
  hands: Item | null;
  feet: Item | null;
  mainhand: Item | null;
  offhand: Item | null;
  ring: Item | null;
  amulet: Item | null;
}

export interface PlayerState {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  xp: number;
  xpToNext: number;
  race: RaceId;
  class: ClassId;
  baseStats: Stats;
  equipped: EquippedItems;
  inventory: Item[];
  gold: number;
  perks: string[];
}

export interface Toast {
  id: number;
  text: string;
  life: number;
}

export interface DungeonState {
  grid: number[][];
  monsters: FloorMonster[];
  items: { item: Item; x: number; y: number }[];
  isBossFloor: boolean;
  rooms?: { x: number; y: number; w: number; h: number }[];
  explored: boolean[][];
}

export interface SaveData {
  player: PlayerState;
  floor: number;
  dungeon: DungeonState;
  runStats: RunStats;
}
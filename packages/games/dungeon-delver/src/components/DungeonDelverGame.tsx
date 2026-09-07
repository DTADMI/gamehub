// Dungeon Delver — Roguelike dungeon crawler for GameHub
// Spiritual successor to Hack Slash Crawl (Hatched Games, 2011)
"use client";

import "../dungeon-delver.css";

import { useGameLoop, useKeyboardInput } from "@games/_engine";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { type Achievement,ACHIEVEMENTS, checkAchievements, loadAchievements, saveAchievements } from "../achievements";
import { ddAudio } from "../audio";
import { createSeededRng,getDailySeed, getDailySeedNumber, hasDailyAttempt, markDailyAttempt } from "../daily";
import { buildCharacter, calcMagicDamage, calcMaxHp, calcMaxMp, calcMeleeDamage, calcXpToNext, computeSetBonuses } from "../modifiers";
import { ParticleSystem } from "../particles";
import { getLevelUpChoices, getPerk, type Perk,PERKS } from "../perks";
import type { ClassDef, ClassId, DungeonState, EquippedItems, FloorMonster, GameScreen, Item, Monster, PlayerState, Race, RaceId, Rarity, RunStats, SaveData, Stats, Title } from "../types";

// ─── Game Constants ───────────────────────────────────────────
const CANVAS_W = 640;
const CANVAS_H = 480;
const CELL = 32;
const COLS = Math.floor(CANVAS_W / CELL); // 20
const ROWS = Math.floor((CANVAS_H - 64) / CELL); // 13 (top 64px for HUD)
const HUD_H = 64;
const BOSS_EVERY = 5;

// ─── Types imported from ../types.ts ─────────────────────────

// ─── Races ─────────────────────────────────────────────────────

const RACES: Race[] = [
  { id: "human", nameEn: "Human", nameFr: "Humain", descEn: "Versatile and adaptable. No weaknesses.", descFr: "Polyvalent et adaptable. Aucune faiblesse.", stats: { str: 1, sta: 1, wil: 1, int: 1 }, resists: {}, abilityEn: "Perseverance: +10% XP gain", abilityFr: "Persévérance : +10% gain XP",
    icon: "👤" },
  { id: "elf", nameEn: "Elf", nameFr: "Elfe", descEn: "Ancient and wise. High intellect.", descFr: "Ancien et sage. Intellect élevé.", stats: { int: 3, wil: 2, sta: -1 }, resists: { ice: 15 }, abilityEn: "Arcane Affinity: +15% magic damage", abilityFr: "Affinité arcanique : +15% dégâts magiques",
    icon: "🧝" },
  { id: "dwarf", nameEn: "Dwarf", nameFr: "Nain", descEn: "Sturdy mountain folk. Fire-resistant.", descFr: "Robuste peuple des montagnes. Résistant au feu.", stats: { sta: 3, str: 1, int: -1 }, resists: { fire: 25 }, abilityEn: "Forgeborn: +20% armor effectiveness", abilityFr: "Forge-né : +20% efficacité d'armure",
    icon: "⛏️" },
  { id: "vampire", nameEn: "Vampire", nameFr: "Vampire", descEn: "Cursed with immortality. Lifesteal on melee.", descFr: "Maudit d'immortalité. Vol de vie en mêlée.", stats: { str: 1, int: 2, wil: 1 }, resists: { poison: 30 }, abilityEn: "Blood Drain: Heal 20% of melee damage dealt", abilityFr: "Drain de sang : Soigne 20% des dégâts de mêlée",
    icon: "🧛" },
  { id: "demon", nameEn: "Demon", nameFr: "Démon", descEn: "Fiery bloodline. High strength.", descFr: "Lignée ardente. Force élevée.", stats: { str: 3, sta: 1, wil: -1 }, resists: { fire: 40, lightning: 15 }, abilityEn: "Hellfire: +25% fire damage, take 10% less fire damage", abilityFr: "Feu infernal : +25% dégâts de feu, -10% subis",
    icon: "😈" },
  { id: "golem", nameEn: "Golem", nameFr: "Golem", descEn: "Living stone. Immense stamina.", descFr: "Pierre vivante. Endurance immense.", stats: { sta: 4, str: 2, int: -2 }, resists: { poison: 50, ice: 20 }, abilityEn: "Stoneform: +30 max HP, immune to poison ticks", abilityFr: "Forme de pierre : +30 PV max, immunisé au poison",
    icon: "🗿" },
  { id: "celestial", nameEn: "Celestial", nameFr: "Céleste", descEn: "Touched by starlight. High willpower.", descFr: "Touché par la lumière stellaire. Volonté élevée.", stats: { wil: 4, int: 2, str: -1 }, resists: { lightning: 40, ice: 20 }, abilityEn: "Divine Grace: 15% chance to negate all damage", abilityFr: "Grâce divine : 15% de chance d'annuler tous les dégâts",
    icon: "👼" },
];

const CLASSES: ClassDef[] = [
  { id: "warrior", nameEn: "Warrior", nameFr: "Guerrier", descEn: "Frontline fighter. Master of weapons.", descFr: "Combattant de première ligne. Maître des armes.", stats: { str: 3, sta: 2 }, attackType: "melee", skillEn: "Cleave: Attack up to 3 adjacent enemies", skillFr: "Fendoir : Attaque jusqu'à 3 ennemis adjacents",
    icon: "⚔️" },
  { id: "mage", nameEn: "Mage", nameFr: "Mage", descEn: "Arcane spellcaster. Devastating magic.", descFr: "Lanceur de sorts arcaniques. Magie dévastatrice.", stats: { int: 4, wil: 2, str: -2 }, attackType: "ranged", skillEn: "Arcane Barrage: Hit all enemies in a 3-tile radius", skillFr: "Barrage arcanique : Frappe tous les ennemis dans un rayon de 3 cases",
    icon: "🧙" },
  { id: "rogue", nameEn: "Rogue", nameFr: "Voleur", descEn: "Quick and deadly. Strikes from shadows.", descFr: "Rapide et mortel. Frappe depuis l'ombre.", stats: { str: 2, int: 1, sta: 1 }, attackType: "hybrid", skillEn: "Backstab: 2x damage when attacking from behind", skillFr: "Attaque sournoise : Dégâts x2 en attaquant par derrière",
    icon: "🗡️" },
  { id: "paladin", nameEn: "Paladin", nameFr: "Paladin", descEn: "Holy knight. Heals and smites.", descFr: "Chevalier sacré. Soigne et châtie.", stats: { str: 2, sta: 2, wil: 2 }, attackType: "melee", skillEn: "Holy Light: Heal 25% HP every 5 turns", skillFr: "Lumière sacrée : Soigne 25% PV tous les 5 tours",
    icon: "🛡️" },
  { id: "necromancer", nameEn: "Necromancer", nameFr: "Nécromancien", descEn: "Death mage. Drains life and raises the fallen.", descFr: "Mage de la mort. Drain de vie et résurrection.", stats: { int: 3, wil: 2, str: -1 }, attackType: "ranged", skillEn: "Soul Drain: Heal 40% of spell damage dealt", skillFr: "Drain d'âme : Soigne 40% des dégâts de sort",
    icon: "💀" },
];

// ─── Monsters ──────────────────────────────────────────────────

const MONSTERS: Monster[] = [
  { id: "rat", nameEn: "Giant Rat", nameFr: "Rat Géant", emoji: "🐀", hp: 15, damage: 3, xp: 10, minFloor: 1 },
  { id: "skeleton", nameEn: "Skeleton", nameFr: "Squelette", emoji: "💀", hp: 22, damage: 5, xp: 18, minFloor: 1 },
  { id: "goblin", nameEn: "Goblin", nameFr: "Gobelin", emoji: "👺", hp: 18, damage: 4, xp: 14, minFloor: 1 },
  { id: "slime", nameEn: "Slime", nameFr: "Gelée", emoji: "🟢", hp: 12, damage: 2, xp: 8, element: "poison", minFloor: 1 },
  { id: "spider", nameEn: "Giant Spider", nameFr: "Araignée Géante", emoji: "🕷️", hp: 28, damage: 7, xp: 22, element: "poison", minFloor: 3 },
  { id: "zombie", nameEn: "Zombie", nameFr: "Zombie", emoji: "🧟", hp: 35, damage: 8, xp: 26, minFloor: 3 },
  { id: "orc", nameEn: "Orc Warrior", nameFr: "Guerrier Orc", emoji: "👹", hp: 40, damage: 10, xp: 32, minFloor: 4 },
  { id: "wraith", nameEn: "Wraith", nameFr: "Spectre", emoji: "👻", hp: 30, damage: 12, xp: 35, element: "ice", minFloor: 5 },
  { id: "troll", nameEn: "Cave Troll", nameFr: "Troll des Cavernes", emoji: "🧌", hp: 60, damage: 15, xp: 50, minFloor: 7 },
  { id: "lich", nameEn: "Lich", nameFr: "Liche", emoji: "🧙‍♂️", hp: 50, damage: 18, xp: 55, element: "lightning", minFloor: 7 },
  { id: "dragon", nameEn: "Young Dragon", nameFr: "Jeune Dragon", emoji: "🐉", hp: 90, damage: 22, xp: 80, element: "fire", minFloor: 10 },
  // v0.5 new monsters
  { id: "fire-imp", nameEn: "Fire Imp", nameFr: "Diablotin de Feu", emoji: "👹", hp: 12, damage: 6, xp: 18, element: "fire", minFloor: 5 },
  { id: "ice-wraith-major", nameEn: "Ice Wraith Major", nameFr: "Spectre de Glace Majeur", emoji: "❄️", hp: 28, damage: 12, xp: 40, element: "ice", minFloor: 8 },
  { id: "shadow-stalker", nameEn: "Shadow Stalker", nameFr: "Traqueur d'Ombre", emoji: "👤", hp: 18, damage: 9, xp: 28, element: "none", minFloor: 6 },
  { id: "venom-wyrm", nameEn: "Venom Wyrm", nameFr: "Vouivre de Venin", emoji: "🐍", hp: 24, damage: 11, xp: 35, element: "poison", minFloor: 7 },
  { id: "storm-sentinel", nameEn: "Storm Sentinel", nameFr: "Sentinelle des Tempêtes", emoji: "⚡", hp: 30, damage: 14, xp: 45, element: "lightning", minFloor: 10 },
  // Original monsters follow
  { id: "void-horror", nameEn: "Void Horror", nameFr: "Horreur du Vide", emoji: "👾", hp: 80, damage: 25, xp: 90, element: "lightning", minFloor: 11 },
];

// ─── Items ─────────────────────────────────────────────────────

const ITEMS: Item[] = [
  { id: "sword", nameEn: "Iron Sword", nameFr: "Épée de Fer", type: "weapon", slot: "mainhand", statBonus: { str: 2 }, resistBonus: {}, emoji: "⚔️", floorRange: [1, 5] },
  { id: "axe", nameEn: "Battle Axe", nameFr: "Hache de Guerre", type: "weapon", slot: "mainhand", statBonus: { str: 4, int: -1 }, resistBonus: {}, emoji: "🪓", floorRange: [3, 8] },
  { id: "staff", nameEn: "Oak Staff", nameFr: "Bâton de Chêne", type: "weapon", slot: "mainhand", statBonus: { int: 3, wil: 1 }, resistBonus: {}, emoji: "🪄", floorRange: [1, 5] },
  { id: "dagger", nameEn: "Shadow Dagger", nameFr: "Dague de l'Ombre", type: "weapon", slot: "offhand", statBonus: { str: 1, int: 1 }, resistBonus: {}, emoji: "🗡️", floorRange: [1, 4] },
  { id: "greatsword", nameEn: "Greatsword", nameFr: "Espadon", type: "weapon", slot: "mainhand", statBonus: { str: 6, sta: 1 }, resistBonus: {}, emoji: "⚔️", floorRange: [6, 99] },
  { id: "arcane-staff", nameEn: "Arcane Staff", nameFr: "Bâton Arcanique", type: "weapon", slot: "mainhand", statBonus: { int: 6, wil: 2 }, resistBonus: { lightning: 10 }, emoji: "🔮", floorRange: [6, 99] },
  { id: "leather-armor", nameEn: "Leather Armor", nameFr: "Armure de Cuir", type: "armor", slot: "body", statBonus: { sta: 2 }, resistBonus: {}, emoji: "🦺", floorRange: [1, 4] },
  { id: "chainmail", nameEn: "Chainmail", nameFr: "Cotte de Mailles", type: "armor", slot: "body", statBonus: { sta: 4 }, resistBonus: { ice: 10 }, emoji: "🛡️", floorRange: [3, 7] },
  { id: "plate-armor", nameEn: "Plate Armor", nameFr: "Armure de Plates", type: "armor", slot: "body", statBonus: { sta: 7, int: -1 }, resistBonus: { fire: 15, ice: 15 }, emoji: "🛡️", floorRange: [6, 99] },
  { id: "ring-fire", nameEn: "Ring of Fire", nameFr: "Anneau de Feu", type: "accessory", slot: "ring", statBonus: { int: 1 }, resistBonus: { fire: 25 }, emoji: "💍", floorRange: [2, 8] },
  { id: "ring-ice", nameEn: "Ring of Frost", nameFr: "Anneau de Givre", type: "accessory", slot: "ring", statBonus: { wil: 1 }, resistBonus: { ice: 25 }, emoji: "💍", floorRange: [2, 8] },
  { id: "amulet-life", nameEn: "Amulet of Life", nameFr: "Amulette de Vie", type: "accessory", slot: "amulet", statBonus: { sta: 3, wil: 1 }, resistBonus: {}, emoji: "📿", floorRange: [4, 99] },
  { id: "health-potion", nameEn: "Health Potion", nameFr: "Potion de Santé", type: "consumable", healAmount: 30, statBonus: {}, resistBonus: {}, emoji: "🧪", floorRange: [1, 99] },
  { id: "mana-potion", nameEn: "Mana Potion", nameFr: "Potion de Mana", type: "consumable", healAmount: 20, statBonus: {}, resistBonus: {}, emoji: "🧪", floorRange: [1, 99] },
  { id: "scroll-power", nameEn: "Scroll of Power", nameFr: "Parchemin de Puissance", type: "consumable", statBonus: { str: 3, int: 3 }, resistBonus: {}, emoji: "📜", floorRange: [5, 99] },
];

// ─── Titles ────────────────────────────────────────────────────

const TITLES: Title[] = [
  { id: "fledgling", nameEn: "Fledgling Delver", nameFr: "Fouilleur Novice", descEn: "Reached floor 2", descFr: "Atteint l'étage 2", bonus: { sta: 2 }, condition: (r) => r.deepestFloor >= 2 },
  { id: "scout", nameEn: "Dungeon Scout", nameFr: "Éclaireur de Donjon", descEn: "Reached floor 5", descFr: "Atteint l'étage 5", bonus: { str: 1, sta: 3 }, condition: (r) => r.deepestFloor >= 5 },
  { id: "walker", nameEn: "Crypt Walker", nameFr: "Marcheur des Cryptes", descEn: "Reached floor 8", descFr: "Atteint l'étage 8", bonus: { str: 2, sta: 4, int: 1 }, condition: (r) => r.deepestFloor >= 8 },
  { id: "abyss", nameEn: "Abyss Strider", nameFr: "Arpenteur des Abysses", descEn: "Reached floor 10", descFr: "Atteint l'étage 10", bonus: { str: 3, sta: 5, int: 2, wil: 2 }, condition: (r) => r.deepestFloor >= 10 },
  { id: "slayer", nameEn: "Monster Slayer", nameFr: "Tueur de Monstres", descEn: "Killed 50 enemies in one run", descFr: "Tué 50 ennemis en une partie", bonus: { str: 2 }, condition: (r) => r.totalKills >= 50 },
  { id: "dragonbane", nameEn: "Dragonbane", nameFr: "Fléau des Dragons", descEn: "Slayed a dragon", descFr: "A terrassé un dragon", bonus: { str: 2, int: 2 }, condition: (r) => r.bossKills.includes("dragon") },
  { id: "lorewarden", nameEn: "Lorewarden", nameFr: "Gardien du Savoir", descEn: "Collected 20 items in one run", descFr: "Collecté 20 objets en une partie", bonus: { int: 2, wil: 1 }, condition: (r) => r.totalItems >= 20 },
  { id: "phantom", nameEn: "Phantom", nameFr: "Fantôme", descEn: "Died on the first floor (hidden)", descFr: "Mort au premier étage (caché)", bonus: { wil: 1 }, condition: (r) => r.diedOnFloor1 },
];

// ─── Helper Functions ──────────────────────────────────────────
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const weightedPick = <T extends { rarity?: Rarity }>(items: T[]): T => {
  const weights: Record<Rarity, number> = { common: 50, uncommon: 28, rare: 14, epic: 6, legendary: 2 };
  const total = items.reduce((s, i) => s + weights[i.rarity || 'common'], 0);
  let roll = Math.random() * total;
  for (const item of items) { roll -= weights[item.rarity || 'common']; if (roll <= 0) {return item;} }
  return items[0]!;
};

/** Build stats using flat modifier pipeline — 1 allocation, O(n) single pass */
function computePlayerStats(race: Race, cls: ClassDef, equipped: EquippedItems, titles: Title[]): Stats {
  return buildCharacter(race, cls, equipped, titles).stats;
}

const getMonstersForFloor = (floor: number, includeBoss: boolean) => {
  let ms = MONSTERS.filter((m) => m.minFloor <= floor);
  if (!includeBoss) {ms = ms.filter((m) => !m.isBoss);}
  return ms;
};
const getItemsForFloor = (floor: number) => ITEMS.filter((i) => i.floorRange[0] <= floor && i.floorRange[1] >= floor);

function generateFloor(floorNb: number): DungeonState {
  const isBossFloor = floorNb % BOSS_EVERY === 0;
  const grid: number[][] = [];
  for (let y = 0; y < ROWS; y++) { grid[y] = Array(COLS).fill(1); }

  const rooms: { x: number; y: number; w: number; h: number }[] = [];
  const roomCount = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < roomCount; i++) {
    const rw = rand(3, 6), rh = rand(3, 5);
    const rx = rand(1, COLS - rw - 2), ry = rand(1, ROWS - rh - 2);
    let overlaps = false;
    for (const r of rooms) { if (rx < r.x + r.w + 1 && rx + rw + 1 > r.x && ry < r.y + r.h + 1 && ry + rh + 1 > r.y) { overlaps = true; break; } }
    if (!overlaps) { rooms.push({ x: rx, y: ry, w: rw, h: rh }); for (let y = ry; y < ry + rh; y++) {for (let x = rx; x < rx + rw; x++) {grid[y][x] = 0;}} }
  }

  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1], b = rooms[i];
    const ax = Math.floor(a.x + a.w / 2), ay = Math.floor(a.y + a.h / 2);
    const bx = Math.floor(b.x + b.w / 2), by = Math.floor(b.y + b.h / 2);
    if (Math.random() > 0.5) { for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {grid[ay][x] = 0;} for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {grid[y][bx] = 0;} }
    else { for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {grid[ay][y] = 0;} for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {grid[by][x] = 0;} }
  }

  const lastRoom = rooms[rooms.length - 1];
  const stairsX = Math.floor(lastRoom.x + lastRoom.w / 2), stairsY = Math.floor(lastRoom.y + lastRoom.h / 2);
  grid[stairsY][stairsX] = 2;

  const availableMonsters = getMonstersForFloor(floorNb, isBossFloor);
  const monsterCount = isBossFloor ? 2 : (3 + Math.floor(floorNb / 2));
  const monsters: FloorMonster[] = [];
  const occupied = new Set<string>();
  occupied.add(stairsX + ',' + stairsY);

  for (let i = 0; i < monsterCount; i++) {
    let mx: number, my: number, attempts = 0;
    do { mx = rand(1, COLS - 2); my = rand(1, ROWS - 2); attempts++; }
    while ((occupied.has(mx + ',' + my) || grid[my][mx] !== 0) && attempts < 100);
    if (attempts < 100) {
      occupied.add(mx + ',' + my);
      let template: Monster;
      if (isBossFloor && i === 0) { const bosses = MONSTERS.filter((m) => m.isBoss && m.minFloor <= floorNb); template = pick(bosses.length > 0 ? bosses : availableMonsters); }
      else { template = isBossFloor ? pick(availableMonsters.filter((m) => !m.isBoss)) : pick(availableMonsters); }
      monsters.push({ monster: template, x: mx, y: my, hp: template.hp + Math.floor(floorNb * 2) });
    }
  }

  const availableItems = getItemsForFloor(floorNb);
  const itemCount = 2 + Math.floor(Math.random() * 4);
  const floorItems: { item: Item; x: number; y: number }[] = [];
  for (let i = 0; i < itemCount; i++) {
    let ix: number, iy: number, attempts = 0;
    do { ix = rand(1, COLS - 2); iy = rand(1, ROWS - 2); attempts++; }
    while ((occupied.has(ix + ',' + iy) || grid[iy][ix] !== 0) && attempts < 100);
    if (attempts < 100) { occupied.add(ix + ',' + iy); floorItems.push({ item: weightedPick(availableItems), x: ix, y: iy }); }
  }

  if (isBossFloor) {
    const bossItems = ITEMS.filter((it) => (it.rarity === 'epic' || it.rarity === 'legendary'));
    if (bossItems.length > 0) { floorItems.push({ item: pick(bossItems), x: stairsX, y: stairsY }); }
  }

  const explored: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  return { grid, monsters, items: floorItems, isBossFloor, explored };
}

// ─── Seeded generation for daily challenge ────────────────────

function generateDailyFloor(floorNb: number): DungeonState {
  const seed = getDailySeedNumber();
  const rng = createSeededRng(seed);
  const origRandom = Math.random;
  try {
    Math.random = rng;
    return generateFloor(floorNb);
  } finally {
    Math.random = origRandom;
  }
}

// ─── Translation Maps ──────────────────────────────────────────

const TX = {
  en: {
    title: "Dungeon Delver",
    subtitle: "A roguelike dungeon crawler",
    chooseRace: "Choose Your Race",
    chooseClass: "Choose Your Class",
    start: "▶ Descend into the Dungeon",
    back: "◀ Back",
    floor: "Floor",
    hp: "HP",
    mp: "MP",
    lvl: "Lvl",
    xp: "XP",
    gold: "Gold",
    gameOver: "You have fallen...",
    runSummary: "Run Summary",
    deepestFloor: "Deepest Floor",
    totalKills: "Total Kills",
    itemsFound: "Items Found",
    titleEarned: "Title Earned",
    newTitle: "New Title Unlocked!",
    newGame: "▶ New Run",
    youDiedOnFloor1: "Did you... just die on the first floor?",
    inventory: "Inventory",
    equip: "Equip",
    use: "Use",
    close: "Close",
    stairsFound: "Stairs found! Click stairs to descend.",
    levelUp: "Level Up!",
    dmg: "DMG",
    statsStr: "STR",
    statsSta: "STA",
    statsWil: "WIL",
    statsInt: "INT",
    resistances: "Resistances",
    abilities: "Abilities",
    clickToMove: "Click to move • Click enemy to attack",
    pressI: "Press I for inventory",
    melee: "Melee",
    ranged: "Ranged",
    hybrid: "Hybrid",
    shopTitle: "⚒️ Merchant Camp",
    shopBuy: "Buy",
    shopPrice: "gold",
    shopContinue: "▶ Continue Deeper",
    shopNoGold: "Not enough gold",
    shopBought: "Bought!",
    shopWelcome: "A hooded merchant beckons...",
    setBonus: "Set Bonus",
    fogHint: "The unknown awaits...",
  },
  fr: {
    title: "Fouilleur de Donjon",
    subtitle: "Un dungeon crawler roguelike",
    chooseRace: "Choisissez votre race",
    chooseClass: "Choisissez votre classe",
    start: "▶ Descendre dans le Donjon",
    back: "◀ Retour",
    floor: "Étage",
    hp: "PV",
    mp: "PM",
    lvl: "Niv",
    xp: "XP",
    gold: "Or",
    gameOver: "Vous avez succombé...",
    runSummary: "Résumé de la partie",
    deepestFloor: "Étage le plus profond",
    totalKills: "Éliminations totales",
    itemsFound: "Objets trouvés",
    titleEarned: "Titre gagné",
    newTitle: "Nouveau Titre Débloqué !",
    newGame: "▶ Nouvelle Partie",
    youDiedOnFloor1: "Euh... tu viens de mourir au premier étage ?",
    inventory: "Inventaire",
    equip: "Équiper",
    use: "Utiliser",
    close: "Fermer",
    stairsFound: "Escaliers trouvés ! Cliquez pour descendre.",
    levelUp: "Niveau supérieur !",
    dmg: "DÉG",
    statsStr: "FOR",
    statsSta: "END",
    statsWil: "VOL",
    statsInt: "INT",
    resistances: "Résistances",
    abilities: "Aptitudes",
    clickToMove: "Cliquez pour bouger • Cliquez l'ennemi pour attaquer",
    pressI: "Appuyez sur I pour l'inventaire",
    melee: "Mêlée",
    ranged: "Distance",
    hybrid: "Hybride",
    shopTitle: "⚒️ Camp du Marchand",
    shopBuy: "Acheter",
    shopPrice: "or",
    shopContinue: "▶ Continuer plus profond",
    shopNoGold: "Pas assez d'or",
    shopBought: "Acheté !",
    shopWelcome: "Un marchand encapuchonné vous fait signe...",
    setBonus: "Bonus d'Ensemble",
    fogHint: "L'inconnu vous attend...",
  },
};

// ─── Main Component ────────────────────────────────────────────
export function DungeonDelverGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef(new ParticleSystem());
  const tickRef = useRef(0);

  // Locale
  const [locale, setLocale] = useState<"en" | "fr">("en");
  const t = useCallback((key: keyof typeof TX.en) => TX[locale][key] || key, [locale]);

  // Screen state
  const [screen, setScreen] = useState<GameScreen>("title");
  const [selectedRace, setSelectedRace] = useState<RaceId | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassId | null>(null);
  const [floor, setFloor] = useState(1);

  // Player state
  const [player, setPlayer] = useState<PlayerState>({
    x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2),
    hp: 100, maxHp: 100, mp: 50, maxMp: 50,
    level: 1, xp: 0, xpToNext: 50,
    race: "human", class: "warrior",
    baseStats: { str: 5, sta: 20, wil: 3, int: 3 },
    equipped: { head: null, body: null, hands: null, feet: null, mainhand: null, offhand: null, ring: null, amulet: null },
    inventory: [],
    gold: 0,
    perks: [],
  });

  // Floor data
  const [dungeon, setDungeon] = useState<DungeonState>(() => generateFloor(1));
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  // Perk selection on level-up
  const [perkChoices, setPerkChoices] = useState<Perk[]>([]);
  const perkPendingRef = useRef<{ xp: number; xpToNext: number; level: number } | null>(null);
  const [playerAnim, setPlayerAnim] = useState<{ x: number; y: number; progress: number } | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<FloorMonster | null>(null);
  // Shop state
  const [shopItems, setShopItems] = useState<Item[]>([]);
  const [pendingNextFloor, setPendingNextFloor] = useState(0);

  // Run stats
  const runStatsRef = useRef<RunStats>({ deepestFloor: 1, totalKills: 0, totalItems: 0, bossKills: [], diedOnFloor1: false });
  const achievementsRef = useRef<string[]>(loadAchievements());
  const newAchievementsRef = useRef<Achievement[]>([]);
  const isDailyRef = useRef(false);
  const titlesRef = useRef<Title[]>(loadTitles());

  // Game tick
  const { state: loopState } = useGameLoop(() => {
    tickRef.current++;
    if (screen === "dungeon" && tickRef.current % 2 === 0) {
      // Monster AI: move toward player
      setDungeon((prev: DungeonState) => {
        const ms = prev.monsters.map((m) => {
          const dx = player.x - m.x;
          const dy = player.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= 10 && dist > 1) {
            const nx = m.x + Math.sign(dx);
            const ny = m.y + Math.sign(dy);
            // Check if target cell is empty (not wall, not another monster)
            const blocked = prev.grid[ny]?.[nx] === 1 ||
              prev.monsters.some((om) => om !== m && om.x === nx && om.y === ny);
            if (!blocked) {return { ...m, x: nx, y: ny };}
          }
          return m;
        });
        return { ...prev, monsters: ms, explored: prev.explored || [] };
      });
    }
  }, { fps: 10, autoStart: true });

  // Keyboard
  const { isPressed } = useKeyboardInput();
  useEffect(() => {
    if (isPressed("i") || isPressed("I")) {
      if (screen === "dungeon") {setScreen("inventory");}
    }
    if (isPressed("Escape")) {
      if (screen === "inventory") {setScreen("dungeon");}
    }
  }, [isPressed, screen, locale]);

  const addLog = useCallback((msg: string) => {
    setLogMessages((prev: string[]) => [...prev.slice(-4), msg]);
  }, []);

  const applyPerk = useCallback((perkId: string) => {
    const perk = getPerk(perkId);
    setPerkChoices([]);
    const pending = perkPendingRef.current;
    perkPendingRef.current = null;
    if (!perk) {return;}
    setPlayer((prev) => {
      const newPerks = [...prev.perks, perkId];
      const newStats = perk.statBonus ? { ...prev.baseStats } : prev.baseStats;
      if (perk.statBonus) {
        const s = perk.statBonus;
        if (s.str) {newStats.str += s.str;}
        if (s.sta) {newStats.sta += s.sta;}
        if (s.wil) {newStats.wil += s.wil;}
        if (s.int) {newStats.int += s.int;}
      }
      const nhp = calcMaxHp(newStats);
      const nmp = calcMaxMp(newStats);
      let heal = perkId === "second-wind" ? Math.floor(nhp * 0.25) : 0;
      ddAudio.play("levelUp");
      if (typeof particlesRef === "object" && particlesRef.current) {particlesRef.current.spawnLevelUp(prev.x * CELL + CELL / 2, HUD_H + prev.y * CELL + CELL / 2);}
      addLog((perk.nameEn || perkId) + "! Level Up!");
      return { ...prev, xp: pending!.xp, xpToNext: pending!.xpToNext, level: pending!.level, perks: newPerks, baseStats: newStats, maxHp: nhp, hp: Math.min(prev.hp + heal, nhp), maxMp: nmp, mp: Math.min(prev.mp, nmp) };
    });
  }, [addLog]);

  const race = RACES.find((r) => r.id === selectedRace)!;
  const cls = CLASSES.find((c) => c.id === selectedClass)!;

  // Start run
  const startRun = useCallback(() => {
    newAchievementsRef.current = [];
    if (!selectedRace || !selectedClass) {return;}
    deleteSavedRun(); // clear any old save
    const r = RACES.find((r) => r.id === selectedRace)!;
    const c = CLASSES.find((c) => c.id === selectedClass)!;
    const stats = computePlayerStats(r, c, { head: null, body: null, hands: null, feet: null, mainhand: null, offhand: null, ring: null, amulet: null }, titlesRef.current);
    const maxHp = calcMaxHp(stats);
    const maxMp = calcMaxMp(stats);

    setPlayer({
      x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2),
      hp: maxHp, maxHp, mp: maxMp, maxMp,
      level: 1, xp: 0, xpToNext: calcXpToNext(1),
      race: selectedRace, class: selectedClass,
      baseStats: stats,
      equipped: { head: null, body: null, hands: null, feet: null, mainhand: null, offhand: null, ring: null, amulet: null },
      inventory: [],
      gold: 0,
      perks: [],
    });
    setFloor(1);
    setDungeon(generateFloor(1));
    runStatsRef.current = { deepestFloor: 1, totalKills: 0, totalItems: 0, bossKills: [], diedOnFloor1: false };
    setScreen("dungeon");
    addLog("You descend into the depths...");
  }, [selectedRace, selectedClass, addLog]);

  // Daily challenge start
  const startDailyRun = useCallback(() => {
    if (!selectedRace || !selectedClass || hasDailyAttempt()) {return;}
    markDailyAttempt();
    isDailyRef.current = true;
    const r = RACES.find((r) => r.id === selectedRace)!;
    const c = CLASSES.find((c) => c.id === selectedClass)!;
    const stats = computePlayerStats(r, c, { head: null, body: null, hands: null, feet: null, mainhand: null, offhand: null, ring: null, amulet: null }, titlesRef.current);
    const maxHp = calcMaxHp(stats);
    const maxMp = calcMaxMp(stats);
    deleteSavedRun();
    setPlayer({
      x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2),
      hp: maxHp, maxHp, mp: maxMp, maxMp,
      level: 1, xp: 0, xpToNext: calcXpToNext(1),
      race: selectedRace, class: selectedClass,
      baseStats: stats,
      equipped: { head: null, body: null, hands: null, feet: null, mainhand: null, offhand: null, ring: null, amulet: null },
      inventory: [],
      gold: 0,
      perks: [],
    });
    setFloor(1);
    setDungeon(generateDailyFloor(1));
    runStatsRef.current = { deepestFloor: 1, totalKills: 0, totalItems: 0, bossKills: [], diedOnFloor1: false };
    setScreen("dungeon");
    addLog("Daily Challenge started! Floor " + getDailySeed());
  }, [selectedRace, selectedClass, addLog]);

  // Override descendStairs to use daily floor gen when in daily mode
  const descendStairsWrapped = useCallback(() => {
    const nextFloor = floor + 1;
    const newDung = isDailyRef.current ? generateDailyFloor(nextFloor) : generateFloor(nextFloor);
    const newPlayer = { ...player, x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };
    setFloor(nextFloor);
    setDungeon(newDung);
    setPlayer(newPlayer);
    if (nextFloor > runStatsRef.current.deepestFloor) {
      runStatsRef.current.deepestFloor = nextFloor;
    }
    const thCount = player.perks.filter((p) => p === 'treasure-hunter').length;
    for (let i = 0; i < thCount; i++) {
      const itms = getItemsForFloor(nextFloor);
      if (itms.length > 0) {
        let ix = rand(1, COLS - 2), iy = rand(1, ROWS - 2), att = 0;
        while ((newDung.grid[iy]?.[ix] !== 0 || newDung.items.some((it: { x: number; y: number }) => it.x === ix && it.y === iy)) && att < 100) { ix = rand(1, COLS - 2); iy = rand(1, ROWS - 2); att++; }
        if (att < 100) {newDung.items.push({ item: weightedPick(itms), x: ix, y: iy });}
      }
    }
    saveRunToLocal(newPlayer, nextFloor, newDung, runStatsRef.current);
    addLog(`You descend to floor ${nextFloor}... [Saved]`);
  }, [floor, player, addLog]);

  // Descend stairs (shop → save → next floor)
  const descendStairs = useCallback(() => {
    const nextFloor = floor + 1;
    // Generate shop inventory (3-5 items, scaled by floor)
    const availItems = getItemsForFloor(nextFloor);
    const count = 3 + Math.floor(Math.random() * 3);
    const shop: Item[] = [];
    for (let i = 0; i < count && availItems.length > 0; i++) {
      shop.push(pick(availItems));
    }
    setShopItems(shop);
    setPendingNextFloor(nextFloor);
    setScreen("shop");
    ddAudio.play("click");
    addLog(nextFloor % BOSS_EVERY === 0 ? "A merchant waits before the boss..." : "A merchant beckons from the shadows...");
  }, [floor, addLog]);

  // Continue from shop to next floor
  const continueFromShop = useCallback(() => {
    const nextFloor = pendingNextFloor;
    setScreen("dungeon");
    const newDung = generateFloor(nextFloor);
    const newPlayer = { ...player, x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };
    setFloor(nextFloor);
    setDungeon(newDung);
    setPlayer(newPlayer);
    if (nextFloor > runStatsRef.current.deepestFloor) {
      runStatsRef.current.deepestFloor = nextFloor;
    }
    // G5: Treasure Hunter — +1 extra item per stack
    const thCount = player.perks.filter((p) => p === 'treasure-hunter').length;
    for (let i = 0; i < thCount; i++) {
      const itms = getItemsForFloor(nextFloor);
      if (itms.length > 0) {
        let ix = rand(1, COLS - 2), iy = rand(1, ROWS - 2), att = 0;
        while ((newDung.grid[iy]?.[ix] !== 0 || newDung.items.some((it: { x: number; y: number }) => it.x === ix && it.y === iy)) && att < 100) { ix = rand(1, COLS - 2); iy = rand(1, ROWS - 2); att++; }
        if (att < 100) {newDung.items.push({ item: weightedPick(itms), x: ix, y: iy });}
      }
    }
    // Auto-save on descend
    saveRunToLocal(newPlayer, nextFloor, newDung, runStatsRef.current);
    addLog(`You descend to floor ${nextFloor}... [Saved]`);
  }, [floor, player, addLog, pendingNextFloor]);

  // Buy item from shop
  const buyShopItem = useCallback((item: Item, price: number) => {
    if (player.gold < price) {
      addLog("Not enough gold!");
      return;
    }
    setPlayer((prev) => ({ ...prev, gold: prev.gold - price, inventory: [...prev.inventory, item].slice(0, 20) }));
    setShopItems((prev) => prev.filter((i) => i !== item));
    addLog(`Bought ${item.nameEn} for ${price} gold!`);
    ddAudio.play("equip");
  }, [player.gold, addLog]);

  // Handle death (deletes save so you can't reload)
  const handleDeath = useCallback(() => {
    if (floor === 1) {runStatsRef.current.diedOnFloor1 = true;}
    deleteSavedRun();
    // Check for new titles
    const newTitles = TITLES.filter((title) =>
      title.condition(runStatsRef.current) &&
      !titlesRef.current.some((t) => t.id === title.id)
    );
    if (newTitles.length > 0) {
      titlesRef.current = [...titlesRef.current, ...newTitles];
      saveTitles(titlesRef.current);
    }
    // Check achievements
    const newAchs = checkAchievements(
      runStatsRef.current,
      achievementsRef.current,
      player.race,
      player.class,
      isDailyRef.current,
    );
    if (newAchs.length > 0) {
      achievementsRef.current = [...achievementsRef.current, ...newAchs.map((a) => a.id)];
      saveAchievements(achievementsRef.current);
      newAchievementsRef.current = newAchs;
    }
    // Dispatch game:complete for PostGameCTA / leaderboard
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("game:complete", {
        detail: { score: runStatsRef.current.deepestFloor, kills: runStatsRef.current.totalKills, items: runStatsRef.current.totalItems },
      }));
      // Submit to leaderboard (silently ignores auth/network errors)
      fetch("/api/leaderboard/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: isDailyRef.current ? "DUNGEON_DELVER_DAILY" : "DUNGEON_DELVER", score: runStatsRef.current.deepestFloor }),
      }).catch(() => { /* guest user or network issue — skip */ });
    }
    ddAudio.stopAmbient();
    ddAudio.play("death");
    setScreen("death");
  }, [floor, player]);

  // Kill a monster
  const killMonster = useCallback((monster: FloorMonster) => {
    runStatsRef.current.totalKills++;
    if (monster.monster.id === "dragon") {
      runStatsRef.current.bossKills.push("dragon");
    }
    setDungeon((prev) => ({
      ...prev,
      monsters: prev.monsters.filter((m) => m !== monster),
      explored: prev.explored,
    }));
    setPlayer((prev: PlayerState) => {
      let newXp = prev.xp + monster.monster.xp;
      // Quick Learner perk: +15% XP per stack
      const qlCount = prev.perks.filter((p) => p === 'quick-learner').length;
      newXp = Math.floor(newXp * (1 + qlCount * 0.15));
      if (newXp >= prev.xpToNext) {
        const choices = getLevelUpChoices(prev.class as ClassId, prev.perks);
        if (choices.length === 0) {choices.push(PERKS[0], PERKS[5]);} // fallback
        addLog('Level Up! Choose a perk...');
        setPerkChoices(choices);
        perkPendingRef.current = { xp: newXp - prev.xpToNext, xpToNext: calcXpToNext(prev.level + 1), level: prev.level + 1 };
        // Pause game until perk is chosen
        return prev;
      }
      return { ...prev, xp: newXp };
    });
  }, [addLog, t]);

  // Attack
  const attackMonster = useCallback((monster: FloorMonster) => {
    const c = CLASSES.find((c) => c.id === player.class)!;
    const isMagic = c.attackType === "ranged" || (c.attackType === "hybrid" && player.equipped.mainhand?.type === "weapon" && player.equipped.mainhand.id.includes("staff"));
    const baseDmg = isMagic ? calcMagicDamage(player.baseStats) : calcMeleeDamage(player.baseStats);

    // Critical hit 10%
    const crit = Math.random() < 0.1;
    let dmg = crit ? baseDmg * 2 : baseDmg;

    // G7: Poison Blade — 30% poison on melee hit (non-magic)
    let poisonTarget: FloorMonster | null = null;
    if (!isMagic && player.perks.includes('poison-blade') && Math.random() < 0.3) {
      poisonTarget = monster;
    }
    // G8: Spell Echo — 25% chance: 50% splash damage to adjacent monsters
    if (isMagic && player.perks.includes('spell-echo') && Math.random() < 0.25) {
      const sx = monster.x, sy = monster.y, splashDmg = Math.floor(dmg * 0.5);
      dungeon.monsters.forEach((m) => {
        if (m !== monster && Math.abs(m.x - sx) <= 1 && Math.abs(m.y - sy) <= 1) {
          m.hp -= splashDmg;
          if (particlesRef?.current) {particlesRef.current.spawnSparks(m.x * CELL + CELL / 2, HUD_H + m.y * CELL + CELL / 2, 3, '#9c27b0');}
          addLog(`Spell echo hits ${m.monster.nameEn} for ${splashDmg}!`);
          if (m.hp <= 0) {
            killMonster(m);
            addLog(`${m.monster.nameEn} is slain!`);
          }
        }
      });
    }

    const newHp = monster.hp - dmg;
    addLog(`You hit ${monster.monster.nameEn} for ${dmg} damage${crit ? " (CRIT!)" : ""}!`);

    if (newHp <= 0) {
      // G9: Corpse Explosion — 20% chance: AoE to adjacent monsters
      if (player.perks.includes('corpse-explosion') && Math.random() < 0.2) {
        const cx = monster.x, cy = monster.y;
        dungeon.monsters.forEach((m) => {
          if (m !== monster && Math.abs(m.x - cx) <= 1 && Math.abs(m.y - cy) <= 1) {
            const splash = Math.floor(dmg * 0.5);
            m.hp -= splash;
            particlesRef.current?.spawnDamage(m.x * CELL + CELL / 2, HUD_H + m.y * CELL + CELL / 2, splash, false, false);
            addLog(`Corpse explosion hits ${m.monster.nameEn} for ${splash}!`);
          }
        });
      }
      killMonster(monster);
      addLog(`${monster.monster.nameEn} is slain!`);
    } else {
      setDungeon((prev) => ({
        ...prev,
        monsters: prev.monsters.map((m) => m === monster ? { ...m, hp: newHp } : m),
        explored: prev.explored,
      }));
    }

    // Counter-attack
    let counterDmg = monster.monster.damage + Math.floor(Math.random() * 3);
    // G6: Evasion perk — dodge chance
    const evaCount = player.perks.filter((p) => p === 'evasion').length;
    if (evaCount > 0) {
      const dodgeChance = Math.min(evaCount * 0.1, 0.5); // 10% per stack, max 50%
      if (Math.random() < dodgeChance) {
        counterDmg = 0;
        addLog("You evade the attack!");
      }
    }
    // Elemental resist: reduce monster counter-damage
    if (monster.monster.element) {
      const char = buildCharacter(RACES.find((r) => r.id === player.race)!, CLASSES.find((c) => c.id === player.class)!, player.equipped, titlesRef.current);
      const resistVal: number = (char.resists as unknown as Record<string, number>)[monster.monster.element] || 0;
      counterDmg = Math.floor(counterDmg * (1 - Math.min(resistVal, 75) / 100));
    }
    setPlayer((prev: PlayerState) => {
      const newHp = prev.hp - counterDmg;
      addLog(`${monster.monster.nameEn} hits you for ${counterDmg} damage!`);
      return { ...prev, hp: Math.max(0, newHp) };
    });

    // Check if player died
    setPlayer((prev: PlayerState) => {
      if (prev.hp <= 2) {
        setTimeout(() => handleDeath(), 100);
      }
      return prev;
    });
  }, [player, addLog, killMonster, handleDeath, dungeon]);

  // Pick up item
  const pickUpItem = useCallback((item: Item) => {
    runStatsRef.current.totalItems++;
    setDungeon((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.item !== item),
      explored: prev.explored,
    }));
    if (item.type === "consumable") {
      // Auto-use consumables
      if (item.id === "health-potion") {
        setPlayer((p) => ({ ...p, hp: Math.min(p.hp + 30, p.maxHp) }));
        addLog(`Used Health Potion! +30 HP`);
      } else if (item.id === "mana-potion") {
        setPlayer((p) => ({ ...p, mp: Math.min(p.mp + 20, p.maxMp) }));
        addLog(`Used Mana Potion! +20 MP`);
      } else if (item.id === "scroll-power") {
        setPlayer((p) => ({ ...p, baseStats: { ...p.baseStats, str: p.baseStats.str + 3, int: p.baseStats.int + 3 } }));
        addLog(`Used Scroll of Power! +3 STR, +3 INT`);
      }
    } else {
      setPlayer((prev: PlayerState) => ({
        ...prev,
        inventory: [...prev.inventory, item].slice(0, 20),
      }));
      addLog(`Picked up ${item.nameEn}!`);
    }
  }, [addLog]);

  // Equip item
  const equipItem = useCallback((item: Item) => {
    if (!item.slot) {return;}
    setPlayer((prev: PlayerState) => {
      const newEquipped = { ...prev.equipped };
      // Unequip current item in same slot
      const old = newEquipped[item.slot!];
      const newInv = prev.inventory.filter((i: Item) => i !== item);
      if (old) {newInv.push(old);}

      newEquipped[item.slot!] = item;
      const r = RACES.find((r) => r.id === prev.race)!;
      const c = CLASSES.find((c) => c.id === prev.class)!;
      const newStats = computePlayerStats(r, c, newEquipped, titlesRef.current);
      const newMaxHp = calcMaxHp(newStats);
      const newMaxMp = calcMaxMp(newStats);

      addLog(`Equipped ${item.nameEn}!`);
      return {
        ...prev,
        equipped: newEquipped,
        inventory: newInv,
        baseStats: newStats,
        maxHp: newMaxHp,
        hp: Math.min(prev.hp, newMaxHp),
        maxMp: newMaxMp,
        mp: Math.min(prev.mp, newMaxMp),
      };
    });
  }, [addLog]);

  // Unequip item
  const unequipItem = useCallback((slot: keyof EquippedItems) => {
    setPlayer((prev: PlayerState) => {
      const item = prev.equipped[slot];
      if (!item) {return prev;}
      const newEquipped = { ...prev.equipped, [slot]: null };
      const r = RACES.find((r) => r.id === prev.race)!;
      const c = CLASSES.find((c) => c.id === prev.class)!;
      const newStats = computePlayerStats(r, c, newEquipped, titlesRef.current);
      const newMaxHp = calcMaxHp(newStats);
      const newMaxMp = calcMaxMp(newStats);

      return {
        ...prev,
        equipped: newEquipped,
        inventory: [...prev.inventory, item],
        baseStats: newStats,
        maxHp: newMaxHp,
        hp: Math.min(prev.hp, newMaxHp),
        maxMp: newMaxMp,
        mp: Math.min(prev.mp, newMaxMp),
      };
    });
  }, []);

  // Use item from inventory
  const consumeItem = useCallback((item: Item) => {
    if (item.type === "consumable" && item.healAmount) {
      setPlayer((prev: PlayerState) => ({
        ...prev,
        hp: Math.min(prev.hp + item.healAmount!, prev.maxHp),
        inventory: prev.inventory.filter((i: Item) => i !== item),
      }));
      addLog(`Used ${item.nameEn}! +${item.healAmount} HP`);
    }
  }, [addLog]);

  // Canvas click handler
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (screen !== "dungeon") {return;}
    const canvas = canvasRef.current;
    if (!canvas) {return;}
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const mx = Math.floor((e.clientX - rect.left) * scaleX / CELL);
    const my = Math.floor((e.clientY - rect.top) * scaleY / CELL);

    // Clicked HUD area
    if (my < HUD_H / CELL) {return;}

    const gridY = my - Math.floor(HUD_H / CELL);

    // Check if clicked on stairs
    if (dungeon.grid[gridY]?.[mx] === 2 && mx === player.x && gridY === player.y) {
      descendStairsWrapped();
      return;
    }

    // Check if clicked on monster
    const clickedMonster = dungeon.monsters.find((m: { x: number; y: number }) => m.x === mx && m.y === gridY);
    if (clickedMonster) {
      const dist = Math.abs(mx - player.x) + Math.abs(gridY - player.y);
      if (dist <= 1) {
        // Adjacent - melee attack
        attackMonster(clickedMonster);
      } else if (dist <= (player.perks.includes('deaths-reach') ? 4 : 3) && (CLASSES.find((c) => c.id === player.class)!.attackType === "ranged" || CLASSES.find((c) => c.id === player.class)!.attackType === "hybrid")) {
        // Ranged attack
        attackMonster(clickedMonster);
      }
      return;
    }

    // Check if clicked on item
    const clickedItem = dungeon.items.find((i: { x: number; y: number }) => i.x === mx && i.y === gridY);
    if (clickedItem && mx === player.x && gridY === player.y) {
      pickUpItem(clickedItem.item);
      return;
    }

    // Move player
    if (dungeon.grid[gridY]?.[mx] === 0 || dungeon.grid[gridY]?.[mx] === 2) {
      // Check no monster in target
      const monsterAtTarget = dungeon.monsters.find((m: { x: number; y: number }) => m.x === mx && m.y === gridY);
      if (!monsterAtTarget) {
        setPlayerAnim({ x: player.x, y: player.y, progress: 0 });
        setPlayer((prev: PlayerState) => ({ ...prev, x: mx, y: gridY }));
        // Check if standing on stairs -> prompt
        if (dungeon.grid[gridY]?.[mx] === 2) {
          addLog(t("stairsFound"));
        }
        // Check if standing on item (or adjacent with Quick Fingers)
        const qfActive = player.perks.includes('quick-fingers');
        const scanRange = qfActive ? 1 : 0;
        for (let dy = -scanRange; dy <= scanRange; dy++) {
          for (let dx = -scanRange; dx <= scanRange; dx++) {
            const sx = mx + dx, sy = gridY + dy;
            if (sx < 0 || sx >= COLS || sy < 0 || sy >= ROWS) {continue;}
            const itemAtPos = dungeon.items.find((i: { x: number; y: number }) => i.x === sx && i.y === sy);
            if (itemAtPos) {
              pickUpItem(itemAtPos.item);
            }
          }
        }
      }
    }
  }, [screen, dungeon, player, descendStairs, attackMonster, pickUpItem, addLog, t]);

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {return;}
    const ctx = canvas.getContext("2d");
    if (!ctx) {return;}

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Fog of war — update explored tiles around player
    const visionRange = floor % BOSS_EVERY === 0 ? 99 : 4; // boss floor: full vision
    const explored = dungeon.explored.map((row) => [...row]);
    for (let dy = -visionRange; dy <= visionRange; dy++) {
      for (let dx = -visionRange; dx <= visionRange; dx++) {
        const fx = player.x + dx, fy = player.y + dy;
        if (fx >= 0 && fx < COLS && fy >= 0 && fy < ROWS) {explored[fy][fx] = true;}
      }
    }

    if (screen === "dungeon") {
      // Draw grid
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const px = x * CELL;
          const py = HUD_H + y * CELL;

          if (!explored[y][x]) {
            // Unexplored — dark fog
            ctx.fillStyle = "#0a0a15";
            ctx.fillRect(px, py, CELL, CELL);
          } else if (dungeon.grid[y][x] === 1) {
            ctx.fillStyle = "#3d3d5c";
            ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
            // Darker inner
            ctx.fillStyle = "#2a2a44";
            ctx.fillRect(px + 3, py + 3, CELL - 6, CELL - 6);
          } else {
            ctx.fillStyle = "#222244";
            ctx.fillRect(px, py, CELL, CELL);
            // Grid lines
            ctx.strokeStyle = "#1a1a38";
            ctx.strokeRect(px, py, CELL, CELL);
          }

          // Stairs
          if (dungeon.grid[y][x] === 2) {
            ctx.fillStyle = "#ffd700";
            ctx.font = "18px serif";
            ctx.textAlign = "center";
            ctx.fillText("⬇", px + CELL / 2, py + CELL / 2 + 6);
          }
        }
      }

      // Draw items (only in explored)
      for (const { item, x, y: iy } of dungeon.items) {
        if (!explored[iy][x]) {continue;}
        const px = x * CELL + 4;
        const py = HUD_H + iy * CELL + 4;
        ctx.font = "14px serif";
        ctx.textAlign = "center";
        ctx.fillText(item.emoji, px + CELL / 2 - 2, py + CELL / 2 + 4);
      }

      // Draw monsters (only in explored)
      for (const m of dungeon.monsters) {
        if (!explored[m.y][m.x]) {continue;}
        const px = m.x * CELL + 4;
        const py = HUD_H + m.y * CELL + 4;
        ctx.font = "20px serif";
        ctx.textAlign = "center";
        ctx.fillText(m.monster.emoji, px + CELL / 2 - 2, py + CELL / 2 + 8);
        // HP bar
        const hpPct = m.hp / (m.monster.hp + (floor - 1) * 2);
        ctx.fillStyle = "#333";
        ctx.fillRect(px, py - 2, CELL - 8, 3);
        ctx.fillStyle = hpPct > 0.5 ? "#4caf50" : hpPct > 0.25 ? "#ff9800" : "#f44336";
        ctx.fillRect(px, py - 2, (CELL - 8) * hpPct, 3);
      }

      // Draw player
      const ppx = player.x * CELL + 4;
      const ppy = HUD_H + player.y * CELL + 4;
      ctx.font = "22px serif";
      ctx.textAlign = "center";
      ctx.fillText("🧝", ppx + CELL / 2 - 2, ppy + CELL / 2 + 8);

      // HUD
      ctx.fillStyle = "#0d0d1a";
      ctx.fillRect(0, 0, CANVAS_W, HUD_H);
      ctx.fillStyle = "#e0e0ff";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "left";
      const clsName = CLASSES.find((c) => c.id === player.class)!.nameEn;
      const raceName = RACES.find((r) => r.id === player.race)!.nameEn;
      ctx.fillText(`${isDailyRef.current ? "📅 " : ""}${t("floor")} ${floor}  |  ${raceName} ${clsName}  |  ${t("lvl")} ${player.level}`, 8, 18);
      ctx.fillText(`${t("hp")}: ${Math.ceil(player.hp)}/${player.maxHp}  ${t("mp")}: ${Math.ceil(player.mp)}/${player.maxMp}  ${t("xp")}: ${player.xp}/${player.xpToNext}`, 8, 38);
      ctx.fillText(`${t("statsStr")}: ${Math.floor(player.baseStats.str)}  ${t("statsSta")}: ${Math.floor(player.baseStats.sta)}  ${t("statsInt")}: ${Math.floor(player.baseStats.int)}  ${t("statsWil")}: ${Math.floor(player.baseStats.wil)}  |  ${t("dmg")}: ${Math.floor(calcMeleeDamage(player.baseStats))}`, 8, 56);

      // HP/MP bars
      const hpPct = player.hp / player.maxHp;
      ctx.fillStyle = "#333";
      ctx.fillRect(CANVAS_W - 160, 4, 152, 18);
      ctx.fillStyle = hpPct > 0.5 ? "#4caf50" : hpPct > 0.25 ? "#ff9800" : "#f44336";
      ctx.fillRect(CANVAS_W - 160, 4, 152 * hpPct, 18);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(`${t("hp")}`, CANVAS_W - 84, 18);

      const mpPct = player.mp / player.maxMp;
      ctx.fillStyle = "#333";
      ctx.fillRect(CANVAS_W - 160, 26, 152, 14);
      ctx.fillStyle = "#2196f3";
      ctx.fillRect(CANVAS_W - 160, 26, 152 * mpPct, 14);
      ctx.fillStyle = "#fff";
      ctx.fillText(`${t("mp")}`, CANVAS_W - 84, 38);

      // Log
      ctx.textAlign = "left";
      ctx.font = "11px monospace";
      for (let i = 0; i < logMessages.length; i++) {
        ctx.fillText(logMessages[i], 8, HUD_H + ROWS * CELL + 14 + i * 14);
      }
    }
  }, [screen, player, dungeon, floor, logMessages, t]);

  // ─── Title Screen Render ─────────────────────────────────────
  if (screen === "title") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d1a] p-4 text-[#e0e0ff]">
        <h1 className="mb-2 text-4xl font-bold tracking-wider text-[#ffd700]">{t("title")}</h1>
        <p className="mb-8 text-lg opacity-70">{t("subtitle")}</p>

        {/* Daily Challenge */}
        <button
          onClick={() => {
            if (hasDailyAttempt()) {return;}
            if (!selectedRace || !selectedClass) {return;}
            startDailyRun();
          }}
          disabled={hasDailyAttempt()}
          className={`mb-4 rounded-lg border-2 px-6 py-3 font-bold transition-all ${
            hasDailyAttempt()
              ? "border-[#666] bg-[#1a1a1a] text-[#666] cursor-not-allowed text-sm"
              : selectedRace && selectedClass
                ? "border-[#ff9800] bg-[#1a1a2e] text-[#ff9800] hover:bg-[#2a2a3e] hover:scale-105"
                : "border-[#666] bg-[#1a1a1a] text-[#666] cursor-not-allowed text-sm"
          }`}
        >
          {hasDailyAttempt()
            ? (locale === "en" ? "🔒 Daily Challenge Completed" : "🔒 Défi Quotidien Terminé")
            : (locale === "en" ? "📅 Daily Challenge (" + getDailySeed() + ")" : "📅 Défi Quotidien (" + getDailySeed() + ")")}
        </button>

        {/* Continue saved run */}
        {hasSavedRun() && (
          <button
            onClick={() => {
              const saved = loadSavedRun();
              if (saved) {
                runStatsRef.current = saved.runStats;
                titlesRef.current = loadTitles();
                setPlayer(saved.player);
                setFloor(saved.floor);
                setDungeon(saved.dungeon);
                setScreen("dungeon");
                addLog("Run resumed from floor " + saved.floor + "...");
              }
            }}
            className="mb-6 rounded-lg border-2 border-[#ffd700] bg-[#1a1a2e] px-6 py-3 font-bold text-[#ffd700] transition-all hover:bg-[#2a2a4a] hover:scale-105"
          >
            {locale === "en" ? "▶ Continue Run" : "▶ Continuer la Partie"}
          </button>
        )}

        {/* Race Selection */}
        <div className="mb-6 w-full max-w-2xl">
          <h2 className="mb-3 text-center text-xl font-semibold text-[#ffd700]">{t("chooseRace")}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RACES.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRace(r.id)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  selectedRace === r.id
                    ? "border-[#ffd700] bg-[#2a2a4a] shadow-lg shadow-[#ffd700]/20"
                    : "border-[#333] bg-[#1a1a2e] hover:border-[#666]"
                }`}
              >
                <div className="font-bold text-sm">
                  {locale === "fr" ? r.nameFr : r.nameEn}
                </div>
                <div className="mt-1 text-[10px] opacity-70 leading-tight">
                  {locale === "fr" ? r.descFr : r.descEn}
                </div>
                <div className="mt-1 text-[10px] text-[#ffd700]">
                  {locale === "fr" ? r.abilityFr : r.abilityEn}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Class Selection */}
        {selectedRace && (
          <div className="mb-8 w-full max-w-2xl">
            <h2 className="mb-3 text-center text-xl font-semibold text-[#ffd700]">{t("chooseClass")}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {CLASSES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClass(c.id)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    selectedClass === c.id
                      ? "border-[#ffd700] bg-[#2a2a4a] shadow-lg shadow-[#ffd700]/20"
                      : "border-[#333] bg-[#1a1a2e] hover:border-[#666]"
                  }`}
                >
                  <div className="font-bold text-sm">
                    {locale === "fr" ? c.nameFr : c.nameEn}
                  </div>
                  <div className="mt-1 text-[10px] opacity-70 leading-tight">
                    {locale === "fr" ? c.descFr : c.descEn}
                  </div>
                  <div className="mt-1 text-[10px] text-[#ffd700]">
                    {locale === "fr" ? c.skillFr : c.skillEn}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Start Button */}
        {selectedRace && selectedClass && (
          <button
            onClick={startRun}
            className="rounded-lg bg-[#ffd700] px-8 py-3 font-bold text-[#0d0d1a] text-lg transition-all hover:bg-[#ffed4a] hover:scale-105"
          >
            {t("start")}
          </button>
        )}

        {/* Language Toggle */}
        <button
          onClick={() => setLocale((l) => (l === "en" ? "fr" : "en"))}
          className="mt-6 text-xs opacity-50 hover:opacity-80"
        >
          {locale === "en" ? "Français" : "English"}
        </button>
      </div>
    );
  }

  // ─── Death Screen Render ─────────────────────────────────────
  if (screen === "death") {
    const earnedTitles = TITLES.filter((title) =>
      title.condition(runStatsRef.current) && titlesRef.current.includes(title)
    );
    const newTitles = TITLES.filter((title) =>
      title.condition(runStatsRef.current) && !titlesRef.current.includes(title)
    );

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d1a] p-4 text-[#e0e0ff]">
        <h1 className="mb-2 text-4xl font-bold text-[#f44336]">{t("gameOver")}</h1>

        {runStatsRef.current.diedOnFloor1 && (
          <p className="mb-4 text-lg text-[#ff9800] italic">{t("youDiedOnFloor1")}</p>
        )}

        <div className="mb-6 w-full max-w-md rounded-lg border border-[#333] bg-[#1a1a2e] p-4">
          <h2 className="mb-3 text-center text-xl text-[#ffd700]">{t("runSummary")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="opacity-70">{t("deepestFloor")}:</span>
              <span className="font-bold">{runStatsRef.current.deepestFloor}</span>
              {isDailyRef.current && (
                <span className="ml-2 text-[#ff9800] text-xs">
                  {locale === "en" ? "(Daily Challenge)" : "(Défi Quotidien)"}
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">{t("totalKills")}:</span>
              <span className="font-bold">{runStatsRef.current.totalKills}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">{t("itemsFound")}:</span>
              <span className="font-bold">{runStatsRef.current.totalItems}</span>
            </div>
          </div>

          {/* Achievements */}
          {achievementsRef.current.length > 0 && (
            <div className="mt-4 border-t border-[#333] pt-3">
              <h3 className="mb-2 text-sm font-semibold text-[#ff9800]">🏆 Achievements ({achievementsRef.current.length})</h3>
              {ACHIEVEMENTS.filter((a) => achievementsRef.current.includes(a.id)).map((a) => (
                <div key={a.id} className="inline-flex items-center gap-1 mr-2 mb-1 rounded bg-[#2a2a44] px-2 py-1 text-xs" title={locale === "fr" ? a.descFr : a.descEn}>
                  {a.icon} {locale === "fr" ? a.nameFr : a.nameEn}
                </div>
              ))}
            </div>
          )}

          {/* New Achievements */}
          {newAchievementsRef.current.length > 0 && (
            <div className="mt-3 rounded-lg border border-[#ff9800]/50 bg-[#ff9800]/10 p-3 text-center">
              <span className="font-bold text-[#ff9800]">{locale === "en" ? "🏆 New Achievement!" : "🏆 Nouveau Succès !"}</span>
              <div className="mt-1 text-sm">
                {newAchievementsRef.current.map((a) => (
                  <div key={a.id}>{a.icon} {locale === "fr" ? a.nameFr : a.nameEn}</div>
                ))}
              </div>
            </div>
          )}

          {/* Titles */}
          {earnedTitles.length > 0 && (
            <div className="mt-4 border-t border-[#333] pt-3">
              <h3 className="mb-2 text-sm font-semibold text-[#ffd700]">{t("titleEarned")}:</h3>
              {earnedTitles.map((title) => (
                <div key={title.id} className="rounded bg-[#2a2a4a] p-2 mb-1 text-sm">
                  <span className="font-bold">{locale === "fr" ? title.nameFr : title.nameEn}</span>
                  <span className="mx-2 opacity-50">—</span>
                  <span className="opacity-70">{locale === "fr" ? title.descFr : title.descEn}</span>
                </div>
              ))}
            </div>
          )}

          {newTitles.length > 0 && (
            <div className="mt-3 rounded-lg border border-[#ffd700] bg-[#ffd700]/10 p-3 text-center">
              <span className="font-bold text-[#ffd700]">{t("newTitle")}</span>
              <div className="mt-1 text-sm">
                {newTitles.map((t) => locale === "fr" ? t.nameFr : t.nameEn).join(", ")}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => { setScreen("title"); setSelectedClass(null); }}
          className="rounded-lg bg-[#4caf50] px-6 py-2 font-bold text-white hover:bg-[#66bb6a] transition-all"
        >
          {t("newGame")}
        </button>
      </div>
    );
  }

  // ─── Inventory Screen Render ─────────────────────────────────
  if (screen === "inventory") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d1a] p-4 text-[#e0e0ff]">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#ffd700]">{t("inventory")}</h2>
            <button onClick={() => setScreen("dungeon")} className="rounded bg-[#333] px-3 py-1 text-sm hover:bg-[#444]">
              {t("close")}
            </button>
          </div>

          {/* Set Bonuses */}
          <div className="mb-4">
            {(() => {
              const setBonuses = computeSetBonuses(player.equipped);
              if (setBonuses.length === 0) {return null;}
              return (
                <div className="rounded border border-[#ffd700]/30 bg-[#ffd700]/5 p-3">
                  <h3 className="mb-2 text-sm font-semibold text-[#ffd700]">══ {t("setBonus")} ══</h3>
                  {setBonuses.map((sb) => (
                    <div key={sb.setId} className="text-xs mb-1">
                      <span className="font-bold text-[#ff9800]">{locale === "fr" ? sb.nameFr : sb.nameEn}</span>
                      <span className="ml-2 opacity-50">{sb.count}/3</span>
                      <span className="ml-2 opacity-70">
                        {Object.entries(sb.bonus).filter(([, v]) => v !== 0).map(([k, v]) => `${k.toUpperCase()}: +${v}`).join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Equipped */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold opacity-70">Équipé</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["head", "body", "hands", "feet", "mainhand", "offhand", "ring", "amulet"] as const).map((slot) => (
                <button
                  key={slot}
                  onClick={() => player.equipped[slot] && unequipItem(slot)}
                  className={`rounded border p-2 text-xs text-left ${
                    player.equipped[slot]
                      ? "border-[#ffd700]/50 bg-[#2a2a44] hover:border-[#f44336]"
                      : "border-[#333] bg-[#1a1a2e] opacity-40"
                  }`}
                >
                  <div className="font-bold capitalize">{slot}</div>
                  {player.equipped[slot] ? (
                    <div>{player.equipped[slot]!.emoji} {player.equipped[slot]!.nameEn}</div>
                  ) : (
                    <div className="italic">(empty)</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory items */}
          <div>
            <h3 className="mb-2 text-sm font-semibold opacity-70">Objets ({player.inventory.length})</h3>
            {player.inventory.length === 0 ? (
              <p className="text-sm opacity-50 italic">No items</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {player.inventory.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="rounded border border-[#333] bg-[#1a1a2e] p-2 flex flex-col gap-1">
                    <div className="text-sm font-bold">{item.emoji} {item.nameEn}</div>
                    <div className="text-[10px] opacity-60">
                      {Object.entries(item.statBonus).filter(([, v]) => v !== 0).map(([k, v]) => `${k.toUpperCase()}: +${v}`).join(", ")}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {item.slot && (
                        <button onClick={() => equipItem(item)} className="rounded bg-[#4caf50] px-2 py-1 text-[10px] font-bold hover:bg-[#66bb6a]">
                          {t("equip")}
                        </button>
                      )}
                      {item.type === "consumable" && (
                        <button onClick={() => consumeItem(item)} className="rounded bg-[#2196f3] px-2 py-1 text-[10px] font-bold hover:bg-[#42a5f5]">
                          {t("use")}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Shop Screen Render ──────────────────────────────────────
  if (screen === "shop") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d1a] p-4 text-[#e0e0ff]">
        <h1 className="mb-2 text-3xl font-bold text-[#ffd700]">{t("shopTitle")}</h1>
        <p className="mb-6 text-sm opacity-60">{t("shopWelcome")}</p>
        <p className="mb-4 text-[#ffd700]">💰 {t("gold")}: {player.gold}</p>
        <div className="mb-6 w-full max-w-lg">
          {shopItems.map((item, idx) => {
            const price = 5 + Math.floor((item.rarity === "common" ? 1 : item.rarity === "uncommon" ? 3 : item.rarity === "rare" ? 8 : item.rarity === "epic" ? 15 : 25) * (pendingNextFloor / 3));
            return (
              <div key={item.id + "-" + idx} className="flex items-center justify-between rounded border border-[#333] bg-[#1a1a2e] p-3 mb-2">
                <div>
                  <span className="font-bold">{item.emoji} {locale === "fr" ? item.nameFr : item.nameEn}</span>
                  <span className="ml-2 text-xs opacity-50" style={{ color: item.rarity === "legendary" ? "#ffd700" : item.rarity === "epic" ? "#9c27b0" : item.rarity === "rare" ? "#2196f3" : item.rarity === "uncommon" ? "#4caf50" : "#aaa" }}>
                    {item.rarity?.toUpperCase()}
                  </span>
                  {item.setId && <span className="ml-1 text-xs text-[#ff9800]">[{item.setId}]</span>}
                </div>
                <button
                  onClick={() => buyShopItem(item, price)}
                  disabled={player.gold < price}
                  className={"rounded px-3 py-1 text-sm font-bold transition-all " + (player.gold >= price ? "bg-[#ffd700] text-[#0d0d1a] hover:bg-[#ffed4a]" : "bg-[#333] text-[#666] cursor-not-allowed")}
                >
                  {price} 🪙 {t("shopBuy")}
                </button>
              </div>
            );
          })}
        </div>
        <button
          onClick={continueFromShop}
          className="rounded-lg bg-[#4caf50] px-8 py-3 font-bold text-white text-lg transition-all hover:bg-[#66bb6a] hover:scale-105"
        >
          {t("shopContinue")} (← Étage {pendingNextFloor})
        </button>
      </div>
    );
  }

  // ─── Dungeon Screen Render ───────────────────────────────────
  return (
    <div ref={containerRef} className="flex flex-col items-center bg-[#0d0d1a] p-2 min-h-screen">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="cursor-crosshair rounded border border-[#333]"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
        <button
          onClick={() => setScreen("inventory")}
          className="rounded bg-[#333] px-3 py-1 text-[#e0e0ff] hover:bg-[#444] transition-colors focus-visible:outline-2 focus-visible:outline-[#ffd700]"
        >
          📦 {t("inventory")} (I)
        </button>
        <button
          onClick={() => { ddAudio.setEnabled(!soundEnabled); setSoundEnabled(!soundEnabled); }}
          className="rounded bg-[#333] px-3 py-1 text-[#e0e0ff] hover:bg-[#444] transition-colors focus-visible:outline-2 focus-visible:outline-[#ffd700]"
          aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
        {dungeon.grid[player.y]?.[player.x] === 2 && (
          <button onClick={descendStairsWrapped} className="rounded bg-[#ffd700] px-3 py-1 font-bold text-[#0d0d1a] hover:bg-[#ffed4a] dd-anim-pulse-gold transition-all focus-visible:outline-2 focus-visible:outline-[#ffd700]">⬇ Descend</button>
        )}
        <span className="hidden sm:inline text-[#666]">{t("pressI")}
      {/* Perk Selection Modal */}
      {perkChoices.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" role="dialog" aria-label="Choose a perk">
          <div className="dd-anim-slide-up mx-4 w-full max-w-md rounded-xl border border-[#ffd700] bg-[#1a1a2e] p-6 shadow-2xl">
            <h2 className="mb-2 text-center text-2xl font-bold text-[#ffd700]">Level Up! Perk Choice</h2>
            <p className="mb-4 text-center text-sm opacity-70">Pick one of three abilities:</p>
            <div className="space-y-3">
              {perkChoices.map((perk) => (
                <button
                  key={perk.id}
                  onClick={() => { ddAudio.play("click"); applyPerk(perk.id); }}
                  className="w-full rounded-lg border border-[#444] bg-[#222244] p-4 text-left transition-all hover:border-[#ffd700] hover:bg-[#2a2a4a] focus-visible:outline-2 focus-visible:outline-[#ffd700]"
                >
                  <div className="font-bold">{locale === "fr" ? perk.nameFr : perk.nameEn}</div>
                  <div className="mt-1 text-sm opacity-70">{locale === "fr" ? perk.descFr : perk.descEn}</div>
                  <div className="mt-1 text-xs opacity-40">
                    {perk.category === "universal" ? "✦ Universal" : perk.category.charAt(0).toUpperCase() + perk.category.slice(1) + " only"}
                    {perk.repeatable ? " · Repeatable" : ""}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}</span>
      </div>
    </div>
  );
}

// ─── Save/Load persistence (localStorage) ──────────────────────

const SAVE_KEY = "dungeon-delver-save";
function saveRunToLocal(player: PlayerState, floor: number, dungeon: DungeonState, runStats: RunStats): void {
  try {
    const data: SaveData = { player, floor, dungeon, runStats };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded or similar — ignore */ }
}

function loadSavedRun(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {return null;}
    return JSON.parse(raw) as SaveData;
  } catch { return null; }
}

function hasSavedRun(): boolean {
  try { return localStorage.getItem(SAVE_KEY) !== null; } catch { return false; }
}

function deleteSavedRun(): void {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
}

// ─── Title persistence (localStorage) ──────────────────────────

const TITLES_KEY = "dungeon-delver-titles";

function loadTitles(): Title[] {
  try {
    const raw = localStorage.getItem(TITLES_KEY);
    if (raw) {
      const ids: string[] = JSON.parse(raw);
      return TITLES.filter((t) => ids.includes(t.id));
    }
  } catch { /* ignore */ }
  return [];
}

function saveTitles(titles: Title[]): void {
  try {
    localStorage.setItem(TITLES_KEY, JSON.stringify(titles.map((t) => t.id)));
  } catch { /* ignore */ }
}
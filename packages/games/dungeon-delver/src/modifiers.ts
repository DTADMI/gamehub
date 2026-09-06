/**
 * Stat Modifier System — Flat composable pipeline for character stats.
 *
 * Replaces the Decorator Pattern with a flat modifier list. Rationale:
 * - All bonuses are additive (no non-commutative transforms) → decorator is overkill
 * - O(n) single-pass computation vs O(n) chain traversal with copies
 * - 1 allocation per compute vs n allocations (one per wrapper layer)
 * - List is trivially serializable for save/load
 * - Same extensibility: add a new source = push to array
 *
 * Usage:
 *   const modifiers = buildModifiers(race, cls, titles, equipped);
 *   const stats = computeStats(modifiers);    // { str: 12, sta: 25, ... }
 *   const resists = computeResists(modifiers); // { fire: 25, ice: 0, ... }
 *   const desc = describeModifiers(modifiers); // "Base → Human → Warrior ⟐ Scout + Iron Sword"
 */

import type { EquippedItems, Item, Race, Stats, Resistances, ClassDef, Title } from "./types";
export type { EquippedItems, Item, Race, Stats, Resistances, ClassDef, Title };

// ─── Core Types ────────────────────────────────────────────────

export interface StatModifier {
  /** Partial stat bonuses (added to base) */
  stats: Partial<Stats>;
  /** Partial resistance bonuses (capped at 75%) */
  resists: Partial<Resistances>;
  /** Human-readable label for debugging / description */
  label: string;
  /** Source category for filtering/debugging */
  source: "base" | "race" | "class" | "title" | "equipment" | "buff" | "debuff";
}

// ─── Modifier Factories ────────────────────────────────────────

export function baseModifier(): StatModifier {
  return {
    stats: { str: 5, sta: 20, wil: 3, int: 3 },
    resists: { fire: 0, ice: 0, poison: 0, lightning: 0 },
    label: "Base",
    source: "base",
  };
}

export function raceModifier(race: Race): StatModifier {
  return {
    stats: { ...race.stats },
    resists: { ...race.resists },
    label: race.nameEn,
    source: "race",
  };
}

export function classModifier(cls: ClassDef): StatModifier {
  return {
    stats: { ...cls.stats },
    resists: {},
    label: cls.nameEn,
    source: "class",
  };
}

export function titleModifier(title: Title): StatModifier {
  return {
    stats: { ...title.bonus },
    resists: {},
    label: title.nameEn,
    source: "title",
  };
}

export function equipmentModifier(item: Item): StatModifier {
  return {
    stats: { ...item.statBonus },
    resists: { ...item.resistBonus },
    label: item.nameEn,
    source: "equipment",
  };
}

export function buffModifier(stats: Partial<Stats>, label: string): StatModifier {
  return { stats: { ...stats }, resists: {}, label, source: "buff" };
}

export function debuffModifier(stats: Partial<Stats>, label: string): StatModifier {
  return { stats: { ...stats }, resists: {}, label, source: "debuff" };
}

// ─── Computation (single-pass, 1 allocation) ───────────────────

const ZERO_STATS: Stats = { str: 0, sta: 0, wil: 0, int: 0 };
const ZERO_RESISTS: Resistances = { fire: 0, ice: 0, poison: 0, lightning: 0 };

export function computeStats(modifiers: StatModifier[]): Stats {
  const result = { ...ZERO_STATS };
  for (const mod of modifiers) {
    const s = mod.stats;
    if (s.str) result.str += s.str;
    if (s.sta) result.sta += s.sta;
    if (s.wil) result.wil += s.wil;
    if (s.int) result.int += s.int;
  }
  return result;
}

export function computeResists(modifiers: StatModifier[]): Resistances {
  const result = { ...ZERO_RESISTS };
  for (const mod of modifiers) {
    const r = mod.resists;
    if (r.fire) result.fire = Math.min(75, result.fire + r.fire);
    if (r.ice) result.ice = Math.min(75, result.ice + r.ice);
    if (r.poison) result.poison = Math.min(75, result.poison + r.poison);
    if (r.lightning) result.lightning = Math.min(75, result.lightning + r.lightning);
  }
  return result;
}

export function describeModifiers(modifiers: StatModifier[]): string {
  return modifiers.map((m) => m.label).join(" → ");
}

// ─── Builder API ───────────────────────────────────────────────

export interface CharacterBuilder {
  withRace(race: Race): CharacterBuilder;
  withClass(cls: ClassDef): CharacterBuilder;
  withTitle(title: Title): CharacterBuilder;
  withEquipment(items: EquippedItems): CharacterBuilder;
  withBuff(stats: Partial<Stats>, label: string): CharacterBuilder;
  withDebuff(stats: Partial<Stats>, label: string): CharacterBuilder;
  build(): StatModifier[];
  computeStats(): Stats;
  computeResists(): Resistances;
  describe(): string;
}

class CharacterBuilderImpl implements CharacterBuilder {
  private modifiers: StatModifier[] = [baseModifier()];

  withRace(race: Race): CharacterBuilder {
    this.modifiers.push(raceModifier(race));
    return this;
  }

  withClass(cls: ClassDef): CharacterBuilder {
    this.modifiers.push(classModifier(cls));
    return this;
  }

  withTitle(title: Title): CharacterBuilder {
    this.modifiers.push(titleModifier(title));
    return this;
  }

  withEquipment(items: EquippedItems): CharacterBuilder {
    for (const item of Object.values(items)) {
      if (item) this.modifiers.push(equipmentModifier(item));
    }
    return this;
  }

  withBuff(stats: Partial<Stats>, label: string): CharacterBuilder {
    this.modifiers.push(buffModifier(stats, label));
    return this;
  }

  withDebuff(stats: Partial<Stats>, label: string): CharacterBuilder {
    this.modifiers.push(debuffModifier(stats, label));
    return this;
  }

  build(): StatModifier[] {
    return this.modifiers;
  }

  computeStats(): Stats {
    return computeStats(this.modifiers);
  }

  computeResists(): Resistances {
    return computeResists(this.modifiers);
  }

  describe(): string {
    return describeModifiers(this.modifiers);
  }
}

export function createCharacterBuilder(): CharacterBuilder {
  return new CharacterBuilderImpl();
}

// ─── Convenience ───────────────────────────────────────────────

export function buildModifiers(
  race: Race,
  cls: ClassDef,
  equipped: EquippedItems,
  titles: Title[],
): StatModifier[] {
  const builder = createCharacterBuilder()
    .withRace(race)
    .withClass(cls);

  for (const title of titles) {
    builder.withTitle(title);
  }

  builder.withEquipment(equipped);
  return builder.build();
}

export function buildCharacter(
  race: Race,
  cls: ClassDef,
  equipped: EquippedItems,
  titles: Title[],
): { stats: Stats; resists: Resistances; description: string; modifiers: StatModifier[] } {
  const modifiers = buildModifiers(race, cls, equipped, titles);
  return {
    stats: computeStats(modifiers),
    resists: computeResists(modifiers),
    description: describeModifiers(modifiers),
    modifiers,
  };
}

// ─── Derived stat helpers ──────────────────────────────────────

export function calcMaxHp(stats: Stats): number { return 20 + stats.sta * 8; }
export function calcMaxMp(stats: Stats): number { return 10 + stats.int * 5 + stats.wil * 3; }
export function calcMeleeDamage(stats: Stats): number { return 4 + stats.str * 2; }
export function calcMagicDamage(stats: Stats): number { return 4 + stats.int * 3; }

// ─── Set Bonuses ──────────────────────────────────────────────

/** Set definitions — 2-piece and 3-piece bonuses */
export const SET_BONUSES: Record<string, { nameEn: string; nameFr: string; bonus2: Partial<Stats>; bonus3: Partial<Stats> }> = {
  iron:     { nameEn: "Iron Armaments",    nameFr: "Armements de Fer",    bonus2: { str: 2 },                 bonus3: { str: 3, sta: 3 } },
  shadow:   { nameEn: "Shadow's Embrace",  nameFr: "Étreinte d'Ombre",   bonus2: { str: 1, int: 1 },         bonus3: { str: 2, int: 2, wil: 2 } },
  arcane:   { nameEn: "Arcane Regalia",    nameFr: "Regalia Arcanique",   bonus2: { int: 2 },                 bonus3: { int: 3, wil: 3, sta: 1 } },
  plate:    { nameEn: "Plate Fortress",    nameFr: "Forteresse de Plaques", bonus2: { sta: 3 },               bonus3: { sta: 5, str: 2 } },
  dragon:   { nameEn: "Dragon's Legacy",   nameFr: "Héritage Draconique", bonus2: { str: 2, int: 2, sta: 1 }, bonus3: { str: 3, int: 3, sta: 2, wil: 2 } },
};

export type SetBonusResult = { setId: string; count: number; bonus: Partial<Stats>; nameEn: string; nameFr: string };

/** Compute active set bonuses from equipped items */
export function computeSetBonuses(equipped: EquippedItems): SetBonusResult[] {
  const counts: Record<string, number> = {};
  for (const slot of Object.values(equipped)) {
    const item = slot as Item | null;
    if (item?.setId) counts[item.setId] = (counts[item.setId] || 0) + 1;
  }
  const results: SetBonusResult[] = [];
  for (const [setId, count] of Object.entries(counts)) {
    const def = SET_BONUSES[setId];
    if (!def) continue;
    if (count >= 3) results.push({ setId, count, bonus: def.bonus3, nameEn: def.nameEn, nameFr: def.nameFr });
    else if (count >= 2) results.push({ setId, count, bonus: def.bonus2, nameEn: def.nameEn, nameFr: def.nameFr });
  }
  return results;
}

export function calcXpToNext(level: number): number { return 30 + level * 20; }
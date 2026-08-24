/**
 * Stat Decorator Pattern — Composable character stat modifiers.
 *
 * Each layer wraps the previous one, adding its own stat bonuses.
 * Layers are order-independent (all additive), but conceptually:
 *   BaseCharacter → RaceDeco → ClassDeco → TitleDeco[] → EquipmentDeco[]
 *
 * Usage:
 *   const char = new RaceDecorator(race, new ClassDecorator(cls, new BaseCharacter()));
 *   const withTitles = titles.reduce((c, t) => new TitleDecorator(t, c), char);
 *   const final = equippedItems.reduce((c, item) => new EquipmentDecorator(item, c), withTitles);
 *   const stats = final.getStats(); // { str: 12, sta: 25, ... }
 */

import type { EquippedItems, Item, Race, Stats, Resistances, ClassDef, Title } from "./types";

// Re-export types for consumers
export type { EquippedItems, Item, Race, Stats, Resistances, ClassDef, Title };

/** Core stat modifier interface */
export interface StatModifier {
  getStats(): Stats;
  getResists(): Resistances;
  getDescription(): string;
}

/** Concrete component: base character with no modifiers */
export class BaseCharacter implements StatModifier {
  private readonly baseStats: Stats = { str: 5, sta: 20, wil: 3, int: 3 };
  private readonly baseResists: Resistances = { fire: 0, ice: 0, poison: 0, lightning: 0 };

  getStats(): Stats { return { ...this.baseStats }; }
  getResists(): Resistances { return { ...this.baseResists }; }
  getDescription(): string { return "Base"; }
}

/** Abstract decorator */
abstract class StatDecorator implements StatModifier {
  protected readonly wrapped: StatModifier;

  constructor(wrapped: StatModifier) {
    this.wrapped = wrapped;
  }

  abstract getStats(): Stats;
  abstract getResists(): Resistances;
  abstract getDescription(): string;
}

/** Race decorator */
export class RaceDecorator extends StatDecorator {
  private readonly race: Race;

  constructor(race: Race, wrapped: StatModifier) {
    super(wrapped);
    this.race = race;
  }

  getStats(): Stats {
    const base = this.wrapped.getStats();
    for (const [k, v] of Object.entries(this.race.stats)) {
      base[k as keyof Stats] += (v as number) ?? 0;
    }
    return base;
  }

  getResists(): Resistances {
    const base = this.wrapped.getResists();
    for (const [k, v] of Object.entries(this.race.resists)) {
      base[k as keyof Resistances] = Math.min(75, base[k as keyof Resistances] + ((v as number) ?? 0));
    }
    return base;
  }

  getDescription(): string { return `${this.wrapped.getDescription()} → ${this.race.nameEn}`; }
}

/** Class decorator */
export class ClassDecorator extends StatDecorator {
  private readonly cls: ClassDef;

  constructor(cls: ClassDef, wrapped: StatModifier) {
    super(wrapped);
    this.cls = cls;
  }

  getStats(): Stats {
    const base = this.wrapped.getStats();
    for (const [k, v] of Object.entries(this.cls.stats)) {
      base[k as keyof Stats] += (v as number) ?? 0;
    }
    return base;
  }

  getResists(): Resistances {
    return this.wrapped.getResists(); // Classes don't grant resists
  }

  getDescription(): string { return `${this.wrapped.getDescription()} → ${this.cls.nameEn}`; }
}

/** Title decorator (permanent meta-progression bonus) */
export class TitleDecorator extends StatDecorator {
  private readonly title: Title;

  constructor(title: Title, wrapped: StatModifier) {
    super(wrapped);
    this.title = title;
  }

  getStats(): Stats {
    const base = this.wrapped.getStats();
    for (const [k, v] of Object.entries(this.title.bonus)) {
      base[k as keyof Stats] += (v as number) ?? 0;
    }
    return base;
  }

  getResists(): Resistances {
    return this.wrapped.getResists(); // Titles don't grant resists
  }

  getDescription(): string { return `${this.wrapped.getDescription()} ⟐ ${this.title.nameEn}`; }
}

/** Equipment decorator (single item) */
export class EquipmentDecorator extends StatDecorator {
  private readonly item: Item;

  constructor(item: Item, wrapped: StatModifier) {
    super(wrapped);
    this.item = item;
  }

  getStats(): Stats {
    const base = this.wrapped.getStats();
    for (const [k, v] of Object.entries(this.item.statBonus)) {
      base[k as keyof Stats] += (v as number) ?? 0;
    }
    return base;
  }

  getResists(): Resistances {
    const base = this.wrapped.getResists();
    for (const [k, v] of Object.entries(this.item.resistBonus)) {
      base[k as keyof Resistances] = Math.min(75, base[k as keyof Resistances] + ((v as number) ?? 0));
    }
    return base;
  }

  getDescription(): string { return `${this.wrapped.getDescription()} + ${this.item.nameEn}`; }
}

/** Temporary buff/debuff decorator (e.g. scroll, potion, curse) */
export class BuffDecorator extends StatDecorator {
  private readonly buff: Partial<Stats>;
  private readonly label: string;

  constructor(buff: Partial<Stats>, label: string, wrapped: StatModifier) {
    super(wrapped);
    this.buff = buff;
    this.label = label;
  }

  getStats(): Stats {
    const base = this.wrapped.getStats();
    for (const [k, v] of Object.entries(this.buff)) {
      base[k as keyof Stats] += (v as number) ?? 0;
    }
    return base;
  }

  getResists(): Resistances {
    return this.wrapped.getResists();
  }

  getDescription(): string { return `${this.wrapped.getDescription()} [${this.label}]`; }
}

// ─── Convenience builder ───────────────────────────────────────

export interface CharacterBuilder {
  withRace(race: Race): CharacterBuilder;
  withClass(cls: ClassDef): CharacterBuilder;
  withTitle(title: Title): CharacterBuilder;
  withEquipment(items: EquippedItems): CharacterBuilder;
  withBuff(buff: Partial<Stats>, label: string): CharacterBuilder;
  build(): StatModifier;
}

class CharacterBuilderImpl implements CharacterBuilder {
  private current: StatModifier;

  constructor() {
    this.current = new BaseCharacter();
  }

  withRace(race: Race): CharacterBuilder {
    this.current = new RaceDecorator(race, this.current);
    return this;
  }

  withClass(cls: ClassDef): CharacterBuilder {
    this.current = new ClassDecorator(cls, this.current);
    return this;
  }

  withTitle(title: Title): CharacterBuilder {
    this.current = new TitleDecorator(title, this.current);
    return this;
  }

  withEquipment(items: EquippedItems): CharacterBuilder {
    for (const item of Object.values(items)) {
      if (item) this.current = new EquipmentDecorator(item, this.current);
    }
    return this;
  }

  withBuff(buff: Partial<Stats>, label: string): CharacterBuilder {
    this.current = new BuffDecorator(buff, label, this.current);
    return this;
  }

  build(): StatModifier {
    return this.current;
  }
}

export function createCharacterBuilder(): CharacterBuilder {
  return new CharacterBuilderImpl();
}

/**
 * Build a full character from race, class, titles, and equipment.
 * Drop-in replacement for the old calcStats + calcResists functions.
 */
export function buildCharacter(
  race: Race,
  cls: ClassDef,
  equipped: EquippedItems,
  titles: Title[],
): StatModifier {
  const builder = createCharacterBuilder()
    .withRace(race)
    .withClass(cls);

  for (const title of titles) {
    builder.withTitle(title);
  }

  builder.withEquipment(equipped);

  return builder.build();
}

// ─── Derived stat helpers ──────────────────────────────────────

export function calcMaxHp(stats: Stats): number { return 20 + stats.sta * 8; }
export function calcMaxMp(stats: Stats): number { return 10 + stats.int * 5 + stats.wil * 3; }
export function calcMeleeDamage(stats: Stats): number { return 4 + stats.str * 2; }
export function calcMagicDamage(stats: Stats): number { return 4 + stats.int * 3; }
export function calcXpToNext(level: number): number { return 30 + level * 20; }
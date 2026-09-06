/**
 * Unit tests for Dungeon Delver modifier system
 *
 * Covers:
 * - Base stats computation
 * - Race, class, title, equipment modifiers
 * - Resistances computation
 * - Builder API
 * - Edge cases (empty equipment, negative stats, cap at 75%)
 * - Derived stats (maxHp, maxMp, damage)
 */

import { describe, it, expect } from "vitest";
import {
  baseModifier,
  raceModifier,
  classModifier,
  titleModifier,
  equipmentModifier,
  buffModifier,
  computeStats,
  computeResists,
  describeModifiers,
  buildModifiers,
  buildCharacter,
  createCharacterBuilder,
  calcMaxHp,
  calcMaxMp,
  calcMeleeDamage,
  calcMagicDamage,
  calcXpToNext,
  computeSetBonuses,
  SET_BONUSES,
} from "../../packages/games/dungeon-delver/src/modifiers";
import type {
  Race,
  ClassDef,
  Title,
  Item,
  EquippedItems,
  Stats,
  Resistances,
} from "../../packages/games/dungeon-delver/src/types";

// ─── Test Fixtures ─────────────────────────────────────────────

const mockRace: Race = {
  id: "elf",
  nameEn: "Elf",
  nameFr: "Elfe",
  descEn: "Test",
  descFr: "Test",
  stats: { int: 3, wil: 2, sta: -1 },
  resists: { ice: 15 },
  abilityEn: "Test",
  abilityFr: "Test",
};

const mockClass: ClassDef = {
  id: "mage",
  nameEn: "Mage",
  nameFr: "Mage",
  descEn: "Test",
  descFr: "Test",
  stats: { int: 4, wil: 2, str: -2 },
  attackType: "ranged",
  skillEn: "Test",
  skillFr: "Test",
};

const mockTitle1: Title = {
  id: "scout",
  nameEn: "Dungeon Scout",
  nameFr: "Éclaireur",
  descEn: "Test",
  descFr: "Test",
  bonus: { str: 1, sta: 3 },
  condition: () => true,
};

const mockTitle2: Title = {
  id: "slayer",
  nameEn: "Monster Slayer",
  nameFr: "Tueur",
  descEn: "Test",
  descFr: "Test",
  bonus: { str: 2 },
  condition: () => true,
};

const mockSword: Item = {
  id: "sword",
  nameEn: "Iron Sword",
  nameFr: "Épée de Fer",
  type: "weapon",
  slot: "mainhand",
  statBonus: { str: 2 },
  resistBonus: {},
  emoji: "⚔️",
  floorRange: [1, 5],
  rarity: "common",
};

const mockArmor: Item = {
  id: "chainmail",
  nameEn: "Chainmail",
  nameFr: "Cotte de Mailles",
  type: "armor",
  slot: "body",
  statBonus: { sta: 4 },
  resistBonus: { ice: 10 },
  emoji: "🛡️",
  floorRange: [3, 7],
  rarity: "uncommon",
};

const mockRing: Item = {
  id: "ring-fire",
  nameEn: "Ring of Fire",
  nameFr: "Anneau de Feu",
  type: "accessory",
  slot: "ring",
  statBonus: { int: 1 },
  resistBonus: { fire: 25 },
  emoji: "💍",
  floorRange: [2, 8],
  rarity: "uncommon",
};

const emptyEquipped: EquippedItems = {
  head: null, body: null, hands: null, feet: null,
  mainhand: null, offhand: null, ring: null, amulet: null,
};

// ─── Base Modifier ─────────────────────────────────────────────

describe("baseModifier", () => {
  it("returns base stats (str:5, sta:20, wil:3, int:3)", () => {
    const mod = baseModifier();
    expect(mod.stats).toEqual({ str: 5, sta: 20, wil: 3, int: 3 });
    expect(mod.resists).toEqual({ fire: 0, ice: 0, poison: 0, lightning: 0 });
    expect(mod.source).toBe("base");
    expect(mod.label).toBe("Base");
  });
});

// ─── Race Modifier ─────────────────────────────────────────────

describe("raceModifier", () => {
  it("copies race stats and resists", () => {
    const mod = raceModifier(mockRace);
    expect(mod.stats).toEqual({ int: 3, wil: 2, sta: -1 });
    expect(mod.resists).toEqual({ ice: 15 });
    expect(mod.source).toBe("race");
    expect(mod.label).toBe("Elf");
  });
});

// ─── Class Modifier ────────────────────────────────────────────

describe("classModifier", () => {
  it("copies class stats, empty resists", () => {
    const mod = classModifier(mockClass);
    expect(mod.stats).toEqual({ int: 4, wil: 2, str: -2 });
    expect(mod.resists).toEqual({});
    expect(mod.source).toBe("class");
  });
});

// ─── Title Modifier ────────────────────────────────────────────

describe("titleModifier", () => {
  it("copies title bonus stats", () => {
    const mod = titleModifier(mockTitle1);
    expect(mod.stats).toEqual({ str: 1, sta: 3 });
    expect(mod.source).toBe("title");
  });
});

// ─── Equipment Modifier ────────────────────────────────────────

describe("equipmentModifier", () => {
  it("copies item stats and resists", () => {
    const mod = equipmentModifier(mockArmor);
    expect(mod.stats).toEqual({ sta: 4 });
    expect(mod.resists).toEqual({ ice: 10 });
    expect(mod.source).toBe("equipment");
  });
});

// ─── Buff Modifier ─────────────────────────────────────────────

describe("buffModifier", () => {
  it("creates a temporary buff with label", () => {
    const mod = buffModifier({ str: 5, int: 5 }, "Scroll of Power");
    expect(mod.stats).toEqual({ str: 5, int: 5 });
    expect(mod.source).toBe("buff");
    expect(mod.label).toBe("Scroll of Power");
  });
});

// ─── computeStats ──────────────────────────────────────────────

describe("computeStats", () => {
  it("returns zero stats for empty modifier list (base must be explicitly added)", () => {
    const result = computeStats([]);
    expect(result).toEqual({ str: 0, sta: 0, wil: 0, int: 0 });
  });

  it("returns base stats for only base modifier", () => {
    const result = computeStats([baseModifier()]);
    expect(result).toEqual({ str: 5, sta: 20, wil: 3, int: 3 });
  });

  it("adds race and class modifiers to base", () => {
    const result = computeStats([
      baseModifier(),
      raceModifier(mockRace),
      classModifier(mockClass),
    ]);
    // base: str:5, sta:20, wil:3, int:3
    // elf:  int+3, wil+2, sta-1
    // mage: int+4, wil+2, str-2
    expect(result.str).toBe(3);   // 5 - 2
    expect(result.sta).toBe(19);  // 20 - 1
    expect(result.wil).toBe(7);   // 3 + 2 + 2
    expect(result.int).toBe(10);  // 3 + 3 + 4
  });

  it("stacks multiple titles", () => {
    const result = computeStats([
      baseModifier(),
      titleModifier(mockTitle1),
      titleModifier(mockTitle2),
    ]);
    // base: str:5, sta:20
    // scout: str+1, sta+3
    // slayer: str+2
    expect(result.str).toBe(8);   // 5 + 1 + 2
    expect(result.sta).toBe(23);  // 20 + 3
  });

  it("handles equipment with stat penalties", () => {
    const result = computeStats([
      baseModifier(),
      equipmentModifier({
        id: "plate",
        nameEn: "Plate Armor",
        nameFr: "Plates",
        type: "armor",
        slot: "body",
        statBonus: { sta: 7, int: -1 },
        resistBonus: { fire: 15 },
        emoji: "🛡️",
        floorRange: [5, 99],
        rarity: "epic",
      }),
    ]);
    expect(result.sta).toBe(27);  // 20 + 7
    expect(result.int).toBe(2);   // 3 - 1
  });

  it("handles empty equipment (null items)", () => {
    const result = computeStats([
      baseModifier(),
      raceModifier(mockRace),
    ]);
    expect(result.str).toBe(5);
    expect(result.int).toBe(6);   // 3 + 3
    expect(result.wil).toBe(5);   // 3 + 2
  });

  it("returns correct stats with full character build", () => {
    const modifiers = [
      baseModifier(),
      raceModifier(mockRace),
      classModifier(mockClass),
      titleModifier(mockTitle1),
      titleModifier(mockTitle2),
      equipmentModifier(mockSword),
      equipmentModifier(mockArmor),
      equipmentModifier(mockRing),
    ];
    const result = computeStats(modifiers);
    // base:5-2+1+2+2=8, sta:20-1+3+4=26, wil:3+2+2=7, int:3+3+4+1=11
    expect(result.str).toBe(8);
    expect(result.sta).toBe(26);  // 20 - 1 + 3 + 4(armor)
    expect(result.wil).toBe(7);   // 3 + 2 + 2
    expect(result.int).toBe(11);  // 3 + 3 + 4 + 1(ring)
  });
});

// ─── computeResists ────────────────────────────────────────────

describe("computeResists", () => {
  it("returns base zero resists for empty list", () => {
    const result = computeResists([]);
    expect(result).toEqual({ fire: 0, ice: 0, poison: 0, lightning: 0 });
  });

  it("stacks race + equipment resists", () => {
    const result = computeResists([
      baseModifier(),
      raceModifier(mockRace),
      equipmentModifier(mockArmor),
      equipmentModifier(mockRing),
    ]);
    expect(result.ice).toBe(25);      // 15 (elf) + 10 (chainmail)
    expect(result.fire).toBe(25);     // 25 (ring)
    expect(result.poison).toBe(0);
    expect(result.lightning).toBe(0);
  });

  it("caps resists at 75%", () => {
    // Create a race with very high fire resist
    const highFireRace: Race = {
      ...mockRace,
      id: "demon",
      nameEn: "Demon",
      resists: { fire: 40, lightning: 15 },
    };
    const result = computeResists([
      baseModifier(),
      raceModifier(highFireRace),
      equipmentModifier(mockRing), // fire +25
    ]);
    expect(result.fire).toBe(65); // 40 + 25 = 65 (under cap)

    // Add another fire item to push over cap
    const result2 = computeResists([
      baseModifier(),
      raceModifier(highFireRace),
      equipmentModifier(mockRing),
      equipmentModifier({ ...mockRing, id: "ring-fire2", resistBonus: { fire: 30 } }),
    ]);
    expect(result2.fire).toBe(75); // 40 + 25 + 30 = 95 → capped at 75
  });
});

// ─── describeModifiers ─────────────────────────────────────────

describe("describeModifiers", () => {
  it("joins labels with arrow", () => {
    const result = describeModifiers([baseModifier(), raceModifier(mockRace)]);
    expect(result).toBe("Base → Elf");
  });

  it("handles full chain", () => {
    const result = describeModifiers([
      baseModifier(),
      raceModifier(mockRace),
      classModifier(mockClass),
      equipmentModifier(mockSword),
    ]);
    expect(result).toBe("Base → Elf → Mage → Iron Sword");
  });
});

// ─── buildModifiers ────────────────────────────────────────────

describe("buildModifiers", () => {
  it("returns array starting with base modifier", () => {
    const result = buildModifiers(mockRace, mockClass, emptyEquipped, []);
    expect(result.length).toBe(3); // base + race + class
    expect(result[0].source).toBe("base");
    expect(result[1].source).toBe("race");
    expect(result[2].source).toBe("class");
  });

  it("includes titles after class", () => {
    const result = buildModifiers(mockRace, mockClass, emptyEquipped, [mockTitle1, mockTitle2]);
    expect(result.length).toBe(5);
    expect(result[3].source).toBe("title");
    expect(result[4].source).toBe("title");
  });

  it("includes equipment at the end", () => {
    const equipped: EquippedItems = {
      ...emptyEquipped,
      mainhand: mockSword,
      body: mockArmor,
      ring: mockRing,
    };
    const result = buildModifiers(mockRace, mockClass, equipped, []);
    expect(result.length).toBe(6); // base + race + class + 3 items
    expect(result[3].source).toBe("equipment");
    expect(result[4].source).toBe("equipment");
    expect(result[5].source).toBe("equipment");
  });

  it("handles null equipment slots", () => {
    const equipped: EquippedItems = {
      ...emptyEquipped,
      mainhand: mockSword,
      // all others null
    };
    const result = buildModifiers(mockRace, mockClass, equipped, []);
    expect(result.length).toBe(4); // base + race + class + 1 item
  });
});

// ─── buildCharacter ────────────────────────────────────────────

describe("buildCharacter", () => {
  it("returns stats, resists, description, and modifiers", () => {
    const char = buildCharacter(mockRace, mockClass, emptyEquipped, []);
    expect(char.stats.str).toBe(3);   // 5 - 2
    expect(char.stats.int).toBe(10);  // 3 + 3 + 4
    expect(char.resists.ice).toBe(15); // from elf
    expect(char.description).toContain("Elf");
    expect(char.description).toContain("Mage");
    expect(char.modifiers.length).toBe(3);
  });
});

// ─── createCharacterBuilder ────────────────────────────────────

describe("createCharacterBuilder", () => {
  it("builds incrementally with fluent API", () => {
    const builder = createCharacterBuilder()
      .withRace(mockRace)
      .withClass(mockClass)
      .withTitle(mockTitle1);

    expect(builder.computeStats().str).toBe(4); // 5 - 2 + 1
    expect(builder.describe()).toContain("Dungeon Scout");
  });

  it("withEquipment handles multiple items", () => {
    const equipped: EquippedItems = {
      ...emptyEquipped,
      mainhand: mockSword,
    };
    const stats = createCharacterBuilder()
      .withRace(mockRace)
      .withClass(mockClass)
      .withEquipment(equipped)
      .computeStats();

    expect(stats.str).toBe(5); // 5 - 2 + 2(sword)
  });

  it("withBuff adds temporary stat boost", () => {
    const stats = createCharacterBuilder()
      .withRace(mockRace)
      .withClass(mockClass)
      .withBuff({ str: 10, int: 10 }, "Berserk")
      .computeStats();

    expect(stats.str).toBe(13); // 5 - 2 + 10
    expect(stats.int).toBe(20); // 3 + 3 + 4 + 10
  });
});

// ─── Derived Stats ─────────────────────────────────────────────

describe("derived stats", () => {
  const baseStats: Stats = { str: 5, sta: 20, wil: 3, int: 3 };

  it("calcMaxHp = 20 + sta * 8", () => {
    expect(calcMaxHp(baseStats)).toBe(180); // 20 + 160
    expect(calcMaxHp({ str: 0, sta: 0, wil: 0, int: 0 })).toBe(20);
    expect(calcMaxHp({ str: 0, sta: 10, wil: 0, int: 0 })).toBe(100);
  });

  it("calcMaxMp = 10 + int * 5 + wil * 3", () => {
    expect(calcMaxMp(baseStats)).toBe(34); // 10 + 15 + 9
  });

  it("calcMeleeDamage = 4 + str * 2", () => {
    expect(calcMeleeDamage(baseStats)).toBe(14); // 4 + 10
  });

  it("calcMagicDamage = 4 + int * 3", () => {
    expect(calcMagicDamage(baseStats)).toBe(13); // 4 + 9
  });

  it("calcXpToNext = 30 + level * 20", () => {
    expect(calcXpToNext(1)).toBe(50);
    expect(calcXpToNext(5)).toBe(130);
    expect(calcXpToNext(10)).toBe(230);
  });
});

// ─── Edge Cases ────────────────────────────────────────────────

describe("edge cases", () => {
  it("handles race with no stat bonuses", () => {
    const neutralRace: Race = {
      ...mockRace,
      stats: {},
      resists: {},
    };
    const stats = computeStats([baseModifier(), raceModifier(neutralRace)]);
    expect(stats).toEqual({ str: 5, sta: 20, wil: 3, int: 3 });
  });

  it("handles item with no stat bonus (pure resist)", () => {
    const pureResistItem: Item = {
      ...mockRing,
      statBonus: {},
      resistBonus: { fire: 30 },
    };
    const stats = computeStats([baseModifier(), equipmentModifier(pureResistItem)]);
    expect(stats).toEqual({ str: 5, sta: 20, wil: 3, int: 3 }); // unchanged
    const resists = computeResists([baseModifier(), equipmentModifier(pureResistItem)]);
    expect(resists.fire).toBe(30);
  });

  it("handles negative total stats (floor at actual value)", () => {
    const penaltyClass: ClassDef = {
      ...mockClass,
      stats: { str: -10, sta: -30 },
    };
    const stats = computeStats([baseModifier(), classModifier(penaltyClass)]);
    expect(stats.str).toBe(-5);  // 5 - 10
    expect(stats.sta).toBe(-10); // 20 - 30
  });

  it("builder handles no modifiers beyond base", () => {
    const builder = createCharacterBuilder();
    expect(builder.computeStats()).toEqual({ str: 5, sta: 20, wil: 3, int: 3 });
    expect(builder.describe()).toBe("Base");
  });
});

// ─── Set Bonuses ────────────────────────────────────────────

describe("computeSetBonuses", () => {
  const mockIronSword: Item = {
    id: "iron-sword", nameEn: "Iron Sword", nameFr: "Épée de Fer", type: "weapon", slot: "mainhand", rarity: "common",
    statBonus: { str: 2, sta: 0, wil: 0, int: 0 }, resistBonus: {}, emoji: "🗡️", floorRange: [1, 99], setId: "iron",
  };
  const mockIronShield: Item = {
    id: "iron-shield", nameEn: "Iron Shield", nameFr: "Bouclier de Fer", type: "armor", slot: "offhand", rarity: "common",
    statBonus: { str: 0, sta: 3, wil: 0, int: 0 }, resistBonus: {}, emoji: "🛡️", floorRange: [1, 99], setId: "iron",
  };
  const mockChainmail: Item = {
    id: "chainmail", nameEn: "Chainmail", nameFr: "Cotte de Mailles", type: "armor", slot: "body", rarity: "common",
    statBonus: { str: 0, sta: 3, wil: 0, int: 0 }, resistBonus: {}, emoji: "🦺", floorRange: [1, 99], setId: "iron",
  };
  const mockNoSetItem: Item = {
    id: "random-ring", nameEn: "Random Ring", nameFr: "Anneau Aléatoire", type: "armor", slot: "ring", rarity: "common",
    statBonus: { str: 1, sta: 0, wil: 0, int: 1 }, resistBonus: {}, emoji: "💍", floorRange: [1, 99],
  };

  it("returns empty for no equipped items", () => {
    const result = computeSetBonuses({ head: null, body: null, hands: null, feet: null, mainhand: null, offhand: null, ring: null, amulet: null });
    expect(result).toEqual([]);
  });

  it("returns empty for items without setId", () => {
    const result = computeSetBonuses({ head: null, body: null, hands: null, feet: null, mainhand: mockNoSetItem, offhand: null, ring: null, amulet: null });
    expect(result).toEqual([]);
  });

  it("returns empty for 1 item of a set", () => {
    const result = computeSetBonuses({ head: null, body: null, hands: null, feet: null, mainhand: mockIronSword, offhand: null, ring: null, amulet: null });
    expect(result).toEqual([]);
  });

  it("activates 2-piece bonus", () => {
    const result = computeSetBonuses({ head: null, body: null, hands: null, feet: null, mainhand: mockIronSword, offhand: mockIronShield, ring: null, amulet: null });
    expect(result).toHaveLength(1);
    expect(result[0]!.setId).toBe("iron");
    expect(result[0]!.count).toBe(2);
    expect(result[0]!.bonus).toEqual({ str: 2 });
  });

  it("activates 3-piece bonus", () => {
    const result = computeSetBonuses({ head: null, body: mockChainmail, hands: null, feet: null, mainhand: mockIronSword, offhand: mockIronShield, ring: null, amulet: null });
    expect(result).toHaveLength(1);
    expect(result[0]!.setId).toBe("iron");
    expect(result[0]!.count).toBe(3);
    expect(result[0]!.bonus).toEqual({ str: 3, sta: 3 });
  });

  it("returns set names correctly", () => {
    const result = computeSetBonuses({ head: null, body: null, hands: null, feet: null, mainhand: mockIronSword, offhand: mockIronShield, ring: null, amulet: null });
    expect(result[0]!.nameEn).toBe("Iron Armaments");
    expect(result[0]!.nameFr).toBe("Armements de Fer");
  });

  it("SET_BONUSES has all 5 sets defined", () => {
    expect(Object.keys(SET_BONUSES)).toHaveLength(5);
    expect(SET_BONUSES.iron).toBeDefined();
    expect(SET_BONUSES.shadow).toBeDefined();
    expect(SET_BONUSES.arcane).toBeDefined();
    expect(SET_BONUSES.plate).toBeDefined();
    expect(SET_BONUSES.dragon).toBeDefined();
  });
});
export { DungeonDelverGame } from "./components/DungeonDelverGame";
// Modifier system (flat pipeline — preferred over decorator)
export { buildCharacter, buildModifiers, createCharacterBuilder, computeStats, computeResists, describeModifiers, calcMaxHp, calcMaxMp, calcMeleeDamage, calcMagicDamage, calcXpToNext, computeSetBonuses, SET_BONUSES } from "./modifiers";
export type { StatModifier, CharacterBuilder, SetBonusResult } from "./modifiers";
// Types
export type { RaceId, ClassId, Rarity, GameScreen, ElementId, Stats, Resistances, Race, ClassDef, Monster, FloorMonster, Item, Title, RunStats, EquippedItems, PlayerState, DungeonState, SaveData } from "./types";
export { PERKS, getLevelUpChoices, getPerk, hasPerk, perkCount } from "./perks";
export type { Perk } from "./perks";
export { ACHIEVEMENTS, checkAchievements, loadAchievements, saveAchievements } from "./achievements";
export type { Achievement } from "./achievements";
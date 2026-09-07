export { DungeonDelverGame } from "./components/DungeonDelverGame";
// Modifier system (flat pipeline — preferred over decorator)
export type { CharacterBuilder, SetBonusResult,StatModifier } from "./modifiers";
export { buildCharacter, buildModifiers, calcMagicDamage, calcMaxHp, calcMaxMp, calcMeleeDamage, calcXpToNext, computeResists, computeSetBonuses, computeStats, createCharacterBuilder, describeModifiers, SET_BONUSES } from "./modifiers";
// Types
export type { Achievement } from "./achievements";
export { ACHIEVEMENTS, checkAchievements, loadAchievements, saveAchievements } from "./achievements";
export type { Perk } from "./perks";
export { getLevelUpChoices, getPerk, hasPerk, perkCount,PERKS } from "./perks";
export type { ClassDef, ClassId, DungeonState, ElementId, EquippedItems, FloorMonster, GameScreen, Item, Monster, PlayerState, Race, RaceId, Rarity, Resistances, RunStats, SaveData,Stats, Title } from "./types";
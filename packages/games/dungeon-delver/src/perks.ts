/**
 * Perk system for Dungeon Delver
 *
 * On level-up, player chooses 1 of 3 random perks.
 * Perks are permanent for the run and stack.
 *
 * Architecture: flat list of perk IDs stored on player state.
 * Each perk has apply/describe functions. Modifier system handles stat bonuses.
 */

import type { ClassId,Stats } from "./types";

// ─── Perk Definition ───────────────────────────────────────────

export interface Perk {
  id: string;
  nameEn: string;
  nameFr: string;
  descEn: string;
  descFr: string;
  /** Stat bonuses added immediately */
  statBonus?: Partial<Stats>;
  /** Category for selection weighting */
  category: "universal" | ClassId;
  /** Can be taken multiple times? */
  repeatable?: boolean;
}

// ─── Perk Database ─────────────────────────────────────────────

export const PERKS: Perk[] = [
  // ── Universal ──
  { id: "iron-will", nameEn: "Iron Will", nameFr: "Volonté de Fer", descEn: "+3 max HP (retroactive)", descFr: "+3 PV max (rétroactif)", statBonus: { sta: 0 }, category: "universal", repeatable: true },
  { id: "quick-learner", nameEn: "Quick Learner", nameFr: "Apprenti Rapide", descEn: "+15% XP from all sources", descFr: "+15% XP de toutes sources", category: "universal", repeatable: true },
  { id: "treasure-hunter", nameEn: "Treasure Hunter", nameFr: "Chasseur de Trésor", descEn: "+1 extra item per floor", descFr: "+1 objet par étage", category: "universal", repeatable: true },
  { id: "second-wind", nameEn: "Second Wind", nameFr: "Second Souffle", descEn: "Heal 25% HP on level-up", descFr: "Soigne 25% PV au niv. sup.", category: "universal", repeatable: true },
  { id: "toughness", nameEn: "Toughness", nameFr: "Robustesse", descEn: "+2 STA, +1 STR", descFr: "+2 END, +1 FOR", statBonus: { sta: 2, str: 1 }, category: "universal", repeatable: true },
  { id: "scholar", nameEn: "Scholar", nameFr: "Érudit", descEn: "+2 INT, +1 WIL", descFr: "+2 INT, +1 VOL", statBonus: { int: 2, wil: 1 }, category: "universal", repeatable: true },

  // ── Warrior ──
  { id: "heavy-blows", nameEn: "Heavy Blows", nameFr: "Coups Lourds", descEn: "+15% melee damage", descFr: "+15% dégâts mêlée", category: "warrior", repeatable: true },
  { id: "battle-hardened", nameEn: "Battle Hardened", nameFr: "Endurci au Combat", descEn: "+2 STR, +2 STA", descFr: "+2 FOR, +2 END", statBonus: { str: 2, sta: 2 }, category: "warrior", repeatable: true },
  { id: "cleave-mastery", nameEn: "Cleave Mastery", nameFr: "Maîtrise du Fendoir", descEn: "+1 target to Cleave", descFr: "+1 cible au Fendoir", category: "warrior" },
  { id: "sword-board", nameEn: "Sword & Board", nameFr: "Épée et Bouclier", descEn: "+10% damage reduction", descFr: "+10% réduction dégâts", category: "warrior" },

  // ── Mage ──
  { id: "arcane-focus", nameEn: "Arcane Focus", nameFr: "Focalisation Arcanique", descEn: "+15% magic damage", descFr: "+15% dégâts magiques", category: "mage", repeatable: true },
  { id: "mana-surge", nameEn: "Mana Surge", nameFr: "Afflux de Mana", descEn: "+5 max MP per level", descFr: "+5 PM max par niveau", category: "mage", repeatable: true },
  { id: "frost-armor", nameEn: "Frost Armor", nameFr: "Armure de Givre", descEn: "+15 ice resist, +5% dmg reduction", descFr: "+15 résist. glace, +5% réduc. dégâts", category: "mage" },
  { id: "spell-echo", nameEn: "Spell Echo", nameFr: "Écho de Sort", descEn: "25% chance: 50% splash damage", descFr: "25% chance: 50% dégâts zone", category: "mage" },

  // ── Rogue ──
  { id: "shadow-strike", nameEn: "Shadow Strike", nameFr: "Frappe de l'Ombre", descEn: "Backstab: 3x damage (was 2x)", descFr: "Sournoise: 3x dégâts (était 2x)", category: "rogue" },
  { id: "evasion", nameEn: "Evasion", nameFr: "Évasion", descEn: "10% dodge chance", descFr: "10% chance d'esquive", category: "rogue", repeatable: true },
  { id: "poison-blade", nameEn: "Poison Blade", nameFr: "Lame Empoisonnée", descEn: "30% poison on hit (3 dmg × 3 ticks)", descFr: "30% poison au toucher (3 dmg × 3)", category: "rogue" },
  { id: "quick-fingers", nameEn: "Quick Fingers", nameFr: "Doigts Agiles", descEn: "Auto-pickup items from adjacent tiles", descFr: "Ramassage auto objets adjacents", category: "rogue" },

  // ── Paladin ──
  { id: "divine-shield", nameEn: "Divine Shield", nameFr: "Bouclier Divin", descEn: "10% chance to block all damage", descFr: "10% chance bloquer tous dégâts", category: "paladin" },
  { id: "holy-aura", nameEn: "Holy Aura", nameFr: "Aura Sacrée", descEn: "Heal 5% HP per turn", descFr: "Soigne 5% PV par tour", category: "paladin", repeatable: true },
  { id: "smite-evil", nameEn: "Smite Evil", nameFr: "Châtiment du Mal", descEn: "+25% dmg vs undead/demons", descFr: "+25% dmg vs morts-vivants/démons", category: "paladin" },
  { id: "blessed-armor", nameEn: "Blessed Armor", nameFr: "Armure Bénie", descEn: "+15 all resistances", descFr: "+15 toutes résistances", category: "paladin", repeatable: true },

  // ── Necromancer ──
  { id: "soul-harvest", nameEn: "Soul Harvest", nameFr: "Moisson d'Âmes", descEn: "+5% lifesteal per kill (resets per floor)", descFr: "+5% vol vie par kill (réinit./étage)", category: "necromancer", repeatable: true },
  { id: "bone-armor", nameEn: "Bone Armor", nameFr: "Armure d'Os", descEn: "+3 STA, +10 poison resist", descFr: "+3 END, +10 résist. poison", statBonus: { sta: 3 }, category: "necromancer", repeatable: true },
  { id: "deaths-reach", nameEn: "Death's Reach", nameFr: "Portée de la Mort", descEn: "+1 spell range", descFr: "+1 portée de sort", category: "necromancer" },
  { id: "corpse-explosion", nameEn: "Corpse Explosion", nameFr: "Explosion de Cadavre", descEn: "20% chance: killed enemy explodes (50% dmg AoE)", descFr: "20% chance: explosion du cadavre (50% dmg AoE)", category: "necromancer" },
];

// ─── Perk Map ──────────────────────────────────────────────────

const perkMap = new Map<string, Perk>(PERKS.map((p) => [p.id, p]));

export function getPerk(id: string): Perk | undefined {
  return perkMap.get(id);
}

// ─── Perk Selection ────────────────────────────────────────────

/**
 * Get 3 random perks for level-up choice.
 * Weighted: ~60% class-specific, ~40% universal.
 * Excludes already-chosen non-repeatable perks.
 */
export function getLevelUpChoices(classId: ClassId, currentPerks: string[]): Perk[] {
  // Filter out non-repeatable perks already taken
  const available = PERKS.filter((p) => {
    if (currentPerks.includes(p.id) && !p.repeatable) {return false;}
    return true;
  });

  const classPerks = available.filter((p) => p.category === classId);
  const universalPerks = available.filter((p) => p.category === "universal");

  const choices: Perk[] = [];

  // Try to get 2 class perks + 1 universal
  for (let i = 0; i < 2 && classPerks.length > 0; i++) {
    const idx = Math.floor(Math.random() * classPerks.length);
    choices.push(classPerks.splice(idx, 1)[0]);
  }

  // Fill remaining with universal or more class perks
  while (choices.length < 3 && universalPerks.length > 0) {
    const idx = Math.floor(Math.random() * universalPerks.length);
    choices.push(universalPerks.splice(idx, 1)[0]);
  }

  // If still not enough, fill with available class perks
  while (choices.length < 3 && classPerks.length > 0) {
    const idx = Math.floor(Math.random() * classPerks.length);
    choices.push(classPerks.splice(idx, 1)[0]);
  }

  // If still < 3 (very unlikely), duplicate some
  while (choices.length < 3 && choices.length > 0) {
    choices.push(choices[choices.length - 1]);
  }

  return choices.slice(0, 3);
}

// ─── Perk Application ──────────────────────────────────────────

/** Check if player has a specific perk */
export function hasPerk(perks: string[], id: string): boolean {
  return perks.includes(id);
}

/** Count how many times a repeatable perk has been taken */
export function perkCount(perks: string[], id: string): number {
  return perks.filter((p) => p === id).length;
}
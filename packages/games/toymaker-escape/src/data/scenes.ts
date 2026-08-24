

// Scene narrative data extracted from ToymakerEscapeGame.tsx.
// The main component imports and uses this as its scenes dictionary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TOYMAKER_SCENES: Record<string, Record<string, unknown>> = {
  INTRO: {
    id: "INTRO",
    title: {
      en: "Toymaker Escape — Intro",
      fr: "Toymaker Escape — Intro",
    },
    body: {
      en: "A late evening at the atelier. Something is amiss...",
      fr: "Un soir tard dans l'atelier. Quelque chose cloche...",
    },
    choices: [{ id: "begin", text: { en: "Begin", fr: "Commencer" }, target: "E1_GEAR" }],
  },
  E1_GEAR: {
    id: "E1_GEAR",
    title: { en: "Episode 1 — Gears", fr: "Épisode 1 — Engrenages" },
    body: {
      en: "Align the gears to open the panel (MVP placeholder puzzle).",
      fr: "Alignez les engrenages pour ouvrir le panneau (puzzle MVP).",
    },
    choices: [
      {
        id: "solve",
        text: { en: "Solve Gear Puzzle", fr: "Résoudre le puzzle d'engrenages" },
        target: "E1_RESULT",
        puzzle: true,
        puzzleId: "gear",
      },
    ],
  },
  E1_RESULT: {
    id: "E1_RESULT",
    title: { en: "Episode 1 — Result", fr: "Épisode 1 — Résultat" },
    body: {
      en: "The gears align with a satisfying click. A hidden drawer opens...",
      fr: "Les engrenages s'alignent avec un clic satisfaisant. Un tiroir caché s'ouvre...",
    },
    choices: [{ id: "next", text: { en: "Continue", fr: "Continuer" }, target: "E2_CIRCUIT" }],
  },
  E2_CIRCUIT: {
    id: "E2_CIRCUIT",
    title: { en: "Episode 2 — Circuit", fr: "Épisode 2 — Circuit" },
    body: {
      en: "Inside the drawer, you find a circuit board. The wires need connecting...",
      fr: "Dans le tiroir, vous trouvez une carte de circuit. Les fils doivent être connectés...",
    },
    choices: [
      {
        id: "solve",
        text: { en: "Connect Wires", fr: "Connecter les fils" },
        target: "E2_RESULT",
        puzzle: true,
        puzzleId: "wires",
      },
    ],
  },
  E2_RESULT: {
    id: "E2_RESULT",
    title: { en: "Episode 2 — Result", fr: "Épisode 2 — Résultat" },
    body: {
      en: "The board hums to life. A small LED blinks a sequence...",
      fr: "La carte s'anime avec un bourdonnement. Une petite DEL clignote une séquence...",
    },
    choices: [{ id: "next", text: { en: "Continue", fr: "Continuer" }, target: "E3_SEQUENCE" }],
  },
  E3_SEQUENCE: {
    id: "E3_SEQUENCE",
    title: { en: "Episode 3 — Sequence", fr: "Épisode 3 — Séquence" },
    body: {
      en: "The blinking pattern... you need to reproduce it.",
      fr: "Le motif clignotant... vous devez le reproduire.",
    },
    choices: [
      {
        id: "solve",
        text: { en: "Reproduce Sequence", fr: "Reproduire la séquence" },
        target: "E3_RESULT",
        puzzle: true,
        puzzleId: "sequence",
      },
    ],
  },
  E3_RESULT: {
    id: "E3_RESULT",
    title: { en: "Episode 3 — Result", fr: "Épisode 3 — Résultat" },
    body: {
      en: "Correct! A panel on the wall slides open, revealing a filing cabinet...",
      fr: "Correct! Un panneau au mur coulisse, révélant un classeur...",
    },
    choices: [
      { id: "next", text: { en: "Continue", fr: "Continuer" }, target: "E4_FILING" },
    ],
  },
  E4_FILING: {
    id: "E4_FILING",
    title: { en: "Episode 4 — Filing", fr: "Épisode 4 — Classement" },
    body: {
      en: "The filing cabinet has three drawers marked A, B, C. Each toy belongs in a specific drawer...",
      fr: "Le classeur a trois tiroirs marqués A, B, C. Chaque jouet appartient à un tiroir spécifique...",
    },
    choices: [
      {
        id: "solve",
        text: { en: "Sort the Toys", fr: "Trier les jouets" },
        target: "E4_RESULT",
        puzzle: true,
        puzzleId: "filing",
      },
    ],
  },
  E4_RESULT: {
    id: "E4_RESULT",
    title: { en: "Episode 4 — Result", fr: "Épisode 4 — Résultat" },
    body: {
      en: "The filing cabinet clicks. A drawer opens to reveal a key with the number '5'...",
      fr: "Le classeur clique. Un tiroir s'ouvre pour révéler une clé avec le numéro '5'...",
    },
    choices: [{ id: "next", text: { en: "Continue", fr: "Continuer" }, target: "E5_KEYPAD" }],
  },
  E5_KEYPAD: {
    id: "E5_KEYPAD",
    title: { en: "Episode 5 — Keypad", fr: "Épisode 5 — Clavier" },
    body: {
      en: "A reinforced door blocks your way. A numeric keypad demands a code...",
      fr: "Une porte renforcée bloque votre chemin. Un clavier numérique exige un code...",
    },
    choices: [
      {
        id: "solve",
        text: { en: "Enter Code", fr: "Entrer le code" },
        target: "E5_RESULT",
        puzzle: true,
        puzzleId: "keypad",
      },
    ],
  },
  E5_RESULT: {
    id: "E5_RESULT",
    title: { en: "Episode 5 — Result", fr: "Épisode 5 — Résultat" },
    body: {
      en: "The door swings open. You're in the toymaker's private workshop...",
      fr: "La porte s'ouvre. Vous êtes dans l'atelier privé du fabricant de jouets...",
    },
    choices: [{ id: "next", text: { en: "Continue", fr: "Continuer" }, target: "E6_BROKEN" }],
  },
  E6_BROKEN: {
    id: "E6_BROKEN",
    title: { en: "Episode 6 — Broken Toys", fr: "Épisode 6 — Jouets cassés" },
    body: {
      en: "The workshop is filled with broken toys. Each needs a specific piece to be fixed...",
      fr: "L'atelier est rempli de jouets cassés. Chacun a besoin d'une pièce spécifique...",
    },
    choices: [
      {
        id: "solve",
        text: { en: "Fix the Toys", fr: "Réparer les jouets" },
        target: "E6_RESULT",
        puzzle: true,
        puzzleId: "broken",
      },
    ],
  },
  E6_RESULT: {
    id: "E6_RESULT",
    title: { en: "Episode 6 — Result", fr: "Épisode 6 — Résultat" },
    body: {
      en: "All toys are fixed! They spring to life, pointing to a shadow box on the wall...",
      fr: "Tous les jouets sont réparés! Ils s'animent, pointant vers une boîte d'ombre au mur...",
    },
    choices: [{ id: "next", text: { en: "Continue", fr: "Continuer" }, target: "E7_SHADOW" }],
  },
  E7_SHADOW: {
    id: "E7_SHADOW",
    title: { en: "Episode 7 — Shadows", fr: "Épisode 7 — Ombres" },
    body: {
      en: "Match the shadow silhouettes to their objects to proceed.",
      fr: "Associez les silhouettes d'ombre à leurs objets pour continuer.",
    },
    choices: [
      {
        id: "solve",
        text: { en: "Match Shadows", fr: "Associer les ombres" },
        target: "E7_RESULT",
        puzzle: true,
        puzzleId: "shadow",
      },
    ],
  },
  E7_RESULT: {
    id: "E7_RESULT",
    title: { en: "Episode 7 — Result", fr: "Épisode 7 — Résultat" },
    body: {
      en: "The shadow box clicks open. Inside: a final puzzle — a complex locking mechanism...",
      fr: "La boîte d'ombre s'ouvre. À l'intérieur : un puzzle final — un mécanisme de verrouillage complexe...",
    },
    choices: [
      { id: "next", text: { en: "Continue", fr: "Continuer" }, target: "E8_LOCKS" },
    ],
  },
  E8_LOCKS: {
    id: "E8_LOCKS",
    title: { en: "Episode 8 — Locks", fr: "Épisode 8 — Serrures" },
    body: {
      en: "Multiple locks protect the final door. Each must be opened in the right order...",
      fr: "Plusieurs serrures protègent la porte finale. Chacune doit être ouverte dans le bon ordre...",
    },
    choices: [
      {
        id: "solve",
        text: { en: "Pick the Locks", fr: "Crocheter les serrures" },
        target: "E8_RESULT",
        puzzle: true,
        puzzleId: "locks",
      },
    ],
  },
  E8_RESULT: {
    id: "E8_RESULT",
    title: { en: "Episode 8 — Result", fr: "Épisode 8 — Résultat" },
    body: {
      en: "The last lock falls away. Morning light streams through the garden door...",
      fr: "La dernière serrure tombe. La lumière du matin traverse la porte du jardin...",
    },
    choices: [
      { id: "next", text: { en: "Continue", fr: "Continuer" }, target: "E3_FINAL_ESCAPE" },
    ],
  },
  E3_FINAL_ESCAPE: {
    id: "E3_FINAL_ESCAPE",
    title: { en: "Final Escape", fr: "Évasion finale" },
    body: {
      en: "One last puzzle stands between you and the morning light. A complex locking mechanism on the studio's garden door. The toymaker's voice guides you softly.",
      fr: "Un dernier puzzle se dresse entre vous et la lumière du matin. Un mécanisme de verrouillage complexe sur la porte du jardin du studio. La voix du fabricant vous guide doucement.",
    },
    choices: [
      {
        id: "solve",
        text: { en: "Escape!", fr: "S'évader!" },
        target: "ENDING",
        puzzle: true,
        puzzleId: "finalEscape",
      },
    ],
  },
  ENDING: {
    id: "ENDING",
    title: { en: "Freedom", fr: "Liberté" },
    body: {
      en: "The apartment mystery is solved. The commissioner WAS the toymaker — you created this puzzle for yourself. Medal earned: Toymaker's Apprentice.",
      fr: "Le mystère de l'appartement est résolu. Le commissaire ÉTAIT le fabricant — vous avez créé ce puzzle pour vous-même. Médaille gagnée : Apprenti Fabricant.",
    },
    choices: [],
  },
};
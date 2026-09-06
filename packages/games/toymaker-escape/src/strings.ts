/**
 * Toymaker Escape — Bilingual string map
 *
 * Replaces inline `lang === "fr" ? X : Y` patterns.
 * Pattern modeled after Dungeon Delver's TX system.
 */

export const TME_TX = {
  en: {
    // Shadow puzzle
    shadowPrompt: "Align shapes to match the target outline",
    shadowAligned: "Shadow aligned!",
    shadowResult: "Result:",
    validateGears: "Confirm gears",
    inspectPlate: "Inspect 3:1 plate",

    // Pipe puzzle
    connect: "Connect",
    validatePipes: "Confirm pipes",

    // Cipher puzzle
    cipherTitle: "Correspondence Cipher",
    cipherPlaceholder: "Your answer...",
    cipherDecode: "Decode",
    cipherSolved: "Cipher solved!",

    // Episode 2
    episode2Complete: "Episode 2 Complete",
    medalEarned: "Medal earned: File Clerk",
    continueToEpisode3: "Continue to Episode 3",
    restart: "Restart",
    apartmentMystery: "Apartment Mystery",
    checkLocks: "Check the locks",
    photoWall: "Photo Memory Wall",

    // Fridge
    continueToFridge: "Continue to fridge",
    fridgeAnagram: "Fridge Anagram",
    yourWord: "Your word...",
    validate: "Submit",
    anagramSolved: "Anagram solved!",

    // Gear wall
    gearWall: "Mechanical Gear Wall",
    result: "Result:",
    correct: "Correct",
    incorrect: "Incorrect",
    validateGears2: "Confirm gears",

    // Legacy
    riteOfDiscovery: "Rite of Discovery",
  },
  fr: {
    shadowPrompt: "Alignez les formes pour le contour cible",
    shadowAligned: "Ombre alignée !",
    shadowResult: "Résultat:",
    validateGears: "Valider l'engrenage",
    inspectPlate: "Observer la plaque 3:1",

    connect: "Connecter",
    validatePipes: "Valider les tuyaux",

    cipherTitle: "Chiffre de correspondance",
    cipherPlaceholder: "Votre réponse...",
    cipherDecode: "Décoder",
    cipherSolved: "Chiffre résolu !",

    episode2Complete: "Épisode 2 terminé",
    medalEarned: "Médaille gagnée : Commis aux archives",
    continueToEpisode3: "Continuer vers l'Épisode 3",
    restart: "Recommencer",
    apartmentMystery: "Le Mystère de l'Appartement",
    checkLocks: "Vérifier les verrous",
    photoWall: "Mur de photos souvenir",

    continueToFridge: "Continuer vers le frigo",
    fridgeAnagram: "Anagramme du frigo",
    yourWord: "Votre mot...",
    validate: "Valider",
    anagramSolved: "Anagramme résolu !",

    gearWall: "Mur d'engrenages mécaniques",
    result: "Résultat :",
    correct: "Correct",
    incorrect: "Incorrect",
    validateGears2: "Valider l'engrenage",

    riteOfDiscovery: "Rite de Découverte",
  },
} as const;

export type TmeTxKey = keyof typeof TME_TX.en;
/**
 * Horloge injectable (B9, registre D2, precondition du replay deterministe).
 *
 * Un moteur qui appelle `Date.now()` directement n'est pas reproductible : le
 * meme enregistrement rejoue donnerait un resultat different. Cette brique PURE
 * fournit une horloge a injecter, et une variante manuelle pour les tests et la
 * re-simulation d'un replay.
 */

export interface Clock {
  /** Temps courant, en millisecondes depuis l'epoque. */
  now(): number;
}

export interface ManualClock extends Clock {
  /** Avance l'horloge de `ms`. */
  advance(ms: number): void;
  /** Fixe l'horloge a une valeur absolue. */
  set(ms: number): void;
}

/** Horloge reelle (par defaut) ou branchee sur une source fournie. */
export function createClock(source: () => number = () => Date.now()): Clock {
  return { now: () => source() };
}

/**
 * Horloge manuelle : le temps ne bouge que sur `advance`/`set`. C'est elle qu'un
 * enregistrement de replay doit utiliser pour etre reproductible.
 */
export function createManualClock(startMs = 0): ManualClock {
  let current = startMs;
  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms;
    },
    set: (ms: number) => {
      current = ms;
    },
  };
}

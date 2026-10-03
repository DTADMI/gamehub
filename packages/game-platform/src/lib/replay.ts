/**
 * Replay deterministe (D2) : brique sure et testable, sans interface.
 *
 * Un replay non deterministe n'est pas un replay : il faut figer les entrees ET la
 * graine du hasard, et porter une version de format pour refuser de rejouer quelque
 * chose qui n'a pas ete produit par la meme version de jeu.
 *
 * Ce module fournit :
 *  - un RNG seme deterministe (mulberry32), pour que le meme appel produise la meme
 *    suite de nombres a chaque rejeu ;
 *  - un format d'enregistrement (entetes + trames d'entree) avec encodage, decodage et
 *    validation.
 *
 * Il ne depend d'aucun jeu : c'est la base commune a tous les jeux.
 */

export const REPLAY_FORMAT_VERSION = 1

export interface ReplayHeader {
  /** Version du format de replay. */
  version: number
  gameId: string
  /** Graine du generateur de hasard du jeu. */
  seed: number
  /** Date ISO de debut d'enregistrement. */
  startedAt: string
}

export interface ReplayFrame {
  /** Horodatage relatif en millisecondes depuis le debut. */
  t: number
  /** Entree du joueur (touches, pointeur, etc.), telle qu'appliquee a la simulation. */
  input: Record<string, unknown>
}

export interface Replay {
  header: ReplayHeader
  frames: ReplayFrame[]
}

/**
 * RNG deterministe (mulberry32). Meme graine, meme suite : c'est la condition d'un
 * replay fiable. Renvoie un nombre dans [0, 1).
 */
export function createSeededRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Melange deterministe (Fisher-Yates) pilote par un RNG seme.
 *
 * Remplace les `items.sort(() => Math.random() - 0.5)` : ces derniers ne sont ni
 * reproductibles ni un melange uniforme. Avec une graine, la meme partie peut
 * etre rejouee a l'identique - c'est la premiere brique d'un replay (B9).
 * Ne mute pas la source.
 */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const rng = createSeededRng(seed)
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const swap = out[i]!
    out[i] = out[j]!
    out[j] = swap
  }
  return out
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isReplay(value: unknown): value is Replay {
  if (!isRecord(value)) return false
  const header = value.header
  const frames = value.frames
  if (!isRecord(header)) return false
  if (typeof header.version !== 'number' || typeof header.gameId !== 'string') return false
  if (typeof header.seed !== 'number' || typeof header.startedAt !== 'string') return false
  if (!Array.isArray(frames)) return false
  return frames.every((frame) => isRecord(frame) && typeof frame.t === 'number' && isRecord(frame.input))
}

export function encodeReplay(replay: Replay): string {
  return JSON.stringify(replay)
}

export type DecodeResult =
  | { ok: true; replay: Replay }
  | { ok: false; reason: 'bad_format' | 'version_mismatch' }

/** Decode un replay et refuse explicitement une autre version du format. */
export function decodeReplay(text: string, expectedVersion = REPLAY_FORMAT_VERSION): DecodeResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'bad_format' }
  }
  if (!isReplay(parsed)) return { ok: false, reason: 'bad_format' }
  if (parsed.header.version !== expectedVersion) return { ok: false, reason: 'version_mismatch' }
  return { ok: true, replay: parsed }
}

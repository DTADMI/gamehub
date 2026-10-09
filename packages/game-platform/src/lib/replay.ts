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

// ---------------------------------------------------------------------------
// Enregistrement des entrees (B9, phase 2)
//
// Un format de replay sans enregistreur ne sert a rien : il faut un objet qui
// collecte les entrees pendant la partie, en refusant ce qui rendrait le rejeu
// impossible. Trois refus, chacun compte et explique :
//   - une entree VIDE n'est pas une entree (elle ne change rien au rejeu) ;
//   - un horodatage qui RECULE rend le rejeu non monotone, donc non rejouable ;
//   - un DOUBLON proche de la meme entree n'ajoute rien : un maintien de touche
//     produirait des milliers de trames identiques.
// ---------------------------------------------------------------------------

export interface RecorderOptions {
  gameId: string
  /** Graine du generateur de hasard du jeu. */
  seed: number
  /** Date ISO de debut ; par defaut, l'instant de construction. */
  startedAt?: string
  /**
   * Fenetre de coalescence en millisecondes. Deux enregistrements IDENTIQUES
   * separes de moins que ce delai ne produisent qu'une trame. 0 (defaut) desactive.
   */
  coalesceWithinMs?: number
}

export interface RecorderStats {
  /** Trames retenues. */
  recorded: number
  /** Refusees : entree vide. */
  droppedEmpty: number
  /** Refusees : horodatage en arriere ou non fini. */
  droppedOutOfOrder: number
  /** Ignorees : doublon dans la fenetre de coalescence. */
  coalesced: number
}

/** Compare deux entrees par valeur (cles et valeurs, objets imbriques compris). */
function sameInput(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keysA = Object.keys(a)
  if (keysA.length !== Object.keys(b).length) return false
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false
    const va = a[key]
    const vb = b[key]
    if (va === vb) continue
    if (typeof va === 'object' || typeof vb === 'object') {
      // Comparaison par valeur serialisee : suffisant pour des entrees simples et
      // deterministe pour un meme objet construit dans le meme ordre.
      if (JSON.stringify(va) !== JSON.stringify(vb)) return false
    } else {
      return false
    }
  }
  return true
}

/**
 * Collecte les entrees d'une partie pour produire un `Replay` valide.
 *
 * Le temps est fourni par l'appelant (pas de `Date.now()` interne) : un
 * enregistreur qui lit l'horloge lui-meme produit des replays non reproductibles.
 */
export class ReplayRecorder {
  private readonly header: ReplayHeader
  private readonly recordedFrames: ReplayFrame[] = []
  private readonly coalesceWithinMs: number
  private readonly counter: RecorderStats = {
    recorded: 0,
    droppedEmpty: 0,
    droppedOutOfOrder: 0,
    coalesced: 0,
  }
  private lastT = Number.NEGATIVE_INFINITY

  constructor(options: RecorderOptions) {
    this.header = {
      version: REPLAY_FORMAT_VERSION,
      gameId: options.gameId,
      seed: options.seed,
      startedAt: options.startedAt ?? new Date().toISOString(),
    }
    this.coalesceWithinMs = options.coalesceWithinMs ?? 0
  }

  /** Enregistre une entree. Retourne true si une trame a ete retenue. */
  record(t: number, input: Record<string, unknown>): boolean {
    if (Object.keys(input).length === 0) {
      this.counter.droppedEmpty += 1
      return false
    }
    if (!Number.isFinite(t) || t < this.lastT) {
      this.counter.droppedOutOfOrder += 1
      return false
    }
    const previous = this.recordedFrames[this.recordedFrames.length - 1]
    if (
      previous &&
      this.coalesceWithinMs > 0 &&
      t - previous.t < this.coalesceWithinMs &&
      sameInput(previous.input, input)
    ) {
      // L'entree est deja active : la trame precedente la represente toujours.
      // On ne touche PAS a son horodatage, qui marque le DEBUT de l'entree.
      this.counter.coalesced += 1
      return false
    }
    this.recordedFrames.push({ t, input: { ...input } })
    this.lastT = t
    this.counter.recorded += 1
    return true
  }

  get frameCount(): number {
    return this.recordedFrames.length
  }

  get stats(): RecorderStats {
    return { ...this.counter }
  }

  /**
   * Fige le replay. Copie profonde des trames : une trame enregistree APRES
   * `build()` ne doit pas modifier le replay deja produit (un replay qui bouge
   * apres coup n'est plus un enregistrement).
   */
  build(): Replay {
    return {
      header: { ...this.header },
      frames: this.recordedFrames.map((frame) => ({ t: frame.t, input: { ...frame.input } })),
    }
  }

  /** Raccourci : le replay encode, pret a etre transmis. */
  encode(): string {
    return encodeReplay(this.build())
  }
}

/**
 * Entree active a un instant donne : la derniere trame commencee a `t` ou avant.
 * Renvoie `null` avant la premiere trame. C'est ce dont une vue spectateur a
 * besoin pour rejouer sans stocker un etat par image.
 */
export function inputAt(frames: readonly ReplayFrame[], t: number): Record<string, unknown> | null {
  let active: Record<string, unknown> | null = null
  for (const frame of frames) {
    if (frame.t > t) break
    active = frame.input
  }
  return active
}

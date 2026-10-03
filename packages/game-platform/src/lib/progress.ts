/**
 * Sauvegarde de progression (B8, decision register D1, option C).
 *
 * Le serveur est la source de verite, le navigateur en garde une copie de
 * travail. Cette brique PURE decide qui gagne et, surtout, **signale** un
 * conflit : une resolution silencieuse peut ecraser une progression recente
 * (risque identifie dans le registre).
 *
 * On ne fusionne pas deux documents differents par une heuristique : on tranche
 * par `updatedAt`, et on marque `conflict` pour que l'appelant puisse le montrer
 * ou le journaliser.
 */

export interface ProgressRecord<T = unknown> {
  gameId: string
  data: T
  /** Horodatage ISO de la derniere ecriture. */
  updatedAt: string
}

export type ConflictReason = 'stale_local' | 'stale_remote' | 'tie'

export type ProgressResolution<T = unknown> =
  | { status: 'no_conflict'; record: ProgressRecord<T>; source: 'local' | 'remote' }
  | {
      status: 'conflict'
      record: ProgressRecord<T>
      source: 'local' | 'remote'
      reason: ConflictReason
    }

function sameData<T>(a: T, b: T): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

/**
 * Tranche entre une copie locale et une copie distante.
 * Renvoie `null` quand les deux sont absentes.
 */
export function resolveProgress<T>(
  local: ProgressRecord<T> | null,
  remote: ProgressRecord<T> | null,
): ProgressResolution<T> | null {
  if (local === null && remote === null) return null
  if (remote === null) return { status: 'no_conflict', record: local as ProgressRecord<T>, source: 'local' }
  if (local === null) return { status: 'no_conflict', record: remote, source: 'remote' }

  if (remote.updatedAt > local.updatedAt) {
    return { status: 'conflict', record: remote, source: 'remote', reason: 'stale_local' }
  }
  if (local.updatedAt > remote.updatedAt) {
    return { status: 'conflict', record: local, source: 'local', reason: 'stale_remote' }
  }
  if (sameData(local.data, remote.data)) {
    return { status: 'no_conflict', record: local, source: 'local' }
  }
  // Meme horodatage, contenus differents : on ne choisit pas en aveugle, on
  // prend le distant (source de verite) et on marque le tie.
  return { status: 'conflict', record: remote, source: 'remote', reason: 'tie' }
}

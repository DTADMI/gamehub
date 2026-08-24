import type { Dictionary } from '../../core/src'
import { sigils } from './sigils'
import { signs } from './signs'
import { sampleSpells } from './sample-spells'

export { sigils } from './sigils'
export { signs } from './signs'
export { sampleSpells } from './sample-spells'
export { validateDictionary, assertValidDictionary } from './validate'
export { DictionaryWatcher, watchDictionary } from './loader'

export const DEFAULT_DICTIONARY: Dictionary = {
  sigils,
  signs,
  sampleSpells,
}

export function loadDictionary(): Dictionary {
  return DEFAULT_DICTIONARY
}

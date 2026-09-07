import type { Dictionary } from '../../core/src';
import { sampleSpells } from './sample-spells';
import { sigils } from './sigils';
import { signs } from './signs';

export { DictionaryWatcher, watchDictionary } from './loader';
export { sampleSpells } from './sample-spells';
export { sigils } from './sigils';
export { signs } from './signs';
export { assertValidDictionary,validateDictionary } from './validate';

export const DEFAULT_DICTIONARY: Dictionary = {
  sigils,
  signs,
  sampleSpells,
};

export function loadDictionary(): Dictionary {
  return DEFAULT_DICTIONARY;
}

export { compileSpell } from './compile'
export {
  compileMultiElement,
  getCombinedElement,
  ELEMENT_COMBINATION_RULES,
} from './multi-element'
export { compileMultiRing, compileLinkedRings } from './multi-ring'
export { buildSpellIR, buildInvalidSpell, generateSignature } from './spell-builder'
export { extractPrimarySigil } from './sigil-extractor'
export { aggregateSigns } from './sign-aggregator'
export { computeParameters } from './parameter-computer'
export { computeDirection } from './direction-computer'
export { computeQuality, computeStability, computeDuration } from './quality-scorer'
export { validateSpellInput } from './validate'
export { mergeWarnings, COMPILER_WARNING_MESSAGES } from './warnings'

export type { SpellBuilderInput } from './spell-builder'
export type { SigilExtractionResult } from './sigil-extractor'
export type { SignAggregationResult } from './sign-aggregator'
export type { ComputedParameters } from './parameter-computer'
export type { DirectionResult } from './direction-computer'
export type { QualityResult } from './quality-scorer'
export type { ValidationResult } from './validate'
export type { MultiElementInput } from './multi-element'

export const COMPILER_VERSION = '0.1.0'

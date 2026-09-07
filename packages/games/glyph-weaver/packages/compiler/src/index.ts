export { compileSpell } from './compile';
export type { DirectionResult } from './direction-computer';
export { computeDirection } from './direction-computer';
export type { MultiElementInput } from './multi-element';
export {
  compileMultiElement,
  ELEMENT_COMBINATION_RULES,
  getCombinedElement,
} from './multi-element';
export { compileLinkedRings,compileMultiRing } from './multi-ring';
export type { ComputedParameters } from './parameter-computer';
export { computeParameters } from './parameter-computer';
export type { QualityResult } from './quality-scorer';
export { computeDuration,computeQuality, computeStability } from './quality-scorer';
export type { SigilExtractionResult } from './sigil-extractor';
export { extractPrimarySigil } from './sigil-extractor';
export type { SignAggregationResult } from './sign-aggregator';
export { aggregateSigns } from './sign-aggregator';
export type { SpellBuilderInput } from './spell-builder';
export { buildInvalidSpell, buildSpellIR, generateSignature } from './spell-builder';
export type { ValidationResult } from './validate';
export { validateSpellInput } from './validate';
export { COMPILER_WARNING_MESSAGES,mergeWarnings } from './warnings';

export const COMPILER_VERSION = '0.1.0';

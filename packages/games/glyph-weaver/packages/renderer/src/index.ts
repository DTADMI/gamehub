export { EffectEngine, createRenderer } from './effect-engine'
export type {
  Effect,
  EffectConfig,
  EffectContext,
  EffectFactory,
  ActiveEffects,
} from './effect-types'

export { createWebGLContext, createShaderProgram, createQuad } from './webgl/context'
export type { QuadGeometry } from './webgl/context'

export {
  VERTEX_SHADER_PASSTHROUGH,
  FRAGMENT_SHADER_FIRE,
  FRAGMENT_SHADER_WATER,
  FRAGMENT_SHADER_WIND,
  FRAGMENT_SHADER_EARTH,
  FRAGMENT_SHADER_LIGHT,
  FRAGMENT_SHADER_DARK,
  FRAGMENT_SHADER_LIGHTNING,
  FRAGMENT_SHADER_ICE,
  FRAGMENT_SHADER_NATURE,
  FRAGMENT_SHADER_ARCANE,
  ELEMENT_FRAGMENT_SHADERS,
} from './webgl/shaders'

export { ParticleSystem } from './webgl/particle-system'
export type { Particle, ParticleEmissionConfig } from './webgl/particle-system'

export { projectPortal, portalOutDirection } from './webgl/portal-plane'
export type { PortalProjection } from './webgl/portal-plane'

export { screenDirection, applyTilt, project3Dto2D } from './direction'

export { FireEffect } from './effects/fire'
export { WaterEffect } from './effects/water'
export { WindEffect } from './effects/wind'
export { EarthEffect } from './effects/earth'
export { LightEffect } from './effects/light'
export { DarkEffect } from './effects/dark'
export { LightningEffect } from './effects/lightning'
export { IceEffect } from './effects/ice'
export { NatureEffect } from './effects/nature'
export { ArcaneEffect } from './effects/arcane'

export { AuraEffect } from './manifestations/aura'
export { ColumnEffect } from './manifestations/column'
export { LevitationEffect } from './manifestations/levitation'
export { ConvergenceEffect } from './manifestations/convergence'
export { BarrierEffect } from './manifestations/barrier'
export { ProjectileEffect } from './manifestations/projectile'
export { AreaEffect } from './manifestations/area'
export { ShieldEffect } from './manifestations/shield'

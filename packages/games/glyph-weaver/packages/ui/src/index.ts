export { GlyphWeaverShell } from './components/Shell'
export { Header } from './components/Header'
export { Sidebar } from './components/Sidebar'
export { CanvasArea } from './components/CanvasArea'
export { ToolPalette } from './components/ToolPalette'
export { BrushSettingsPanel } from './components/BrushSettings'
export { DictionaryPanel } from './components/panels/DictionaryPanel'
export { DiagnosticsPanel } from './components/panels/DiagnosticsPanel'
export { SpellStateDisplay } from './components/panels/SpellStateDisplay'
export { SettingsPanel } from './components/panels/SettingsPanel'
export { FeatureFlagGate } from './components/FeatureFlagGate'

export {
  DrawingCanvas,
  EffectsOverlay,
  Paper,
  HistoryManager,
  getCursorStyle,
  clearCursorCache,
} from './canvas/index'

export {
  I18nProvider,
  useI18n,
  resolveLocale,
  getServerTranslations,
  parseAcceptLanguage,
} from './i18n/index'
export type { Locale, TranslationMap, I18nContextValue } from './i18n/index'

export { ThemeProvider, useTheme } from './theme/index'
export type { Theme } from './theme/index'

export { useKeyboardShortcuts, getShortcutLabel, DEFAULT_SHORTCUTS } from './shortcuts/index'
export type { ShortcutAction, ActionHandler } from './shortcuts/index'

export { useStore } from './state/index'
export type { ToolType, PanelState, AppStoreState, PipelineStatus } from './state/index'
export type { BrushSettings as BrushSettingsConfig } from './state/index'

export { pipelineManager } from './pipeline/index'
export type { PipelineManager, RingStatus, PipelineResult } from './pipeline/index'

export { GLYPH_WEAVER_VERSION, GLYPH_WEAVER_NAME } from '../../core/src'

export const UI_VERSION = '0.1.0'

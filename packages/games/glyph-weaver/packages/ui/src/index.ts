export { GLYPH_WEAVER_NAME,GLYPH_WEAVER_VERSION } from '../../core/src';
export {
  clearCursorCache,
  DrawingCanvas,
  EffectsOverlay,
  getCursorStyle,
  HistoryManager,
  Paper,
} from './canvas/index';
export { BrushSettingsPanel } from './components/BrushSettings';
export { CanvasArea } from './components/CanvasArea';
export { FeatureFlagGate } from './components/FeatureFlagGate';
export { Header } from './components/Header';
export { DiagnosticsPanel } from './components/panels/DiagnosticsPanel';
export { DictionaryPanel } from './components/panels/DictionaryPanel';
export { SettingsPanel } from './components/panels/SettingsPanel';
export { SpellStateDisplay } from './components/panels/SpellStateDisplay';
export { GlyphWeaverShell } from './components/Shell';
export { Sidebar } from './components/Sidebar';
export { ToolPalette } from './components/ToolPalette';
export type { I18nContextValue,Locale, TranslationMap } from './i18n/index';
export {
  getServerTranslations,
  I18nProvider,
  parseAcceptLanguage,
  resolveLocale,
  useI18n,
} from './i18n/index';
export type { PipelineManager, PipelineResult,RingStatus } from './pipeline/index';
export { pipelineManager } from './pipeline/index';
export type { ActionHandler,ShortcutAction } from './shortcuts/index';
export { DEFAULT_SHORTCUTS,getShortcutLabel, useKeyboardShortcuts } from './shortcuts/index';
export type { AppStoreState, PanelState, PipelineStatus,ToolType } from './state/index';
export type { BrushSettings as BrushSettingsConfig } from './state/index';
export { useStore } from './state/index';
export type { Theme } from './theme/index';
export { ThemeProvider, useTheme } from './theme/index';

export const UI_VERSION = '0.1.0';

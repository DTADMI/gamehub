# Glyph Weaver — GameHub Integration

**Owner**: Nebula Forge GameHub Team + Glyph Weaver Team
**Last Updated**: 2026-08-22

## Overview

Glyph Weaver is a full spell-crafting studio originally developed as a standalone monorepo at `../glyph-weaver/`. It has been integrated into GameHub as game #20 in the roster.

### What Is Glyph Weaver?

A programmable glyph engine inspired by the magic system in *Witch Hat Atelier* (Kamome Shirahama / Kodansha). Features:

- **Drawing Canvas** — HTML5 Canvas with procedural paper texture, pen/eraser tools, pressure sensitivity
- **WebGL Particle Effects** — 5 core elements (fire, water, wind, earth, light) + 5 additional (dark, lightning, ice, nature, arcane) with GPU particle systems
- **WHA-DSL** — Domain-specific language for text-based spell diagrams
- **Multi-Ring Compilation** — Nested and linked spell circles with element combination logic
- **Dictionary System** — Extensible sigil/sign/sample-spell definitions
- **Pipeline** — Draw → Parse → GlyphAST → Compile → SpellIR → Render

### Project Structure (Separate Monorepo)

```
glyph-weaver/                     # Separate monorepo at ../glyph-weaver/
├── packages/
│   ├── core/                     # Shared types (GlyphAST, SpellIR), Zod, config
│   ├── dictionary/               # Sigil/sign/sample-spell definitions
│   ├── parser/                   # Stroke → GlyphAST pipeline
│   ├── compiler/                 # GlyphAST → SpellIR pipeline
│   ├── dsl/                      # WHA-DSL lexer/parser/compiler
│   ├── renderer/                 # WebGL/Canvas visual effects
│   ├── ui/                       # React components, canvas shell
│   └── tools/                    # Stroke template maker, effect lab
├── apps/web/                     # Next.js frontend
└── docs/                         # Full documentation
```

## Integration Architecture

### Two-Tier Approach

GameHub offers two entry points for glyph-based spell crafting:

| Entry | Slug | Type | Complexity |
|-------|------|------|------------|
| **Spell Craft** (Quick) | `spell-craft` | Basic drawing canvas, element detection | Casual |
| **Glyph Weaver** (Full) | `glyph-weaver` | Full studio with WebGL, DSL, multi-ring | Expert |

### GlyphWeaverGame Component

Located at `packages/games/glyph-weaver/src/GlyphWeaverGame.tsx`. Uses a dual-mode loading strategy:

1. **Direct Import Mode**: Attempts to dynamically import `@glyph-weaver/ui`'s `GlyphWeaverShell` from `../../../../glyph-weaver/packages/ui/dist/index.js`
2. **Launchpad Fallback**: If the import fails (separate monorepo, not linked), shows a polished launchpad with feature showcase and link to Spell Craft quick version

### Why Not Direct Import?

Per NF root `AGENTS.md` rules:
- "No shared packages. No npm/pnpm packages across projects."
- "All reusable code lives within each project's own repo."
- "Each project is a self-contained repo that can be cloned independently."

The two monorepos (gamehub + glyph-weaver) must remain independently deployable. The current integration uses:
- `tsconfig.json` path mapping for type resolution: `"glyph-weaver/*": ["../glyph-weaver/*"]`
- Runtime dynamic import with graceful fallback for when repos aren't co-located

### Production Deployment

For full integration (eliminating the launchpad fallback):

**Option A: Deploy glyph-weaver separately**
- Deploy glyph-weaver/apps/web to Vercel/Cloudflare Pages
- Update `GlyphWeaverGame.tsx` to use an iframe embed pointing to the deployed URL
- Most robust, respects NF independence rules

**Option B: Package as library**
- Add glyph-weaver packages as `file:` dependencies in `packages/games/glyph-weaver/package.json`
- Builds glyph-weaver packages during GameHub build
- Heavier build but fully integrated UX

**Option C: Copy into GameHub**
- Copy relevant packages into `packages/games/glyph-weaver/packages/`
- Self-contained, follows NF "copy, don't share" principle
- Requires maintenance sync

## Glyph Weaver Project Status

### Audit Summary

| Area | Status | Detail |
|------|--------|--------|
| Core types | ✅ Complete | GlyphAST, SpellIR, Dictionary, Config, Zod schemas |
| Parser | ✅ Complete | Stroke processing, ring detection, symbol recognition |
| Compiler | ✅ Complete | Single + multi-element compilation, SpellIR output |
| DSL | ✅ Complete | Full WHA-DSL lexer/parser/compiler, 14 token types |
| Renderer | ✅ Complete | WebGL 2.0, 10 elements, 8 manifestations |
| UI | ✅ Complete | Drawing canvas, panels, theme, i18n, shortcuts |
| Tools | ✅ Complete | Template maker, detector lab, effect lab |
| Tests | ✅ Complete | 217 tests across 22 files, 8 packages |
| CI | ✅ NF Compliant | ubuntu-24.04, Node 26.3.0, pnpm 11.5.0 |
| i18n | ✅ Complete | EN/FR with React Context, FR default |
| Feature flags | ✅ Complete | 5 flags (multiRing, multiSigil, DSL, experimental, LLM) |
| Persistence | ✅ Complete | localStorage adapter, save slots, auto-save |

### Remaining Gaps & Recommendations

| # | Gap | Priority | Effort |
|---|---|---|---|
| GW-1 | CI action-plan docs say ubuntu-22.04/Node 22 — actual CI and package.json use correct versions | LOW | Already compliant, just doc fix |
| GW-2 | UI package root `tsc --noEmit` fails (no jsx in root tsconfig) — per-package builds work fine | LOW | Add `"jsx": "react-jsx"` to root tsconfig or use `tsc --build` only |
| GW-3 | Accessibility audit — deferred (WCAG 2.1 AA) | MEDIUM | 🔵 Deferred |
| GW-4 | Onboarding tutorial — deferred | MEDIUM | 🔵 Phase 2 |
| GW-5 | PWA support — deferred | LOW | 🔵 Phase 2 |
| GW-6 | Integration with GameHub — launchpad mode | MEDIUM | Created this session |
| GW-7 | No standalone deployment URL yet | HIGH | Blocked on deployment |
| GW-8 | README says packages are "future" but all are 🟢 complete | LOW | Update README |

### NF Rule Compliance Check

| Rule | Status | Notes |
|------|--------|-------|
| Node 26.3.0 target | ✅ | .nvmrc, .node-version, CI all set |
| pnpm 11.5.0 | ✅ | packageManager field set |
| ubuntu-24.04 CI | ✅ | Already correct in ci.yml |
| TypeScript strict | ✅ | All packages use strict mode |
| i18n EN/FR | ✅ | React Context, FR default |
| No `any` without justification | ✅ | Zod schemas for runtime validation |
| Pre-commit hooks | ✅ | typecheck, lint, test, build, format:check |
| Feature flags | ✅ | 5 flags in lib/feature-flags.ts |
| Encoding handling | ✅ | check-encoding.ps1 + fix-encoding.ps1 |
| Docs aligned with code | ⚠️ | README says "future" but packages complete; action-plan version note out of date |

## GameHub Game Roster (Updated)

**20 games total** (was 19, now includes glyph-weaver):

| # | Game | Type | Status |
|---|---|---|---|
| 1-19 | Existing 19 games | Various | ✅ |
| 20 | **Glyph Weaver** | Spell Crafting Studio | ✅ In roster · 🚀 Launchpad mode · ⬜ Full integration pending deployment |

## Related Documentation

- GameHub: `docsfile:///games/point-and-click-production.md`
- GameHub: `docsfile:///games/production-audit.md`
- GameHub: `docsfile:///action-plan.md`
- Glyph Weaver: `../glyph-weaver/docs/project-spec.md`
- Glyph Weaver: `../glyph-weaver/docs/action-plan.md`
- Glyph Weaver: `../glyph-weaver/AGENTS.md`
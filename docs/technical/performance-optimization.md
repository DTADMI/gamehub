# GameHub — Performance Optimization

> **Owner**: Nebula Forge Digital Studio  
> **Last Updated**: 2026-08-20  
> **Canonical rules**: `../../docs/technical/performance-optimization.md` (NF root)

---

## SSR & Caching Strategy

| Content Type | Strategy | Revalidation |
|---|---|---|
| Home page | ISR | 60s |
| Blog posts | ISR + `generateStaticParams` for top posts | 300s |
| Game launcher pages | Static + client hydration for game state | N/A |
| Leaderboard | `force-dynamic` (real-time scores) | N/A |
| Explore page | ISR | 120s |
| Admin pages | `force-dynamic` | N/A |

## Bundle Optimization

### `next.config.ts`
```typescript
experimental: {
  optimizePackageImports: ['radix-ui', 'lucide-react', 'date-fns'],
  ppr: 'incremental',
  staleTimes: { dynamic: 30, static: 180 },
}
```

### Game Bundle Loading
- Games are dynamically imported with `next/dynamic` + `ssr: false`
- WASM/JS bundles served from `public/` with appropriate cache headers
- PixiJS and Three.js are in `transpilePackages` for tree-shaking

## Monorepo Package Optimization

| Package | Strategy |
|---|---|
| `@gamehub/game-platform` | Shared core — tree-shaken at build |
| `@gamehub/ui` | Design system — optimized via `optimizePackageImports` |
| `@gamehub/pixi-engine` | Lazy-loaded only for Pixi games |
| `@gamehub/pointclick-engine` | Lazy-loaded only for narrative games |
| `@gamehub/glyph-engine` | Lazy-loaded only for pattern-matching games |

## Cache Layers

| Layer | Technology | Scope |
|---|---|---|
| Next.js Data Cache | Built-in | Server-side fetch deduplication |
| React Cache | `React.cache()` | Per-request dedup (Supabase clients, auth) |
| Redis | Upstash | Feature flags, rate limits, leaderboard cache |
| Pg Cache | `lib/pg-cache.ts` | Fallback when Redis unavailable |

## Monitoring

- **Lighthouse**: Target ≥ 90 on all public pages
- **Vercel Analytics**: Web Vitals (LCP, FID, CLS, INP)
- **CI budget**: Build < 5 min, E2E suite < 10 min

---

*Document maintained by Nebula Forge Digital Studio — August 2026*
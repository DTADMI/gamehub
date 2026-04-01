# React Performance Hooks Guidelines

This document defines when to use `useEffectEvent`, `startTransition`, `useDeferredValue`, `useMemo`, and `useCallback` in GameHub.

## Rules

1. Use `useEffectEvent` for event handlers referenced inside `useEffect` subscriptions.
2. Use `startTransition` for non-urgent UI updates (filters, language switches, large list updates).
3. Use `useDeferredValue` for search/filter text that drives expensive filtering.
4. Use `useMemo` for derived arrays/objects used during rendering.
5. Use `useCallback` when passing handlers/render helpers to child trees repeatedly.

## Guardrails

1. Do not use memo hooks preemptively on tiny computations.
2. Keep dependency arrays complete and explicit.
3. Do not wrap every function with `useCallback`; apply only where re-renders matter.
4. Prefer measured fixes: profile first for hotspot pages.

## Implemented In This Pass

1. Locale event subscriptions:
   - `packages/game-platform/src/lib/site-locale.ts`
   - `useEffectEvent` applied for storage/custom-event listeners.
2. Language toggle behavior:
   - `packages/game-platform/src/components/LanguageToggle.tsx`
   - `startTransition` used for locale switch and refresh.
3. Games filtering UX:
   - `packages/game-platform/src/components/games/GamesList.tsx`
   - `useDeferredValue`, `useMemo`, `useCallback`, `startTransition`.
4. Projects filtering UX:
   - `app/projects/projects-client.tsx`
   - `useDeferredValue`, `useMemo`, `useCallback`, `startTransition`.
5. Home and Explore derived data:
   - `app/page.tsx`
   - `app/explore/page.tsx`
   - `useMemo` for render-critical derived lists.

## Query Data Rule

For static manifest data, avoid empty `initialData` with infinite stale time.  
Use concrete initial values from source data so card lists are rendered immediately.

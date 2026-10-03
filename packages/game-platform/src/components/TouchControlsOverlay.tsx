"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Overlay de commandes tactiles (B7).
 *
 * Composant DEDIE et reutilisable, plutot qu'une integration ad hoc par jeu : il
 * fournit des boutons a grande cible (>= 44 px, recommandation d'accessibilite
 * tactile), respecte les zones sures des telephones (encoches et barre gestuelle),
 * ne s'affiche que sur pointeur grossier (tactile) sauf forcage explicite, et
 * maintient un bouton appuyé pour les commandes de mouvement.
 *
 * Chaque bouton porte un nom accessible (NF-UX-002) ; le libelle visible peut etre
 * une icone.
 */

export type TouchControlButton = {
  /** Identifiant stable (cle React). */
  id: string;
  /** Libelle visible court (icone ou caractere). */
  label: React.ReactNode;
  /** Nom accessible : obligatoire, le libelle visible pouvant etre une icone. */
  ariaLabel: string;
  /** Declenche a l'appui. */
  onPress: () => void;
  /** Declenche au relachement (utile pour arreter un mouvement maintenu). */
  onRelease?: () => void;
  /** Maintien : repete `onPress` tant que le doigt reste pose. */
  repeat?: boolean;
  /** Periode de repetition en ms (defaut 120). */
  repeatMs?: number;
};

export interface TouchControlsOverlayProps {
  buttons: TouchControlButton[];
  /** Force l'affichage meme sur pointeur fin (tests, desktop). */
  force?: boolean;
  /** Disposition : croix directionnelle ou barre. */
  layout?: "dpad" | "bar";
  className?: string;
}

/** Detecte un pointeur tactile (coarse). Se met a jour au changement de media. */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(pointer: coarse)");
    setCoarse(query.matches);
    const onChange = (event: MediaQueryListEvent) => setCoarse(event.matches);
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);
  return coarse;
}

const BUTTON_CLASS =
  "flex min-h-[44px] min-w-[44px] select-none items-center justify-center rounded-xl " +
  "border border-white/20 bg-black/40 text-lg font-semibold text-white backdrop-blur-sm " +
  "active:bg-white/25 transition-colors";

export function TouchControlsOverlay({
  buttons,
  force = false,
  layout = "bar",
  className,
}: TouchControlsOverlayProps) {
  const coarse = useCoarsePointer();
  const timers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const clear = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearInterval(timer);
      timers.current.delete(id);
    }
  }, []);

  useEffect(() => {
    const map = timers.current;
    return () => {
      for (const timer of map.values()) clearInterval(timer);
      map.clear();
    };
  }, []);

  const press = useCallback(
    (button: TouchControlButton) => {
      button.onPress();
      if (button.repeat && !timers.current.has(button.id)) {
        const timer = setInterval(() => button.onPress(), button.repeatMs ?? 120);
        timers.current.set(button.id, timer);
      }
    },
    [],
  );

  const release = useCallback(
    (button: TouchControlButton) => {
      clear(button.id);
      button.onRelease?.();
    },
    [clear],
  );

  if (!force && !coarse) return null;

  return (
    <div
      data-testid="touch-controls-overlay"
      className={[
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center",
        "px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4",
        className ?? "",
      ].join(" ")}
      style={{ touchAction: "none" }}
    >
      <div
        className={[
          "pointer-events-auto grid gap-2",
          layout === "dpad" ? "grid-cols-3 grid-rows-3" : "grid-flow-col auto-cols-max",
        ].join(" ")}
      >
        {buttons.map((button) => (
          <button
            key={button.id}
            type="button"
            aria-label={button.ariaLabel}
            title={button.ariaLabel}
            className={BUTTON_CLASS}
            onPointerDown={(event) => {
              event.preventDefault();
              press(button);
            }}
            onPointerUp={() => release(button)}
            onPointerLeave={() => release(button)}
            onPointerCancel={() => release(button)}
            onContextMenu={(event) => event.preventDefault()}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

import type { Choice, Lang, Scene } from "../engine";

/** Character portrait configuration per scene or global */
export type CharacterPortrait = {
  /** Image URL or emoji fallback */
  src?: string;
  /** Emoji fallback if no src */
  emoji?: string;
  /** Display name */
  name: string;
  /** Side of the dialogue box */
  side?: "left" | "right";
};

export type DialogueBoxProps = {
  scene: Scene;
  lang: Lang;
  onChoose: (choiceId: string) => void;
  /** Current game context for guard evaluation */
  ctx?: Record<string, any>;
  /** Typing speed in ms per character (default: 25) */
  typingSpeed?: number;
  /** Whether to show a "click to continue" indicator after text finishes */
  showContinueIndicator?: boolean;
  /** Character portrait for this scene */
  speaker?: CharacterPortrait;
  /** Scene-level character portraits keyed by character id */
  characters?: Record<string, CharacterPortrait>;
  /** Callback when text finishes typing */
  onTextComplete?: () => void;
  /** Whether to play a subtle tick sound on each character (default: true) */
  playTickSound?: boolean;
  /** Custom tick sound player */
  onTick?: () => void;
};

/**
 * Enhanced DialogueBox with typewriter animation, character portraits,
 * guard evaluation, and choice presentation.
 *
 * Inspired by Rusty Lake's atmospheric dialogue, The Room's elegant pacing,
 * and classic point-and-click adventure game dialogue systems.
 *
 * Features:
 * - Typewriter text animation with configurable speed
 * - Character portraits (image or emoji fallback) with left/right positioning
 * - Guard evaluation: choices with unmet guards are greyed out with lock icon
 * - "Click to continue" / skip-typing interaction
 * - Accessible: aria-live region for screen readers
 * - Click-to-skip: clicking during typing completes text instantly
 */
export function DialogueBox({
  scene,
  lang,
  onChoose,
  ctx = {},
  typingSpeed = 25,
  showContinueIndicator = true,
  speaker,
  characters = {},
  onTextComplete,
  playTickSound = true,
  onTick,
}: DialogueBoxProps) {
  const title = typeof scene.title === "string" ? scene.title : scene.title[lang];
  const body = typeof scene.body === "string" ? scene.body : (scene.body?.[lang] ?? "");

  const [displayedChars, setDisplayedChars] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const fullTextRef = useRef(body);

  // Reset on scene change
  useEffect(() => {
    fullTextRef.current = body;
    setDisplayedChars(0);
    setTypingComplete(false);
    setChoicesVisible(false);
  }, [body, scene.id]);

  // Typewriter effect
  useEffect(() => {
    if (!body || body.length === 0) {
      setTypingComplete(true);
      setChoicesVisible(true);
      return;
    }

    const tick = () => {
      setDisplayedChars((prev) => {
        const next = prev + 1;
        if (next >= fullTextRef.current.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTypingComplete(true);
          // Show choices after a brief pause
          setTimeout(() => setChoicesVisible(true), 300);
          onTextComplete?.();
          return fullTextRef.current.length;
        }
        if (playTickSound) onTick?.();
        return next;
      });
    };

    intervalRef.current = window.setInterval(tick, typingSpeed);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [body, typingSpeed]);

  // Click-to-skip
  const handleTextClick = useCallback(() => {
    if (!typingComplete && body) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayedChars(fullTextRef.current.length);
      setTypingComplete(true);
      setTimeout(() => setChoicesVisible(true), 200);
      onTextComplete?.();
    }
  }, [typingComplete, body, onTextComplete]);

  const displayedText = body.slice(0, displayedChars);
  const activeSpeaker = speaker;
  const sceneChoices = scene.choices ?? [];

  // Evaluate guards for each choice
  const evaluatedChoices = sceneChoices.map((c) => ({
    ...c,
    available: !c.guard || c.guard(ctx),
  }));

  return (
    <section
      role="dialog"
      aria-labelledby="dlg-title"
      aria-live="polite"
      className="bg-card/95 text-card-foreground relative rounded-xl border border-white/10 shadow-2xl backdrop-blur-sm transition-all duration-300"
    >
      {/* Title bar */}
      <div className="border-b border-white/10 px-5 py-3">
        <h2 id="dlg-title" className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
      </div>

      {/* Body with optional speaker portrait */}
      <div className="flex gap-4 p-5">
        {/* Speaker portrait — left side */}
        {activeSpeaker && (
          <div className="mt-1 flex-shrink-0">
            <div
              className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 ${
                activeSpeaker.side === "right" ? "border-blue-500/50" : "border-amber-500/50"
              } bg-white/5`}
              aria-label={activeSpeaker.name}
            >
              {activeSpeaker.src ? (
                <img
                  src={activeSpeaker.src}
                  alt={activeSpeaker.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl">{activeSpeaker.emoji || "👤"}</span>
              )}
            </div>
            <p className="mt-1 text-center text-xs text-white/50">{activeSpeaker.name}</p>
          </div>
        )}

        {/* Text area */}
        <div className="min-h-[80px] flex-1">
          {body ? (
            <div
              className="cursor-pointer select-none rounded-lg bg-white/5 p-4 text-sm leading-relaxed"
              onClick={handleTextClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleTextClick();
              }}
              aria-label={
                typingComplete
                  ? "Dialogue text"
                  : "Click to skip typing animation"
              }
            >
              <p className="text-white/90">
                {displayedText}
                {!typingComplete && (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-white/70 align-middle">
                    &nbsp;
                  </span>
                )}
              </p>

              {/* Click to continue indicator */}
              {typingComplete && showContinueIndicator && (
                <div className="mt-3 flex justify-end">
                  <span className="animate-bounce text-xs text-white/40">
                    {lang === "fr" ? "Cliquer pour continuer ▾" : "Click to continue ▾"}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-[80px] items-center justify-center rounded-lg bg-white/5 text-sm text-white/30">
              ...
            </div>
          )}
        </div>

        {/* Speaker portrait — right side */}
        {activeSpeaker && activeSpeaker.side === "right" && (
          <div className="mt-1 flex-shrink-0">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-blue-500/50 bg-white/5">
              {activeSpeaker.src ? (
                <img src={activeSpeaker.src} alt={activeSpeaker.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl">{activeSpeaker.emoji || "👤"}</span>
              )}
            </div>
            <p className="mt-1 text-center text-xs text-white/50">{activeSpeaker.name}</p>
          </div>
        )}
      </div>

      {/* Choices */}
      {choicesVisible && evaluatedChoices.length > 0 && (
        <div className="border-t border-white/10 px-5 pb-5 pt-3">
          <div className="flex flex-col gap-2">
            {evaluatedChoices.map((c) => (
              <button
                key={c.id}
                disabled={!c.available}
                className={`min-h-[44px] rounded-lg px-4 py-3 text-left text-sm transition-all duration-200 ${
                  c.available
                    ? "bg-primary/20 hover:bg-primary/30 hover:scale-[1.01] active:scale-[0.99] border border-primary/30 hover:border-primary/50 text-white cursor-pointer"
                    : "cursor-not-allowed border border-white/5 bg-white/5 text-white/25"
                }`}
                onClick={() => c.available && onChoose(c.id)}
                aria-disabled={!c.available}
              >
                <span className="flex items-center gap-2">
                  {!c.available && <span className="text-xs">🔒</span>}
                  {c.text[lang] ?? c.text.en}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No choices — just a continue button */}
      {choicesVisible && evaluatedChoices.length === 0 && (
        <div className="border-t border-white/10 px-5 pb-5 pt-3">
          <button
            className="bg-primary/20 hover:bg-primary/30 w-full min-h-[44px] rounded-lg border border-primary/30 px-4 py-3 text-sm transition-all"
            onClick={() => onChoose("__continue__")}
          >
            {lang === "fr" ? "Continuer" : "Continue"}
          </button>
        </div>
      )}
    </section>
  );
}

export default DialogueBox;
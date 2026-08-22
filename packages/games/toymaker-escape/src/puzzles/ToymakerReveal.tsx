"use client";
import React from "react";

export type ToymakerRevealProps = {
  lang: "en" | "fr";
};

/**
 * E3 — Toymaker Reveal: the climactic story reveal scene.
 * Shows the toymaker's studio with dialogue and childhood-toy narrative.
 */
export function ToymakerReveal({ lang }: ToymakerRevealProps) {
  return (
    <div className="mb-4 rounded-md border p-3" style={{
      background: "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #3d2b5e 100%)",
    }}>
      <h3 className="mb-2 font-semibold text-pink-200">
        {lang === "fr" ? "Le Studio du fabricant" : "The Toymaker's Studio"}
      </h3>
      <div className="mb-3 rounded border border-pink-800 bg-pink-950/30 p-3">
        <p className="mb-1 text-xs font-bold uppercase text-pink-300">
          {lang === "fr" ? "Le fabricant de jouets" : "The Toymaker"}
        </p>
        <p className="text-sm italic text-pink-100">
          {lang === "fr"
            ? "\u00AB Je me demandais quand tu comprendrais. Tu as construit ce puzzle pour toi-m\u00EAme, tu sais. La question est : te souviens-tu pourquoi ? \u00BB"
            : "\"I was wondering when you'd figure it out. You built this puzzle for yourself, you know. The question is: do you remember why?\""}
        </p>
      </div>
      <p className="mb-2 text-sm text-gray-300">
        {lang === "fr"
          ? "Le fabricant vous regarde avec une chaleur patiente. Les jouets sur l'\u00E9tabli \u2014 un ours \u00E0 engrenage, une bo\u00EEte \u00E0 musique, une marionnette \u2014 ce sont les v\u00F4tres, de votre enfance."
          : "The toymaker looks at you with patient warmth. The toys on the bench \u2014 a gear bear, a music box, a marionette \u2014 they're yours, from your childhood."}
      </p>
    </div>
  );
}
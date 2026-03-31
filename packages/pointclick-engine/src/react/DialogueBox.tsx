"use client";
import React from "react";

import type { Lang, Scene } from "../engine";

export function DialogueBox({
  scene,
  lang,
  onChoose,
}: {
  scene: Scene;
  lang: Lang;
  onChoose: (choiceId: string) => void;
}) {
  const title = typeof scene.title === "string" ? scene.title : scene.title[lang];
  const body = typeof scene.body === "string" ? scene.body : (scene.body?.[lang] ?? "");
  return (
    <section
      role="dialog"
      aria-labelledby="dlg-title"
      className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm"
    >
      <h2 id="dlg-title" className="mb-2 text-xl font-semibold">
        {title}
      </h2>
      {body && <p className="mb-3 text-sm opacity-90">{body}</p>}
      <div className="mt-2 flex flex-col gap-2">
        {(scene.choices ?? []).map((c) => (
          <button
            key={c.id}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-11 rounded-md px-4 py-2 text-left text-sm"
            onClick={() => onChoose(c.id)}
          >
            {c.text[lang] ?? c.text.en}
          </button>
        ))}
      </div>
    </section>
  );
}

export default DialogueBox;

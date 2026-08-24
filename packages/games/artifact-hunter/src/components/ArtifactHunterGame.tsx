"use client";

import { GameContainer } from "@gamehub/game-platform";
import { DialogueBox, SceneBackground, useSceneAudio, useSoundEffects } from "@games/pointclick-engine";
import type { Lang, Scene } from "@games/pointclick-engine/engine";
import { createSequenceState, pressSeq, type SequenceState } from "@games/pointclick-engine/puzzles/sequence";
import { createCipherState, submitCipher, updateCipherInput, type CipherState } from "@games/pointclick-engine/puzzles/cipher";
import { createKeypadState, pressKey, submitKeypad, clearKeypad, type KeypadState } from "@games/pointclick-engine/puzzles/keypad";
import { useI18n } from "@/lib/i18n";
import React, { useEffect, useMemo, useState } from "react";

const SAVE_KEY = "artifact-hunter:save:v1";
const TILE_ORDER = ["SUN", "MOON", "STAR", "COMET"];
const CIPHER_ANSWER = "AMUN RA";
const CHAMBER_CODE = "3142";
const HIEROGLYPH_GOAL = ["ANKH", "EYE", "SCARAB"];

export const ArtifactHunterGame: React.FC = () => {
  const { locale } = useI18n();
  const lang: Lang = locale === "fr" ? "fr" : "en";
  const sfx = useSoundEffects();

  // Custom pattern state: pick the correct 3 glyphs in order
  const [glyphSel, setGlyphSel] = useState<string[]>([]);
  const patternSolved = glyphSel.length === 3 && glyphSel.every((g, i) => g === HIEROGLYPH_GOAL[i]);
  const [tiles, setTiles] = useState<SequenceState>(() => createSequenceState(TILE_ORDER, { lives: 5 }));
  const [cipher, setCipher] = useState<CipherState>(() => createCipherState(CIPHER_ANSWER));
  const [keypad, setKeypad] = useState<KeypadState>(() => createKeypadState());

  const tilesSolved = tiles.solved;
  const cipherSolved = cipher.solved;
  const codeSolved = keypad.solved;

  const [sceneId, setSceneId] = useState("ENTRANCE");

  const scenes = useMemo<Record<string, Scene>>(() => ({
    ENTRANCE: {
      id: "ENTRANCE", title: { en: "Temple of Amun-Ra — Entrance", fr: "Temple d'Amon-Rê — Entrée" },
      body: {
        en: "The ancient Temple of Amun-Ra looms before you. The Amulet of Eternity lies within, guarded by four chambers. Solve each to claim the prize.",
        fr: "Le Temple d'Amon-Rê se dresse devant vous. L'Amulette d'Éternité repose à l'intérieur, gardée par quatre chambres. Résolvez-les.",
      },
      choices: [
        { id: "hieroglyph", text: { en: "🔣 Hieroglyph Chamber " + (patternSolved ? "✓" : ""), fr: "🔣 Chambre des Hiéroglyphes " + (patternSolved ? "✓" : "") }, target: "HIEROGLYPH" },
        { id: "celestial", text: { en: "🌙 Celestial Chamber " + (tilesSolved ? "✓" : ""), fr: "🌙 Chambre Céleste " + (tilesSolved ? "✓" : "") }, target: "CELESTIAL", guard: () => patternSolved },
        { id: "scribe", text: { en: "📜 Scribe's Chamber " + (cipherSolved ? "✓" : ""), fr: "📜 Chambre du Scribe " + (cipherSolved ? "✓" : "") }, target: "SCRIBE", guard: () => tilesSolved },
        { id: "pharaoh", text: { en: "👑 Pharaoh's Chamber " + (codeSolved ? "✓" : ""), fr: "👑 Chambre du Pharaon " + (codeSolved ? "✓" : "") }, target: "PHARAOH", guard: () => cipherSolved },
      ],
    },
    HIEROGLYPH: {
      id: "HIEROGLYPH", title: { en: "Hieroglyph Chamber", fr: "Chambre des Hiéroglyphes" },
      body: { en: "A repeating pattern: ANKH, EYE, SCARAB, ANKH, EYE, ???. Select the 3 glyphs that complete the sequence.", fr: "Un motif: ÂNKH, ŒIL, SCARABÉE, ÂNKH, ŒIL, ???. Sélectionnez les 3 glyphes." },
      choices: [{ id: "back", text: { en: "← Back", fr: "← Retour" }, target: "ENTRANCE" }],
    },
    CELESTIAL: {
      id: "CELESTIAL", title: { en: "Celestial Chamber", fr: "Chambre Céleste" },
      body: { en: "Arrange the celestial bodies: SUN → MOON → STAR → COMET.", fr: "Ordonnez les corps célestes : SOLEIL → LUNE → ÉTOILE → COMÈTE." },
      choices: [{ id: "back", text: { en: "← Back", fr: "← Retour" }, target: "ENTRANCE" }],
    },
    SCRIBE: {
      id: "SCRIBE", title: { en: "Scribe's Chamber", fr: "Chambre du Scribe" },
      body: { en: "A scroll: 'ZFNZ IZ.' Shift -1 (each letter goes back one).", fr: "Un rouleau: 'ZFNZ IZ.' Décalage -1." },
      choices: [{ id: "back", text: { en: "← Back", fr: "← Retour" }, target: "ENTRANCE" }],
    },
    PHARAOH: {
      id: "PHARAOH", title: { en: "Pharaoh's Chamber", fr: "Chambre du Pharaon" },
      body: { en: "A golden sarcophagus. The sacred numbers: 3-1-4-2.", fr: "Un sarcophage doré. Les nombres sacrés : 3-1-4-2." },
      choices: [{ id: "back", text: { en: "← Back", fr: "← Retour" }, target: "ENTRANCE" }],
    },
    REWARD: {
      id: "REWARD", title: { en: "The Amulet of Eternity", fr: "L'Amulette d'Éternité" },
      body: { en: "The sarcophagus opens. The Amulet of Eternity glows with ancient power. The temple seals itself — time to leave!", fr: "Le sarcophage s'ouvre. L'Amulette d'Éternité brille. Le temple se scelle — partez!" },
      choices: [],
    },
  }), [lang, patternSolved, tilesSolved, cipherSolved, codeSolved]);

  const scene = scenes[sceneId] || scenes.ENTRANCE;
  useSceneAudio(sceneId, {}, true);
  useEffect(() => { if (typeof window !== "undefined") { try { localStorage.setItem(SAVE_KEY, sceneId); } catch {} } }, [sceneId]);

  const handleGlyph = (g: string) => { const next = [...glyphSel, g]; setGlyphSel(next); if (next.length === 3 && next.every((x, i) => x === HIEROGLYPH_GOAL[i])) sfx.playSolve(); else sfx.playClick(); };
  const handleTile = (s: string) => { const n = pressSeq(tiles, s); setTiles(n); if (n.solved) sfx.playSolve(); else sfx.playClick(); };
  const handleCipher = () => { const n = submitCipher(cipher); setCipher(n); if (n.solved) sfx.playSolve(); else sfx.playError(); };
  const handleKP = (d: string) => setKeypad((s) => pressKey(s, d, { code: CHAMBER_CODE, maxLen: 4 }));
  const handleKPS = () => { const n = submitKeypad(keypad, { code: CHAMBER_CODE, maxLen: 4 }); setKeypad(n); if (n.solved) sfx.playSolve(); else sfx.playError(); };

  return (
    <GameContainer title={(scene.title as Record<string, string>)[lang] || "Artifact Hunter"}>
      <SceneBackground type="apartment" animate>
        <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
          <DialogueBox scene={scene} lang={lang} onChoose={(id) => { sfx.playClick(); setSceneId(id); }} ctx={{ patternSolved, tilesSolved, cipherSolved, codeSolved }} />

          {sceneId === "HIEROGLYPH" && !patternSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="text-sm font-bold mb-3 text-center">{lang === "fr" ? "🔣 Glyphes — Cliquez: Ankh, Œil, Scarabée" : "🔣 Glyphs — Click: Ankh, Eye, Scarab"}</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {["ANKH", "EYE", "SCARAB", "FEATHER", "CROWN", "CROOK"].map(g => {
                  const sel = glyphSel.includes(g);
                  return <button key={g} onClick={() => !sel && glyphSel.length < 3 && handleGlyph(g)} disabled={sel || glyphSel.length >= 3}
                    className={`px-3 py-2 rounded border text-sm ${sel ? "bg-green-200 dark:bg-green-800 line-through" : "bg-white dark:bg-gray-700 hover:bg-amber-100"}`}>{g}</button>;
                })}
              </div>
              <p className="text-xs text-center mt-2 text-gray-500">Selected: {glyphSel.join(" → ")}</p>
              {patternSolved && <p className="text-green-500 text-xs text-center mt-2 font-bold">✅ {lang === "fr" ? "Correct!" : "Correct!"}</p>}
            </div>
          )}

          {sceneId === "CELESTIAL" && !tilesSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="text-sm font-bold mb-3 text-center">{lang === "fr" ? "🌙 Ordonnez le Ciel" : "🌙 Order the Sky"}</h3>
              <p className="text-xs text-center mb-3">{lang === "fr" ? "Soleil→Lune→Étoile→Comète" : "Sun→Moon→Star→Comet"}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {TILE_ORDER.map(t => { const used = tiles.input.includes(t); return <button key={t} onClick={() => !used && handleTile(t)} disabled={used} className={`px-3 py-2 rounded border text-sm ${used ? "bg-green-200 dark:bg-green-800 line-through" : "bg-white dark:bg-gray-700 hover:bg-amber-100"}`}>{t}</button>; })}
              </div>
            </div>
          )}

          {sceneId === "SCRIBE" && !cipherSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="text-sm font-bold mb-3 text-center">{lang === "fr" ? "📜 Décodez (-1)" : "📜 Decode (-1)"}</h3>
              <p className="text-xs text-center mb-2"><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">ZFNZ IZ</code></p>
              <div className="flex gap-2 max-w-[300px] mx-auto">
                <input type="text" value={cipher.userInput} onChange={(e) => setCipher((s) => updateCipherInput(s, e.target.value))} placeholder={lang === "fr" ? "Votre réponse..." : "Your answer..."} className="flex-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm" onKeyDown={(e) => e.key === "Enter" && handleCipher()} />
                <button onClick={handleCipher} className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded border text-sm">{lang === "fr" ? "Vérifier" : "Check"}</button>
              </div>
            </div>
          )}

          {sceneId === "PHARAOH" && !codeSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="text-sm font-bold mb-3 text-center">{lang === "fr" ? "👑 Code (3-1-4-2)" : "👑 Code (3-1-4-2)"}</h3>
              <div className="text-center mb-2 text-lg font-mono tracking-wider">{keypad.input || "____"}</div>
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                {["1","2","3","4","5","6","7","8","9"].map(d => <button key={d} onClick={() => handleKP(d)} className="px-4 py-2 bg-white dark:bg-gray-700 rounded border text-sm">{d}</button>)}
                <button onClick={() => setKeypad((s) => clearKeypad(s))} className="px-4 py-2 bg-red-100 dark:bg-red-900 rounded border text-sm">{lang === "fr" ? "Eff." : "Clr"}</button>
                <button onClick={() => handleKP("0")} className="px-4 py-2 bg-white dark:bg-gray-700 rounded border text-sm">0</button>
                <button onClick={handleKPS} className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded border text-sm">✔</button>
              </div>
            </div>
          )}

          {sceneId === "REWARD" && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-6 border text-center">
              <p className="text-4xl mb-3">💎</p>
              <h2 className="text-lg font-bold mb-2">{lang === "fr" ? "Amulette Récupérée!" : "Amulet Recovered!"}</h2>
              <p className="text-sm text-gray-500">{lang === "fr" ? "Le temple vous salue." : "The temple salutes you."}</p>
            </div>
          )}
        </div>
      </SceneBackground>
    </GameContainer>
  );
};

export default ArtifactHunterGame;
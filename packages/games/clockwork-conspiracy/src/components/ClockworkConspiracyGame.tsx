"use client";

import { GameContainer } from "@gamehub/game-platform";
import { DialogueBox, SceneBackground, useSceneAudio, useSoundEffects } from "@games/pointclick-engine";
import type { Lang, Scene } from "@games/pointclick-engine/engine";
import { createGearsState, setGearsTeeth, type GearsState, type Gear } from "@games/pointclick-engine/puzzles/gears";
import { createSequenceState, pressSeq, type SequenceState } from "@games/pointclick-engine/puzzles/sequence";
import { createCipherState, submitCipher, updateCipherInput, type CipherState } from "@games/pointclick-engine/puzzles/cipher";
import { createKeypadState, pressKey, submitKeypad, clearKeypad, type KeypadState } from "@games/pointclick-engine/puzzles/keypad";
import { useI18n } from "@/lib/i18n";
import React, { useEffect, useMemo, useState } from "react";

const SAVE_KEY = "clockwork-conspiracy:save:v1";
const INITIAL_GEARS: Gear[] = [{ id: "GearA", teeth: 1 }, { id: "GearB", teeth: 1 }, { id: "GearC", teeth: 1 }, { id: "GearD", teeth: 1 }];
const GEAR_CONNECTIONS = [{ a: "GearA", b: "GearB" }, { a: "GearA", b: "GearC" }, { a: "GearC", b: "GearD" }];
const GEAR_TOOTH_OPTIONS: Record<string, number[]> = { GearA: [12], GearB: [4], GearC: [3], GearD: [1] };
const GEAR_TARGET = 12;
const CLOCK_SEQUENCE = ["XII", "III", "VI", "IX"];
const CIPHER_ANSWER = "MIDNIGHT";
const MASTER_CODE = "1873";

export const ClockworkConspiracyGame: React.FC = () => {
  const { locale } = useI18n();
  const lang: Lang = locale === "fr" ? "fr" : "en";
  const sfx = useSoundEffects();

  const [gears, setGears] = useState<GearsState>(() =>
    createGearsState(INITIAL_GEARS, GEAR_CONNECTIONS, "GearA", "GearD", GEAR_TARGET)
  );
  const [clockSeq, setClockSeq] = useState<SequenceState>(() => createSequenceState(CLOCK_SEQUENCE, { lives: 5 }));
  const [cipher, setCipher] = useState<CipherState>(() => createCipherState(CIPHER_ANSWER));
  const [keypad, setKeypad] = useState<KeypadState>(() => createKeypadState());

  const gearsSolved = gears.solved;
  const clockSolved = clockSeq.solved;
  const cipherSolved = cipher.solved;
  const codeSolved = keypad.solved;

  const [sceneId, setSceneId] = useState("FOYER");

  const scenes = useMemo<Record<string, Scene>>(() => ({
    FOYER: {
      id: "FOYER", title: { en: "The Clockwork Tower — Foyer", fr: "La Tour Mécanique — Foyer" },
      body: {
        en: "Gears hum, pistons hiss. The Great Clock has been sabotaged — it will strike at midnight and trigger a catastrophe. Four systems need your expertise: Gear Room, Clock Face, Cipher Room, and Guild Vault.",
        fr: "Les engrenages ronronnent. La Grande Horloge a été sabotée. Quatre systèmes vous attendent : Engrenages, Cadran, Chiffre, et Coffre.",
      },
      choices: [
        { id: "gearroom", text: { en: "⚙️ Gear Room " + (gearsSolved ? "✓" : ""), fr: "⚙️ Salle des Engrenages " + (gearsSolved ? "✓" : "") }, target: "GEARROOM" },
        { id: "clockface", text: { en: "🕐 Clock Face " + (clockSolved ? "✓" : ""), fr: "🕐 Cadran de l'Horloge " + (clockSolved ? "✓" : "") }, target: "CLOCKFACE", guard: () => gearsSolved },
        { id: "cipherroom", text: { en: "📝 Cipher Room " + (cipherSolved ? "✓" : ""), fr: "📝 Salle du Chiffre " + (cipherSolved ? "✓" : "") }, target: "CIPHERROOM", guard: () => clockSolved },
        { id: "vault", text: { en: "🔒 Guild Vault " + (codeSolved ? "✓" : ""), fr: "🔒 Coffre de la Guilde " + (codeSolved ? "✓" : "") }, target: "VAULT", guard: () => cipherSolved },
      ],
    },
    GEARROOM: {
      id: "GEARROOM", title: { en: "The Gear Room", fr: "La Salle des Engrenages" },
      body: { en: "Input gear A must turn 12 times → output D turns 1 time. A drives B+C, C drives D. Hint: A=12, B=4, C=3, D=1 teeth.", fr: "L'engrenage A doit tourner 12 fois → D tourne 1 fois. A→B+C, C→D. Indice: A=12, B=4, C=3, D=1 dents." },
      choices: [{ id: "back", text: { en: "← Back", fr: "← Retour" }, target: "FOYER" }],
    },
    CLOCKFACE: {
      id: "CLOCKFACE", title: { en: "The Clock Face", fr: "Le Cadran" },
      body: { en: "Frozen hour markers: XII, III, VI, IX. Press in daily order: noon→afternoon→evening→night.", fr: "Marqueurs figés : XII, III, VI, IX. Midi→après-midi→soir→nuit." },
      choices: [{ id: "back", text: { en: "← Back", fr: "← Retour" }, target: "FOYER" }],
    },
    CIPHERROOM: {
      id: "CIPHERROOM", title: { en: "The Cipher Room", fr: "La Salle du Chiffre" },
      body: { en: "Encoded: 'ZCSVKTSF.' Vigenère cipher, keyword: 'GEAR.'", fr: "Chiffré: 'ZCSVKTSF.' Vigenère, clé: 'GEAR.'" },
      choices: [{ id: "back", text: { en: "← Back", fr: "← Retour" }, target: "FOYER" }],
    },
    VAULT: {
      id: "VAULT", title: { en: "The Guild Vault", fr: "Le Coffre" },
      body: { en: "Master vault. 4-digit keypad. Founding year: 1873.", fr: "Coffre principal. Pavé 4 chiffres. Fondation: 1873." },
      choices: [{ id: "back", text: { en: "← Back", fr: "← Retour" }, target: "FOYER" }],
    },
    SAVED: {
      id: "SAVED", title: { en: "City Saved!", fr: "Ville Sauvée!" },
      body: { en: "The vault opens. The master bypass key! You race to the Great Clock and insert it at midnight. The mechanism resets. The city's lights stay on. The Guild owes you everything, Engineer.", fr: "Le coffre s'ouvre. La clé maîtresse! Vous courez à l'Horloge et l'insérez à minuit. La ville est sauvée. La Guilde vous doit tout." },
      choices: [],
    },
  }), [lang, gearsSolved, clockSolved, cipherSolved, codeSolved]);

  const scene = scenes[sceneId] || scenes.FOYER;
  useSceneAudio(sceneId, {}, true);
  useEffect(() => { if (typeof window !== "undefined") { try { localStorage.setItem(SAVE_KEY, sceneId); } catch {} } }, [sceneId]);

  const handleGear = (id: string, teeth: number) => { const n = setGearsTeeth(gears, id, teeth); setGears(n); if (n.solved) sfx.playSolve(); else sfx.playClick(); };
  const handleClock = (s: string) => { const n = pressSeq(clockSeq, s); setClockSeq(n); if (n.solved) sfx.playSolve(); else sfx.playClick(); };
  const handleCipher = () => { const n = submitCipher(cipher); setCipher(n); if (n.solved) sfx.playSolve(); else sfx.playError(); };
  const handleKP = (d: string) => setKeypad((s) => pressKey(s, d, { code: MASTER_CODE, maxLen: 4 }));
  const handleKPS = () => { const n = submitKeypad(keypad, { code: MASTER_CODE, maxLen: 4 }); setKeypad(n); if (n.solved) sfx.playSolve(); else sfx.playError(); };

  return (
    <GameContainer title={(scene.title as Record<string, string>)[lang] || "Clockwork Conspiracy"}>
      <SceneBackground type="workshop" animate>
        <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
          <DialogueBox scene={scene} lang={lang} onChoose={(id) => { sfx.playClick(); setSceneId(id); }} ctx={{ gearsSolved, clockSolved, cipherSolved, codeSolved }} />

          {/* Gear Room */}
          {sceneId === "GEARROOM" && !gearsSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="text-sm font-bold mb-3 text-center">{lang === "fr" ? "⚙️ Réglez les Engrenages" : "⚙️ Set the Gears"}</h3>
              <p className="text-xs text-center mb-2">{lang === "fr" ? "A(12x) → D(1x). A→B+C, C→D" : "A(12x) → D(1x). A→B+C, C→D"}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {INITIAL_GEARS.map((g: Gear) => (
                  <div key={g.id} className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded px-3 py-2 border">
                    <span className="text-xs font-bold">{g.id}</span>
                    <div className="flex gap-1">
                      {(GEAR_TOOTH_OPTIONS[g.id] || []).map((teeth: number) => (
                        <button key={teeth} onClick={() => handleGear(g.id, teeth)}
                          className={`px-2 py-1 rounded border text-xs ${gears.gears.find((x) => x.id === g.id)?.teeth === teeth ? "bg-blue-200 dark:bg-blue-800 border-blue-400 font-bold" : "bg-gray-100 dark:bg-gray-600 hover:bg-blue-100"}`}>{teeth}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {gearsSolved && <p className="text-green-500 text-xs text-center mt-2 font-bold">✅ {lang === "fr" ? "Ratio parfait!" : "Perfect ratio!"}</p>}
            </div>
          )}

          {/* Clock Face */}
          {sceneId === "CLOCKFACE" && !clockSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="text-sm font-bold mb-3 text-center">{lang === "fr" ? "🕐 Les Heures" : "🕐 The Hours"}</h3>
              <p className="text-xs text-center mb-3">{lang === "fr" ? "Midi→Après-midi→Soir→Nuit" : "Noon→Afternoon→Evening→Night"}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {CLOCK_SEQUENCE.map(h => { const used = clockSeq.input.includes(h); return <button key={h} onClick={() => !used && handleClock(h)} disabled={used} className={`px-3 py-2 rounded border text-sm ${used ? "bg-green-200 dark:bg-green-800 line-through" : "bg-white dark:bg-gray-700 hover:bg-amber-100"}`}>{h}</button>; })}
              </div>
            </div>
          )}

          {/* Cipher */}
          {sceneId === "CIPHERROOM" && !cipherSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="text-sm font-bold mb-3 text-center">{lang === "fr" ? "📝 Vigenère (clé: GEAR)" : "📝 Vigenère (key: GEAR)"}</h3>
              <p className="text-xs text-center mb-2"><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">ZCSVKTSF</code></p>
              <div className="flex gap-2 max-w-[300px] mx-auto">
                <input type="text" value={cipher.userInput} onChange={(e) => setCipher((s) => updateCipherInput(s, e.target.value))} placeholder={lang === "fr" ? "Votre réponse..." : "Your answer..."} className="flex-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm" onKeyDown={(e) => e.key === "Enter" && handleCipher()} />
                <button onClick={handleCipher} className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded border text-sm">{lang === "fr" ? "Vérifier" : "Check"}</button>
              </div>
            </div>
          )}

          {/* Vault */}
          {sceneId === "VAULT" && !codeSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="text-sm font-bold mb-3 text-center">{lang === "fr" ? "🔒 Code (1873)" : "🔒 Code (1873)"}</h3>
              <div className="text-center mb-2 text-lg font-mono tracking-wider">{keypad.input || "____"}</div>
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                {["1","2","3","4","5","6","7","8","9"].map(d => <button key={d} onClick={() => handleKP(d)} className="px-4 py-2 bg-white dark:bg-gray-700 rounded border text-sm">{d}</button>)}
                <button onClick={() => setKeypad((s) => clearKeypad(s))} className="px-4 py-2 bg-red-100 dark:bg-red-900 rounded border text-sm">{lang === "fr" ? "Eff." : "Clr"}</button>
                <button onClick={() => handleKP("0")} className="px-4 py-2 bg-white dark:bg-gray-700 rounded border text-sm">0</button>
                <button onClick={handleKPS} className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded border text-sm">✔</button>
              </div>
            </div>
          )}

          {sceneId === "SAVED" && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-6 border text-center">
              <p className="text-4xl mb-3">⚙️</p>
              <h2 className="text-lg font-bold mb-2">{lang === "fr" ? "Catastrophe Évitée!" : "Catastrophe Averted!"}</h2>
              <p className="text-sm text-gray-500">{lang === "fr" ? "La ville vous remercie." : "The city thanks you."}</p>
            </div>
          )}
        </div>
      </SceneBackground>
    </GameContainer>
  );
};

export default ClockworkConspiracyGame;
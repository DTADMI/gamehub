"use client";

import { GameContainer } from "@gamehub/game-platform";
import { DialogueBox, SceneBackground, useSceneAudio, useSoundEffects } from "@games/pointclick-engine";
import type { Lang, Scene } from "@games/pointclick-engine/engine";
import { type CipherState,createCipherState, submitCipher, updateCipherInput } from "@games/pointclick-engine/puzzles/cipher";
import { clearKeypad, createKeypadState, type KeypadState,pressKey, submitKeypad } from "@games/pointclick-engine/puzzles/keypad";
import { createSequenceState, pressSeq, type SequenceState } from "@games/pointclick-engine/puzzles/sequence";
import React, { useEffect, useMemo, useState } from "react";

import { useI18n } from "@/lib/i18n";

const SAVE_KEY = "mystery-manor:save:v1";
const CIPHER_ANSWER = "THE LIBRARY";
const VAULT_CODE = "1899";

export const MysteryManorGame: React.FC = () => {
  const { locale } = useI18n();
  const lang: Lang = locale === "fr" ? "fr" : "en";
  const sfx = useSoundEffects();

  // Simple selection-based clue gathering (custom state since logic-grid doesn't exist)
  const [clues, setClues] = useState<Record<string, boolean>>({});
  const [cipher, setCipher] = useState<CipherState>(() => createCipherState(CIPHER_ANSWER));
  const [sequence, setSequence] = useState<SequenceState>(() =>
    createSequenceState(["L", "I", "B", "R", "A", "R", "Y"], { lives: 5 })
  );
  const [keypad, setKeypad] = useState<KeypadState>(() => createKeypadState());

  const cluesFound = Object.values(clues).filter(Boolean).length >= 3;
  const cipherSolved = cipher.solved;
  const seqSolved = sequence.solved;
  const vaultSolved = keypad.solved;
  const allSolved = cluesFound && cipherSolved && seqSolved && vaultSolved;

  const [sceneId, setSceneId] = useState("HALL");

  const scenes = useMemo<Record<string, Scene>>(() => ({
    HALL: {
      id: "HALL", title: { en: "Blackwood Manor — Grand Hall", fr: "Manoir Blackwood — Grand Hall" },
      body: {
        en: "Lord Blackwood has been found dead. Four suspects: the Butler, Cook, Gardener, and a mysterious Guest. Search the manor for clues to identify the killer.",
        fr: "Lord Blackwood a été retrouvé mort. Quatre suspects : le Majordome, la Cuisinière, le Jardinier et un mystérieux Invité. Fouillez le manoir.",
      },
      choices: [
        { id: "kitchen", text: { en: "🍳 Search the Kitchen " + (clues.kitchen ? "✓" : ""), fr: "🍳 Fouiller la Cuisine " + (clues.kitchen ? "✓" : "") }, target: "KITCHEN" },
        { id: "study", text: { en: "📚 Search the Study " + (cipherSolved ? "✓" : ""), fr: "📚 Fouiller le Bureau " + (cipherSolved ? "✓" : "") }, target: "STUDY" },
        { id: "library", text: { en: "📖 Search the Library " + (seqSolved ? "✓" : ""), fr: "📖 Fouiller la Bibliothèque " + (seqSolved ? "✓" : "") }, target: "LIBRARY" },
        { id: "accuse", text: { en: "⚖️ Present Your Case", fr: "⚖️ Présenter votre Dossier" }, target: "ACCUSE", guard: () => allSolved },
      ],
    },
    KITCHEN: {
      id: "KITCHEN", title: { en: "The Kitchen", fr: "La Cuisine" },
      body: {
        en: "The Cook is scrubbing pans. On the counter, three clues:\n1. The Cook was in the Kitchen (tap to mark)\n2. The Gardener had the Rope\n3. The Guest was in the Library\n\nRead all three to satisfy the Kitchen clue.",
        fr: "La Cuisinière nettoie des casseroles. Sur le comptoir, trois indices :\n1. La Cuisinière était dans la Cuisine\n2. Le Jardinier avait la Corde\n3. L'Invité était dans la Bibliothèque\n\nLisez-les tous.",
      },
      choices: [
        { id: "back", text: { en: "← Back to Hall", fr: "← Retour au Hall" }, target: "HALL" },
      ],
    },
    STUDY: {
      id: "STUDY", title: { en: "The Study", fr: "Le Bureau" },
      body: {
        en: "The Butler stands by the desk. A notepad: 'MAX YORXZOF.' Caesar cipher, shift 7 backward (A→T, B→U...). Decode the message.",
        fr: "Le Majordome près du bureau. Un bloc-notes : 'MAX YORXZOF.' Chiffrement de César, décalage 7 arrière (A→T, B→U...). Décodez.",
      },
      choices: [{ id: "back", text: { en: "← Back to Hall", fr: "← Retour au Hall" }, target: "HALL" }],
    },
    LIBRARY: {
      id: "LIBRARY", title: { en: "The Library", fr: "La Bibliothèque" },
      body: {
        en: "The Guest is reading anxiously. A locked drawer needs 7 letters: spell L-I-B-R-A-R-Y in order.",
        fr: "L'Invité lit nerveusement. Un tiroir à 7 lettres : épeler L-I-B-R-A-R-Y dans l'ordre.",
      },
      choices: [{ id: "back", text: { en: "← Back to Hall", fr: "← Retour au Hall" }, target: "HALL" }],
    },
    ACCUSE: {
      id: "ACCUSE", title: { en: "The Verdict", fr: "Le Verdict" },
      body: {
        en: "All clues gathered. A wall safe requires the founding year: 1899.",
        fr: "Tous les indices sont réunis. Un coffre mural exige l'année de fondation : 1899.",
      },
      choices: [{ id: "back", text: { en: "← Back to Hall", fr: "← Retour au Hall" }, target: "HALL" }],
    },
    SOLVED: {
      id: "SOLVED", title: { en: "Case Closed!", fr: "Affaire Classée!" },
      body: {
        en: "The safe opens. Inside: Lord Blackwood's final will, disinheriting the Guest — his estranged nephew. Furious, the Guest poisoned Lord Blackwood's tea. Case closed, Detective.",
        fr: "Le coffre s'ouvre. Le testament déshérite l'Invité — son neveu. Furieux, il a empoisonné le thé. Affaire classée, Détective.",
      },
      choices: [],
    },
  }), [lang, clues, cipherSolved, seqSolved, vaultSolved, allSolved]);

  const scene = scenes[sceneId] || scenes.HALL;
  useSceneAudio(sceneId, {}, true);
  useEffect(() => { if (typeof window !== "undefined") { try { localStorage.setItem(SAVE_KEY, sceneId); } catch {} } }, [sceneId]);

  const handleTag = (s: string) => { const n = pressSeq(sequence, s as "L"); setSequence(n); if (n.solved) {sfx.playSolve();} else {sfx.playClick();} };
  const handleKP = (d: string) => setKeypad((s) => pressKey(s, d, { code: VAULT_CODE, maxLen: 4 }));
  const handleKPS = () => { const n = submitKeypad(keypad, { code: VAULT_CODE, maxLen: 4 }); setKeypad(n); if (n.solved) {sfx.playSolve();} else {sfx.playError();} };
  const handleCipherSubmit = () => { const n = submitCipher(cipher); setCipher(n); if (n.solved) {sfx.playSolve();} else {sfx.playError();} };

  return (
    <GameContainer title={(scene.title as Record<string, string>)[lang] || "Mystery Manor"}>
      <SceneBackground type="office" animate>
        <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
          <DialogueBox scene={scene} lang={lang} onChoose={(id) => { sfx.playClick(); setSceneId(id); }} ctx={{ cluesFound, cipherSolved, seqSolved, vaultSolved, allSolved }} />

          {/* Kitchen — clue reading buttons */}
          {sceneId === "KITCHEN" && !cluesFound && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="text-sm font-bold mb-3 text-center">{lang === "fr" ? "🔍 Indices de la Cuisine" : "🔍 Kitchen Clues"}</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { key: "cook_kitchen", label: lang === "fr" ? "La Cuisinière → Cuisine" : "Cook → Kitchen" },
                  { key: "gardener_rope", label: lang === "fr" ? "Le Jardinier → Corde" : "Gardener → Rope" },
                  { key: "guest_library", label: lang === "fr" ? "L'Invité → Bibliothèque" : "Guest → Library" },
                ].map(c => (
                  <button key={c.key} onClick={() => setClues(prev => ({ ...prev, [c.key]: true }))}
                    className={`px-3 py-2 rounded border text-sm ${clues[c.key] ? "bg-green-200 dark:bg-green-800 line-through" : "bg-white dark:bg-gray-700 hover:bg-amber-100"}`}>{c.label}</button>
                ))}
              </div>
              {cluesFound && <p className="text-green-500 text-xs text-center mt-2 font-bold">✅ {lang === "fr" ? "Indices notés!" : "Clues noted!"}</p>}
            </div>
          )}

          {/* Study — cipher */}
          {sceneId === "STUDY" && !cipherSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="text-sm font-bold mb-3 text-center">{lang === "fr" ? "🔐 Décodez (César -7)" : "🔐 Decode (Caesar -7)"}</h3>
              <p className="text-xs text-center mb-2"><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">MAX YORXZOF</code> {lang === "fr" ? "→ H → T..." : "→ H → T..."}</p>
              <div className="flex gap-2 max-w-[300px] mx-auto">
                <input type="text" value={cipher.userInput} onChange={(e) => setCipher((s) => updateCipherInput(s, e.target.value))} placeholder={lang === "fr" ? "Votre réponse..." : "Your answer..."} className="flex-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm" onKeyDown={(e) => e.key === "Enter" && handleCipherSubmit()} />
                <button onClick={handleCipherSubmit} className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded border text-sm">{lang === "fr" ? "Vérifier" : "Check"}</button>
              </div>
              {cipherSolved && <p className="text-green-500 text-xs text-center mt-2 font-bold">✅ {lang === "fr" ? "Correct! → Bibliothèque" : "Correct! → Library"}</p>}
            </div>
          )}

          {/* Library — sequence */}
          {sceneId === "LIBRARY" && !seqSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="text-sm font-bold mb-3 text-center">{lang === "fr" ? "🔤 Épeler LIBRARY" : "🔤 Spell LIBRARY"}</h3>
              <p className="text-xs text-center mb-3">{lang === "fr" ? "Cliquez: L→I→B→R→A→R→Y" : "Click: L→I→B→R→A→R→Y"}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["L","I","B","R","A","R","Y"].map((ch) => {
                  const countInInput = sequence.input.filter((c) => c === ch).length;
                  const idxInFull = ["L","I","B","R","A","R","Y"].indexOf(ch);
                  const expectedCount = ["L","I","B","R","A","R","Y"].slice(0, sequence.input.length).filter((c) => c === ch).length;
                  const used = countInInput > expectedCount || (sequence.input.includes(ch) && sequence.input.indexOf(ch) <= idxInFull);
                  return <button key={ch} onClick={() => !used && handleTag(ch)} disabled={used}
                    className={`px-3 py-2 rounded border text-sm ${used ? "bg-green-200 dark:bg-green-800 line-through" : "bg-white dark:bg-gray-700 hover:bg-amber-100"}`}>{ch}</button>;
                })}
              </div>
              {seqSolved && <p className="text-green-500 text-xs text-center mt-2 font-bold">✅ {lang === "fr" ? "Déverrouillé!" : "Unlocked!"}</p>}
            </div>
          )}

          {/* Accuse — keypad */}
          {sceneId === "ACCUSE" && !vaultSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border">
              <h3 className="text-sm font-bold mb-3 text-center">{lang === "fr" ? "🔑 Code (1899)" : "🔑 Code (1899)"}</h3>
              <div className="text-center mb-2 text-lg font-mono tracking-wider">{keypad.input || "____"}</div>
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                {["1","2","3","4","5","6","7","8","9"].map(d => <button key={d} onClick={() => handleKP(d)} className="px-4 py-2 bg-white dark:bg-gray-700 rounded border text-sm">{d}</button>)}
                <button onClick={() => setKeypad((s) => clearKeypad(s))} className="px-4 py-2 bg-red-100 dark:bg-red-900 rounded border text-sm">{lang === "fr" ? "Eff." : "Clr"}</button>
                <button onClick={() => handleKP("0")} className="px-4 py-2 bg-white dark:bg-gray-700 rounded border text-sm">0</button>
                <button onClick={handleKPS} className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded border text-sm">✔</button>
              </div>
              {vaultSolved && <p className="text-green-500 text-xs text-center mt-2 font-bold">✅ {lang === "fr" ? "Ouvert!" : "Open!"}</p>}
            </div>
          )}

          {sceneId === "SOLVED" && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-6 border text-center">
              <p className="text-4xl mb-3">🔍</p>
              <h2 className="text-lg font-bold mb-2">{lang === "fr" ? "Meurtre Résolu!" : "Murder Solved!"}</h2>
              <p className="text-sm text-gray-500">{lang === "fr" ? "Justice rendue, Détective." : "Justice served, Detective."}</p>
            </div>
          )}
        </div>
      </SceneBackground>
    </GameContainer>
  );
};

export default MysteryManorGame;
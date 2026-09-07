"use client";

import { GameContainer } from "@gamehub/game-platform";
import { DialogueBox } from "@games/pointclick-engine";
import { SceneBackground, useSceneAudio, useSoundEffects } from "@games/pointclick-engine";
import {
  type Lang,
  type Scene,
} from "@games/pointclick-engine/engine";
import {
  type CipherState,
  createCipherState,
  submitCipher,
  updateCipherInput,
} from "@games/pointclick-engine/puzzles/cipher";
import {
  clearKeypad,
  createKeypadState,
  type KeypadState,
  pressKey,
  submitKeypad,
} from "@games/pointclick-engine/puzzles/keypad";
import {
  createSequenceState,
  pressSeq,
  type SequenceState,
} from "@games/pointclick-engine/puzzles/sequence";
import {
  createWiresState,
  evaluateSolved as evalWires,
  setWiresConnection,
  type TerminalId,
  type WireColor,
  type WiresState,
} from "@games/pointclick-engine/puzzles/wires";
import React, { useEffect, useMemo, useState } from "react";

import { useI18n } from "@/lib/i18n";

const SAVE_KEY = "escape-room:save:v1";
const SEQUENCE_ORDER = ["LOGIC", "HISTORY", "ART", "MATHEMATICS", "POETRY"];
const CIPHER_ANSWER = "THIS ALL BEGINS";
const SAFE_CODE = "352";

const WIRES_LEFT: TerminalId[] = ["red", "green", "white"];
const WIRES_RIGHT: TerminalId[] = ["blue", "yellow", "black"];
const WIRES_GOAL: Record<string, { from: TerminalId; to: TerminalId; color: WireColor }[]> = {
  red: [{ from: "red", to: "blue", color: "red" as WireColor }],
  green: [{ from: "green", to: "yellow", color: "green" as WireColor }],
  white: [{ from: "white", to: "black", color: "white" as WireColor }],
};

export const EscapeRoomGame: React.FC = () => {
  const { locale } = useI18n();
  const lang: Lang = locale === "fr" ? "fr" : "en";
  const sfx = useSoundEffects();

  // Puzzle states
  const [tags, setTags] = useState<SequenceState>(() =>
    createSequenceState(SEQUENCE_ORDER, { lives: 5 }),
  );
  const [cipher, setCipher] = useState<CipherState>(() => createCipherState(CIPHER_ANSWER));
  const [wires, setWires] = useState<WiresState>(() =>
    createWiresState(WIRES_LEFT, WIRES_RIGHT, WIRES_GOAL),
  );
  const [keypad, setKeypad] = useState<KeypadState>(() => createKeypadState());

  // Solved flags
  const bookSolved = tags.solved;
  const cipherSolved = cipher.solved;
  const wiresSolved = wires.solved;
  const safeSolved = keypad.solved;

  const [sceneId, setSceneId] = useState("INTRO");

  const scenes = useMemo<Record<string, Scene>>(
    () => ({
      INTRO: {
        id: "INTRO",
        title: { en: "Escape Room", fr: "Escape Room" },
        body: {
          en: "The heavy oak door clicks shut behind you. You're in Professor Aldric's private study. Dusty bookshelves, a massive wooden desk, a globe, and an old crooked painting. Somewhere in this room is the key out...",
          fr: "La lourde porte en chêne se referme derrière vous. Vous êtes dans le bureau privé du professeur Aldric. Des bibliothèques poussiéreuses, un imposant bureau, un globe et un vieux tableau de travers. Quelque part dans cette pièce se trouve la clé pour sortir...",
        },
        choices: [
          { id: "books", text: { en: "\ud83d\udcda Examine the Bookshelf", fr: "\ud83d\udcda Examiner la Biblioth\u00e8que" }, target: "BOOKS" },
          { id: "desk", text: { en: "\ud83d\udd22 Search the Desk", fr: "\ud83d\udd22 Fouiller le Bureau" }, target: "DESK", guard: () => bookSolved },
          { id: "globe", text: { en: "\ud83c\udf0d Look at the Globe", fr: "\ud83c\udf0d Regarder le Globe" }, target: "GLOBE", guard: () => bookSolved },
          { id: "painting", text: { en: "\ud83d\uddbc\ufe0f Inspect the Painting", fr: "\ud83d\uddbc\ufe0f Inspecter le Tableau" }, target: "PAINTING", guard: () => cipherSolved },
          { id: "safe", text: { en: "\ud83d\udd13 Open the Safe", fr: "\ud83d\udd13 Ouvrir le Coffre" }, target: "SAFE", guard: () => wiresSolved },
          { id: "escape", text: { en: "\ud83d\udddd\ufe0f Use the Key", fr: "\ud83d\udddd\ufe0f Utiliser la Cl\u00e9" }, target: "ESCAPE", guard: () => safeSolved },
        ],
      },
      BOOKS: {
        id: "BOOKS",
        title: { en: "The Bookshelf", fr: "La Biblioth\u00e8que" },
        body: {
          en: "Five books are out of place: LOGIC, HISTORY, ART, MATHEMATICS, POETRY. A brass plaque reads: 'First Logic, then History, followed by Art, Math, and Poetry.'",
          fr: "Cinq livres sont d\u00e9plac\u00e9s : LOGIQUE, HISTOIRE, ART, MATH\u00c9MATIQUES, PO\u00c9SIE. Une plaque dit : \u00ab D'abord la Logique, puis l'Histoire, puis l'Art, les Maths, et la Po\u00e9sie. \u00bb",
        },
        choices: [
          { id: "back", text: { en: "\u2190 Back", fr: "\u2190 Retour" }, target: "INTRO" },
        ],
      },
      DESK: {
        id: "DESK",
        title: { en: "The Desk", fr: "Le Bureau" },
        body: {
          en: "The bookshelf revealed a clue. On the desk: 'The globe holds the cipher. ATBASH mirror: A=Z, B=Y.' A small key points to the globe.",
          fr: "La biblioth\u00e8que a r\u00e9v\u00e9l\u00e9 un indice. Sur le bureau : \u00ab Le globe d\u00e9tient le chiffre. Miroir ATBASH : A=Z, B=Y. \u00bb Une petite fl\u00e8che pointe vers le globe.",
        },
        choices: [
          { id: "back", text: { en: "\u2190 Back", fr: "\u2190 Retour" }, target: "INTRO" },
        ],
      },
      GLOBE: {
        id: "GLOBE",
        title: { en: "The Globe", fr: "Le Globe" },
        body: {
          en: "Etched into the globe's stand: GSRH ZOO YVRMT. Use ATBASH to decode it.",
          fr: "Grav\u00e9 sur le support du globe : GSRH ZOO YVRMT. Utilisez ATBASH pour le d\u00e9coder.",
        },
        choices: [
          { id: "back", text: { en: "\u2190 Back", fr: "\u2190 Retour" }, target: "INTRO" },
        ],
      },
      PAINTING: {
        id: "PAINTING",
        title: { en: "Behind the Painting", fr: "Derri\u00e8re le Tableau" },
        body: {
          en: "Swing the crooked painting aside. A panel reveals tangled wires with a diagram: RED\u2192BLUE, GREEN\u2192YELLOW, WHITE\u2192BLACK.",
          fr: "\u00c9cartez le tableau de travers. Un panneau r\u00e9v\u00e8le des fils emm\u00eal\u00e9s avec un sch\u00e9ma : ROUGE\u2192BLEU, VERT\u2192JAUNE, BLANC\u2192NOIR.",
        },
        choices: [
          { id: "back", text: { en: "\u2190 Back", fr: "\u2190 Retour" }, target: "INTRO" },
        ],
      },
      SAFE: {
        id: "SAFE",
        title: { en: "The Safe", fr: "Le Coffre-fort" },
        body: {
          en: "The circuit restored, a wall panel slides open. An ornate safe with a 3-digit keypad. The gears on top show the code: 3-5-2.",
          fr: "Le circuit r\u00e9tabli, un panneau mural coulisse. Un coffre-fort orn\u00e9 avec un pav\u00e9 num\u00e9rique \u00e0 3 chiffres. Les engrenages au-dessus indiquent le code : 3-5-2.",
        },
        choices: [
          { id: "back", text: { en: "\u2190 Back", fr: "\u2190 Retour" }, target: "INTRO" },
        ],
      },
      ESCAPE: {
        id: "ESCAPE",
        title: { en: "Freedom!", fr: "Libert\u00e9!" },
        body: {
          en: "The safe clicks open. Inside: an old iron key and a worn leather journal. The key fits the study door perfectly. On the journal's first page: 'To whoever solves my puzzles \u2014 you have the mind of a scholar. The key was never the prize. The journey was.' \u2014 Professor Aldric, 1892.",
          fr: "Le coffre s'ouvre. \u00c0 l'int\u00e9rieur : une vieille cl\u00e9 en fer et un journal en cuir us\u00e9. La cl\u00e9 s'adapte parfaitement \u00e0 la porte. Sur la premi\u00e8re page du journal : \u00ab \u00c0 celui qui r\u00e9sout mes \u00e9nigmes \u2014 vous avez l'esprit d'un \u00e9rudit. La cl\u00e9 n'a jamais \u00e9t\u00e9 le prix. Le voyage l'\u00e9tait. \u00bb \u2014 Professeur Aldric, 1892.",
        },
        choices: [],
      },
    }),
    [lang, bookSolved, cipherSolved, wiresSolved, safeSolved],
  );

  const scene = scenes[sceneId] || scenes.INTRO;

  useSceneAudio(sceneId, {}, true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try { localStorage.setItem(SAVE_KEY, sceneId); } catch {}
    }
  }, [sceneId]);

  // Handlers
  const handleTag = (sym: string) => {
    const next = pressSeq(tags, sym);
    setTags(next);
    if (next.solved) {sfx.playSolve();}
    else {sfx.playClick();}
  };

  const handleCipherSubmit = () => {
    const next = submitCipher(cipher);
    setCipher(next);
    if (next.solved) {sfx.playSolve();}
    else {sfx.playError();}
  };

  const handleWire = (from: TerminalId, color: WireColor, to: TerminalId) => {
    const next = setWiresConnection(wires, from, to, color);
    const final = evalWires(next);
    setWires(final);
    if (final.solved) {sfx.playSolve();}
    else {sfx.playClick();}
  };

  const handleKeypadPress = (digit: string) => {
    setKeypad((s) => pressKey(s, digit, { code: SAFE_CODE, maxLen: 3 }));
  };

  const handleKeypadSubmit = () => {
    const next = submitKeypad(keypad, { code: SAFE_CODE, maxLen: 3 });
    setKeypad(next);
    if (next.solved) {sfx.playSolve();}
    else {sfx.playError();}
  };

  return (
    <GameContainer title={(scene.title as Record<string, string>)[lang] || "Escape Room"}>
      <SceneBackground type="office" animate>
        <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
          <DialogueBox
            scene={scene}
            lang={lang}
            onChoose={(choiceId) => {
              sfx.playClick();
              setSceneId(choiceId);
            }}
            ctx={{ bookSolved, cipherSolved, wiresSolved, safeSolved }}
          />

          {/* Books Puzzle */}
          {sceneId === "BOOKS" && !bookSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-gray-600">
              <h3 className="text-sm font-bold mb-3 text-center">
                {lang === "fr" ? "\ud83d\udcda Rangez les Livres" : "\ud83d\udcda Arrange the Books"}
              </h3>
              <p className="text-xs text-center text-gray-500 mb-3">
                {lang === "fr" ? "Cliquez dans l'ordre : Logique \u2192 Histoire \u2192 Art \u2192 Math\u00e9matiques \u2192 Po\u00e9sie" : "Click in order: Logic \u2192 History \u2192 Art \u2192 Mathematics \u2192 Poetry"}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SEQUENCE_ORDER.map((item) => {
                  const used = tags.input.includes(item);
                  return (
                    <button key={item} onClick={() => !used && handleTag(item)}
                      disabled={used}
                      className={`px-3 py-2 rounded border text-sm ${
                        used ? "bg-green-200 dark:bg-green-800 border-green-400 line-through" : "bg-white dark:bg-gray-700 hover:bg-amber-100 dark:hover:bg-gray-600 border-gray-300"
                      }`}>
                      {item}
                    </button>
                  );
                })}
              </div>
              {tags.solved && <p className="text-green-500 text-xs text-center mt-2 font-bold">\u2705 {lang === "fr" ? "Correct! \u2192 Bureau" : "Correct! \u2192 Desk"}</p>}
            </div>
          )}

          {/* Cipher Puzzle */}
          {sceneId === "GLOBE" && !cipherSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-gray-600">
              <h3 className="text-sm font-bold mb-3 text-center">
                {lang === "fr" ? "\ud83d\udd10 D\u00e9codez le Message" : "\ud83d\udd10 Decode the Message"}
              </h3>
              <p className="text-xs text-center text-gray-500 mb-2">
                ATBASH: A=Z, B=Y... <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">GSRH ZOO YVRMT</code>
              </p>
              <div className="flex gap-2 max-w-[300px] mx-auto">
                <input type="text" value={cipher.userInput}
                  onChange={(e) => setCipher((s) => updateCipherInput(s, e.target.value))}
                  placeholder={lang === "fr" ? "Votre r\u00e9ponse..." : "Your answer..."}
                  className="flex-1 px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleCipherSubmit()} />
                <button onClick={handleCipherSubmit}
                  className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded border text-sm hover:bg-green-200 dark:hover:bg-green-800">
                  {lang === "fr" ? "V\u00e9rifier" : "Check"}
                </button>
              </div>
              {cipherSolved && <p className="text-green-500 text-xs text-center mt-2 font-bold">\u2705 {lang === "fr" ? "Correct! \u2192 Tableau" : "Correct! \u2192 Painting"}</p>}
            </div>
          )}

          {/* Wires Puzzle */}
          {sceneId === "PAINTING" && !wiresSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-gray-600">
              <h3 className="text-sm font-bold mb-3 text-center">
                {lang === "fr" ? "\ud83d\udd0c Reconnectez les Fils" : "\ud83d\udd0c Reconnect the Wires"}
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {WIRES_LEFT.map((from) => (
                  <div key={from} className="flex flex-col items-center gap-1">
                    <span className={`w-6 h-6 rounded-full ${
                      from === "red" ? "bg-red-500" : from === "green" ? "bg-green-500" : "bg-gray-300 dark:bg-gray-500"
                    }`} />
                    <select value={wires.connections.find((c) => c.from === from)?.to ?? ""}
                      onChange={(e) => handleWire(from, from as WireColor, e.target.value as TerminalId)}
                      className="px-2 py-1 border rounded text-xs bg-white dark:bg-gray-700">
                      <option value="">---</option>
                      {WIRES_RIGHT.map((to) => <option key={to} value={to}>{to}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {wiresSolved && <p className="text-green-500 text-xs text-center mt-2 font-bold">\u2705 {lang === "fr" ? "Circuit r\u00e9tabli! \u2192 Coffre" : "Circuit restored! \u2192 Safe"}</p>}
            </div>
          )}

          {/* Safe Keypad Puzzle */}
          {sceneId === "SAFE" && !safeSolved && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-gray-600">
              <h3 className="text-sm font-bold mb-3 text-center">
                {lang === "fr" ? "\ud83d\udd13 Code du Coffre (3-5-2)" : "\ud83d\udd13 Safe Code (3-5-2)"}
              </h3>
              <div className="text-center mb-2 text-lg font-mono tracking-wider">{keypad.input || "___"}</div>
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                {["1","2","3","4","5","6","7","8","9"].map((d) => (
                  <button key={d} onClick={() => handleKeypadPress(d)}
                    className="px-4 py-2 bg-white dark:bg-gray-700 rounded border hover:bg-amber-100 dark:hover:bg-gray-600 text-sm">{d}</button>
                ))}
                <button onClick={() => setKeypad((s) => clearKeypad(s))}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900 rounded border text-sm">
                  {lang === "fr" ? "Eff." : "Clr"}
                </button>
                <button onClick={() => handleKeypadPress("0")}
                  className="px-4 py-2 bg-white dark:bg-gray-700 rounded border text-sm">0</button>
                <button onClick={handleKeypadSubmit}
                  className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded border text-sm">\u2714</button>
              </div>
              {safeSolved && <p className="text-green-500 text-xs text-center mt-2 font-bold">\u2705 {lang === "fr" ? "Ouvert! \u2192 Cl\u00e9 trouv\u00e9e!" : "Open! \u2192 Key found!"}</p>}
            </div>
          )}

          {sceneId === "ESCAPE" && (
            <div className="bg-amber-50 dark:bg-gray-800 rounded-lg p-6 border border-amber-200 dark:border-gray-600 text-center">
              <p className="text-4xl mb-3">\ud83c\udf89</p>
              <h2 className="text-lg font-bold mb-2">{lang === "fr" ? "Vous vous \u00eates \u00e9chapp\u00e9!" : "You Escaped!"}</h2>
              <p className="text-sm text-gray-500">{lang === "fr" ? "Le professeur Aldric serait fier." : "Professor Aldric would be proud."}</p>
            </div>
          )}
        </div>
      </SceneBackground>
    </GameContainer>
  );
};

export default EscapeRoomGame;
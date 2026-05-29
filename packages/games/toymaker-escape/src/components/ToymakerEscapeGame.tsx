"use client";

import { GameContainer } from "@gamehub/game-platform";
import { t } from "@gamehub/game-platform/lib/i18n";
import { DialogueBox, InventoryBar, versionedLoad, versionedSave } from "@games/pointclick-engine";
import {
  detectLang,
  effects,
  ensureCtx,
  type Lang,
  nextScene,
  type Scene,
} from "@games/pointclick-engine/engine";
import {
  createGearsState,
  evaluateGears,
  type GearsState,
  setGearsTeeth as setGearTeeth,
} from "@games/pointclick-engine/puzzles/gears";
import {
  clearKeypad,
  createKeypadState,
  pressKey,
  submitKeypad,
} from "@games/pointclick-engine/puzzles/keypad";
import {
  createPipesState,
  evaluatePipes,
  type PipesState,
  setTileRotation,
  toggleValve,
  type Tile,
} from "@games/pointclick-engine/puzzles/pipes";
import {
  createSequenceState,
  pressSeq as pressSequenceKey,
  type SequenceState,
} from "@games/pointclick-engine/puzzles/sequence";
import {
  createCipherState,
  submitCipher,
  updateCipherInput,
  type CipherState,
} from "@games/pointclick-engine/puzzles/cipher";
import {
  createAnagramState,
  submitAnagram,
  updateAnagramInput,
  type AnagramState,
} from "@games/pointclick-engine/puzzles/anagram";
import {
  createWiresState,
  hasWiresCrossing,
  setWiresConnection,
  type WiresState,
} from "@games/pointclick-engine/puzzles/wires";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { E1CabinetCanvas } from "./E1CabinetCanvas";

const SAVE_KEY = "tme:save:v1";

type TmeSaveV1 = {
  sceneId: string;
  flags: {
    keypad?: { solved?: boolean };
    gears?: { solved?: boolean };
    wires?: { solved?: boolean };
    pipes?: { solved?: boolean };
    latch?: { revealed?: boolean };
    seen?: {
      posterOrder?: boolean;
      ratioPlate?: boolean;
      scuff?: boolean;
    };
  };
  inventory: string[];
};

const FILING_TARGETS: Record<string, string> = {
  doll: "a",
  car: "b",
  puzzle: "c",
};

export const ToymakerEscapeGame: React.FC = () => {
  const lang = useMemo<Lang>(() => detectLang(), []);
  const scenes = useMemo<Record<string, Scene>>(
    () => ({
      INTRO: {
        id: "INTRO",
        title: {
          en: "Toymaker Escape — Intro",
          fr: "Toymaker Escape — Intro",
        },
        body: {
          en: "A late evening at the atelier. Something is amiss...",
          fr: "Un soir tard dans l'atelier. Quelque chose cloche...",
        },
        choices: [{ id: "begin", text: { en: "Begin", fr: "Commencer" }, target: "E1_GEAR" }],
      },
      E1_GEAR: {
        id: "E1_GEAR",
        title: { en: "Episode 1 — Gears", fr: "Épisode 1 — Engrenages" },
        body: {
          en: "Align the gears to open the panel (MVP placeholder puzzle).",
          fr: "Alignez les engrenages pour ouvrir le panneau (puzzle MVP).",
        },
        choices: [
          {
            id: "solve",
            text: { en: "Turn gears", fr: "Tourner les engrenages" },
            target: "E1_WRAP",
            effect: (ctx) => ({ ...ctx, gearSolved: true }),
          },
        ],
      },
      E1_WRAP: {
        id: "E1_WRAP",
        title: { en: "Wrap — Episode 1", fr: "Conclusion — Épisode 1" },
        body: {
          en: "You found the hidden compartment. Medal earned: Gear Whisperer.",
          fr: "Vous avez trouvé le compartiment secret. Médaille: Chuchoteur d'engrenages.",
        },
        choices: [
          {
            id: "continueE2",
            text: { en: "Continue to Episode 2 — The Office", fr: "Continuer vers l'Épisode 2 — Le Bureau" },
            target: "E2_INTRO",
          },
          {
            id: "restart",
            text: { en: "Restart", fr: "Recommencer" },
            target: "INTRO",
            effect: () => ({}),
          },
        ],
      },
      E2_INTRO: {
        id: "E2_INTRO",
        title: { en: "Episode 2 — Office & Secret Stair", fr: "Épisode 2 — Bureau & Escalier secret" },
        body: {
          en: "You step into the toymaker's office. Filing cabinets line the walls. A coded letter sits on the desk.",
          fr: "Vous entrez dans le bureau du fabricant. Des classeurs tapissent les murs. Une lettre codée repose sur le bureau.",
        },
        choices: [
          {
            id: "examine",
            text: { en: "Examine the coded letter", fr: "Examiner la lettre codée" },
            target: "E2_CIPHER",
          },
        ],
      },
      E2_CIPHER: {
        id: "E2_CIPHER",
        title: { en: "Episode 2 — Correspondence Cipher", fr: "Épisode 2 — Chiffre de correspondance" },
        body: {
          en: "A coded message was left in the workshop files. Decode it to find the filing cabinet key.",
          fr: "Un message codé a été laissé dans les dossiers de l'atelier. Décodez-le pour trouver la clé du classeur.",
        },
        choices: [
          {
            id: "solve",
            text: { en: "Decode the cipher", fr: "Décoder le chiffre" },
            target: "E2_FILING",
            effect: (ctx) => ({ ...ctx, cipherSolved: true }),
          },
        ],
      },
      E2_FILING: {
        id: "E2_FILING",
        title: { en: "Episode 2 — Filing Logic", fr: "Épisode 2 — Logique de classement" },
        body: {
          en: "The filing cabinets need to be organized. Sort the toys into the correct cabinets.",
          fr: "Les classeurs doivent être organisés. Triez les jouets dans les bons classeurs.",
        },
        choices: [
          {
            id: "solve",
            text: { en: "Open the safe", fr: "Ouvrir le coffre" },
            target: "E2_SHADOW",
            effect: (ctx) => ({ ...ctx, filingSolved: true }),
          },
        ],
      },
      E2_SHADOW: {
        id: "E2_SHADOW",
        title: { en: "Episode 2 — Shadow Safe", fr: "Épisode 2 — Coffre d'ombre" },
        body: {
          en: "A strange safe sits in the corner. Shadows cast from objects must align to unlock it.",
          fr: "Un coffre étrange se trouve dans le coin. Les ombres projetées par les objets doivent s'aligner pour l'ouvrir.",
        },
        choices: [
          {
            id: "solve",
            text: { en: "Open the files", fr: "Ouvrir les dossiers" },
            target: "E2_WRAP",
            effect: (ctx) => ({ ...ctx, shadowSolved: true }),
          },
        ],
      },
      E2_WRAP: {
        id: "E2_WRAP",
        title: { en: "Wrap — Episode 2 Complete", fr: "Conclusion — Épisode 2 terminé" },
        body: {
          en: "The office secrets are revealed. You found the commissioner's notes.",
          fr: "Les secrets du bureau sont révélés. Vous avez trouvé les notes du commissaire.",
        },
        choices: [
          {
            id: "continueE3",
            text: { en: "Continue to Episode 3 — Apartment Mystery", fr: "Continuer vers l'Épisode 3 — Le Mystère de l'Appartement" },
            target: "E3_INTRO",
          },
          {
            id: "restart",
            text: { en: "Restart adventure", fr: "Recommencer l'aventure" },
            target: "INTRO",
            effect: () => ({}),
          },
        ],
      },
      E3_INTRO: {
        id: "E3_INTRO",
        title: { en: "Episode 3 — Apartment Mystery", fr: "Épisode 3 — Le Mystère de l'Appartement" },
        body: {
          en: "You arrive at your own apartment. Something feels off. Familiar objects are rearranged. The commissioner left clues here... but why YOUR apartment?",
          fr: "Vous arrivez à votre propre appartement. Quelque chose semble étrange. Les objets familiers ont été réarrangés. Le commissaire a laissé des indices ici... mais pourquoi VOTRE appartement?",
        },
        choices: [
          {
            id: "locks",
            text: { en: "Check the environmental locks", fr: "Vérifier les verrous environnementaux" },
            target: "E3_LOCKS",
          },
        ],
      },
      E3_LOCKS: {
        id: "E3_LOCKS",
        title: { en: "Episode 3 — Environmental Locks", fr: "Épisode 3 — Verrous environnementaux" },
        body: {
          en: "The apartment's objects must be triggered in the right sequence. Plants need watering, blinds need adjusting, soil needs tending.",
          fr: "Les objets de l'appartement doivent être actionnés dans le bon ordre. Les plantes ont besoin d'eau, les stores doivent être ajustés, le terreau doit être entretenu.",
        },
        choices: [
          {
            id: "solve",
            text: { en: "Solve the sequence", fr: "Résoudre la séquence" },
            target: "E3_PHOTOS",
            effect: (ctx) => ({ ...ctx, locksSolved: true }),
          },
        ],
      },
      E3_PHOTOS: {
        id: "E3_PHOTOS",
        title: { en: "Episode 3 — Photo Memory Wall", fr: "Épisode 3 — Mur de photos souvenir" },
        body: {
          en: "A wall of photos. Find the two that are connected — the commissioner and the toymaker share a hidden link.",
          fr: "Un mur de photos. Trouvez les deux qui sont liées — le commissaire et le fabricant de jouets partagent un lien caché.",
        },
        choices: [
          {
            id: "solve",
            text: { en: "Identify the connection", fr: "Identifier la connexion" },
            target: "E3_ANAGRAM",
            effect: (ctx) => ({ ...ctx, photosSolved: true }),
          },
        ],
      },
      E3_ANAGRAM: {
        id: "E3_ANAGRAM",
        title: { en: "Episode 3 — Fridge Anagram", fr: "Épisode 3 — Anagramme du frigo" },
        body: {
          en: "The fridge magnets spell a scrambled word. Rearrange them to unlock the cool storage.",
          fr: "Les aimants du frigo forment un mot mélangé. Réorganisez-les pour déverrouiller l'espace réfrigéré.",
        },
        choices: [
          {
            id: "solve",
            text: { en: "Solve anagram", fr: "Résoudre l'anagramme" },
            target: "E3_WRAP",
            effect: (ctx) => ({ ...ctx, anagramSolved: true }),
          },
        ],
      },
      E3_WRAP: {
        id: "E3_WRAP",
        title: { en: "Wrap — Episode 3 Complete", fr: "Conclusion — Épisode 3 terminé" },
        body: {
          en: "The apartment mystery is solved. The commissioner WAS the toymaker — you created this puzzle for yourself. Medal earned: Toymaker's Apprentice.",
          fr: "Le mystère de l'appartement est résolu. Le commissaire ÉTAIT le fabricant de jouets — vous avez créé ce casse-tête pour vous-même. Médaille: Apprenti fabricant.",
        },
        choices: [
          {
            id: "restart",
            text: { en: "Restart adventure", fr: "Recommencer l'aventure" },
            target: "INTRO",
            effect: () => ({}),
          },
        ],
      },
    }),
    [],
  );

  const initialSave = (() => {
    try {
      const payload = versionedLoad<TmeSaveV1>(SAVE_KEY);
      return payload?.data ?? null;
    } catch {
      return null;
    }
  })();

  const [sceneId, setSceneId] = useState<string>(() => initialSave?.sceneId || "INTRO");
  const [ctx, setCtx] = useState(() =>
    ensureCtx({
      inventory: initialSave?.inventory ?? [],
      flags: (initialSave?.flags as any) ?? {},
    }),
  );

  const [wires, setWires] = useState<WiresState>(() =>
    createWiresState(["A1", "A2"], ["B1", "B2"], {
      red: [{ from: "A1", to: "B2" }],
      blue: [{ from: "A2", to: "B1" }],
    }),
  );

  const initialTiles: Tile[] = [
    { type: "straight", rotation: 0, source: true },
    { type: "valve", rotation: 0, open: false },
    { type: "straight", rotation: 0, sink: true },
  ];
  const [pipes, setPipes] = useState<PipesState>(() => createPipesState(3, 1, initialTiles));
  const [keypad, setKeypad] = useState(() => createKeypadState());
  const [gears, setGears] = useState<GearsState>(() =>
    createGearsState(
      [
        { id: "in", teeth: 20 },
        { id: "idle", teeth: 30 },
        { id: "out", teeth: 60 },
      ],
      [
        { a: "in", b: "idle" },
        { a: "idle", b: "out" },
      ],
      "in",
      "out",
      1 / 3,
    ),
  );
  const [sorter, setSorter] = useState<SequenceState>(() =>
    createSequenceState(["red", "blue", "green"], { lives: 5 }),
  );

  const [cipher, setCipher] = useState<CipherState>(() =>
    createCipherState("WORKSHOP", "A simple shift cipher. A becomes X, B becomes Y..."),
  );
  const [anagram, setAnagram] = useState<AnagramState>(() =>
    createAnagramState("REFRIGERATOR"),
  );

  const [locksSeq, setLocksSeq] = useState<SequenceState>(() =>
    createSequenceState(["water", "sunlight", "soil"], { lives: 3 }),
  );
  const [photoMatch, setPhotoMatch] = useState<{
    selected: string | null;
    solved: Record<string, string>;
  }>({ selected: null, solved: {} });
  const PHOTO_PAIRS: Record<string, string> = {
    partner: "toymaker",
  };
  const photoMatchSolved = photoMatch.solved.partner === "toymaker";

  const [filing, setFiling] = useState<Record<string, string>>({});
  const [filingSelected, setFilingSelected] = useState<string | null>(null);

  const filingItems = ["doll", "car", "puzzle"];
  const filingCabinets = ["a", "b", "c"];
  const filingAllDone = Object.keys(filing).length === filingItems.length &&
    filingItems.every((item) => filing[item] === FILING_TARGETS[item]);
  const filingSolved = !!ctx.flags["filing.solved"] || filingAllDone;

  const [shadowPositions, setShadowPositions] = useState({
    circle: { x: 80, y: 80 },
    square: { x: 200, y: 80 },
    triangle: { x: 320, y: 80 },
  });
  const [shadowSolved, setShadowSolved] = useState(false);
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null);

  const lastSavedRef = useRef<string | null>(null);
  useEffect(() => {
    const data: TmeSaveV1 = {
      sceneId,
      flags: ctx.flags || {},
      inventory: ctx.inventory || [],
    } as any;
    const payload = JSON.stringify({ v: 1, data });
    if (lastSavedRef.current !== payload) {
      versionedSave<TmeSaveV1>(SAVE_KEY, 1, data);
      lastSavedRef.current = payload;
    }
  }, [sceneId, ctx]);

  useEffect(() => {
    const flags: any = (ctx as any).flags || {};
    const gateSolved = !!(flags["gears.solved"] || flags["wires.solved"] || flags["pipes.solved"]);
    const latch = !!flags["latch.revealed"];
    const existing = flags?.medals?.e1;
    if (!gateSolved || !latch || existing) {
      return;
    }
    const hintsUsed = [flags?.["seen.posterOrder"], flags?.["seen.ratioPlate"]].filter(
      Boolean,
    ).length;
    const level = hintsUsed === 0 ? "gold" : hintsUsed === 1 ? "silver" : "bronze";
    setCtx((c) => effects.setFlag(`medals.e1`, level as any)(ensureCtx(c)));
  }, [ctx]);

  useEffect(() => {
    if (sceneId !== "E2_SHADOW") return;
    const canvas = shadowCanvasRef.current;
    if (!canvas) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const render = () => {
      ctx2d.clearRect(0, 0, 480, 200);
      ctx2d.fillStyle = "#1a1a2e";
      ctx2d.fillRect(0, 0, 480, 200);

      ctx2d.fillStyle = "#ffd700";
      ctx2d.font = "12px monospace";
      ctx2d.fillText(
        lang === "fr" ? "Alignez les formes pour le contour cible" : "Align shapes to match the target outline",
        10, 15,
      );

      ctx2d.strokeStyle = "#556";
      ctx2d.lineWidth = 2;
      ctx2d.setLineDash([6, 4]);
      ctx2d.beginPath();
      ctx2d.roundRect(140, 120, 200, 50, 8);
      ctx2d.stroke();
      ctx2d.setLineDash([]);

      const cs = shadowPositions.circle;
      ctx2d.fillStyle = "rgba(220,100,100,0.7)";
      ctx2d.beginPath();
      ctx2d.arc(cs.x, cs.y, 25, 0, Math.PI * 2);
      ctx2d.fill();
      ctx2d.strokeStyle = "#e88";
      ctx2d.lineWidth = 2;
      ctx2d.stroke();

      const ss = shadowPositions.square;
      ctx2d.fillStyle = "rgba(100,220,100,0.7)";
      ctx2d.fillRect(ss.x - 25, ss.y - 25, 50, 50);
      ctx2d.strokeStyle = "#8e8";
      ctx2d.lineWidth = 2;
      ctx2d.strokeRect(ss.x - 25, ss.y - 25, 50, 50);

      const ts = shadowPositions.triangle;
      ctx2d.fillStyle = "rgba(100,100,220,0.7)";
      ctx2d.beginPath();
      ctx2d.moveTo(ts.x, ts.y - 30);
      ctx2d.lineTo(ts.x + 26, ts.y + 22);
      ctx2d.lineTo(ts.x - 26, ts.y + 22);
      ctx2d.closePath();
      ctx2d.fill();
      ctx2d.strokeStyle = "#88e";
      ctx2d.lineWidth = 2;
      ctx2d.stroke();

      if (shadowSolved || ctx.flags["shadow.solved"]) {
        ctx2d.fillStyle = "#4f4";
        ctx2d.font = "bold 14px monospace";
        ctx2d.fillText(
          lang === "fr" ? "Ombre alignée !" : "Shadow aligned!",
          340, 15,
        );
      }
    };

    render();
  }, [sceneId, shadowPositions, shadowSolved, ctx.flags, lang]);

  const checkShadowSolve = () => {
    const valid =
      shadowPositions.circle.x >= 150 && shadowPositions.circle.x <= 170 &&
      shadowPositions.circle.y >= 110 && shadowPositions.circle.y <= 130 &&
      shadowPositions.square.x >= 210 && shadowPositions.square.x <= 230 &&
      shadowPositions.square.y >= 110 && shadowPositions.square.y <= 130 &&
      shadowPositions.triangle.x >= 270 && shadowPositions.triangle.x <= 290 &&
      shadowPositions.triangle.y >= 110 && shadowPositions.triangle.y <= 130;
    if (valid) {
      setShadowSolved(true);
      setCtx((c) => effects.setFlag("shadow.solved", true)(ensureCtx(c)));
    }
  };

  const scene = scenes[sceneId];

  const title =
    typeof scene?.title === "string" ? scene.title : scene?.title?.[lang] || "Toymaker Escape";
  const description = typeof scene?.body === "string" ? scene.body : scene?.body?.[lang] || "";
  return (
    <GameContainer
      title={title}
      description={description}
      lockTouch={false}
      showParticleControls={false}
    >
      <div role="application" aria-label="Toymaker Escape" className="p-4">
        <h2 className="mb-2 text-2xl font-bold" aria-live="polite">
          {title ?? t("tme.e1.title")}
        </h2>
        {scene?.body ? (
          <p className="text-muted-foreground mb-4">{description}</p>
        ) : (
          <p className="text-muted-foreground mb-4">{t("tme.e1.body")}</p>
        )}

        {/* Episode 1 keypad + gears */}
        {sceneId === "E1_GEAR" && (
          <div className="mb-4 rounded-md border p-3">
            <p className="mb-2 text-sm">{t("tme.e1.keypad.hint")}</p>
            <div className="grid max-w-xs grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((d) => (
                <button
                  key={d}
                  className="bg-muted hover:bg-muted/80 min-h-11 rounded px-4 py-2"
                  onClick={() => setKeypad((s) => pressKey(s, d, { code: "2413" }))}
                >
                  {d}
                </button>
              ))}
              <button
                className="col-span-2 min-h-11 rounded bg-gray-200 px-4 py-2 dark:bg-gray-700"
                onClick={() => setKeypad((s) => clearKeypad(s))}
              >
                {t("tme.e1.keypad.clear")}
              </button>
              <button
                className="bg-primary text-primary-foreground min-h-11 rounded px-4 py-2"
                onClick={() => {
                  setKeypad((s) => {
                    const next = submitKeypad(s, { code: "2413" });
                    if (next.solved) {
                      const updated = effects.addItem("gear-key")(ctx);
                      setCtx(effects.setFlag("keypad.solved", true)(ensureCtx(updated)));
                    }
                    return next;
                  });
                }}
              >
                {t("tme.e1.keypad.submit")}
              </button>
            </div>
            <div className="mt-2 text-sm">
              {t("tme.e1.keypad.input")} <b>{keypad.input}</b>{" "}
              {keypad.solved && (
                <span className="text-green-600">{t("tme.e1.keypad.unlocked")}</span>
              )}
            </div>
            <div className="mt-4">
              <p className="mb-2 text-sm">{t("tme.e1.gears.instruction")}</p>
              <div className="flex max-w-md flex-col gap-2">
                {["in", "idle", "out"].map((id) => (
                  <div key={id} className="flex items-center gap-2">
                    <span className="text-muted-foreground w-16 text-sm uppercase">{id}</span>
                    <button
                      className="rounded bg-gray-200 px-3 py-2 dark:bg-gray-700"
                      aria-label={`- teeth ${id}`}
                      onClick={() =>
                        setGears((s) =>
                          setGearTeeth(
                            s,
                            id,
                            Math.max(10, (s.gears.find((g) => g.id === id)?.teeth || 10) - 10),
                          ),
                        )
                      }
                    >
                      −10
                    </button>
                    <span className="min-w-10 text-center">
                      {gears.gears.find((g) => g.id === id)?.teeth}
                    </span>
                    <button
                      className="rounded bg-gray-200 px-3 py-2 dark:bg-gray-700"
                      aria-label={`+ teeth ${id}`}
                      onClick={() =>
                        setGears((s) =>
                          setGearTeeth(
                            s,
                            id,
                            Math.min(120, (s.gears.find((g) => g.id === id)?.teeth || 10) + 10),
                          ),
                        )
                      }
                    >
                      +10
                    </button>
                  </div>
                ))}
                <div className="text-sm">
                  {lang === "fr" ? "Résultat:" : "Result:"}{" "}
                  <b>
                    {evaluateGears(gears).solved
                      ? lang === "fr"
                        ? "Correct"
                        : "Correct"
                      : lang === "fr"
                        ? "Incorrect"
                        : "Incorrect"}
                  </b>
                </div>
                {evaluateGears(gears).solved && (
                  <button
                    className="mt-1 self-start rounded bg-emerald-600 px-4 py-2 text-white"
                    onClick={() => {
                      setCtx((c) => effects.setFlag("gears.solved", true)(ensureCtx(c)));
                    }}
                  >
                    {lang === "fr" ? "Valider l'engrenage" : "Confirm gears"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cabinet panel — Wires and Pipes stubs for E1 */}
        {sceneId === "E1_GEAR" && (
          <div className="mb-4 rounded-md border p-3">
            <h3 className="mb-2 font-semibold">{t("tme.e1.panel.title")}</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                className="bg-muted rounded px-3 py-2"
                onClick={() =>
                  setCtx((c) => effects.setFlag("seen.posterOrder", true)(ensureCtx(c)))
                }
              >
                {lang === "fr"
                  ? "Regarder l'affiche (ordre des jouets)"
                  : "Examine poster (toys order)"}
              </button>
              <button
                className="bg-muted rounded px-3 py-2"
                onClick={() =>
                  setCtx((c) => effects.setFlag("seen.ratioPlate", true)(ensureCtx(c)))
                }
              >
                {lang === "fr" ? "Observer la plaque 3:1" : "Inspect 3:1 plate"}
              </button>
            </div>

            {/* Wires stub */}
            <div className="mb-3">
              <p className="mb-2 text-sm">{t("tme.e1.panel.wiresHint")}</p>
              <div className="mb-2 flex items-center gap-2">
                <select
                  aria-label="Left terminal"
                  onChange={(e) => (e.currentTarget.dataset.v = e.target.value)}
                  data-v="A1"
                  data-testid="wires-left"
                >
                  {wires.terminalsLeft.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
                <span>→</span>
                <select
                  aria-label="Right terminal"
                  onChange={(e) => (e.currentTarget.dataset.v = e.target.value)}
                  data-v="B1"
                  data-testid="wires-right"
                >
                  {wires.terminalsRight.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
                <select aria-label="Color" defaultValue="red" data-testid="wires-color">
                  {Object.keys(wires.goal).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  className="bg-muted rounded px-3 py-2"
                  onClick={(e) => {
                    const leftSel = e.currentTarget.parentElement?.querySelector(
                      '[data-testid="wires-left"]',
                    ) as HTMLSelectElement;
                    const rightSel = e.currentTarget.parentElement?.querySelector(
                      '[data-testid="wires-right"]',
                    ) as HTMLSelectElement;
                    const colorSel = e.currentTarget.parentElement?.querySelector(
                      '[data-testid="wires-color"]',
                    ) as HTMLSelectElement;
                    const next = setWiresConnection(
                      wires,
                      leftSel?.value || "A1",
                      rightSel?.value || "B1",
                      colorSel?.value || "red",
                    );
                    setWires(next);
                    if (next.solved) {
                      setCtx((c) => effects.setFlag("wires.solved", true)(ensureCtx(c)));
                    }
                  }}
                >
                  {lang === "fr" ? "Connecter" : "Connect"}
                </button>
              </div>
              {hasWiresCrossing(wires) && (
                <div className="text-sm text-amber-600" role="status">
                  {t("tme.e1.panel.wiresAvoid")}
                </div>
              )}
              {wires.solved && (
                <div className="text-sm text-emerald-600" role="status">
                  {t("tme.e1.panel.wiresSolved")}
                </div>
              )}
            </div>

            {/* Pipes stub */}
            <div>
              <p className="mb-2 text-sm">{t("tme.e1.panel.pipesHint")}</p>
              <div className="mb-2 flex items-center gap-2">
                <button
                  className="bg-muted rounded px-3 py-2"
                  onClick={() => {
                    setPipes((s) => {
                      const nextRotation = (((s.grid[0]?.rotation || 0) + 90) % 360) as
                        | 0
                        | 90
                        | 180
                        | 270;
                      return evaluatePipes(setTileRotation(s, 0, 0, nextRotation));
                    });
                  }}
                >
                  {t("tme.e1.panel.rotate00")}
                </button>
                <button
                  className="bg-muted rounded px-3 py-2"
                  onClick={() => {
                    setPipes((s) => {
                      const nextRotation = (((s.grid[2]?.rotation || 0) + 90) % 360) as
                        | 0
                        | 90
                        | 180
                        | 270;
                      return evaluatePipes(setTileRotation(s, 2, 0, nextRotation));
                    });
                  }}
                >
                  {t("tme.e1.panel.rotate20")}
                </button>
                <button
                  className="bg-muted rounded px-3 py-2"
                  onClick={() => setPipes((s) => evaluatePipes(toggleValve(s, 1, 0, true)))}
                >
                  {t("tme.e1.panel.openValve")}
                </button>
              </div>
              <div className="text-sm" role="status">
                {pipes.solved ? t("tme.e1.panel.pipesSolved") : t("tme.e1.panel.pipesNotSolved")}
              </div>
              {pipes.errors && pipes.errors.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-sm text-amber-600">
                  {pipes.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
              {pipes.solved && (
                <button
                  className="mt-2 rounded bg-emerald-600 px-3 py-2 text-white"
                  onClick={() => setCtx((c) => effects.setFlag("pipes.solved", true)(ensureCtx(c)))}
                >
                  {lang === "fr" ? "Valider les tuyaux" : "Confirm pipes"}
                </button>
              )}
            </div>

            {/* Sorter */}
            <div className="mt-4">
              <p className="mb-2 text-sm">{t("tme.playroom.colors.hint")}</p>
              <div className="flex gap-2">
                {["red", "blue", "green"].map((color) => (
                  <button
                    key={color}
                    className="flex h-16 w-16 items-center justify-center rounded border capitalize"
                    style={{ backgroundColor: color, color: color === "green" ? "black" : "white" }}
                    onClick={() => {
                      const next = pressSequenceKey(sorter, color);
                      setSorter(next);
                      if (next.solved) {
                        setCtx((c) => effects.setFlag("sorter.solved", true)(ensureCtx(c)));
                      }
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-sm">
                Progress: {sorter.input.length} / {sorter.target.length}
                {ctx.flags["sorter.solved"] && <span className="ml-2 text-green-500">Solved!</span>}
              </div>
            </div>

            {/* Hidden latch */}
            <div className="mt-4">
              <p className="mb-2 text-sm">{t("tme.e1.latch.hint")}</p>
              <div className="flex flex-wrap items-center gap-4">
                <E1CabinetCanvas
                  onLatchReveal={() =>
                    setCtx((c) => effects.setFlag("latch.revealed", true)(ensureCtx(c)))
                  }
                />
                <div className="text-muted-foreground text-sm">
                  {lang === "fr"
                    ? "Astuce: appui long puis glisser sur la rayure."
                    : "Tip: long-press then drag over the scuff."}
                </div>
              </div>
              <ScuffLatch
                onRevealed={() =>
                  setCtx((c) => effects.setFlag("latch.revealed", true)(ensureCtx(c)))
                }
                onSeen={() => setCtx((c) => effects.setFlag("seen.scuff", true)(ensureCtx(c)))}
              />
              {(ctx as any).flags?.["latch.revealed"] && (
                <div className="mt-2 text-emerald-600" role="status">
                  {t("tme.e1.latch.revealed")}
                </div>
              )}
              {(ctx as any).flags?.medals?.e1 && (
                <div className="mt-1 text-sm" role="status" data-testid="medal-line">
                  {`${t("tme.e1.medal.label")} ${t("tme.e1.medal." + (ctx as any).flags.medals.e1)}`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* E2 — Cipher puzzle */}
        {sceneId === "E2_CIPHER" && (
          <div className="mb-4 rounded-md border p-3">
            <h3 className="mb-2 font-semibold">{lang === "fr" ? "Chiffre de correspondance" : "Correspondence Cipher"}</h3>
            <p className="mb-2 text-sm">
              {lang === "fr"
                ? `Message codé : ${cipher.coded}. Entrez le mot décodé :`
                : `Coded message: ${cipher.coded}. Enter the decoded word:`}
            </p>
            <div className="flex items-center gap-2">
              <input
                className="bg-background min-h-[44px] rounded border px-3 py-2"
                value={cipher.userInput}
                onChange={(e) => setCipher((s) => updateCipherInput(s, e.target.value))}
                placeholder={lang === "fr" ? "Votre réponse..." : "Your answer..."}
                maxLength={cipher.answer.length}
              />
              <button
                className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
                onClick={() => {
                  const next = submitCipher(cipher);
                  setCipher(next);
                  if (next.solved) {
                    const updated = effects.addItem("filing-key")(ctx);
                    setCtx(effects.setFlag("cipher.solved", true)(ensureCtx(updated)));
                  }
                }}
              >
                {lang === "fr" ? "Décoder" : "Decode"}
              </button>
            </div>
            {cipher.hint && (
              <p className="mt-2 text-xs opacity-70">{cipher.hint}</p>
            )}
            {cipher.solved && (
              <p className="mt-2 text-emerald-600">
                {lang === "fr" ? "Chiffre résolu !" : "Cipher solved!"}
              </p>
            )}
            {cipher.attempts > 0 && !cipher.solved && (
              <p className="mt-2 text-amber-600 text-sm">
                {lang === "fr" ? `Tentatives : ${cipher.attempts}` : `Attempts: ${cipher.attempts}`}
              </p>
            )}
          </div>
        )}

        {/* E2 — Filing Logic sorting puzzle */}
        {sceneId === "E2_FILING" && (
          <div className="mb-4 rounded-md border p-3">
            <h3 className="mb-2 font-semibold">
              {lang === "fr" ? "Logique de classement" : "Filing Logic"}
            </h3>
            <p className="mb-2 text-sm">
              {lang === "fr"
                ? "Classez chaque jouet dans le bon classeur selon les indices."
                : "Sort each toy into the correct cabinet based on the clues."}
            </p>
            <p className="mb-2 text-xs opacity-60">
              {lang === "fr"
                ? "Les poupées vont dans le classeur A, les voitures dans B, les puzzles dans C."
                : "Dolls go to Cabinet A, cars to Cabinet B, puzzles to Cabinet C."}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-bold uppercase opacity-50">
                  {lang === "fr" ? "Jouets à classer" : "Toys to sort"}
                </p>
                <div className="flex flex-col gap-2">
                  {filingItems.map((item) => (
                    <button
                      key={item}
                      className={`min-h-[44px] rounded border-2 px-3 py-2 text-left ${
                        filing[item]
                          ? "border-green-400 bg-green-100 cursor-default"
                          : filingSelected === item
                            ? "border-blue-500 bg-blue-100"
                            : "border-gray-300 bg-white"
                      }`}
                      disabled={!!filing[item]}
                      onClick={() => setFilingSelected(filingSelected === item ? null : item)}
                    >
                      {item === "doll"
                        ? lang === "fr" ? "Poupée de porcelaine" : "Porcelain Doll"
                        : item === "car"
                          ? lang === "fr" ? "Voiture à remontoir" : "Wind-up Car"
                          : lang === "fr" ? "Casse-tête" : "Jigsaw Puzzle"}
                      {filing[item] && (
                        <span className="ml-2 text-xs text-green-600">
                          → {lang === "fr" ? "Classeur " : "Cabinet "}{filing[item].toUpperCase()}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase opacity-50">
                  {lang === "fr" ? "Classeurs" : "Cabinets"}
                </p>
                <div className="flex flex-col gap-2">
                  {filingCabinets.map((cab) => (
                    <button
                      key={cab}
                      className={`min-h-[44px] rounded border-2 px-3 py-2 ${
                        Object.values(filing).includes(cab)
                          ? "border-green-400 bg-green-100 cursor-default"
                          : "border-gray-300 bg-white hover:border-blue-400"
                      }`}
                      disabled={!filingSelected || Object.values(filing).includes(cab)}
                      onClick={() => {
                        if (filingSelected && !filing[filingSelected]) {
                          const next = { ...filing, [filingSelected]: cab };
                          setFiling(next);
                          setFilingSelected(null);
                          if (
                            Object.keys(next).length === filingItems.length &&
                            filingItems.every((item) => next[item] === FILING_TARGETS[item])
                          ) {
                            setCtx((c) => effects.setFlag("filing.solved", true)(ensureCtx(c)));
                          }
                        }
                      }}
                    >
                      {lang === "fr" ? "Classeur " : "Cabinet "}{cab.toUpperCase()}
                      {cab === "a" ? ` (${lang === "fr" ? "Poupées" : "Dolls"})` : cab === "b" ? ` (${lang === "fr" ? "Véhicules" : "Vehicles"})` : ` (${lang === "fr" ? "Puzzles" : "Puzzles"})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm">
              {lang === "fr" ? "Classés : " : "Sorted: "}
              <span className="font-mono">{Object.keys(filing).length} / {filingItems.length}</span>
            </div>
            {filingSolved && (
              <p className="mt-2 font-bold text-emerald-600">
                {lang === "fr" ? "Tous les jouets sont bien classés ! La clé du classeur tourne." : "All toys sorted correctly! The filing-cabinet key turns."}
              </p>
            )}
            <button
              className="mt-2 min-h-[32px] rounded border px-3 py-1 text-sm"
              onClick={() => {
                setFiling({});
                setFilingSelected(null);
              }}
            >
              {lang === "fr" ? "Réinitialiser" : "Reset"}
            </button>
          </div>
        )}

        {/* E2 — Shadow Safe canvas puzzle */}
        {sceneId === "E2_SHADOW" && (
          <div className="mb-4 rounded-md border p-3">
            <h3 className="mb-2 font-semibold">
              {lang === "fr" ? "Coffre d'ombre" : "Shadow Safe"}
            </h3>
            <p className="mb-2 text-sm">
              {lang === "fr"
                ? "Faites glisser chaque forme jusqu'à ce que l'ombre combinée corresponde au motif de la serrure."
                : "Drag each shape until the combined shadow matches the safe's keyhole pattern."}
            </p>
            <div className="flex items-center justify-center">
              <canvas
                ref={shadowCanvasRef}
                width={480}
                height={200}
                className="rounded border border-dashed border-gray-500"
                aria-label="Shadow safe alignment puzzle"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["circle", "square", "triangle"] as const).map((shape) => (
                <div key={shape} className="flex items-center gap-2">
                  <span className="w-16 text-sm capitalize">{shape}:</span>
                  <button
                    className="min-h-[32px] rounded border px-2 py-1 text-sm"
                    onClick={() =>
                      setShadowPositions((p) => ({
                        ...p,
                        [shape]: { x: Math.max(10, p[shape].x - 20), y: p[shape].y },
                      }))
                    }
                  >
                    ←
                  </button>
                  <button
                    className="min-h-[32px] rounded border px-2 py-1 text-sm"
                    onClick={() =>
                      setShadowPositions((p) => ({
                        ...p,
                        [shape]: { x: Math.min(470, p[shape].x + 20), y: p[shape].y },
                      }))
                    }
                  >
                    →
                  </button>
                  <button
                    className="min-h-[32px] rounded border px-2 py-1 text-sm"
                    onClick={() =>
                      setShadowPositions((p) => ({
                        ...p,
                        [shape]: { x: p[shape].x, y: Math.max(10, p[shape].y - 20) },
                      }))
                    }
                  >
                    ↑
                  </button>
                  <button
                    className="min-h-[32px] rounded border px-2 py-1 text-sm"
                    onClick={() =>
                      setShadowPositions((p) => ({
                        ...p,
                        [shape]: { x: p[shape].x, y: Math.min(190, p[shape].y + 20) },
                      }))
                    }
                  >
                    ↓
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <button
                className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
                onClick={checkShadowSolve}
              >
                {lang === "fr" ? "Vérifier l'alignement" : "Check Alignment"}
              </button>
              <button
                className="min-h-[44px] rounded border px-3 py-2 text-sm"
                onClick={() => {
                  setShadowPositions({
                    circle: { x: 80, y: 80 },
                    square: { x: 200, y: 80 },
                    triangle: { x: 320, y: 80 },
                  });
                  setShadowSolved(false);
                }}
              >
                {lang === "fr" ? "Réinitialiser" : "Reset positions"}
              </button>
            </div>
            {(shadowSolved || ctx.flags["shadow.solved"]) && (
              <p className="mt-2 font-bold text-emerald-600">
                {lang === "fr" ? "L'ombre s'aligne parfaitement. Le coffre s'ouvre." : "The shadow aligns perfectly. The safe clicks open."}
              </p>
            )}
          </div>
        )}

        {/* E2 — Wrap */}
        {sceneId === "E2_WRAP" && (
          <div className="mb-4 rounded-md border p-3">
            <h3 className="mb-2 font-semibold">
              {lang === "fr" ? "Épisode 2 terminé" : "Episode 2 Complete"}
            </h3>
            <p className="mb-2 text-sm">
              {lang === "fr"
                ? "Les secrets du bureau sont révélés. Vous avez trouvé les notes du commissaire."
                : "The office secrets are revealed. You found the commissioner's notes."}
            </p>
            <p className="mb-2 text-xs font-bold text-amber-600">
              {lang === "fr" ? "Médaille gagnée : Commis aux archives" : "Medal earned: File Clerk"}
            </p>
            <div className="flex gap-2">
              <button
                className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
                onClick={() => setSceneId("E3_INTRO")}
              >
                {lang === "fr" ? "Continuer vers l'Épisode 3" : "Continue to Episode 3"}
              </button>
              <button
                className="min-h-[44px] rounded border px-3 py-2"
                onClick={() => setSceneId("INTRO")}
              >
                {lang === "fr" ? "Recommencer" : "Restart"}
              </button>
            </div>
          </div>
        )}

        {/* E3_INTRO */}
        {sceneId === "E3_INTRO" && (
          <div className="mb-4 rounded-md border p-3">
            <h3 className="mb-2 font-semibold">
              {lang === "fr" ? "Le Mystère de l'Appartement" : "Apartment Mystery"}
            </h3>
            <p className="mb-2 text-sm">
              {lang === "fr"
                ? "Vous arrivez à votre propre appartement. Des objets familiers ont été réarrangés. Le commissaire a laissé des indices ici — mais pourquoi VOTRE appartement?"
                : "You arrive at your own apartment. Familiar objects are rearranged. The commissioner left clues here — but why YOUR apartment?"}
            </p>
            <div className="flex gap-2">
              <button
                className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
                onClick={() => setSceneId("E3_LOCKS")}
              >
                {lang === "fr" ? "Vérifier les verrous" : "Check the locks"}
              </button>
            </div>
          </div>
        )}

        {/* E3_LOCKS — Environmental Locks Sequence Puzzle */}
        {sceneId === "E3_LOCKS" && (
          <div className="mb-4 rounded-md border p-3">
            <h3 className="mb-2 font-semibold">
              {lang === "fr" ? "Verrous environnementaux" : "Environmental Locks"}
            </h3>
            <p className="mb-2 text-sm">
              {lang === "fr"
                ? "Actionnez les objets dans le bon ordre : eau, lumière, terreau."
                : "Trigger the objects in the right sequence: water, sunlight, soil."}
            </p>
            <div className="flex gap-2">
              {["water", "sunlight", "soil"].map((item) => (
                <button
                  key={item}
                  className="bg-muted hover:bg-muted/80 min-h-[44px] min-w-[80px] rounded border px-4 py-2 capitalize"
                  onClick={() => {
                    const next = pressSequenceKey(locksSeq, item);
                    setLocksSeq(next);
                    if (next.solved) {
                      setCtx((c) => effects.setFlag("locks.solved", true)(ensureCtx(c)));
                    }
                  }}
                >
                  {item === "water"
                    ? lang === "fr" ? "Arroser" : "Water"
                    : item === "sunlight"
                      ? lang === "fr" ? "Lumière" : "Sunlight"
                      : lang === "fr" ? "Terreau" : "Soil"}
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm">
              {lang === "fr" ? "Progression : " : "Progress: "}
              {locksSeq.input.length} / {locksSeq.target.length}
              {ctx.flags["locks.solved"] && (
                <span className="ml-2 text-green-500">
                  {lang === "fr" ? "Résolu!" : "Solved!"}
                </span>
              )}
            </div>
            {(ctx.flags["locks.solved"] || locksSeq.solved) && (
              <div className="mt-3">
                <button
                  className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
                  onClick={() => setSceneId("E3_PHOTOS")}
                >
                  {lang === "fr" ? "Continuer vers le mur de photos" : "Continue to photo wall"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* E3_PHOTOS — Photo Memory Wall */}
        {sceneId === "E3_PHOTOS" && (
          <div className="mb-4 rounded-md border p-3">
            <h3 className="mb-2 font-semibold">
              {lang === "fr" ? "Mur de photos souvenir" : "Photo Memory Wall"}
            </h3>
            <p className="mb-2 text-sm">
              {lang === "fr"
                ? "Trois photos sont accrochées au mur. Identifiez les deux qui sont connectées."
                : "Three photos are pinned to the wall. Identify the two that are connected."}
            </p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { id: "toymaker", labelEn: "Toymaker", labelFr: "Fabricant", emoji: "🧸" },
                { id: "partner", labelEn: "Partner", labelFr: "Partenaire", emoji: "💌" },
                { id: "stranger", labelEn: "Stranger", labelFr: "Inconnu", emoji: "❓" },
              ].map((photo) => (
                <button
                  key={photo.id}
                  className={`flex flex-col items-center rounded border-2 p-3 min-h-[120px] ${
                    Object.values(photoMatch.solved).includes(photo.id) || photoMatch.solved[photo.id]
                      ? "border-green-400 bg-green-100"
                      : photoMatch.selected === photo.id
                        ? "border-blue-500 bg-blue-100"
                        : "border-gray-300 bg-white hover:border-blue-400"
                  }`}
                  disabled={Object.values(photoMatch.solved).includes(photo.id) || !!photoMatch.solved[photo.id]}
                  onClick={() => {
                    if (photoMatch.solved[photo.id] || Object.values(photoMatch.solved).includes(photo.id)) return;
                    if (!photoMatch.selected) {
                      setPhotoMatch((p) => ({ ...p, selected: photo.id }));
                    } else if (photoMatch.selected !== photo.id) {
                      const a = photoMatch.selected;
                      const b = photo.id;
                      if (PHOTO_PAIRS[a] === b || PHOTO_PAIRS[b] === a) {
                        const next = { ...photoMatch.solved, [a]: b };
                        setPhotoMatch({ selected: null, solved: next });
                        const allDone = !!next["partner"];
                        if (allDone) {
                          setCtx((c) => effects.setFlag("photos.solved", true)(ensureCtx(c)));
                        }
                      } else {
                        setPhotoMatch((p) => ({ ...p, selected: null }));
                      }
                    }
                  }}
                >
                  <span className="text-3xl mb-1">{photo.emoji}</span>
                  <span className="text-sm font-medium">
                    {lang === "fr" ? photo.labelFr : photo.labelEn}
                  </span>
                </button>
              ))}
            </div>
            {(ctx.flags["photos.solved"] || photoMatchSolved) && (
              <div>
                <p className="mb-2 text-emerald-600 font-bold">
                  {lang === "fr"
                    ? "Vous avez trouvé la connexion! Le commissaire et le fabricant partagent un lien."
                    : "You found the connection! The commissioner and the toymaker share a link."}
                </p>
                <button
                  className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
                  onClick={() => setSceneId("E3_ANAGRAM")}
                >
                  {lang === "fr" ? "Continuer vers le frigo" : "Continue to fridge"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* E3 — Anagram puzzle */}
        {sceneId === "E3_ANAGRAM" && (
          <div className="mb-4 rounded-md border p-3">
            <h3 className="mb-2 font-semibold">{lang === "fr" ? "Anagramme du frigo" : "Fridge Anagram"}</h3>
            <p className="mb-2 text-sm">
              {lang === "fr"
                ? `Lettres mélangées : ${anagram.scrambled}. Réorganisez pour former un mot :`
                : `Scrambled: ${anagram.scrambled}. Rearrange to form a word:`}
            </p>
            <div className="flex flex-wrap gap-1 mb-3">
              {anagram.scrambled.split("").map((letter, i) => (
                <span
                  key={i}
                  className="bg-background inline-flex h-10 w-10 items-center justify-center rounded border font-mono text-lg"
                >
                  {letter}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                className="bg-background min-h-[44px] rounded border px-3 py-2 uppercase"
                value={anagram.userInput}
                onChange={(e) => setAnagram((s) => updateAnagramInput(s, e.target.value))}
                placeholder={lang === "fr" ? "Votre mot..." : "Your word..."}
                maxLength={anagram.word.length}
              />
              <button
                className="bg-primary text-primary-foreground min-h-[44px] rounded px-4 py-2"
                onClick={() => {
                  const next = submitAnagram(anagram);
                  setAnagram(next);
                  if (next.solved) {
                    const updated = effects.addItem("cool-key")(ctx);
                    setCtx(effects.setFlag("anagram.solved", true)(ensureCtx(updated)));
                  }
                }}
              >
                {lang === "fr" ? "Valider" : "Submit"}
              </button>
            </div>
            {anagram.solved && (
              <p className="mt-2 text-emerald-600">
                {lang === "fr" ? "Anagramme résolu !" : "Anagram solved!"}
              </p>
            )}
            {anagram.attempts > 0 && !anagram.solved && (
              <p className="mt-2 text-amber-600 text-sm">
                {lang === "fr" ? `Tentatives : ${anagram.attempts}` : `Attempts: ${anagram.attempts}`}
              </p>
            )}
          </div>
        )}

        <DialogueBox
          scene={scene}
          lang={lang}
          onChoose={(choiceId) => {
            const res = nextScene(sceneId, scenes, choiceId, ctx);
            setSceneId(res.sceneId);
            setCtx(res.ctx);
            if (res.sceneId === "E1_WRAP") {
              setCtx((c) => effects.setFlag("medal:gear", true)(ensureCtx(c)));
            }
            if (res.sceneId === "E2_WRAP") {
              setCtx((c) => effects.setFlag("medal:fileClerk", true)(ensureCtx(c)));
            }
            if (res.sceneId === "E3_WRAP") {
              setCtx((c) => effects.setFlag("medal:toymakersApprentice", true)(ensureCtx(c)));
            }
          }}
        />

        <InventoryBar
          items={ctx.inventory}
          onUse={() => {}}
        />
      </div>
    </GameContainer>
  );
};

export default ToymakerEscapeGame;

function ScuffLatch({ onRevealed, onSeen }: { onRevealed: () => void; onSeen: () => void }) {
  const [longPressed, setLongPressed] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  const onPointerDown = () => {
    onSeen();
    setLongPressed(false);
    timeoutRef.current = window.setTimeout(() => {
      setLongPressed(true);
    }, 800);
  };
  const onPointerUp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = null;
    setLongPressed(false);
  };
  const onPointerMove = () => {
    if (longPressed) {
      onRevealed();
    }
  };
  return (
    <div
      role="button"
      aria-label="Scuffed area"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onRevealed();
        }
      }}
      className="border-muted-foreground/60 bg-muted/50 flex h-10 w-24 items-center justify-center rounded border border-dashed select-none"
      data-testid="scuff-area"
    >
      <span className="text-muted-foreground text-xs">{"// scuff"}</span>
    </div>
  );
}

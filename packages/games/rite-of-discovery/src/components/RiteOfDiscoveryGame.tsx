"use client";

import { GameContainer } from "@gamehub/game-platform";
import { t } from "@gamehub/game-platform/lib/i18n";
import { DialogueBox, InventoryBar } from "@games/pointclick-engine";
import {
  loadWithMigrations,
  SAVE_KEYS,
  versionedSave,
} from "@games/pointclick-engine/core/Persistence";
import {
  detectLang,
  effects,
  ensureCtx,
  type Lang,
  nextScene,
  type Scene,
} from "@games/pointclick-engine/engine";
import {
  createSequenceState,
  pressSeq as pressSequenceKey,
  type SequenceState,
} from "@games/pointclick-engine/puzzles/sequence";
import React, { useEffect, useMemo, useState } from "react";

const SAVE_KEY = SAVE_KEYS.rod;

const LETTER_MATCH_TARGETS: Record<string, string> = {
  a: "A", b: "B", t: "T", f: "F", o: "O", r: "R",
};

const LETTER_PAIRS: { id: string; left: string; right: string }[] = [
  { id: "a", left: "a", right: "A" },
  { id: "b", left: "b", right: "B" },
  { id: "t", left: "t", right: "T" },
  { id: "f", left: "f", right: "F" },
  { id: "o", left: "o", right: "O" },
  { id: "r", left: "r", right: "R" },
];

export const RiteOfDiscoveryGame: React.FC = () => {
  const lang = useMemo<Lang>(() => detectLang(), []);

  const [tags, setTags] = useState<SequenceState>(() =>
    createSequenceState(["star", "heart", "bell"], { lives: 5 }),
  );

  const [letterMatches, setLetterMatches] = useState<Record<string, boolean>>({});
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [letterSolved, setLetterSolved] = useState(false);

  const scenes = useMemo<Record<string, Scene>>(
    () => ({
      INTRO: {
        id: "INTRO",
        title: { en: t("rod.intro.title"), fr: t("rod.intro.title") },
        body: {
          en: t("rod.intro.p1"),
          fr: t("rod.intro.p1"),
        },
        choices: [
          {
            id: "start",
            text: { en: t("rod.intro.cta"), fr: t("rod.intro.cta") },
            target: "S1_NIGHT_BEFORE",
            effect: (ctx) => effects.setFlag("intro.seen", true)(ensureCtx(ctx)),
          },
        ],
      },
      S1_NIGHT_BEFORE: {
        id: "S1_NIGHT_BEFORE",
        title: { en: t("rod.s1.title"), fr: "La veille au soir" },
        body: { en: t("rod.s1.body"), fr: "Le salon est calme. Du papier d'emballage et des étiquettes sont éparpillés sur la table. Une étiquette s'est déchirée — reassemblez-la." },
        choices: [
          {
            id: "keepQuiet",
            text: { en: t("rod.s1.keepQuiet"), fr: "Garder ça pour toi pour l'instant" },
            target: "S2_TOOTH_TRADITION",
            effect: (ctx) => effects.setFlag("s1.askParent", false)(ensureCtx(ctx)),
            guard: (ctx) => (ctx.flags?.["tag" as keyof typeof ctx.flags] || tags.solved) === true,
          },
          {
            id: "askParent",
            text: { en: t("rod.s1.askParent"), fr: "Poser une question subtile au souper" },
            target: "S2_TOOTH_TRADITION",
            effect: (ctx) => effects.setFlag("s1.askParent", true)(ensureCtx(ctx)),
            guard: (ctx) => (ctx.flags?.["tag" as keyof typeof ctx.flags] || tags.solved) === true,
          },
        ],
      },
      S2_TOOTH_TRADITION: {
        id: "S2_TOOTH_TRADITION",
        title: { en: t("rod.s2.title"), fr: "La tradition de la dent" },
        body: { en: t("rod.s2.body"), fr: "Dans ta chambre, tu trouves deux notes — une de la « Fée des dents » et une d'un parent. Compare les lettres." },
        choices: [
          {
            id: "keepNote",
            text: { en: t("rod.s2.keepNote"), fr: "Garder la note comme preuve" },
            target: "S3_PROOF_MOMENT",
            effect: (ctx) => effects.setFlag("s2.keepNote", true)(ensureCtx(ctx)),
            guard: () => letterSolved,
          },
          {
            id: "leaveNote",
            text: { en: t("rod.s2.leaveNote"), fr: "Laisser ça de côté pour l'instant" },
            target: "S3_PROOF_MOMENT",
            effect: (ctx) => effects.setFlag("s2.keepNote", false)(ensureCtx(ctx)),
            guard: () => letterSolved,
          },
        ],
      },
      S3_PROOF_MOMENT: {
        id: "S3_PROOF_MOMENT",
        title: { en: t("rod.s3.title"), fr: "Le moment de vérité" },
        body: {
          en: t("rod.s3.body"),
          fr: "Tu entends des voix étouffées depuis la cuisine. Il y a un reçu sur le comptoir et un sac-cadeau dans le placard. Que crois-tu ?",
        },
        choices: [
          {
            id: "confrontNow",
            text: { en: t("rod.s3.confrontNow"), fr: "Confronter tes parents maintenant — tu veux la vérité" },
            target: "EPILOGUE",
            effect: (ctx) => effects.setFlag("s3.confrontNow", true)(ensureCtx(ctx)),
          },
          {
            id: "saveLater",
            text: { en: t("rod.s3.saveLater"), fr: "Garder la découverte pour plus tard — tu n'es pas pressé" },
            target: "EPILOGUE",
            effect: (ctx) => effects.setFlag("s3.confrontNow", false)(ensureCtx(ctx)),
          },
        ],
      },
      EPILOGUE: {
        id: "EPILOGUE",
        title: { en: t("rod.epilogue.title"), fr: "Le rite de découverte" },
        body: { en: t("rod.epilogue.body"), fr: "Tes parents s'assoient avec toi. Ils sourient chaleureusement. « Nous savions que ce jour viendrait, » disent-ils. « Maintenant tu fais partie de la tradition — les aides qui gardent la magie vivante pour les plus jeunes. »" },
        choices: [
          {
            id: "restart",
            text: { en: t("rod.epilogue.restart"), fr: "Recommencer l'aventure" },
            target: "INTRO",
            effect: (ctx) => effects.setFlag("ep.badgeHelper", true)(ensureCtx(ctx)),
          },
          {
            id: "viewOutro",
            text: { en: t("rod.epilogue.viewOutro"), fr: "Voir la conclusion" },
            target: "OUTRO",
            effect: (ctx) => effects.setFlag("outro.seen", true)(ensureCtx(ctx)),
          },
        ],
      },
      OUTRO: {
        id: "OUTRO",
        title: { en: t("rod.outro.title"), fr: "Découverte terminée" },
        body: { en: t("rod.outro.body"), fr: "Tu as complété ton Rite de Découverte. Chaque tradition familiale est un choix de créer de l'émerveillement. Maintenant tu peux être un créateur de merveilles aussi." },
        choices: [
          {
            id: "replay",
            text: { en: t("rod.outro.replay"), fr: "Rejouer depuis le début" },
            target: "S1_NIGHT_BEFORE",
            effect: () => ({}),
          },
          {
            id: "otherBranch",
            text: { en: t("rod.outro.otherBranch"), fr: "Essayer l'autre branche de S3" },
            target: "S3_PROOF_MOMENT",
            effect: () => ({}),
          },
          {
            id: "gentleToggle",
            text: { en: t("rod.outro.gentleToggle"), fr: "Activer le mode doux pour la prochaine partie" },
            target: "INTRO",
            effect: () => ({}),
          },
          {
            id: "ngPlus",
            text: { en: t("rod.outro.ngPlus"), fr: "Nouvelle Partie+ : Mentor Mini" },
            target: "S1_NIGHT_BEFORE",
            effect: (ctx) => effects.setFlag("ngplus.mentor", true)(ensureCtx(ctx)),
          },
        ],
      },
    }),
    [tags.solved, letterSolved],
  );

  const [sceneId, setSceneId] = useState<string>(
    () => loadWithMigrations<any>(SAVE_KEY, 1)?.sceneId || "INTRO",
  );
  const [ctx, setCtx] = useState(() => ensureCtx(loadWithMigrations<any>(SAVE_KEY, 1)?.ctx || {}));

  const gentle = Boolean(ctx.flags["gentle"]);

  useEffect(() => {
    versionedSave(SAVE_KEY, 1, { sceneId, ctx });
  }, [sceneId, ctx]);

  const scene = scenes[sceneId];
  const title =
    typeof scene?.title === "string" ? scene.title : scene?.title?.[lang] || "Rite of Discovery";
  const bodyText = typeof scene?.body === "string" ? scene.body : (scene?.body?.[lang] ?? "");

  const letterMatchCount = Object.values(letterMatches).filter(Boolean).length;
  const letterTotal = LETTER_PAIRS.length;

  return (
    <GameContainer title={title} description={bodyText}>
      <div className="mx-auto max-w-2xl p-4">
        <h2 className="mb-4 text-2xl font-bold">{title}</h2>
        <p className="mb-6">{bodyText}</p>

        {/* S1: Tag Reassembly — Sequence Puzzle */}
        {sceneId === "S1_NIGHT_BEFORE" && (
          <div className="bg-muted mb-6 rounded-lg p-6">
            <p className="mb-3 text-sm font-medium">
              {lang === "fr" ? "Assemblez les étiquettes magiques dans le bon ordre :" : "Assemble the magic tags in the correct order:"}
            </p>
            {gentle && (
              <p className="mb-3 text-sm opacity-70">
                {lang === "fr"
                  ? "Pensez à l'ordre dans lequel elles ont été placées sur les cadeaux : étoile d'abord, puis cœur, puis cloche."
                  : "Think about the order they were placed on gifts: star first, then heart, then bell."}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mb-4">
              {[{ key: "star", label: lang === "fr" ? "Étoile" : "Star", color: "#f5d742" },
                { key: "heart", label: lang === "fr" ? "Cœur" : "Heart", color: "#e8547c" },
                { key: "bell", label: lang === "fr" ? "Cloche" : "Bell", color: "#54b8e8" },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 text-xs font-bold capitalize shadow-sm transition hover:scale-105"
                  style={{
                    borderColor: color,
                    backgroundColor: tags.input.includes(key) ? `${color}33` : "transparent",
                  }}
                  onClick={() => {
                    const next = pressSequenceKey(tags, key);
                    setTags(next);
                    if (next.solved) {
                      setCtx((c) => effects.setFlag("tag.reassembled", true)(ensureCtx(c)));
                    }
                  }}
                >
                  <span className="text-lg">{key === "star" ? "\u2B50" : key === "heart" ? "\u2764\uFE0F" : "\uD83D\uDD14"}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="mb-3 text-sm">
              {lang === "fr" ? "Progression : " : "Progress: "}
              <span className="font-mono">
                [{tags.input.map((t) => (t === "star" ? lang === "fr" ? "Étoile" : "Star" : t === "heart" ? lang === "fr" ? "Cœur" : "Heart" : lang === "fr" ? "Cloche" : "Bell")).join(", ") || (lang === "fr" ? "..." : "...")}]
              </span>
              <span className="ml-2 text-xs opacity-50">
                {tags.input.length} / {tags.target.length}
              </span>
            </div>
            {tags.solved && (
              <p className="mb-3 font-bold text-green-500">
                {lang === "fr" ? "L'écriture correspond à celle de la note de maman sur le frigo. Intéressant..." : "The handwriting matches mom's note on the fridge. Interesting..."}
              </p>
            )}
            {tags.mistakes > 0 && !tags.solved && (
              <p className="mb-3 text-sm text-amber-600">
                {lang === "fr" ? `Essais incorrects : ${tags.mistakes}` : `Wrong attempts: ${tags.mistakes}`}
              </p>
            )}
            <button
              className="mt-2 min-h-[32px] rounded border px-3 py-1 text-sm"
              onClick={() => setTags(createSequenceState(["star", "heart", "bell"], { lives: 5 }))}
            >
              {lang === "fr" ? "Réinitialiser" : "Reset"}
            </button>
          </div>
        )}

        {/* S2: Letter Matching Puzzle */}
        {sceneId === "S2_TOOTH_TRADITION" && (
          <div className="bg-muted mb-6 rounded-lg p-6">
            <p className="mb-3 text-sm font-medium">
              {lang === "fr" ? "Associe les lettres qui se ressemblent sur les deux notes :" : "Match the letters that look the same across both notes:"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-bold uppercase opacity-60">
                  {lang === "fr" ? "Note de la Fée des dents" : "Tooth Fairy Note"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {LETTER_PAIRS.map(({ id, left }) => (
                    <button
                      key={`left-${id}`}
                      className={`flex h-12 w-12 items-center justify-center rounded border-2 text-lg font-serif ${
                        letterMatches[id]
                          ? "border-green-400 bg-green-100 cursor-default"
                          : selectedLetter === id
                            ? "border-blue-500 bg-blue-100"
                            : "border-gray-300 bg-white"
                      }`}
                      disabled={!!letterMatches[id]}
                      onClick={() => setSelectedLetter(selectedLetter === id ? null : id)}
                    >
                      {left}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase opacity-60">
                  {lang === "fr" ? "Note d'un parent" : "Parent's Note"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {LETTER_PAIRS.map(({ id, right }) => (
                    <button
                      key={`right-${id}`}
                      className={`flex h-12 w-12 items-center justify-center rounded border-2 text-lg font-serif ${
                        letterMatches[id]
                          ? "border-green-400 bg-green-100 cursor-default"
                          : "border-gray-300 bg-white hover:border-blue-400"
                      }`}
                      disabled={!!letterMatches[id] || !selectedLetter}
                      onClick={() => {
                        if (selectedLetter && LETTER_MATCH_TARGETS[selectedLetter] === right) {
                          const next = { ...letterMatches, [selectedLetter]: true };
                          setLetterMatches(next);
                          setSelectedLetter(null);
                          if (Object.keys(next).length === LETTER_PAIRS.length) {
                            setLetterSolved(true);
                            setCtx((c) => effects.setFlag("letters.matched", true)(ensureCtx(c)));
                          }
                        }
                      }}
                    >
                      {right}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm">
              {lang === "fr" ? "Lettres associées : " : "Letters matched: "}
              <span className="font-mono">{letterMatchCount} / {letterTotal}</span>
            </div>
            {letterSolved && (
              <p className="mt-2 font-bold text-green-500">
                {lang === "fr" ? "La même écriture apparaît sur les deux notes. Un motif se dessine." : "The same handwriting appears on both notes. A pattern is emerging."}
              </p>
            )}
            <button
              className="mt-2 min-h-[32px] rounded border px-3 py-1 text-sm"
              onClick={() => {
                setLetterMatches({});
                setSelectedLetter(null);
                setLetterSolved(false);
              }}
            >
              {lang === "fr" ? "Réinitialiser" : "Reset"}
            </button>
          </div>
        )}

        {/* S3: Proof Moment — Choice-based */}
        {sceneId === "S3_PROOF_MOMENT" && (
          <div className="bg-muted mb-6 rounded-lg p-6">
            <p className="mb-3 text-sm font-medium">
              {lang === "fr" ? "Les preuves s'accumulent. Comment te sens-tu face à cette découverte ?" : "The evidence is piling up. How do you feel about what you're discovering?"}
            </p>
            {gentle && (
              <p className="mb-3 rounded bg-amber-50 p-2 text-sm text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                {lang === "fr" ? "Les traditions sont une façon pour les familles de montrer leur amour. La magie vit dans la bienveillance." : "Traditions are a way families show love. The magic lives in kindness."}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <div className="rounded border p-3">
                <p className="mb-1 text-xs font-bold uppercase opacity-50">
                  {lang === "fr" ? "Sur le comptoir :" : "On the counter:"}
                </p>
                <p className="text-sm">
                  {lang === "fr" ? "Un reçu pour un costume de fée des dents, acheté la semaine dernière." : "A receipt for a tooth fairy costume, purchased last week."}
                </p>
              </div>
              <div className="rounded border p-3">
                <p className="mb-1 text-xs font-bold uppercase opacity-50">
                  {lang === "fr" ? "Dans le placard :" : "In the closet:"}
                </p>
                <p className="text-sm">
                  {lang === "fr" ? "Un sac-cadeau avec la même écriture que les étiquettes." : "A gift bag with the same handwriting as the tags."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Epilogue */}
        {sceneId === "EPILOGUE" && (
          <div className="bg-muted mb-6 rounded-lg p-6">
            {ctx.flags["s3.confrontNow"] ? (
              <p className="mb-3 text-sm font-medium">
                {lang === "fr" ? "Tu te sens fier. Tu es dans le secret maintenant — un rite de passage." : "You feel proud. You're in on the secret now — a rite of passage."}
              </p>
            ) : (
              <p className="mb-3 text-sm font-medium">
                {lang === "fr" ? "Tu te sens bien. La magie n'a pas disparu — elle a juste changé de forme." : "You feel cozy. The magic didn't disappear — it just changed shape."}
              </p>
            )}
            <p className="mb-3 text-xs font-bold uppercase text-green-600">
              {lang === "fr" ? "Badge d'Aide gagné ! Tu fais maintenant partie du cercle de la bienveillance." : "Helper Badge earned! You're now part of the circle of kindness."}
            </p>
            {ctx.flags["s1.askParent"] && (
              <p className="mb-1 text-xs opacity-60">
                {lang === "fr" ? "Tu as posé une question à tes parents — ils savaient que tu étais prêt." : "You asked your parents a question — they knew you were ready."}
              </p>
            )}
            {ctx.flags["s2.keepNote"] && (
              <p className="mb-1 text-xs opacity-60">
                {lang === "fr" ? "Tu as gardé la note — un souvenir de ta découverte." : "You kept the note — a memento of your discovery."}
              </p>
            )}
          </div>
        )}

        {/* Outro: Replay encouragement */}
        {sceneId === "OUTRO" && (
          <div className="bg-muted mb-6 rounded-lg p-6">
            <p className="mb-3 text-sm">
              {lang === "fr" ? "Tu as complété ton Rite de Découverte. Chaque tradition familiale est un choix de créer de l'émerveillement. Maintenant tu peux être un créateur de merveilles aussi." : "You've completed your Rite of Discovery. Every family tradition is a choice to create wonder. Now you can be a wonder-maker too."}
            </p>
            {ctx.flags["ep.badgeHelper"] && (
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                <span>{lang === "fr" ? "Badge d'Aide" : "Helper Badge"}</span>
              </div>
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
          }}
        />

        <InventoryBar items={ctx.inventory} onUse={(item) => console.log("Using", item)} />
      </div>
    </GameContainer>
  );
};

export default RiteOfDiscoveryGame;

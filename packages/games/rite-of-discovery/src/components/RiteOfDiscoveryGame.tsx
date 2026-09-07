"use client";

import { GameContainer } from "@gamehub/game-platform";
import { DialogueBox, InventoryBar, PostGameCTA } from "@games/pointclick-engine";
import { SceneBackground, useSceneAudio, useSoundEffects } from "@games/pointclick-engine";
import {
  loadWithMigrations,
  SAVE_KEYS,
  versionedSave,
} from "@games/pointclick-engine/core/Persistence";
import {
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

import { t, useI18n } from "@/lib/i18n";

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
  const { locale } = useI18n();
  const lang: Lang = locale === "fr" ? "fr" : "en";

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
          {
            id: "thinkingTools",
            text: { en: "Explore Thinking Tools", fr: "Explorer les Outils de Réflexion" },
            target: "TT_INTRO",
            effect: () => ({}),
          },
        ],
      },
      TT_INTRO: {
        id: "TT_INTRO",
        title: { en: "Thinking Tools — Intro", fr: "Outils de Réflexion — Intro" },
        body: {
          en: "Welcome to Thinking Tools. These are short exercises to sharpen your reasoning. Each one explores a different way our minds work.",
          fr: "Bienvenue aux Outils de Réflexion. Ce sont de courts exercices pour affiner ton raisonnement. Chacun explore une façon différente dont notre esprit fonctionne.",
        },
        choices: [
          { id: "tt1", text: { en: "The Mystery Coupon (Anchoring)", fr: "Le Coupon Mystère (Ancrage)" }, target: "TT1_COUPON" },
          { id: "tt2", text: { en: "The Echo Thread (Confirmation)", fr: "Le Fil d'Écho (Confirmation)" }, target: "TT2_ECHO" },
          { id: "tt3", text: { en: "The Coin-Flip Streak (Probability)", fr: "La Série de Pile-ou-Face (Probabilité)" }, target: "TT3_COIN" },
          { id: "tt4", text: { en: "The Miracle Patch (Post Hoc)", fr: "Le Patch Miracle (Post Hoc)" }, target: "TT4_MIRACLE" },
          { id: "tt5", text: { en: "The Amazing Poster (Authority)", fr: "L'Affiche Incroyable (Autorité)" }, target: "TT5_POSTER" },
          { id: "tt6", text: { en: "The Sample Size (Base Rates)", fr: "La Taille d'Échantillon (Taux de Base)" }, target: "TT6_SAMPLE" },
          { id: "back", text: { en: "Back to Outro", fr: "Retour à la Conclusion" }, target: "OUTRO" },
        ],
      },
      TT1_COUPON: {
        id: "TT1_COUPON",
        title: { en: "Thinking Tool: The Mystery Coupon", fr: "Outil de Réflexion : Le Coupon Mystère" },
        body: {
          en: "A store offers a coupon: 'Save 30% on your next purchase!' Is this a good deal? The original price was marked up by 40% before the coupon was offered.",
          fr: "Un magasin offre un coupon : « Économisez 30% sur votre prochain achat! » Est-ce une bonne affaire? Le prix original a été majoré de 40% avant que le coupon ne soit offert.",
        },
        choices: [
          { id: "goodDeal", text: { en: "Yes, 30% off is great!", fr: "Oui, 30% de rabais c'est super!" }, target: "TT1_RESULT", effect: (ctx) => effects.setVar("tt1.choice", "goodDeal")(ensureCtx(ctx)) },
          { id: "badDeal", text: { en: "Wait... the price was raised first", fr: "Attends... le prix a été gonflé d'abord" }, target: "TT1_RESULT", effect: (ctx) => effects.setVar("tt1.choice", "badDeal")(ensureCtx(ctx)) },
        ],
      },
      TT1_RESULT: {
        id: "TT1_RESULT",
        title: { en: "Thinking Tool: Anchoring Revealed", fr: "Outil de Réflexion : L'Ancrage Révélé" },
        body: {
          en: "If a $100 item is marked up 40% to $140, then '30% off' brings it to $98. You saved $2 from the original price — not 30%! The higher 'anchor' price makes the discount seem bigger than it is. This is the anchoring bias: our brains cling to the first number we see.",
          fr: "Si un article de 100$ est majoré de 40% à 140$, puis « 30% de rabais » le ramène à 98$. Tu as économisé 2$ par rapport au prix original — pas 30%! Le prix « ancré » plus élevé fait paraître le rabais plus grand qu'il ne l'est. C'est le biais d'ancrage : notre cerveau s'accroche au premier chiffre qu'il voit.",
        },
        choices: [
          { id: "next", text: { en: "Try another tool", fr: "Essayer un autre outil" }, target: "TT_INTRO" },
        ],
      },
      TT2_ECHO: {
        id: "TT2_ECHO",
        title: { en: "Thinking Tool: The Echo Thread", fr: "Outil de Réflexion : Le Fil d'Écho" },
        body: {
          en: "You read three articles that all say the same thing. Does that mean it's true? Or are they all quoting the same unreliable source?",
          fr: "Tu lis trois articles qui disent tous la même chose. Est-ce que ça veut dire que c'est vrai? Ou est-ce qu'ils citent tous la même source peu fiable?",
        },
        choices: [
          { id: "true", text: { en: "Three sources agree — must be true", fr: "Trois sources sont d'accord — ça doit être vrai" }, target: "TT2_RESULT", effect: (ctx) => effects.setVar("tt2.choice", "true")(ensureCtx(ctx)) },
          { id: "check", text: { en: "I should check if they're independent", fr: "Je devrais vérifier si elles sont indépendantes" }, target: "TT2_RESULT", effect: (ctx) => effects.setVar("tt2.choice", "check")(ensureCtx(ctx)) },
        ],
      },
      TT2_RESULT: {
        id: "TT2_RESULT",
        title: { en: "Thinking Tool: Confirmation Bias", fr: "Outil de Réflexion : Biais de Confirmation" },
        body: {
          en: "Multiple sources agreeing doesn't guarantee truth — they might all be echoing the same mistake. This is confirmation bias: we tend to seek and trust information that confirms what we already believe. Good thinking means checking if sources are truly independent.",
          fr: "Plusieurs sources qui s'accordent ne garantissent pas la vérité — elles pourraient toutes répéter la même erreur. C'est le biais de confirmation : on a tendance à chercher et à faire confiance aux informations qui confirment ce qu'on croit déjà. Bien réfléchir signifie vérifier si les sources sont vraiment indépendantes.",
        },
        choices: [
          { id: "next", text: { en: "Next tool", fr: "Outil suivant" }, target: "TT_INTRO" },
        ],
      },
      TT3_COIN: {
        id: "TT3_COIN",
        title: { en: "Thinking Tool: The Coin-Flip Streak", fr: "Outil de Réflexion : La Série de Pile-ou-Face" },
        body: {
          en: "You flip a fair coin 5 times and get heads every time. What are the odds of heads on the 6th flip?",
          fr: "Tu lances une pièce équitable 5 fois et obtiens face chaque fois. Quelles sont les chances d'avoir face au 6e lancer?",
        },
        choices: [
          { id: "lessThanHalf", text: { en: "Less than 50% — tails is 'due'", fr: "Moins de 50% — pile est 'dû'" }, target: "TT3_RESULT", effect: (ctx) => effects.setVar("tt3.choice", "gambler")(ensureCtx(ctx)) },
          { id: "half", text: { en: "Still 50% — each flip is independent", fr: "Toujours 50% — chaque lancer est indépendant" }, target: "TT3_RESULT", effect: (ctx) => effects.setVar("tt3.choice", "correct")(ensureCtx(ctx)) },
        ],
      },
      TT3_RESULT: {
        id: "TT3_RESULT",
        title: { en: "Thinking Tool: Gambler's Fallacy", fr: "Outil de Réflexion : Le Sophisme du Joueur" },
        body: {
          en: "Each coin flip is independent — the coin has no memory. The odds stay 50% no matter what happened before. Believing that 'tails is due' is the gambler's fallacy: our brains look for patterns even in random events.",
          fr: "Chaque lancer de pièce est indépendant — la pièce n'a pas de mémoire. Les chances restent 50% peu importe ce qui s'est passé avant. Croire que « pile est dû » est le sophisme du joueur : notre cerveau cherche des motifs même dans les événements aléatoires.",
        },
        choices: [
          { id: "next", text: { en: "Next tool", fr: "Outil suivant" }, target: "TT_INTRO" },
        ],
      },
      TT4_MIRACLE: {
        id: "TT4_MIRACLE",
        title: { en: "Thinking Tool: The Miracle Patch", fr: "Outil de Réflexion : Le Patch Miracle" },
        body: {
          en: "Your friend wears a special patch and their headache goes away. They say the patch cured them. What else could explain this?",
          fr: "Ton ami porte un patch spécial et son mal de tête disparaît. Il dit que le patch l'a guéri. Quoi d'autre pourrait expliquer cela?",
        },
        choices: [
          { id: "patch", text: { en: "The patch must work", fr: "Le patch doit fonctionner" }, target: "TT4_RESULT", effect: (ctx) => effects.setVar("tt4.choice", "posthoc")(ensureCtx(ctx)) },
          { id: "other", text: { en: "Headaches often go away on their own", fr: "Les maux de tête disparaissent souvent d'eux-mêmes" }, target: "TT4_RESULT", effect: (ctx) => effects.setVar("tt4.choice", "correct")(ensureCtx(ctx)) },
        ],
      },
      TT4_RESULT: {
        id: "TT4_RESULT",
        title: { en: "Thinking Tool: Post Hoc Fallacy", fr: "Outil de Réflexion : Sophisme Post Hoc" },
        body: {
          en: "Just because B happened after A doesn't mean A caused B. Headaches naturally resolve. This is post hoc ergo propter hoc ('after this, therefore because of this'). Correlation is not causation — look for other explanations and control groups.",
          fr: "Ce n'est pas parce que B s'est produit après A que A a causé B. Les maux de tête se résolvent naturellement. C'est post hoc ergo propter hoc (« après cela, donc à cause de cela »). La corrélation n'est pas la causalité — cherche d'autres explications et des groupes témoins.",
        },
        choices: [
          { id: "next", text: { en: "Next tool", fr: "Outil suivant" }, target: "TT_INTRO" },
        ],
      },
      TT5_POSTER: {
        id: "TT5_POSTER",
        title: { en: "Thinking Tool: The Amazing Poster", fr: "Outil de Réflexion : L'Affiche Incroyable" },
        body: {
          en: "A poster claims a new diet is 'doctor-approved.' Should you trust it based on this authority?",
          fr: "Une affiche prétend qu'un nouveau régime est « approuvé par un médecin ». Devrais-tu lui faire confiance sur la base de cette autorité?",
        },
        choices: [
          { id: "trust", text: { en: "Doctors know best — trust it", fr: "Les médecins savent — fais-lui confiance" }, target: "TT5_RESULT", effect: (ctx) => effects.setVar("tt5.choice", "authority")(ensureCtx(ctx)) },
          { id: "question", text: { en: "Which doctor? What evidence?", fr: "Quel médecin? Quelles preuves?" }, target: "TT5_RESULT", effect: (ctx) => effects.setVar("tt5.choice", "correct")(ensureCtx(ctx)) },
        ],
      },
      TT5_RESULT: {
        id: "TT5_RESULT",
        title: { en: "Thinking Tool: Appeal to Authority", fr: "Outil de Réflexion : Appel à l'Autorité" },
        body: {
          en: "Even experts can be wrong, especially outside their field. A dermatologist isn't automatically a nutrition expert. Good thinking asks: is this person qualified in this specific area? What evidence do they provide? Authority is a clue, not proof.",
          fr: "Même les experts peuvent se tromper, surtout hors de leur domaine. Un dermatologue n'est pas automatiquement un expert en nutrition. Bien réfléchir demande : cette personne est-elle qualifiée dans ce domaine précis? Quelles preuves fournit-elle? L'autorité est un indice, pas une preuve.",
        },
        choices: [
          { id: "next", text: { en: "Next tool", fr: "Outil suivant" }, target: "TT_INTRO" },
        ],
      },
      TT6_SAMPLE: {
        id: "TT6_SAMPLE",
        title: { en: "Thinking Tool: The Sample Size", fr: "Outil de Réflexion : La Taille d'Échantillon" },
        body: {
          en: "You try a new restaurant once and it's terrible. Your friend says 'I ate there 20 times and it was great 18 times.' Whose experience better predicts the restaurant's quality?",
          fr: "Tu essaies un nouveau restaurant une fois et c'est terrible. Ton ami dit « J'y ai mangé 20 fois et c'était excellent 18 fois. » Quelle expérience prédit le mieux la qualité du restaurant?",
        },
        choices: [
          { id: "mine", text: { en: "My experience — it was terrible!", fr: "Mon expérience — c'était terrible!" }, target: "TT6_RESULT", effect: (ctx) => effects.setVar("tt6.choice", "baseRate")(ensureCtx(ctx)) },
          { id: "friend", text: { en: "My friend's — 20 visits is more data", fr: "Celle de mon ami — 20 visites c'est plus de données" }, target: "TT6_RESULT", effect: (ctx) => effects.setVar("tt6.choice", "correct")(ensureCtx(ctx)) },
        ],
      },
      TT6_RESULT: {
        id: "TT6_RESULT",
        title: { en: "Thinking Tool: Base Rate Neglect", fr: "Outil de Réflexion : Négligence du Taux de Base" },
        body: {
          en: "A single bad experience out of one visit is a small sample. 18 good visits out of 20 gives you a much better picture (90% good). This is base rate neglect: we overweight vivid single experiences and underweight larger, more reliable data sets. Look for the bigger picture.",
          fr: "Une seule mauvaise expérience sur une visite est un petit échantillon. 18 bonnes visites sur 20 te donnent une bien meilleure image (90% bon). C'est la négligence du taux de base : on accorde trop de poids aux expériences uniques et vives et pas assez aux ensembles de données plus larges et fiables. Cherche la vue d'ensemble.",
        },
        choices: [
          { id: "next", text: { en: "Back to tools", fr: "Retour aux outils" }, target: "TT_INTRO" },
          { id: "done", text: { en: "Return to outro", fr: "Retour à la conclusion" }, target: "OUTRO" },
        ],
      },
    }),
    [tags.solved, letterSolved, lang],
  );

  const [sceneId, setSceneId] = useState<string>(
    () => loadWithMigrations<any>(SAVE_KEY, 1)?.sceneId || "INTRO",
  );
  const sfx = useSoundEffects();

  // Procedural ambient audio
  useSceneAudio(sceneId, {
    TT: "thinking",
    INTRO: "home",
    S1: "home",
    S2: "home",
    S3: "home",
    EPILOGUE: "home",
    OUTRO: "home",
  });

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

  const bgType = sceneId.startsWith("TT") ? "thinking" as const : "home" as const;

  return (
    <SceneBackground type={bgType} animate>
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
            <PostGameCTA
              gameSlug="rite-of-discovery"
              completed
              achievements={ctx.flags["ep.badgeHelper"] ? [lang === "fr" ? "Badge d'Aide" : "Helper Badge"] : []}
              onReplay={() => {
                setSceneId("INTRO");
                setCtx(ensureCtx({ inventory: [], flags: {} }));
              }}
              nextGameSlug="systems-discovery"
              nextGameTitle={lang === "fr" ? "Découverte des Systèmes" : "Systems Discovery"}
              lang={lang}
            />
          </div>
        )}

        {/* Character Art (CSS gradient illustrations) */}
        <div className="mb-6 rounded-lg border border-dashed border-gray-600 p-4" style={{
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        }}>
          <p className="mb-3 text-xs font-bold uppercase text-gray-400">
            {lang === "fr" ? "Personnages" : "Characters"}
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-500/50" style={{
                background: "radial-gradient(circle at 40% 40%, #f5d742, #c49b29)",
                boxShadow: "0 0 20px rgba(245,215,66,0.3)",
              }}>
                <span className="text-3xl" role="img" aria-label={lang === "fr" ? "Toi" : "You"}>🧒</span>
              </div>
              <p className="text-sm font-medium text-amber-200">
                {lang === "fr" ? "Toi" : "You"}
              </p>
              <p className="text-xs text-gray-400 text-center">
                {lang === "fr"
                  ? "Curieux, attentif aux détails. Sur le chemin de la découverte."
                  : "Curious, detail-oriented. On the path of discovery."}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full border-2 border-pink-500/50" style={{
                background: "radial-gradient(circle at 40% 40%, #f5a0c0, #c4547c)",
                boxShadow: "0 0 20px rgba(245,160,192,0.3)",
              }}>
                <span className="text-3xl" role="img" aria-label={lang === "fr" ? "Maman" : "Mom"}>👩</span>
              </div>
              <p className="text-sm font-medium text-pink-200">
                {lang === "fr" ? "Maman" : "Mom"}
              </p>
              <p className="text-xs text-gray-400 text-center">
                {lang === "fr"
                  ? "Chaleureuse, patiente. Son écriture se retrouve partout dans la maison."
                  : "Warm, patient. Her handwriting appears everywhere in the house."}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full border-2 border-blue-500/50" style={{
                background: "radial-gradient(circle at 40% 40%, #54b8e8, #2c7a9c)",
                boxShadow: "0 0 20px rgba(84,184,232,0.3)",
              }}>
                <span className="text-3xl" role="img" aria-label={lang === "fr" ? "Papa" : "Dad"}>👨</span>
              </div>
              <p className="text-sm font-medium text-blue-200">
                {lang === "fr" ? "Papa" : "Dad"}
              </p>
              <p className="text-xs text-gray-400 text-center">
                {lang === "fr"
                  ? "Posé et rassurant. Celui qui raconte les meilleures histoires avant le coucher."
                  : "Calm and reassuring. The one who tells the best bedtime stories."}
              </p>
            </div>
          </div>
        </div>

        {/* Thinking Tools scenes */}
        {sceneId === "TT_INTRO" && (
          <div className="bg-muted mb-6 rounded-lg border-2 border-purple-500/40 p-6" style={{
            background: "linear-gradient(135deg, #1a1025, #2d1b4e, #1a1025)",
          }}>
            <h3 className="mb-2 text-lg font-bold text-purple-200">
              {lang === "fr" ? "Outils de Réflexion" : "Thinking Tools"}
            </h3>
            <p className="mb-3 text-sm text-purple-100">
              {lang === "fr"
                ? "Explore ces mini-exercices pour comprendre comment ton esprit fonctionne. Chaque outil explore un biais cognitif différent."
                : "Explore these mini-exercises to understand how your mind works. Each tool explores a different cognitive bias."}
            </p>
          </div>
        )}
        {(sceneId === "TT1_COUPON" || sceneId === "TT2_ECHO" || sceneId === "TT3_COIN" ||
          sceneId === "TT4_MIRACLE" || sceneId === "TT5_POSTER" || sceneId === "TT6_SAMPLE") && (
          <div className="bg-muted mb-6 rounded-lg border-2 border-purple-500/40 p-6" style={{
            background: "linear-gradient(135deg, #1a1025, #2d1b4e, #1a1025)",
          }}>
            <span className="mb-2 inline-block rounded bg-purple-800 px-2 py-1 text-xs font-bold text-purple-200">
              {lang === "fr" ? "Outil de Réflexion" : "Thinking Tool"}
            </span>
          </div>
        )}
        {(sceneId === "TT1_RESULT" || sceneId === "TT2_RESULT" || sceneId === "TT3_RESULT" ||
          sceneId === "TT4_RESULT" || sceneId === "TT5_RESULT" || sceneId === "TT6_RESULT") && (
          <div className="bg-muted mb-6 rounded-lg border-2 border-emerald-500/40 p-6" style={{
            background: "linear-gradient(135deg, #0a2a1a, #1a4a3a, #0a2a1a)",
          }}>
            <span className="mb-2 inline-block rounded bg-emerald-800 px-2 py-1 text-xs font-bold text-emerald-200">
              {lang === "fr" ? "Leçon Apprise" : "Lesson Learned"}
            </span>
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
    </SceneBackground>
  );
};

export default RiteOfDiscoveryGame;

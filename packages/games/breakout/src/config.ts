/**
 * Configuration de Breakout (B1 / D3, refactor strangler).
 *
 * Premiere responsabilite extraite du monolithe `BreakoutGame.tsx` : les
 * constantes de reglage et les types de base. Aucun changement de comportement,
 * seulement un deplacement, ce qui rend les reglages testables et modifiables
 * sans rouvrir un fichier de 77 Ko.
 */

// Taille logique de la toile (la mise a l'echelle DPR est faite au resize).
export const CANVAS_WIDTH = 640;
export const CANVAS_HEIGHT = 420;

export const PADDLE_WIDTH = 75;
export const PADDLE_HEIGHT = 10;
export const PADDLE_SPEED = 6;

export const BALL_RADIUS = 8;
// Vitesse de base et bornes : reglees pour un controle confortable, puis mises a
// l'echelle par le niveau et le mode.
export const BASE_BALL_SPEED = 4.32;
export const MIN_BALL_SPEED = 3.6;
export const MAX_BALL_SPEED = 7.2;

// Anti-blocage et ressenti de controle.
export const MIN_BOUNCE_ANGLE = (10 * Math.PI) / 180; // au moins 10 degres de la verticale
export const MAX_BOUNCE_ANGLE = (75 * Math.PI) / 180; // plafonne a 75 degres
export const PADDLE_INFLUENCE_BASE = 0.04; // radians par px de mouvement (desktop)
export const PADDLE_INFLUENCE_MOBILE = 0.05; // un peu plus sur pointeur grossier
export const MAX_INFLUENCE_ANGLE = (20 * Math.PI) / 180; // influence ajoutee bornee
export const MIN_HORIZ_COMPONENT = 1.1; // garantir une vitesse horizontale minimale
export const NUDGE_EPS = 0.35; // sous ce |dx|, on envisage un deblocage
export const NUDGE_AMOUNT = 0.6; // poussee horizontale de deblocage
export const NUDGE_COOLDOWN_MS = 320; // delai minimal entre deux deblocages

export type Ball = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
};

export type Paddle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

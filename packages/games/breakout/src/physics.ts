/**
 * Physique de la raquette (B1 / D3, refactor strangler).
 *
 * Deuxieme responsabilite extraite de `BreakoutGame.tsx` : le calcul de l'angle de
 * rebond et des composantes de vitesse. La formule est reprise a l'identique (aucun
 * changement de comportement) mais devient une fonction PURE, donc testable sans
 * toile ni boucle de jeu.
 */

import {
  BASE_BALL_SPEED,
  MAX_BOUNCE_ANGLE,
  MAX_INFLUENCE_ANGLE,
  MIN_BOUNCE_ANGLE,
  MIN_HORIZ_COMPONENT,
  clamp,
} from "./config";

export interface PaddleBounceInput {
  /** Position x courante de la balle. */
  ballX: number;
  /** Position x de la raquette (coin gauche). */
  paddleX: number;
  paddleWidth: number;
  /** Vitesse horizontale de la raquette sur la frame. */
  paddleVelocity: number;
  /** Influence angulaire par unite de vitesse (desktop ou mobile). */
  paddleInfluence: number;
  /** Composantes de vitesse avant le rebond (servent a preserver la norme). */
  currentDx: number;
  currentDy: number;
}

export interface PaddleBounceResult {
  dx: number;
  dy: number;
  angle: number;
}

/**
 * Calcule la nouvelle vitesse de la balle apres un rebond sur la raquette.
 * 0 radian = tout droit vers le haut ; le signe de l'angle suit le cote touche.
 */
export function computePaddleBounce({
  ballX,
  paddleX,
  paddleWidth,
  paddleVelocity,
  paddleInfluence,
  currentDx,
  currentDy,
}: PaddleBounceInput): PaddleBounceResult {
  // Position relative au centre de la raquette, ramenee dans [-1, 1].
  const rel = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
  const baseAngle = clamp(rel, -1, 1) * MAX_BOUNCE_ANGLE;

  // Petite influence selon la direction/vitesse de la raquette sur la frame.
  const influence = clamp(paddleVelocity * paddleInfluence, -MAX_INFLUENCE_ANGLE, MAX_INFLUENCE_ANGLE);
  let angle = baseAngle + influence;

  // Eviter les frolements quasi horizontaux qui semblent coller a la raquette.
  if (angle > MAX_BOUNCE_ANGLE) angle = MAX_BOUNCE_ANGLE;
  if (angle < -MAX_BOUNCE_ANGLE) angle = -MAX_BOUNCE_ANGLE;
  // Garantir un minimum d'angle par rapport a la verticale.
  if (Math.abs(angle) < MIN_BOUNCE_ANGLE) {
    angle = angle >= 0 ? MIN_BOUNCE_ANGLE : -MIN_BOUNCE_ANGLE;
  }

  const speed = Math.sqrt(currentDx * currentDx + currentDy * currentDy) || BASE_BALL_SPEED;
  const tx = speed * Math.sin(angle);
  const ty = -speed * Math.cos(angle);

  // Si la composante horizontale disparait, on la force a MIN_HORIZ_COMPONENT
  // et on recalcule la composante verticale pour conserver la norme.
  //
  // BUG CORRIGE (2026-10-03) : le signe de `hy` etait inverse
  // (`-Math.sign(ty || -1)`), ce qui envoyait la balle VERS LE BAS sur un rebond
  // pres du centre (|angle| entre 10 et ~15 degres), la faisant traverser la
  // raquette et disparaitre. On conserve desormais la direction verticale d'origine.
  if (Math.abs(tx) < MIN_HORIZ_COMPONENT) {
    const sign = tx >= 0 ? 1 : -1;
    const hx = MIN_HORIZ_COMPONENT * sign;
    const hy = Math.sign(ty || -1) * Math.sqrt(Math.max(0, speed * speed - hx * hx));
    return { dx: hx, dy: hy, angle };
  }

  return { dx: tx, dy: ty, angle };
}

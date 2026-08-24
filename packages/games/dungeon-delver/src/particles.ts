/**
 * Particle system for Dungeon Delver combat effects.
 *
 * Lightweight object-pool-based particles for:
 * - Damage numbers (float up, fade out)
 * - Combat sparks (explode outward)
 * - Level-up glow (expanding ring)
 * - Item sparkle (golden shimmer)
 * - Death burst (dark explosion)
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  text?: string;
  alpha: number;
}

const POOL_SIZE = 200;
const pool: Particle[] = [];

function getParticle(): Particle {
  const p = pool.pop();
  if (p) return p;
  return { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 2, color: "#fff", alpha: 1 };
}

function releaseParticle(p: Particle) {
  p.life = 0;
  if (pool.length < POOL_SIZE) pool.push(p);
}

export class ParticleSystem {
  particles: Particle[] = [];
  private textParticles: Particle[] = [];

  update(dt: number) {
    // dt is in ms, normalize to seconds
    const secs = dt / 1000;

    // Spatial particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * secs;
      p.y += p.vy * secs;
      p.life -= secs;
      p.vy += 20 * secs; // gravity on sparks
      if (p.life <= 0) {
        releaseParticle(p);
        this.particles.splice(i, 1);
      }
    }

    // Text particles (damage numbers)
    for (let i = this.textParticles.length - 1; i >= 0; i--) {
      const p = this.textParticles[i];
      p.y += p.vy * secs;
      p.life -= secs;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        releaseParticle(p);
        this.textParticles.splice(i, 1);
      }
    }
  }

  /** Render all particles to canvas context */
  render(ctx: CanvasRenderingContext2D) {
    // Sparks
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    }

    // Text particles
    for (const p of this.textParticles) {
      if (!p.text) continue;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.font = `bold ${p.size}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    }
  }

  /** Spawn damage number above position */
  spawnDamage(x: number, y: number, amount: number, isCrit: boolean, isHeal: boolean) {
    for (let i = 0; i < 3; i++) {
      const p = getParticle();
      p.x = x + (Math.random() - 0.5) * 12;
      p.y = y + (Math.random() - 0.5) * 4;
      p.vx = (Math.random() - 0.5) * 30;
      p.vy = -30 - Math.random() * 20;
      p.life = 0.8 + Math.random() * 0.4;
      p.maxLife = p.life;
      p.size = isCrit ? 16 : 12;
      p.color = isHeal ? "#4caf50" : isCrit ? "#ffd700" : "#ffffff";
      p.text = i === 0 ? (isHeal ? `+${amount}` : `${amount}`) : "";
      p.alpha = 1;
      this.textParticles.push(p);
    }
  }

  /** Combat sparks at position */
  spawnSparks(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      const p = getParticle();
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 20;
      p.life = 0.3 + Math.random() * 0.4;
      p.maxLife = p.life;
      p.size = 1 + Math.random() * 3;
      p.color = color;
      p.alpha = 1;
      this.particles.push(p);
    }
  }

  /** Level-up glow ring */
  spawnLevelUp(x: number, y: number) {
    for (let i = 0; i < 40; i++) {
      const p = getParticle();
      const angle = (Math.PI * 2 * i) / 40;
      const speed = 60 + Math.random() * 40;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 0.8 + Math.random() * 0.4;
      p.maxLife = p.life;
      p.size = 2 + Math.random() * 3;
      p.color = Math.random() > 0.5 ? "#ffd700" : "#ff8c00";
      p.alpha = 1;
      this.particles.push(p);
    }
  }

  /** Golden sparkle on item pickup */
  spawnSparkle(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const p = getParticle();
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 40;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 10;
      p.life = 0.5 + Math.random() * 0.5;
      p.maxLife = p.life;
      p.size = 1 + Math.random() * 2;
      p.color = "#ffd700";
      p.alpha = 1;
      this.particles.push(p);
    }
  }

  /** Death burst */
  spawnDeathBurst(x: number, y: number) {
    for (let i = 0; i < 50; i++) {
      const p = getParticle();
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 100;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 30;
      p.life = 0.5 + Math.random() * 0.8;
      p.maxLife = p.life;
      p.size = 1 + Math.random() * 4;
      p.color = ["#f44336", "#ff6600", "#ffd700", "#333"][Math.floor(Math.random() * 4)];
      p.alpha = 1;
      this.particles.push(p);
    }
  }

  clear() {
    for (const p of this.particles) releaseParticle(p);
    for (const p of this.textParticles) releaseParticle(p);
    this.particles = [];
    this.textParticles = [];
  }
}
export interface PixiGameOptions {
  width?: number;
  height?: number;
  backgroundColor?: number;
  resolution?: number;
  antialias?: boolean;
  autoResize?: boolean;
  targetFPS?: number;
}

export interface PixiGame {
  app: unknown;
  ticker: { add: (fn: (delta: number) => void) => void; remove: (fn: (delta: number) => void) => void; start: () => void; stop: () => void };
  stage: unknown;
  loadAssets(assets: { alias: string; src: string }[]): Promise<void>;
  start(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
}

export function createPixiGame(
  container: HTMLElement,
  options: PixiGameOptions = {},
): PixiGame {
  const resolvedOptions = {
    width: options.width ?? 800,
    height: options.height ?? 600,
    backgroundColor: options.backgroundColor ?? 0x1a1a2e,
    resolution: options.resolution ?? (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1),
    antialias: options.antialias ?? true,
    autoResize: options.autoResize ?? true,
    targetFPS: options.targetFPS ?? 60,
  };

  let app: any = null;
  let stage: any = null;
  let ticker: any = null;
  let running = false;
  let animFrameId: ReturnType<typeof requestAnimationFrame> | null = null;
  let lastTime = 0;
  let tickerCallbacks: Array<(delta: number) => void> = [];
  let assetsMap = new Map<string, any>();
  let resizeObserver: ResizeObserver | null = null;

  async function initApp() {
    try {
      const PIXI = await import("pixi.js");

      app = new PIXI.Application();
      await app.init({
        width: resolvedOptions.width,
        height: resolvedOptions.height,
        backgroundColor: resolvedOptions.backgroundColor,
        resolution: resolvedOptions.resolution,
        antialias: resolvedOptions.antialias,
        resizeTo: resolvedOptions.autoResize ? container : undefined,
      });

      container.appendChild(app.canvas as HTMLCanvasElement);
      stage = app.stage;
      ticker = app.ticker;
    } catch {
      initFallback();
    }
  }

  function initFallback() {
    const canvas = document.createElement("canvas");
    canvas.width = resolvedOptions.width;
    canvas.height = resolvedOptions.height;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    stage = { canvas };
    ticker = {
      _callbacks: tickerCallbacks,
      add(fn: (delta: number) => void) {
        tickerCallbacks.push(fn);
      },
      remove(fn: (delta: number) => void) {
        tickerCallbacks = tickerCallbacks.filter((c) => c !== fn);
      },
      start() {},
      stop() {},
    };
  }

  function gameLoop(timestamp: number) {
    if (!running) {return;}
    const deltaMs = lastTime ? timestamp - lastTime : 1000 / resolvedOptions.targetFPS;
    lastTime = timestamp;
    const delta = deltaMs / (1000 / resolvedOptions.targetFPS);

    for (const cb of tickerCallbacks) {
      try {
        cb(delta);
      } catch {
        // swallow per-frame errors
      }
    }

    animFrameId = requestAnimationFrame(gameLoop);
  }

  initApp();

  if (resolvedOptions.autoResize && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      if (app?.renderer) {
        const bounds = container.getBoundingClientRect();
        app.renderer.resize(bounds.width, bounds.height);
      }
    });
    resizeObserver.observe(container);
  }

  const pixiGame: PixiGame = {
    get app() { return app; },
    get stage() { return stage; },
    get ticker() { return ticker; },

    async loadAssets(assets: { alias: string; src: string }[]) {
      if (app?.loader) {
        for (const asset of assets) {
          const texture = await app.loader.load(asset.src);
          assetsMap.set(asset.alias, texture);
        }
      }
    },

    start() {
      if (running) {return;}
      running = true;
      if (app?.ticker) {
        app.ticker.start();
      }
      lastTime = 0;
      animFrameId = requestAnimationFrame(gameLoop);
    },

    pause() {
      running = false;
      if (app?.ticker) {
        app.ticker.stop();
      }
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    },

    resume() {
      if (running) {return;}
      running = true;
      if (app?.ticker) {
        app.ticker.start();
      }
      lastTime = 0;
      animFrameId = requestAnimationFrame(gameLoop);
    },

    destroy() {
      running = false;
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      resizeObserver?.disconnect();
      resizeObserver = null;
      tickerCallbacks = [];
      assetsMap.clear();

      if (app) {
        try {
          app.destroy(true, { children: true, texture: true });
        } catch {
          // cleanup failure is non-critical
        }
        app = null;
        stage = null;
        ticker = null;
      }

      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    },
  };

  return pixiGame;
}

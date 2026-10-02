// Tests de la detection WebGPU (B2). detectWebGPU met le resultat en cache au niveau
// du module : chaque cas recharge donc le module (vi.resetModules) pour partir d'un
// etat vierge. La detection decide du moteur de rendu de plusieurs jeux ; une erreur
// enverrait un appareil compatible WebGPU sur un repli, ou l'inverse sur une machine
// qui n'en a pas.
import { afterEach, describe, expect, it, vi } from "vitest";

async function load() {
  vi.resetModules();
  return await import("../../packages/game-platform/src/lib/webgpu");
}

function setGpu(value: unknown) {
  Object.defineProperty(navigator, "gpu", { value, configurable: true });
}

function mockCanvasContext(result: unknown) {
  const original = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    const el = original(tag) as HTMLElement;
    if (tag === "canvas") {
      (el as HTMLCanvasElement).getContext = vi.fn(() => result as never);
    }
    return el;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  // Retirer gpu pour que les cas suivants repartent d'une page sans WebGPU.
  delete (navigator as unknown as { gpu?: unknown }).gpu;
});

describe("detectWebGPU", () => {
  it("renvoie none sans WebGPU ni WebGL", async () => {
    mockCanvasContext(null);
    const { detectWebGPU } = await load();
    const result = detectWebGPU();
    expect(result.supportLevel).toBe("none");
    expect(result.fallbackReason).toContain("WebGPU API not available");
  });

  it("renvoie webgl-only quand WebGL est disponible sans WebGPU", async () => {
    mockCanvasContext({});
    const { detectWebGPU } = await load();
    expect(detectWebGPU().supportLevel).toBe("webgl-only");
  });

  it("renvoie full quand navigator.gpu expose requestAdapter", async () => {
    setGpu({ requestAdapter: vi.fn() });
    const { detectWebGPU } = await load();
    expect(detectWebGPU().supportLevel).toBe("full");
  });
});

describe("detectWebGPUAsync", () => {
  it("retombe sur webgl-only quand aucun adaptateur n est trouve", async () => {
    setGpu({ requestAdapter: vi.fn(async () => null) });
    const { detectWebGPUAsync } = await load();
    const result = await detectWebGPUAsync();
    expect(result.supportLevel).toBe("webgl-only");
    expect(result.fallbackReason).toBe("No WebGPU adapter found");
  });

  it("remplit adapterInfo et applique les defauts unknown", async () => {
    setGpu({
      requestAdapter: vi.fn(async () => ({
        requestAdapterInfo: vi.fn(async () => ({ vendor: "NVIDIA" })),
      })),
    });
    const { detectWebGPUAsync } = await load();
    const result = await detectWebGPUAsync();
    expect(result.supportLevel).toBe("full");
    expect(result.adapterInfo).toEqual({
      vendor: "NVIDIA",
      architecture: "unknown",
      device: "unknown",
      description: "unknown",
    });
  });
});

describe("getOptimalRenderer", () => {
  it("choisit webgpu quand c est supporte", async () => {
    setGpu({ requestAdapter: vi.fn(async () => ({ requestAdapterInfo: vi.fn(async () => ({})) })) });
    const { getOptimalRenderer } = await load();
    expect(await getOptimalRenderer()).toBe("webgpu");
  });

  it("choisit canvas2d quand rien n est disponible", async () => {
    mockCanvasContext(null);
    const { getOptimalRenderer } = await load();
    expect(await getOptimalRenderer()).toBe("canvas2d");
  });
});

"use client";

export type WebGPUSupportLevel = "full" | "webgl-only" | "none";

export interface WebGPUDetectResult {
  supportLevel: WebGPUSupportLevel;
  adapterInfo?: {
    vendor: string;
    architecture: string;
    device: string;
    description: string;
  };
  fallbackReason?: string;
}

export type RendererFallback = "webgl2" | "webgl" | "canvas2d";

export interface WebGPUStatus {
  supported: boolean;
  adapter: GPUAdapterInfo | null;
  fallback: RendererFallback;
}

let cached: WebGPUDetectResult | null = null;

export function detectWebGPU(): WebGPUDetectResult {
  if (cached) {
    return cached;
  }

  if (typeof navigator === "undefined" || typeof window === "undefined") {
    cached = { supportLevel: "none", fallbackReason: "ssr" };
    return cached;
  }

  const gpuAvailable = "gpu" in navigator && typeof (navigator as any).gpu?.requestAdapter === "function";

  if (!gpuAvailable) {
    const hasWebGL = (() => {
      try {
        const c = document.createElement("canvas");
        return !!(c.getContext("webgl2") || c.getContext("webgl"));
      } catch {
        return false;
      }
    })();

    cached = {
      supportLevel: hasWebGL ? "webgl-only" : "none",
      fallbackReason: "WebGPU API not available in this browser",
    };
    return cached;
  }

  cached = { supportLevel: "full" };
  return cached;
}

export async function detectWebGPUAsync(): Promise<WebGPUDetectResult> {
  const base = detectWebGPU();
  if (base.supportLevel !== "full") {
    return base;
  }

  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) {
      cached = { supportLevel: "webgl-only", fallbackReason: "No WebGPU adapter found" };
      return cached;
    }

    const info = await adapter.requestAdapterInfo();
    cached = {
      supportLevel: "full",
      adapterInfo: {
        vendor: info.vendor ?? "unknown",
        architecture: info.architecture ?? "unknown",
        device: info.device ?? "unknown",
        description: info.description ?? "unknown",
      },
    };
    return cached;
  } catch (e) {
    cached = {
      supportLevel: "webgl-only",
      fallbackReason: `WebGPU adapter request failed: ${(e as Error).message}`,
    };
    return cached;
  }
}

export function getWebGPUFallbackReason(): string | undefined {
  const r = detectWebGPU();
  return r.fallbackReason;
}

export function useWebGPU(): WebGPUDetectResult {
  return detectWebGPU();
}

export async function getWebGPUStatus(): Promise<WebGPUStatus> {
  if (typeof navigator === "undefined") {
    return { supported: false, adapter: null, fallback: "canvas2d" };
  }

  const gpuAvailable = "gpu" in navigator && typeof (navigator as any).gpu?.requestAdapter === "function";

  if (!gpuAvailable) {
    const c = document.createElement("canvas");
    const hasWebGL2 = !!c.getContext("webgl2");
    const hasWebGL = !!c.getContext("webgl");
    return {
      supported: false,
      adapter: null,
      fallback: hasWebGL2 ? "webgl2" : hasWebGL ? "webgl" : "canvas2d",
    };
  }

  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) {
      return { supported: false, adapter: null, fallback: "webgl2" };
    }
    const info = await adapter.requestAdapterInfo();
    return {
      supported: true,
      adapter: info as GPUAdapterInfo,
      fallback: "canvas2d",
    };
  } catch {
    return { supported: false, adapter: null, fallback: "webgl2" };
  }
}

export async function getOptimalRenderer(): Promise<"webgpu" | "webgl2" | "webgl" | "canvas2d"> {
  const status = await getWebGPUStatus();
  if (status.supported) {return "webgpu";}
  return status.fallback;
}

export async function initWebGPU(
  canvas: HTMLCanvasElement,
): Promise<GPUCanvasContext | null> {
  if (typeof navigator === "undefined") {return null;}

  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) {return null;}

    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu");
    if (!context) {return null;}

    const format = navigator?.gpu?.getPreferredCanvasFormat?.() ?? "bgra8unorm";
    context.configure({
      device,
      format,
      alphaMode: "premultiplied" as GPUCanvasAlphaMode,
    });

    return context;
  } catch {
    return null;
  }
}

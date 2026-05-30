export type TouchControlOptions = {
  sensitivity?: number;
  swipeThreshold?: number;
  tapTimeout?: number;
  doubleTapTimeout?: number;
};

type SwipeCallback = (direction: "up" | "down" | "left" | "right", distance: number) => void;
type TapCallback = (x: number, y: number) => void;
type PanCallback = (dx: number, dy: number) => void;
type PinchCallback = (scale: number) => void;

export interface TouchControls {
  swipe: SwipeCallback | null;
  tap: TapCallback | null;
  pan: PanCallback | null;
  pinch: PinchCallback | null;
  destroy(): void;
  onSwipe(callback: SwipeCallback): void;
  onTap(callback: TapCallback): void;
  onDoubleTap(callback: TapCallback): void;
  onPinch(callback: PinchCallback): void;
  onPan(callback: PanCallback): void;
}

export function createTouchControls(
  canvas: HTMLElement,
  options: TouchControlOptions = {},
): TouchControls {
  const opts = {
    sensitivity: options.sensitivity ?? 1,
    swipeThreshold: options.swipeThreshold ?? 30,
    tapTimeout: options.tapTimeout ?? 300,
    doubleTapTimeout: options.doubleTapTimeout ?? 300,
  };

  let swipeCb: SwipeCallback | null = null;
  let tapCb: TapCallback | null = null;
  let doubleTapCb: TapCallback | null = null;
  let panCb: PanCallback | null = null;
  let pinchCb: PinchCallback | null = null;

  let startX = 0;
  let startY = 0;
  let lastTapTime = 0;
  let startTime = 0;
  let moved = false;
  let swipeStartX = 0;
  let swipeStartY = 0;
  let initialDistance = 0;

  function getDistance(t1: Touch, t2: Touch): number {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleTouchStart(e: TouchEvent) {
    const touches = e.touches;

    if (touches.length === 1) {
      startX = touches[0].clientX;
      startY = touches[0].clientY;
      swipeStartX = touches[0].clientX;
      swipeStartY = touches[0].clientY;
      startTime = Date.now();
      moved = false;
    }

    if (touches.length === 2) {
      initialDistance = getDistance(touches[0], touches[1]);
    }
  }

  function handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    const touches = e.touches;

    if (touches.length === 1 && panCb) {
      const dx = (touches[0].clientX - startX) * opts.sensitivity;
      const dy = (touches[0].clientY - startY) * opts.sensitivity;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        moved = true;
      }
      startX = touches[0].clientX;
      startY = touches[0].clientY;
      panCb(dx, dy);
    }

    if (touches.length === 2 && pinchCb) {
      const currentDistance = getDistance(touches[0], touches[1]);
      if (initialDistance > 0) {
        const scale = currentDistance / initialDistance;
        pinchCb(scale);
      }
      initialDistance = currentDistance;
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    const elapsed = Date.now() - startTime;

    if (!moved && elapsed < opts.tapTimeout && tapCb) {
      const now = Date.now();
      const rect = canvas.getBoundingClientRect();
      const x = startX - rect.left;
      const y = startY - rect.top;

      if (now - lastTapTime < opts.doubleTapTimeout && doubleTapCb) {
        doubleTapCb(x, y);
        lastTapTime = 0;
      } else {
        tapCb(x, y);
      }
      lastTapTime = now;
      return;
    }

    if (moved && swipeCb) {
      const dx = startX - swipeStartX;
      const dy = startY - swipeStartY;

      if (Math.abs(dx) > opts.swipeThreshold || Math.abs(dy) > opts.swipeThreshold) {
        let direction: "up" | "down" | "left" | "right";
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? "right" : "left";
        } else {
          direction = dy > 0 ? "down" : "up";
        }
        swipeCb(direction, distance);
      }
    }
  }

  canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchend", handleTouchEnd);
  canvas.addEventListener("touchcancel", handleTouchEnd);

  function destroy() {
    canvas.removeEventListener("touchstart", handleTouchStart);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchend", handleTouchEnd);
    canvas.removeEventListener("touchcancel", handleTouchEnd);
    swipeCb = null;
    tapCb = null;
    doubleTapCb = null;
    panCb = null;
    pinchCb = null;
  }

  const controls: TouchControls = {
    get swipe() { return swipeCb; },
    set swipe(cb: SwipeCallback | null) { swipeCb = cb; },
    get tap() { return tapCb; },
    set tap(cb: TapCallback | null) { tapCb = cb; },
    get pan() { return panCb; },
    set pan(cb: PanCallback | null) { panCb = cb; },
    get pinch() { return pinchCb; },
    set pinch(cb: PinchCallback | null) { pinchCb = cb; },
    destroy,
    onSwipe(callback: SwipeCallback) { swipeCb = callback; },
    onTap(callback: TapCallback) { tapCb = callback; },
    onDoubleTap(callback: TapCallback) { doubleTapCb = callback; },
    onPinch(callback: PinchCallback) { pinchCb = callback; },
    onPan(callback: PanCallback) { panCb = callback; },
  };

  return controls;
}

import { InputSequenceDetector, } from "../ui/InputSequenceDetector";
export class InputManager {
    canvas;
    eventSystem;
    pointerPosition = { x: 0, y: 0 };
    keys = new Set();
    isPointerDown = false;
    touchIds = new Map();
    // New properties for gesture detection
    gestureStartTime = 0;
    gestureStartPos = { x: 0, y: 0 };
    gestureThreshold = 10; // pixels
    longPressTimeout = null;
    longPressDuration = 800; // ms
    lastTapTime = 0;
    doubleTapThreshold = 300; // ms
    lastTapPos = { x: 0, y: 0 };
    doubleTapDistanceThreshold = 10; // pixels
    // Input sequence detectors (gesture macros)
    sequenceDetectors = new Map();
    constructor(canvas, eventSystem) {
        this.canvas = canvas;
        this.eventSystem = eventSystem;
        this.setupEventListeners();
    }
    isKeyDown(key) {
        return this.keys.has(key);
    }
    getPointerPosition() {
        return { ...this.pointerPosition };
    }
    isPointerPressed() {
        return this.isPointerDown;
    }
    update() {
        // Update any input-related logic that needs to run every frame
        // For example, you might want to track how long keys have been pressed
        // or handle input cooldowns here
        // Check for any keys that are currently down
        if (this.keys.size > 0) {
            this.eventSystem.emit("input:keysdown", {
                keys: Array.from(this.keys),
                position: this.getPointerPosition(),
            });
        }
        // Emit continuous move events if pointer is down
        if (this.isPointerDown) {
            this.eventSystem.emit("input:pointerdrag", {
                position: this.getPointerPosition(),
                isDown: true,
            });
        }
        // Update touch positions
        this.touchIds.forEach((position, id) => {
            this.eventSystem.emit("input:touchmove", {
                touchId: id,
                position,
                isDown: true,
            });
        });
    }
    // Public API: register a gesture macro sequence
    registerSequenceMacro(name, targetSequence, onMatched) {
        const detector = new InputSequenceDetector(targetSequence, (sequence) => {
            // Emit a high-level macro event and call optional callback
            this.eventSystem.emit(`input:macro:${name}`, {
                name,
                sequence,
            });
            onMatched?.(sequence);
        });
        this.sequenceDetectors.set(name, detector);
        // Return unregister function
        return () => {
            this.sequenceDetectors.delete(name);
        };
    }
    cleanup() {
        // Remove all event listeners
        this.canvas.removeEventListener("mousedown", this.handlePointerDown);
        this.canvas.removeEventListener("mousemove", this.handlePointerMove);
        this.canvas.removeEventListener("mouseup", this.handlePointerUp);
        this.canvas.removeEventListener("mouseleave", this.handlePointerUp);
        this.canvas.removeEventListener("touchstart", this.handleTouchStart);
        this.canvas.removeEventListener("touchmove", this.handleTouchMove);
        this.canvas.removeEventListener("touchend", this.handleTouchEnd);
        this.canvas.removeEventListener("touchcancel", this.handleTouchEnd);
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
    }
    feedSequence(event) {
        // Push the input event type to all detectors
        for (const det of this.sequenceDetectors.values()) {
            det.processInput(event);
        }
    }
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener("mousedown", this.handlePointerDown);
        this.canvas.addEventListener("mousemove", this.handlePointerMove);
        this.canvas.addEventListener("mouseup", this.handlePointerUp);
        this.canvas.addEventListener("mouseleave", this.handlePointerUp);
        // Touch events
        this.canvas.addEventListener("touchstart", this.handleTouchStart, {
            passive: false,
        });
        this.canvas.addEventListener("touchmove", this.handleTouchMove, {
            passive: false,
        });
        this.canvas.addEventListener("touchend", this.handleTouchEnd);
        this.canvas.addEventListener("touchcancel", this.handleTouchEnd);
        // Keyboard events
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
    }
    getCanvasPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    }
    getSwipeDirection(dx, dy) {
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? "right" : "left";
        }
        else {
            return dy > 0 ? "down" : "up";
        }
    }
    handlePointerDown = (e) => {
        e.preventDefault();
        this.isPointerDown = true;
        this.pointerPosition = this.getCanvasPosition(e.clientX, e.clientY);
        // Gesture tracking
        this.gestureStartTime = Date.now();
        this.gestureStartPos = { ...this.pointerPosition };
        // Setup long press detection
        this.longPressTimeout = window.setTimeout(() => {
            this.eventSystem.emit("input:longpress", {
                position: this.pointerPosition,
                duration: Date.now() - this.gestureStartTime,
            });
            this.feedSequence({ type: "longpress", position: this.pointerPosition });
        }, this.longPressDuration);
        this.emitInputEvent("pointerdown", this.pointerPosition, e);
        this.feedSequence({ type: "pointerdown", position: this.pointerPosition });
    };
    handlePointerMove = (e) => {
        e.preventDefault();
        this.pointerPosition = this.getCanvasPosition(e.clientX, e.clientY);
        // Emit the move event first
        this.emitInputEvent("pointermove", this.pointerPosition, e);
        // Detect swipe
        if (this.isPointerDown) {
            const dx = this.pointerPosition.x - this.gestureStartPos.x;
            const dy = this.pointerPosition.y - this.gestureStartPos.y;
            const distance = Math.hypot(dx, dy);
            if (distance > this.gestureThreshold) {
                // Cancel long press if we're moving
                if (this.longPressTimeout) {
                    clearTimeout(this.longPressTimeout);
                    this.longPressTimeout = null;
                }
                // Emit swipe event
                this.eventSystem.emit("input:swipe", {
                    start: { ...this.gestureStartPos },
                    end: { ...this.pointerPosition },
                    delta: { x: dx, y: dy },
                    direction: this.getSwipeDirection(dx, dy),
                    distance: distance,
                    duration: Date.now() - this.gestureStartTime,
                });
                this.feedSequence({ type: "swipe" });
            }
        }
    };
    handlePointerUp = (e) => {
        e.preventDefault();
        this.isPointerDown = false;
        this.pointerPosition = this.getCanvasPosition(e.clientX, e.clientY);
        // Clear long press timeout
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
            this.longPressTimeout = null;
        }
        // Check for tap/click
        const now = Date.now();
        const timeSinceLastTap = now - this.lastTapTime;
        const distance = Math.hypot(this.pointerPosition.x - this.lastTapPos.x, this.pointerPosition.y - this.lastTapPos.y);
        if (timeSinceLastTap < this.doubleTapThreshold &&
            distance < this.doubleTapDistanceThreshold) {
            // Double tap detected
            this.eventSystem.emit("input:doubletap", {
                position: this.pointerPosition,
            });
            this.feedSequence({ type: "doubletap", position: this.pointerPosition });
        }
        else {
            // Single tap
            this.eventSystem.emit("input:singletap", {
                position: this.pointerPosition,
            });
        }
        this.lastTapTime = now;
        this.lastTapPos = { ...this.pointerPosition };
        this.emitInputEvent("pointerup", this.pointerPosition, e);
        this.feedSequence({ type: "pointerup", position: this.pointerPosition });
    };
    handleTouchStart = (e) => {
        e.preventDefault();
        Array.from(e.changedTouches).forEach((touch) => {
            const position = this.getCanvasPosition(touch.clientX, touch.clientY);
            this.touchIds.set(touch.identifier, position);
            this.emitInputEvent("pointerdown", position, e, touch.identifier);
        });
    };
    handleTouchMove = (e) => {
        e.preventDefault();
        Array.from(e.changedTouches).forEach((touch) => {
            const position = this.getCanvasPosition(touch.clientX, touch.clientY);
            this.touchIds.set(touch.identifier, position);
            this.emitInputEvent("pointermove", position, e, touch.identifier);
        });
    };
    handleTouchEnd = (e) => {
        e.preventDefault();
        Array.from(e.changedTouches).forEach((touch) => {
            const position = this.getCanvasPosition(touch.clientX, touch.clientY);
            this.touchIds.delete(touch.identifier);
            this.emitInputEvent("pointerup", position, e, touch.identifier);
        });
    };
    handleKeyDown = (e) => {
        if (this.keys.has(e.code)) {
            return;
        }
        this.keys.add(e.code);
        this.emitInputEvent("keydown", undefined, e, undefined, e.code);
        this.feedSequence({ type: "keydown", key: e.code });
    };
    handleKeyUp = (e) => {
        this.keys.delete(e.code);
        this.emitInputEvent("keyup", undefined, e, undefined, e.code);
        this.feedSequence({ type: "keyup", key: e.code });
    };
    emitInputEvent(type, position, originalEvent, touchId, key) {
        const event = {
            type: type,
            position,
            originalEvent,
            key,
        };
        this.eventSystem.emit("input", event);
        this.eventSystem.emit(`input:${type}`, event);
    }
}

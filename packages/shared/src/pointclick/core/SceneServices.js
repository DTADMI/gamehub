export class TimerService {
    timers = new Map();
    nextId = 1;
    raf;
    running = false;
    update = (now) => {
        if (!this.running) {
            return;
        }
        const toFire = [];
        for (const rec of this.timers.values()) {
            if (!rec.active) {
                continue;
            }
            const elapsed = now - rec.lastStart;
            if (elapsed >= rec.remaining) {
                toFire.push(rec);
            }
        }
        for (const rec of toFire) {
            if (!this.timers.has(rec.id)) {
                continue;
            }
            try {
                rec.cb();
            }
            catch (e) {
                console.error("[TimerService] timer error", e);
            }
            if (rec.repeat && rec.period != null) {
                rec.lastStart = now;
                rec.remaining = rec.period;
            }
            else {
                this.timers.delete(rec.id);
            }
        }
        if (this.timers.size === 0) {
            this.stop();
        }
    };
    createTimeout(ms, cb) {
        const id = this.nextId++;
        const rec = {
            id,
            remaining: ms,
            cb,
            active: true,
            lastStart: performance.now(),
            repeat: false,
        };
        this.timers.set(id, rec);
        this.start();
        return this.handle(rec);
    }
    createInterval(ms, cb) {
        const id = this.nextId++;
        const rec = {
            id,
            remaining: ms,
            period: ms,
            cb,
            active: true,
            lastStart: performance.now(),
            repeat: true,
        };
        this.timers.set(id, rec);
        this.start();
        return this.handle(rec);
    }
    clearAll() {
        this.timers.clear();
        this.stop();
    }
    loop = () => {
        this.update(performance.now());
        if (this.running) {
            this.raf = requestAnimationFrame(this.loop);
        }
    };
    start() {
        if (this.running) {
            return;
        }
        this.running = true;
        this.raf = requestAnimationFrame(this.loop);
    }
    stop() {
        this.running = false;
        if (this.raf) {
            cancelAnimationFrame(this.raf);
        }
        this.raf = undefined;
    }
    handle(rec) {
        return {
            pause: () => {
                if (!rec.active) {
                    return;
                }
                const now = performance.now();
                rec.remaining -= now - rec.lastStart;
                rec.active = false;
            },
            resume: () => {
                if (rec.active) {
                    return;
                }
                rec.lastStart = performance.now();
                rec.active = true;
                this.start();
            },
            cancel: () => {
                this.timers.delete(rec.id);
                if (this.timers.size === 0) {
                    this.stop();
                }
            },
            isActive: () => rec.active,
        };
    }
}
export class CutsceneRunner {
    events;
    timers;
    playing = false;
    cancelFlag = false;
    disposeEvent;
    constructor(events, timers) {
        this.events = events;
        this.timers = timers;
    }
    async run(steps) {
        this.playing = true;
        this.cancelFlag = false;
        for (const step of steps) {
            if (this.cancelFlag) {
                break;
            }
            switch (step.type) {
                case "say":
                    this.events.emit("cutscene:say", step.payload.text);
                    break;
                case "effect":
                    step.payload.run();
                    break;
                case "wait":
                    await new Promise((resolve) => {
                        if (step.payload.ms != null) {
                            const h = this.timers.createTimeout(step.payload.ms, () => {
                                resolve();
                                h.cancel();
                            });
                        }
                        else if (step.payload.event) {
                            const off = this.events.on(step.payload.event, () => {
                                off();
                                resolve();
                            });
                            this.disposeEvent = off;
                        }
                        else {
                            resolve();
                        }
                    });
                    break;
                case "animate":
                    await new Promise((resolve) => {
                        const start = performance.now();
                        const tick = () => {
                            const dt = (performance.now() - start) / 1000;
                            const done = step.payload.run(dt);
                            if (done || this.cancelFlag) {
                                resolve();
                            }
                            else {
                                requestAnimationFrame(tick);
                            }
                        };
                        requestAnimationFrame(tick);
                    });
                    break;
            }
        }
        this.disposeEvent?.();
        this.disposeEvent = undefined;
        this.playing = false;
        this.events.emit("cutscene:done");
    }
    cancel() {
        this.cancelFlag = true;
    }
    isPlaying() {
        return this.playing;
    }
}
// Blackboard — tiny per‑scene typed KV store
export class Blackboard {
    data = new Map();
    get(key) {
        return this.data.get(key);
    }
    set(key, value) {
        this.data.set(key, value);
    }
    update(key, fn) {
        const next = fn(this.get(key));
        this.set(key, next);
        return next;
    }
    clear() {
        this.data.clear();
    }
}
// SceneServices facade to be attached per scene
export class SceneServices {
    events;
    timers = new TimerService();
    cutscenes;
    blackboard = new Blackboard();
    constructor(events) {
        this.events = events;
        this.cutscenes = new CutsceneRunner(events, this.timers);
    }
    destroy() {
        this.timers.clearAll();
        this.blackboard.clear();
        if (this.cutscenes.isPlaying()) {
            this.cutscenes.cancel();
        }
    }
}
export { EventSystem } from "../utils/EventSystem";

import { EventSystem } from "../utils/EventSystem";
export class StateManager {
    state = new Map();
    eventSystem;
    history = [];
    historyLimit = 100;
    constructor() {
        this.eventSystem = new EventSystem();
    }
    set(key, value) {
        const previousValue = this.get(key);
        // Only update if the value has changed
        if (JSON.stringify(previousValue) !== JSON.stringify(value)) {
            // Save to history
            this.history.push({
                key,
                value: JSON.parse(JSON.stringify(previousValue)),
            });
            if (this.history.length > this.historyLimit) {
                this.history.shift();
            }
            // Update state
            this.state.set(key, value);
            // Emit change event
            const event = {
                key,
                previousValue,
                newValue: value,
            };
            this.eventSystem.emit("state:change", event);
            this.eventSystem.emit(`state:change:${key}`, event);
        }
    }
    get(key, defaultValue) {
        return this.state.has(key) ? this.state.get(key) : defaultValue;
    }
    has(key) {
        return this.state.has(key);
    }
    delete(key) {
        if (this.state.has(key)) {
            const previousValue = this.get(key);
            const deleted = this.state.delete(key);
            if (deleted) {
                this.eventSystem.emit("state:delete", { key, previousValue });
                this.eventSystem.emit(`state:delete:${key}`, { key, previousValue });
            }
            return deleted;
        }
        return false;
    }
    clear() {
        const previousState = new Map(this.state);
        this.state.clear();
        this.history = [];
        previousState.forEach((value, key) => {
            this.eventSystem.emit("state:delete", { key, previousValue: value });
            this.eventSystem.emit(`state:delete:${key}`, {
                key,
                previousValue: value,
            });
        });
    }
    watch(key, callback) {
        const changeHandler = (event) => {
            if (event.key === key) {
                callback(event);
            }
        };
        this.eventSystem.on("state:change", changeHandler);
        // Return unwatch function
        return () => {
            this.eventSystem.off("state:change", changeHandler);
        };
    }
    undo() {
        if (this.history.length === 0) {
            return false;
        }
        const lastChange = this.history.pop();
        if (lastChange) {
            this.state.set(lastChange.key, lastChange.value);
            this.eventSystem.emit("state:undo", {
                key: lastChange.key,
                value: lastChange.value,
            });
            return true;
        }
        return false;
    }
    save(slot = "default") {
        const state = Object.fromEntries(this.state);
        const saveData = {
            timestamp: Date.now(),
            state,
        };
        localStorage.setItem(`game:state:${slot}`, JSON.stringify(saveData));
        this.eventSystem.emit("state:save", { slot, state });
    }
    load(slot = "default") {
        const saveData = localStorage.getItem(`game:state:${slot}`);
        if (!saveData) {
            return false;
        }
        try {
            const { state } = JSON.parse(saveData);
            this.state = new Map(Object.entries(state));
            this.eventSystem.emit("state:load", { slot, state });
            return true;
        }
        catch (error) {
            console.error("Failed to load state:", error);
            return false;
        }
    }
    export() {
        return JSON.stringify(Array.from(this.state.entries()));
    }
    import(data) {
        try {
            const entries = JSON.parse(data);
            if (Array.isArray(entries)) {
                this.state = new Map(entries);
                this.eventSystem.emit("state:import", {
                    state: Object.fromEntries(entries),
                });
            }
        }
        catch (error) {
            console.error("Failed to import state:", error);
        }
    }
}

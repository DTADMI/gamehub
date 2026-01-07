export class EventSystem {
    events = new Map();
    on(event, handler) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        const handlers = this.events.get(event);
        handlers.add(handler);
        // Return unsubscribe function
        return () => {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.events.delete(event);
            }
        };
    }
    off(event, handler) {
        if (this.events.has(event)) {
            const handlers = this.events.get(event);
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.events.delete(event);
            }
        }
    }
    emit(event, ...args) {
        if (this.events.has(event)) {
            for (const handler of this.events.get(event)) {
                try {
                    handler(...args);
                }
                catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            }
        }
    }
    once(event, handler) {
        const onceHandler = (...args) => {
            this.off(event, onceHandler);
            handler(...args);
        };
        this.on(event, onceHandler);
    }
    clear() {
        this.events.clear();
    }
}

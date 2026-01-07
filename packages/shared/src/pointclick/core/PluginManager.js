export class PluginManager {
    plugins = new Map();
    engine;
    constructor(engine) {
        this.engine = engine;
    }
    register(id, plugin) {
        if (this.plugins.has(id)) {
            console.warn(`Plugin with id '${id}' is already registered.`);
            return;
        }
        this.plugins.set(id, plugin);
    }
    get(id) {
        return this.plugins.get(id);
    }
    async init() {
        for (const [id, plugin] of this.plugins.entries()) {
            if (typeof plugin.init === "function") {
                try {
                    await plugin.init();
                    console.log(`Plugin '${id}' initialized successfully.`);
                }
                catch (error) {
                    console.error(`Failed to initialize plugin '${id}':`, error);
                }
            }
        }
    }
    update(deltaTime) {
        for (const plugin of this.plugins.values()) {
            if (typeof plugin.update === "function") {
                plugin.update(deltaTime);
            }
        }
    }
    trigger(event, ...args) {
        for (const plugin of this.plugins.values()) {
            if (typeof plugin[event] === "function") {
                plugin[event](...args);
            }
        }
    }
    destroy() {
        for (const [id, plugin] of this.plugins.entries()) {
            if (typeof plugin.destroy === "function") {
                try {
                    plugin.destroy();
                    console.log(`Plugin '${id}' destroyed.`);
                }
                catch (error) {
                    console.error(`Error destroying plugin '${id}':`, error);
                }
            }
        }
        this.plugins.clear();
    }
}

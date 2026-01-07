export class SceneManager {
    engine;
    scenes = new Map();
    currentScene = null;
    sceneHistory = [];
    maxHistory = 10;
    constructor(engine) {
        this.engine = engine;
    }
    get current() {
        return this.currentScene;
    }
    register(scene) {
        if (this.scenes.has(scene.id)) {
            console.warn(`Scene with id '${scene.id}' is already registered.`);
            return;
        }
        this.scenes.set(scene.id, scene);
    }
    get(id) {
        return this.scenes.get(id);
    }
    async switchTo(sceneId, data) {
        const nextScene = this.scenes.get(sceneId);
        if (!nextScene) {
            console.error(`Scene '${sceneId}' not found.`);
            return false;
        }
        // Don't do anything if we're already on this scene
        if (this.currentScene && this.currentScene.id === sceneId) {
            return true;
        }
        try {
            // Notify current scene it's being exited
            if (this.currentScene) {
                await this.currentScene.onExit?.(nextScene.id);
                this.engine.events.emit("scene:exit", this.currentScene.id, sceneId);
            }
            // Update history
            if (this.currentScene) {
                this.sceneHistory.push(this.currentScene.id);
                if (this.sceneHistory.length > this.maxHistory) {
                    this.sceneHistory.shift();
                }
            }
            // Switch to the new scene
            const previousSceneId = this.currentScene?.id;
            this.currentScene = nextScene;
            // Initialize the new scene if needed
            if (typeof this.currentScene.init === "function") {
                await this.currentScene.init();
            }
            // Notify the new scene it's been entered
            await this.currentScene.onEnter?.(previousSceneId, data);
            this.engine.events.emit("scene:enter", sceneId, previousSceneId, data);
            return true;
        }
        catch (error) {
            console.error(`Error switching to scene '${sceneId}':`, error);
            return false;
        }
    }
    goBack() {
        if (this.sceneHistory.length === 0) {
            return Promise.resolve(false);
        }
        const previousScene = this.sceneHistory.pop();
        return this.switchTo(previousScene);
    }
    destroy() {
        this.scenes.values().forEach((scene) => {
            if (typeof scene.destroy === "function") {
                scene.destroy();
            }
        });
        this.scenes.clear();
        this.currentScene = null;
        this.sceneHistory = [];
    }
}

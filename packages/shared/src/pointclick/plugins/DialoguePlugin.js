import { EventSystem } from "../utils/EventSystem";
import { logger } from "../utils/Logger";
export class DialoguePlugin {
    eventSystem;
    isActive = false;
    currentDialogue = null;
    currentOptions = [];
    currentCallback = null;
    constructor() {
        this.eventSystem = new EventSystem();
    }
    async init() {
        logger.info("Dialogue plugin initialized");
    }
    show(text, options = [], onComplete) {
        this.currentDialogue = { text };
        this.currentOptions = options;
        this.currentCallback = onComplete || null;
        this.isActive = true;
        this.eventSystem.emit("dialogue:show", {
            text,
            options,
        });
    }
    selectOption(optionIndex) {
        if (!this.isActive ||
            optionIndex < 0 ||
            optionIndex >= this.currentOptions.length) {
            return;
        }
        const option = this.currentOptions[optionIndex];
        if (option && typeof option.onSelect === "function") {
            option.onSelect();
        }
        this.hide();
    }
    hide() {
        this.isActive = false;
        this.currentDialogue = null;
        this.currentOptions = [];
        if (this.currentCallback) {
            this.currentCallback();
            this.currentCallback = null;
        }
        this.eventSystem.emit("dialogue:hide");
    }
    update(_deltaTime) {
        // Update logic for animations or timed dialogues
    }
    on(event, handler) {
        return this.eventSystem.on(event, handler);
    }
    destroy() {
        this.eventSystem.clear();
        logger.info("Dialogue plugin destroyed");
    }
}

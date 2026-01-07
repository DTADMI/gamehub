import { EventSystem } from "../utils/EventSystem";
import { logger } from "../utils/Logger";
export class InventoryPlugin {
    eventSystem;
    items = new Map();
    maxSlots = 20;
    onChangeCallbacks = [];
    constructor() {
        this.eventSystem = new EventSystem();
    }
    async init() {
        logger.info("Inventory plugin initialized");
    }
    addItem(item, quantity = 1) {
        if (this.items.size >= this.maxSlots && !this.hasItem(item.id)) {
            return false; // No more slots available
        }
        const existingItem = this.items.get(item.id);
        if (existingItem) {
            // Stack items if possible
            const newQuantity = existingItem.quantity + quantity;
            if (existingItem.maxStack > 1 && newQuantity <= existingItem.maxStack) {
                existingItem.quantity = newQuantity;
                this.notifyChange();
                return true;
            }
            return false; // Can't stack more
        }
        // Add new item
        this.items.set(item.id, { ...item, quantity });
        this.notifyChange();
        return true;
    }
    removeItem(itemId, quantity = 1) {
        const item = this.items.get(itemId);
        if (!item) {
            return false;
        }
        if (item.quantity > quantity) {
            item.quantity -= quantity;
        }
        else {
            this.items.delete(itemId);
        }
        this.notifyChange();
        return true;
    }
    hasItem(itemId, quantity = 1) {
        const item = this.items.get(itemId);
        return item ? item.quantity >= quantity : false;
    }
    getItem(itemId) {
        return this.items.get(itemId);
    }
    getAllItems() {
        return Array.from(this.items.values());
    }
    clear() {
        this.items.clear();
        this.notifyChange();
    }
    on(event, handler) {
        return this.eventSystem.on(event, handler);
    }
    onChange(callback) {
        this.onChangeCallbacks.push(callback);
        return () => {
            this.onChangeCallbacks = this.onChangeCallbacks.filter((cb) => cb !== callback);
        };
    }
    destroy() {
        this.eventSystem.clear();
        this.items.clear();
        this.onChangeCallbacks = [];
        logger.info("Inventory plugin destroyed");
    }
    notifyChange() {
        this.eventSystem.emit("inventory:change", { items: this.getAllItems() });
        this.onChangeCallbacks.forEach((callback) => callback());
    }
}

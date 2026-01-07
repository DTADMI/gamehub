import { EventSystem } from "../utils/EventSystem";
import { logger } from "../utils/Logger";
export class AchievementPlugin {
    eventSystem;
    achievements = new Map();
    unlockedAchievements = new Set();
    constructor() {
        this.eventSystem = new EventSystem();
    }
    async init() {
        // Load saved achievements from storage
        this.load();
        logger.info("Achievement plugin initialized");
    }
    register(achievement) {
        if (this.achievements.has(achievement.id)) {
            logger.warn(`Achievement with id '${achievement.id}' is already registered.`);
            return;
        }
        const newAchievement = {
            ...achievement,
            unlocked: this.unlockedAchievements.has(achievement.id),
            unlockTime: this.unlockedAchievements.has(achievement.id)
                ? Date.now()
                : undefined,
        };
        this.achievements.set(achievement.id, newAchievement);
    }
    unlock(achievementId) {
        const achievement = this.achievements.get(achievementId);
        if (!achievement || achievement.unlocked) {
            return false;
        }
        achievement.unlocked = true;
        achievement.unlockTime = Date.now();
        this.unlockedAchievements.add(achievementId);
        // Save to storage
        this.save();
        // Notify listeners
        this.eventSystem.emit("achievement:unlocked", achievement);
        logger.info(`Achievement unlocked: ${achievement.name}`);
        return true;
    }
    getAchievement(achievementId) {
        return this.achievements.get(achievementId);
    }
    getUnlockedAchievements() {
        return Array.from(this.achievements.values())
            .filter((achievement) => achievement.unlocked)
            .sort((a, b) => (a.unlockTime || 0) - (b.unlockTime || 0));
    }
    getLockedAchievements() {
        return Array.from(this.achievements.values()).filter((achievement) => !achievement.unlocked && !achievement.hidden);
    }
    on(event, handler) {
        return this.eventSystem.on(event, handler);
    }
    reset() {
        this.unlockedAchievements.clear();
        this.achievements.forEach((achievement) => {
            achievement.unlocked = false;
            delete achievement.unlockTime;
        });
        localStorage.removeItem("achievements");
    }
    destroy() {
        this.eventSystem.clear();
        this.achievements.clear();
        this.unlockedAchievements.clear();
        logger.info("Achievement plugin destroyed");
    }
    save() {
        const data = {
            version: 1,
            unlocked: Array.from(this.unlockedAchievements),
            timestamp: Date.now(),
        };
        localStorage.setItem("achievements", JSON.stringify(data));
    }
    load() {
        try {
            const data = localStorage.getItem("achievements");
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.unlocked && Array.isArray(parsed.unlocked)) {
                    parsed.unlocked.forEach((id) => {
                        this.unlockedAchievements.add(id);
                    });
                }
            }
        }
        catch (error) {
            logger.error("Failed to load achievements:", error);
        }
    }
}

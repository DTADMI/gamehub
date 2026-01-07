export class Helpers {
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }
    static distance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    static randomChoice(items) {
        return items[Math.floor(Math.random() * items.length)];
    }
    static shuffle(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    static pointInRect(point, rect) {
        return (point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height);
    }
    static rectsOverlap(a, b) {
        return (a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y);
    }
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    static debounce(func, wait) {
        let timeout = null;
        return function (...args) {
            const later = () => {
                timeout = null;
                func.apply(this, args);
            };
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(later, wait);
        };
    }
    static throttle(func, limit) {
        let inThrottle = false;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    static async loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    static async loadJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${response.statusText}`);
        }
        return response.json();
    }
    static async loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = url;
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}
// Global helper functions
export const { clamp, lerp, distance, randomInt, randomFloat, randomChoice, shuffle, formatTime, pointInRect, rectsOverlap, deepClone, debounce, throttle, formatNumber, loadImage, loadJSON, loadScript, } = Helpers;

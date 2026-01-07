export class Logger {
    static instance;
    enabled = true;
    context = "Game";
    history = [];
    maxHistory = 1000;
    constructor() {
        if (Logger.instance) {
            return Logger.instance;
        }
        Logger.instance = this;
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    enable() {
        this.enabled = true;
    }
    disable() {
        this.enabled = false;
    }
    setContext(context) {
        this.context = context;
    }
    debug(message, ...args) {
        this.log("debug", message, ...args);
    }
    info(message, ...args) {
        this.log("info", message, ...args);
    }
    warn(message, ...args) {
        this.log("warn", message, ...args);
    }
    error(message, ...args) {
        this.log("error", message, ...args);
    }
    getHistory() {
        return [...this.history];
    }
    clearHistory() {
        this.history = [];
    }
    log(level, message, ...args) {
        if (!this.enabled) {
            return;
        }
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${this.context}] [${level.toUpperCase()}] ${message}`;
        // Add to history
        this.history.push(logMessage);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        // Log to console
        const logArgs = [logMessage, ...args];
        switch (level) {
            case "debug":
                console.debug(...logArgs);
                break;
            case "info":
                console.info(...logArgs);
                break;
            case "warn":
                console.warn(...logArgs);
                break;
            case "error":
                console.error(...logArgs);
                break;
            default:
                console.log(...logArgs);
        }
    }
}
// Singleton export
export const logger = Logger.getInstance();

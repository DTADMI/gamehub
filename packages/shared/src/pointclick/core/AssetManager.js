import { EventSystem } from "../utils/EventSystem";
export class AssetManager {
    assets = new Map();
    eventSystem;
    constructor() {
        this.eventSystem = new EventSystem();
    }
    async load(assets) {
        const loadPromises = assets.map((asset) => this.loadAsset(asset));
        await Promise.all(loadPromises);
    }
    get(id) {
        const asset = this.assets.get(id);
        return asset?.data;
    }
    unload(id) {
        return this.assets.delete(id);
    }
    unloadAll() {
        this.assets.clear();
    }
    on(event, handler) {
        return this.eventSystem.on(event, handler);
    }
    off(event, handler) {
        this.eventSystem.off(event, handler);
    }
    async loadAsset(assetDef) {
        if (this.assets.has(assetDef.id)) {
            console.warn(`Asset with id '${assetDef.id}' is already loaded.`);
            return;
        }
        try {
            const asset = {
                ...assetDef,
                data: null,
                metadata: assetDef.metadata || {},
            };
            switch (assetDef.type) {
                case "image":
                    asset.data = await this.loadImage(assetDef.src);
                    break;
                case "audio":
                    asset.data = await this.loadAudio(assetDef.src);
                    break;
                case "json":
                    asset.data = await this.loadJson(assetDef.src);
                    break;
                case "spritesheet":
                    asset.data = await this.loadSpritesheet(assetDef.src, assetDef.metadata);
                    break;
                case "font":
                    await this.loadFont(assetDef.src, assetDef.id);
                    asset.data = assetDef.id; // Store font family name
                    break;
                default:
                    throw new Error(`Unsupported asset type: ${assetDef.type}`);
            }
            this.assets.set(assetDef.id, asset);
            this.eventSystem.emit("asset:loaded", assetDef.id);
        }
        catch (error) {
            console.error(`Failed to load asset '${assetDef.id}':`, error);
            throw error;
        }
    }
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }
    loadAudio(src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = "auto";
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
            audio.src = src;
        });
    }
    async loadJson(src) {
        const response = await fetch(src);
        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${src} (${response.status})`);
        }
        return response.json();
    }
    async loadSpritesheet(src, metadata) {
        const image = await this.loadImage(src);
        return { image, ...metadata };
    }
    async loadFont(src, fontFamily) {
        const fontFace = new FontFace(fontFamily, `url(${src})`);
        await fontFace.load();
        document.fonts.add(fontFace);
    }
}

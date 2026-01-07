export class GameObject {
    position;
    size;
    visible = true;
    interactive = true;
    constructor(config) {
        this.position = config.position || { x: 0, y: 0 };
        this.size = config.size || { x: 32, y: 32 };
        this.visible = config.visible ?? true;
        this.interactive = config.interactive ?? true;
    }
    containsPoint(point) {
        return (point.x >= this.position.x &&
            point.x <= this.position.x + this.size.x &&
            point.y >= this.position.y &&
            point.y <= this.position.y + this.size.y);
    }
    onPointerDown(_e) {
    }
    onPointerUp(_e) {
    }
    onPointerMove(_e) {
    }
    onPointerOver(_e) {
    }
    onPointerOut(_e) {
    }
}

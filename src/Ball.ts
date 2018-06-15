import {Vector2D} from "./Utils";

export default class Ball {
    private _position: Vector2D;
    private _speedX: number = 4;
    private _speedY: number = 4;
    private _radius: number = 10;

    private drawContext: CanvasRenderingContext2D;

    readonly COLOR: string = 'white';

    constructor(position: Vector2D, drawContext: CanvasRenderingContext2D) {
        this.position = position;
        this.drawContext = drawContext;
    }

    move(): void {
        this.position.x += this.speedX;
        this.position.y += this.speedY;
    }
    
    draw(): void {
        this.drawContext.beginPath();
        this.drawContext.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        this.drawContext.fillStyle = this.COLOR;
        this.drawContext.fill();
        this.drawContext.strokeStyle = "grey";
        this.drawContext.lineWidth = 1;
        this.drawContext.stroke();
    }

    get radius(): number {
        return this._radius;
    }

    get speedX(): number {
        return this._speedX;
    }

    set speedX(value: number) {
        this._speedX = value;
    }

    get speedY(): number {
        return this._speedY;
    }

    set speedY(value: number) {
        this._speedY = value;
    }

    get position(): Vector2D {
        return this._position;
    }

    set position(value: Vector2D) {
        this._position = value;
    }
}
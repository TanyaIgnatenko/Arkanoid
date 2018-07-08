import {Vector2D} from "./Utils";

export default class Ball {
    readonly RADIUS: number = 10;
    readonly SPEED_X: number = 4;
    readonly SPEED_Y: number = 4;

    private _position: Vector2D;
    private _speedX: number = this.SPEED_X;
    private _speedY: number = this.SPEED_Y;
    private _radius: number = this.RADIUS;

    private drawContext: CanvasRenderingContext2D;

    readonly COLOR: string = 'white';

    constructor(position: Vector2D, drawContext: CanvasRenderingContext2D) {
        this.position = position.clone();
        this.drawContext = drawContext;
    }

    reset(): void {
        this._speedX = this.SPEED_X;
        this._speedY = this.SPEED_Y;
        this._radius = this.RADIUS;
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
        this._position = value.clone();
    }
}
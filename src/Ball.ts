import {Vector2D} from "./Utils";

export default class Ball {
    readonly RADIUS: number = 10;
    readonly SPEED_X: number = 4;
    readonly SPEED_Y: number = 4;

    private _position: Vector2D;
    private _velocity: Vector2D = new Vector2D(this.SPEED_X, this.SPEED_Y);
    private _radius: number = this.RADIUS;

    private drawContext: CanvasRenderingContext2D;

    readonly COLOR: string = 'white';

    constructor(position: Vector2D, drawContext: CanvasRenderingContext2D) {
        this.position = position.clone();
        this.drawContext = drawContext;
    }

    reset(): void {
        this._velocity.x = this.SPEED_X;
        this._velocity.y = this.SPEED_Y;
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

    get velocity() : Vector2D {
        return this._velocity;
    }

    get speedX(): number {
        return this._velocity.x;
    }

    set velocity(vector: Vector2D) {
        this._velocity = vector;
    }

    set speedX(value: number) {
        this._velocity.x = value;
    }

    get speedY(): number {
        return this._velocity.y;
    }

    set speedY(value: number) {
        this._velocity.y = value;
    }

    get position(): Vector2D {
        return this._position;
    }

    set position(value: Vector2D) {
        this._position = value.clone();
    }
}
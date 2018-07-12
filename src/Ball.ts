import {SphericalObject, Vector2D} from "./Utils";

export default class Ball implements SphericalObject {
    readonly RADIUS: number = 10;
    readonly SPEED_X: number = 4;
    readonly SPEED_Y: number = 4;

    private _position: Vector2D;
    private _velocity: Vector2D = new Vector2D(this.SPEED_X, this.SPEED_Y);
    private _radius: number = this.RADIUS;

    private drawContext: CanvasRenderingContext2D;

    readonly COLOR: string = 'white';

    constructor(drawContext: CanvasRenderingContext2D) {
        this.drawContext = drawContext;
    }

    reset(): void {
        this._velocity.x = this.SPEED_X;
        this._velocity.y = this.SPEED_Y;
        this._radius = this.RADIUS;
    }

    move(): void {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
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

    set velocity(vector: Vector2D) {
        this._velocity = vector;
    }

    get position(): Vector2D {
        return this._position;
    }

    set position(value: Vector2D) {
        this._position = value.clone();
    }
}
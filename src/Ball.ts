import {SphericalObject, Vector2D} from "./Utils";

export default class Ball implements SphericalObject {
    readonly RADIUS: number = 10;
    readonly INITIAL_VELOCITY: Vector2D = new Vector2D(0, 6);

    private _position: Vector2D;
    private _velocity: Vector2D = this.INITIAL_VELOCITY;
    private _radius: number = this.RADIUS;

    private drawContext: CanvasRenderingContext2D;

    readonly COLOR: string = 'white';

    constructor(drawContext: CanvasRenderingContext2D) {
        this.drawContext = drawContext;
    }

    reset(): void {
        this._velocity = this.INITIAL_VELOCITY;
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
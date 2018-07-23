import {SphericalObject, Vector2D} from "../Utils/Utils";

export default class Ball implements SphericalObject {
    readonly RADIUS: number = 10;
    readonly INITIAL_VELOCITY: Vector2D = new Vector2D(0, 6);

    private _position: Vector2D;
    private _velocity: Vector2D = this.INITIAL_VELOCITY.clone();
    private _radius: number = this.RADIUS;

    reset(): void {
        this._velocity = this.INITIAL_VELOCITY.clone();
        this._radius = this.RADIUS;
    }

    move(): void {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
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
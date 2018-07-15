import {Vector2D} from "../model/Utils";


export class BallView {
    readonly RADIUS: number = 10;
    readonly COLOR: string = 'white';
    readonly BORDER_WIDTH: number = 1;

    private _radius: number = this.RADIUS;
    private _lastPosition: Vector2D = new Vector2D(0, 0);

    private context: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
    }

    draw(position: Vector2D): void {
        this.context.beginPath();
        this.context.arc(position.x, position.y, this._radius - this.BORDER_WIDTH, 0, 2 * Math.PI, false);
        this.context.fillStyle = this.COLOR;
        this.context.fill();
        this.context.strokeStyle = "grey";
        this.context.lineWidth = this.BORDER_WIDTH;
        this.context.stroke();
    }

    get lastPosition(): Vector2D {
        return this._lastPosition;
    }

    set lastPosition(value: Vector2D) {
        this._lastPosition = value.clone();
    }

    get radius(): number {
        return this._radius;
    }
}
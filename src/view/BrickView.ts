import {Vector2D} from "../Utils/Utils";


export class BrickView {
    readonly BORDER_WIDTH: number = 4;

    private _topLeftPoint: Vector2D = new Vector2D(0, 0);
    private _width: number = 75;
    private _height: number = 20;
    private _alive: boolean;
    private context : CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
    }

    draw(): void {
        let gradient = this.context.createLinearGradient(0, 0, 640, 0);
        gradient.addColorStop(0, "#AFC7CE");
        gradient.addColorStop(1, "#1C6074");

        this.context.fillStyle = gradient;
        this.context.lineWidth = this.BORDER_WIDTH;
        this.context.fillRect(this._topLeftPoint.x, this._topLeftPoint.y, this._width, this._height);
        this.context.strokeRect(this._topLeftPoint.x + this.BORDER_WIDTH / 2,
            this._topLeftPoint.y + this.BORDER_WIDTH / 2,
            this._width - this.BORDER_WIDTH,
            this._height - this.BORDER_WIDTH);
    }

    get topLeftPoint(): Vector2D {
        return this._topLeftPoint;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get alive(): boolean {
        return this._alive;
    }

    set alive(value: boolean) {
        this._alive = value;
    }
}
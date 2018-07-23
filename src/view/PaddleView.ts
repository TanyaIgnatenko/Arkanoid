import {Vector2D} from "../Utils/Utils";


export class PaddleView {
    readonly COLOR: string = '#AC7548';
    readonly BORDER_WIDTH: number = 3;

    private _width: number = 100;
    private _height: number = 20;
    private _lastTopLeftPosition: Vector2D = new Vector2D(0, -this.height);

    private context;

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
    }

    draw(topLeftPosition: Vector2D): void {
        this.context.clearRect(this._lastTopLeftPosition.x,
                               this._lastTopLeftPosition.y,
                               this._width, this._height);

        this.context.fillStyle = this.COLOR;
        this.context.strokeStyle = "#765031";
        this.context.lineWidth = this.BORDER_WIDTH;
        this.context.fillRect(topLeftPosition.x, topLeftPosition.y, this._width, this._height);
        this.context.strokeRect(topLeftPosition.x + this.BORDER_WIDTH / 2,
            topLeftPosition.y + this.BORDER_WIDTH / 2,
            this._width - this.BORDER_WIDTH,
            this._height - this.BORDER_WIDTH);
    }

    get lastTopLeftPosition(): Vector2D {
        return this._lastTopLeftPosition;
    }

    set lastTopLeftPosition(value: Vector2D) {
        this._lastTopLeftPosition = value.clone();
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }
}
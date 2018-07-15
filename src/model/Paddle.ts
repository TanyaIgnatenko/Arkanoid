import {Direction, Vector2D} from "./Utils";

export default class Paddle {
    readonly SPEED_X: number = 10;

    private _topCenterPosition: Vector2D;
    private _width: number = 100;
    private _height: number = 20;
    private _direction: Direction = Direction.None;

    private borders: { leftBorder: number, rightBorder: number, topBorder: number, bottomBorder: number };

    constructor(borders: { leftBorder: number, rightBorder: number, topBorder: number, bottomBorder: number }) {
        this.borders = borders;

        this.reset();
    }

    reset(): void {
        this._topCenterPosition = new Vector2D(
            this.borders.rightBorder / 2,
            this.borders.bottomBorder - this._height - 10
        );
    }

    move(): void {
        if (this._direction === Direction.Left) {
            this.topCenterPosition.x = Math.max(this.topCenterPosition.x - this.SPEED_X,
                this.borders.leftBorder + this.width / 2);
        } else if (this._direction === Direction.Right) {
            this.topCenterPosition.x = Math.min(this.topCenterPosition.x + this.SPEED_X,
                this.borders.rightBorder - this._width / 2);
        }
    }

    get topLeftPosition(): Vector2D {
        return new Vector2D(this.topCenterPosition.x - this.width / 2, this.topCenterPosition.y);
    }

    get topCenterPosition(): Vector2D {
        return this._topCenterPosition;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    set topCenterPosition(value: Vector2D) {
        this._topCenterPosition = value.clone();
    }

    set direction(value: Direction) {
        this._direction = value;
    }
}
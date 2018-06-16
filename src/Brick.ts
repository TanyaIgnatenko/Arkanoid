import {CollisionType, Segment, Vector2D} from "./Utils";
import Ball from "./Ball";

export default class Brick {
    private _topLeftPoint: Vector2D = {x:0, y:0};
    private _width: number = 75;
    private _height: number = 20;
    private livesCount: number = 1;

    readonly COLOR: string = "#F74F16";

    private _alive: boolean = true;
    private _cost: number = 1;

    private drawContext: CanvasRenderingContext2D;

    constructor(drawContext: CanvasRenderingContext2D) {
        this.drawContext = drawContext;
    }

    draw(): void {
        this.drawContext.fillStyle = this.COLOR;
        this.drawContext.fillRect(this._topLeftPoint.x, this._topLeftPoint.y, this._width, this._height);
        this.drawContext.strokeRect(this._topLeftPoint.x, this._topLeftPoint.y, this._width, this._height);
    }

    get cost(): number {
        return this._cost;
    }

    get alive(): boolean {
        return this._alive;
    }

    set alive(value: boolean) {
        this._alive = value;
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

    private checkHorizontalCollision(horizontalSegment: Segment, line: Segment): boolean {
        const x1: number = line.startPoint.x;
        const x2: number = line.endPoint.x;
        const y1: number = line.startPoint.y;
        const y2: number = line.endPoint.y;

        if(y1 === y2) return false;

        const intersectionY: number = horizontalSegment.startPoint.y;
        const intersectionX: number = ((x2 - x1) * intersectionY + (x1 * y2 - x2 * y1)) / (y2 - y1);

        return (intersectionY <= y1 && intersectionY >= y2 ||
            intersectionY <= y2 && intersectionY >= y1) &&
            intersectionX >= horizontalSegment.startPoint.x &&
            intersectionX <= horizontalSegment.endPoint.x;
    }

    private checkVerticalCollision(verticalSegment: Segment, line: Segment): boolean {
        const x1: number = line.startPoint.x;
        const x2: number = line.endPoint.x;
        const y1: number = line.startPoint.y;
        const y2: number = line.endPoint.y;

        if(x1 === x2) return false;

        const intersectionX: number = verticalSegment.startPoint.x;
        const intersectionY: number = ((y1 - y2) * intersectionX + (x1 * y2 - x2 * y1)) / (x1 - x2);

        return (intersectionX <= x1 && intersectionX >= x2 ||
            intersectionX <= x2 && intersectionX >= x1) &&
            intersectionY >= verticalSegment.startPoint.y &&
            intersectionY <= verticalSegment.endPoint.y;
    }

    calculateCollisionType(ball: Ball): CollisionType {
        const ballSpeedVector: Segment = {
            startPoint: {x: ball.position.x, y: ball.position.y},
            endPoint: {x: ball.position.x - ball.speedX, y: ball.position.y - ball.speedY}
        };
        const brickTopLine: Segment = {
            startPoint: {x: this._topLeftPoint.x, y: this._topLeftPoint.y},
            endPoint: {x: this._topLeftPoint.x + this._width, y: this._topLeftPoint.y}
        };
        const brickBottomLine: Segment = {
            startPoint: {x: this._topLeftPoint.x, y: this._topLeftPoint.y + this._height},
            endPoint: {x: this._topLeftPoint.x + this._width, y: this._topLeftPoint.y + this._height}
        };
        const brickLeftLine: Segment = {
            startPoint: {x: this._topLeftPoint.x, y: this._topLeftPoint.y},
            endPoint: {x: this._topLeftPoint.x, y: this._topLeftPoint.y + this._height}
        };
        const brickRightLine: Segment = {
            startPoint: {x: this._topLeftPoint.x + this._width, y: this._topLeftPoint.y},
            endPoint: {x: this._topLeftPoint.x + this._width, y: this._topLeftPoint.y + this._height}
        };

        if (this.checkHorizontalCollision(brickTopLine, ballSpeedVector)) return CollisionType.Horizontal;
        if (this.checkHorizontalCollision(brickBottomLine, ballSpeedVector)) return CollisionType.Horizontal;
        if (this.checkVerticalCollision(brickLeftLine, ballSpeedVector)) return CollisionType.Vertical;
        if (this.checkVerticalCollision(brickRightLine, ballSpeedVector)) return CollisionType.Vertical;
        return CollisionType.None;
    }
}
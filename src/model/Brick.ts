import {CollisionType, Segment, Vector2D} from "./Utils";
import Ball from "./Ball";

export default class Brick {
    private _width: number;
    private _height: number;
    private _topLeftPoint: Vector2D;
    private _topRightPoint: Vector2D;
    private _bottomLeftPoint: Vector2D;
    private _bottomRightPoint: Vector2D;
    private livesCount: number = 1;

    private _alive: boolean = true;
    private _cost: number = 1;

    constructor(topLeftPoint: Vector2D, width: number, height: number) {
        this._width = width;
        this._height = height;
        this._topLeftPoint = topLeftPoint.clone();
        this._topRightPoint = topLeftPoint.plus(new Vector2D(this._width, 0));
        this._bottomLeftPoint = topLeftPoint.plus(new Vector2D(0, this._height));
        this._bottomRightPoint = topLeftPoint.plus(new Vector2D(this._width, this._height));
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
            startPoint: ball.position.minus(ball.velocity),
            endPoint:  ball.position
        };

        const ballRadiusX : Vector2D = new Vector2D(ball.radius, 0);
        const ballRadiusY : Vector2D = new Vector2D(0, ball.radius);

        const brickTopLine: Segment = {
            startPoint: this._topRightPoint.minus(ballRadiusY),
            endPoint: this._topRightPoint.minus(ballRadiusY)
        };
        const brickBottomLine: Segment = {
            startPoint: this._bottomLeftPoint.plus(ballRadiusY),
            endPoint: this._topRightPoint.plus(ballRadiusY)
        };
        const brickLeftLine: Segment = {
            startPoint: this._topLeftPoint.minus(ballRadiusX),
            endPoint: this._bottomLeftPoint.minus(ballRadiusX)
        };
        const brickRightLine: Segment = {
            startPoint: this._topRightPoint.plus(ballRadiusX),
            endPoint: this._bottomRightPoint.plus(ballRadiusX)
        };

        if (this.checkHorizontalCollision(brickTopLine, ballSpeedVector)) return CollisionType.Horizontal;
        if (this.checkHorizontalCollision(brickBottomLine, ballSpeedVector)) return CollisionType.Horizontal;
        if (this.checkVerticalCollision(brickLeftLine, ballSpeedVector)) return CollisionType.Vertical;
        if (this.checkVerticalCollision(brickRightLine, ballSpeedVector)) return CollisionType.Vertical;

        if(ball.position.distance(this._topLeftPoint) <= ball.radius) return CollisionType.Corner;
        if(ball.position.distance(this._topRightPoint) <= ball.radius) return CollisionType.Corner;
        if(ball.position.distance(this._bottomLeftPoint) <= ball.radius) return CollisionType.Corner;
        if(ball.position.distance(this._bottomRightPoint) <= ball.radius) return CollisionType.Corner;

        return CollisionType.None;
    }
}
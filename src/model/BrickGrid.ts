import {BrickGridNumber, CollisionType, GridSize, SphericalObject, Vector2D} from "./Utils";
import Brick from "./Brick";
import Ball from "./Ball";
import {Observable, ObservableImpl} from "./Observer";

export default class BrickGrid {
    private startPosition: Vector2D;
    private gridSize: GridSize;
    private bricks: Array<Array<Brick>> = new Array<Array<Brick>>();
    private _bricksLeftCount: number;

    private _pointsChangeNotifier: ObservableImpl<number> = new ObservableImpl<number>();
    private _bricksCountChangeNotifier: ObservableImpl<number> = new ObservableImpl<number>();
    private _brickDestructionNotifier: ObservableImpl<BrickGridNumber> = new ObservableImpl<BrickGridNumber>();

    constructor(startPosition: Vector2D, gridSize: GridSize) {
        this.startPosition = startPosition;
        this.gridSize = gridSize;

        this.bricks = new Array(this.gridSize.rowCount);
        for (let row = 0; row < this.gridSize.rowCount; ++row) {
            this.bricks[row] = new Array(this.gridSize.columnCount);
            for (let col = 0; col < this.gridSize.columnCount; ++col) {
                this.bricks[row][col] = new Brick();
                this.bricks[row][col].topLeftPoint.x = startPosition.x + col * this.bricks[row][col].width;
                this.bricks[row][col].topLeftPoint.y = startPosition.y + row * this.bricks[row][col].height;
            }
        }
        this._bricksLeftCount = this.gridSize.rowCount * this.gridSize.columnCount;
    }

    recoverAllBricks() : void {
        for (let row = 0; row < this.gridSize.rowCount; ++row) {
            this.bricks[row] = new Array(this.gridSize.columnCount);
            for (let col = 0; col < this.gridSize.columnCount; ++col) {
                this.bricks[row][col].alive = true;
            }
        }
    }

    checkBallCollisions(ball: Ball): void {
        for (let row = 0; row < this.gridSize.rowCount; ++row) {
            for (let col = 0; col < this.gridSize.columnCount; ++col) {
                if (this.bricks[row][col].alive) {
                    const collisionType: CollisionType = this.bricks[row][col].calculateCollisionType(ball);

                    if (collisionType === CollisionType.None) continue;

                    --this._bricksLeftCount;
                    this.bricks[row][col].alive = false;
                    this._pointsChangeNotifier.notify(this.bricks[row][col].cost);
                    this._bricksCountChangeNotifier.notify(this._bricksLeftCount);
                    this._brickDestructionNotifier.notify({row, col});

                    if (collisionType === CollisionType.Vertical) {
                        ball.velocity.x = -ball.velocity.x;
                    } else if (collisionType === CollisionType.Horizontal) {
                        ball.velocity.y = -ball.velocity.y;
                    }
                }
            }
        }
    }

    get bricksLeftCount(): number {
        return this._bricksLeftCount;
    }

    get pointsChangeNotifier(): Observable<number> {
        return this._pointsChangeNotifier;
    }

    get bricksCountChangeNotifier(): Observable<number> {
        return this._bricksCountChangeNotifier;
    }

    get brickDestructionNotifier(): Observable<BrickGridNumber> {
        return this._brickDestructionNotifier;
    }
}

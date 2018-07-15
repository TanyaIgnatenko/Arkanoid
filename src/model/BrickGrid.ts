import {BrickGridNumber, CollisionType, GridSize, Vector2D} from "./Utils";
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

        const brickWidth:number = 75;
        const brickHeight:number = 20;

        this.bricks = new Array(this.gridSize.rowCount);
        for (let row = 0; row < this.gridSize.rowCount; ++row) {
            this.bricks[row] = new Array(this.gridSize.columnCount);
            for (let col = 0; col < this.gridSize.columnCount; ++col) {
                this.bricks[row][col] = new Brick(new Vector2D(startPosition.x + col * brickWidth,
                                                               startPosition.y + row * brickHeight),
                                                  brickWidth, brickHeight);
            }
        }
        this._bricksLeftCount = this.gridSize.rowCount * this.gridSize.columnCount;
    }

    recoverAllBricks() : void {
        for (let row = 0; row < this.gridSize.rowCount; ++row) {
            for (let col = 0; col < this.gridSize.columnCount; ++col) {
                this.bricks[row][col].alive = true;
            }
        }
        this._bricksLeftCount = this.gridSize.rowCount * this.gridSize.columnCount;
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
                        ball.velocity = new Vector2D(-ball.velocity.x, ball.velocity.y);
                    } else if (collisionType === CollisionType.Horizontal) {
                        ball.velocity = new Vector2D(ball.velocity.x, -ball.velocity.y);
                    } else if(collisionType === CollisionType.Corner) {
                        ball.velocity = ball.velocity.multiply(-1);
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

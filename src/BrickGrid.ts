import {CollisionType, GridSize, Vector2D} from "./Utils";
import Brick from "./Brick";
import {WinLogic} from "./WinLogic";
import Ball from "./Ball";

export default class BrickGrid {
    private startPosition: Vector2D;
    private gridSize: GridSize;
    private _cost: number;
    private drawContext: CanvasRenderingContext2D;
    private bricks: Array<Array<Brick>> = new Array<Array<Brick>>();
    private winLogic: WinLogic;

    constructor(startPosition: Vector2D, gridSize: GridSize, drawContext: CanvasRenderingContext2D, winLogic: WinLogic) {
        this.startPosition = startPosition;
        this.gridSize = gridSize;
        this.drawContext = drawContext;
        this.winLogic = winLogic;

        this.bricks = new Array(this.gridSize.columnCount);
        for (let row = 0; row < this.gridSize.rowCount; ++row) {
            this.bricks[row] = new Array(this.gridSize.columnCount);
            for (let col = 0; col < this.gridSize.columnCount; ++col) {
                this.bricks[row][col] = new Brick(drawContext);
            }
        }

        this._cost = 0;
        for (let row = 0; row < this.gridSize.rowCount; ++row) {
            for (let col = 0; col < this.gridSize.columnCount; ++col) {
                this.bricks[row][col].topLeftPoint.x = startPosition.x + col * this.bricks[row][col].width;
                this.bricks[row][col].topLeftPoint.y = startPosition.y + row * this.bricks[row][col].height;
                this._cost += this.bricks[row][col].cost;
            }
        }
    }

    draw(): void {
        this.drawContext.lineWidth = 4;
        this.drawContext.strokeStyle = "#eeeeee";
        for (let row = 0; row < this.gridSize.rowCount; ++row) {
            for (let col = 0; col < this.gridSize.columnCount; ++col) {
                if (this.bricks[row][col].alive) {
                    this.bricks[row][col].draw();
                }
            }
        }
    }

    checkBallCollisions(ball: Ball): void {
        for (let row = 0; row < this.gridSize.rowCount; ++row) {
            for (let col = 0; col < this.gridSize.columnCount; ++col) {
                if (this.bricks[row][col].alive) {
                    const collisionType: CollisionType = this.bricks[row][col].calculateCollisionType(ball);

                    if (collisionType === CollisionType.None) continue;

                    this.bricks[row][col].alive = false;
                    ++this.winLogic.score;
                    this.winLogic.checkWinCondition();

                    if (collisionType === CollisionType.Vertical) {
                        ball.speedX = -ball.speedX;
                    } else if (collisionType === CollisionType.Horizontal) {
                        ball.speedY = -ball.speedY;
                    }
                }
            }
        }
    }

    get cost(): number {
        return this._cost;
    }
}

import {CollisionType, GridSize, Vector2D} from "./Utils";
import Brick from "./Brick";
import {WinLogic} from "./WinLogic";
import Ball from "./Ball";

export default class BrickGrid {
    private startPosition: Vector2D;
    private gridSize: GridSize;
    private _cost: number;
    private drawContext: CanvasRenderingContext2D;
    private bricks: Array<Array<Brick>>;
    private winLogic: WinLogic;

    constructor(startPosition: Vector2D, gridSize: GridSize, drawContext: CanvasRenderingContext2D, winLogic: WinLogic) {
        this.startPosition = startPosition;
        this.gridSize = gridSize;
        this.drawContext = drawContext;
        this.winLogic = winLogic;

        this._cost = 0;
        for (let col = 0; col < this.gridSize.columnCount; ++col) {
            for (let row = 0; row < this.gridSize.rowCount; ++row) {
                bricks[col][row] = new Brick(drawContext);
                bricks[col][row].topLeftPoint.x = startPosition.x + col * bricks[col][row].width;
                bricks[col][row].topLeftPoint.y = startPosition.y + row * bricks[col][row].height;
                this._cost += bricks[col][row].cost;
            }
        }
    }

    draw(): void {
        this.drawContext.lineWidth = 4;
        this.drawContext.strokeStyle = "#eeeeee";
        for (let col = 0; col < this.gridSize.columnCount; ++col) {
            for (let row = 0; row < this.gridSize.rowCount; ++row) {
                if (bricks[col][row].alive) {
                    bricks[col][row].draw();
                }
            }
        }
    }

    checkBallCollisions(ball: Ball): void {
        for(let col = 0; col < this.gridSize.columnCount; ++col){
            for(let row = 0; row < this.gridSize.rowCount; ++row){
                if(bricks[col][row].alive) {
                    const collisionType: CollisionType = bricks[col][row].calculateBallCollisionType(ball);

                    if(collisionType === CollisionType.None) continue;

                    bricks[col][row].alive = false;
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

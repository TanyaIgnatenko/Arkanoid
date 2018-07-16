import {GridSize, Vector2D} from "../model/Utils";
import Brick from "../model/Brick";
import {BrickView} from "./BrickView";


export class BricksGridView {
    private _startPosition: Vector2D;
    private gridSize: GridSize;
    private bricks: Array<Array<BrickView>>;
    private context: CanvasRenderingContext2D;
    private _width: number;
    private _height: number;

    constructor(context: CanvasRenderingContext2D, gridSize: GridSize, startPosition: Vector2D) {
        this.context = context;
        this._startPosition = startPosition;
        this.gridSize = gridSize;

        this.bricks = new Array(this.gridSize.rowCount);
        for (let row = 0; row < this.gridSize.rowCount; ++row) {
            this.bricks[row] = new Array(this.gridSize.columnCount);
            for (let col = 0; col < this.gridSize.columnCount; ++col) {
                let brick : BrickView = new BrickView(context);
                brick.topLeftPoint.x = startPosition.x + col * brick.width;
                brick.topLeftPoint.y = startPosition.y + row * brick.height;
                this.bricks[row][col] = brick;
            }
        }

        this._width = gridSize.columnCount * this.bricks[0][0].width;
        this._height = gridSize.rowCount * this.bricks[0][0].height;
    }

    draw(): void {
        this.context.clearRect(this._startPosition.x,
                               this._startPosition.y,
                               this._width, this._height);

        this.context.strokeStyle = "#eeeeee";
        for (let row = 0; row < this.gridSize.rowCount; ++row) {
            for (let col = 0; col < this.gridSize.columnCount; ++col) {
                if (this.bricks[row][col].alive) {
                    this.bricks[row][col].draw();
                }
            }
        }
    }

    destroyBrick(brickGridNumber): void {
        this.bricks[brickGridNumber.row][brickGridNumber.col].alive = false;
    }

    reanimateAllBricks(): void {
        for (let row = 0; row < this.gridSize.rowCount; ++row) {
            for (let col = 0; col < this.gridSize.columnCount; ++col) {
                this.bricks[row][col].alive = true;
            }
        }
    }

    get startPosition(): Vector2D {
        return this._startPosition;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }
}
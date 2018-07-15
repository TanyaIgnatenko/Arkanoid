import {BallView} from "./BallView";
import {PaddleView} from "./PaddleView";
import {Observable, ObservableImpl, Observer} from "../model/Observer";
import {BrickGridNumber, GridSize, Key, Vector2D} from "../model/Utils";
import {BricksGridView} from "./BricksGridView";

export class GameView {
    readonly BRICK_GRID_SIZE: GridSize = {rowCount: 3, columnCount: 8};
    readonly BRICKS_START_POSITION: Vector2D = new Vector2D(50, 30);

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private _width: number;
    private _height: number;

    private ball: BallView = new BallView(this.context);
    private paddle: PaddleView = new PaddleView(this.context);
    private bricksGrid: BricksGridView = new BricksGridView(this.context, this.BRICK_GRID_SIZE, this.BRICKS_START_POSITION);

    private _ballPositionChangeHandler: BallPositionChangeHandler;
    private _paddlePositionChangeHandler: PaddlePositionChangeHandler;
    private _bricksGridChangeHandler: BricksGridChangeHandler;
    private _scoreChangeHandler: ScoreChangeHandler;
    private _livesCountChangeHandler: LivesCountChangeHandler;
    private _bricksGridRecoveryHandler: BricksGridRecoveryHandler;

    private _keyboardEventNotifier: ObservableImpl<Key> = new ObservableImpl<Key>();
    private _mouseEventNotifier: ObservableImpl<number> = new ObservableImpl<number>();

    private scorePositionBottomLeft: Vector2D = new Vector2D(8, 20);
    private livesCountPositionBottomLeft: Vector2D;
    private scoreTextWidth: number = 100;
    private scoreTextHeight: number = 16;
    private livesCountTextWidth: number = 65;
    private livesCountTextHeight: number = 16;

    private borders: { leftBorder: number, rightBorder: number, topBorder: number, bottomBorder: number };

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this._width = this.canvas.width;
        this._height = this.canvas.height;

        this.borders = {
            leftBorder: 0,
            rightBorder: this._width,
            topBorder: 0,
            bottomBorder: this._height
        };

        this.ball = new BallView(this.context);
        this.paddle = new PaddleView(this.context);
        this.bricksGrid = new BricksGridView(this.context, this.BRICK_GRID_SIZE, this.BRICKS_START_POSITION);

        this.livesCountPositionBottomLeft = new Vector2D(this.borders.rightBorder - 65, 20);

        this._scoreChangeHandler = new ScoreChangeHandler(
            score => {
                this.context.clearRect(this.scorePositionBottomLeft.x,
                                    this.scorePositionBottomLeft.y - this.scoreTextHeight,
                                       this.scoreTextWidth, this.scoreTextHeight);
                this.drawScore(score);
            });

        this._livesCountChangeHandler = new LivesCountChangeHandler(
        livesCount => {
            this.context.clearRect(this.livesCountPositionBottomLeft.x,
                                this.livesCountPositionBottomLeft.y - this.livesCountTextHeight,
                                   this.livesCountTextWidth, this.livesCountTextHeight);
            this.drawLivesCount(livesCount);
        });

        this._ballPositionChangeHandler = new BallPositionChangeHandler(
            position => {
                this.context.clearRect(this.ball.lastPosition.x - this.ball.radius,
                                       this.ball.lastPosition.y - this.ball.radius,
                                       2 * this.ball.radius, 2 * this.ball.radius);
                this.ball.draw(position);
                this.ball.lastPosition = position;
            }
        );

        this._paddlePositionChangeHandler = new PaddlePositionChangeHandler(
            topLeftPosition => {
                this.context.clearRect(this.paddle.lastTopLeftPosition.x,
                                       this.paddle.lastTopLeftPosition.y,
                                       this.paddle.width, this.paddle.height);
                this.paddle.draw(topLeftPosition);
                this.paddle.lastTopLeftPosition = topLeftPosition;
            }
        );

        this._bricksGridChangeHandler = new BricksGridChangeHandler(
            destroyedBrickNumber => {
                this.bricksGrid.destroyBrick(destroyedBrickNumber);
                this.context.clearRect(this.bricksGrid.startPosition.x,
                                       this.bricksGrid.startPosition.y,
                                       this.bricksGrid.width, this.bricksGrid.height);
                this.bricksGrid.draw();
            }
        );

        this._bricksGridRecoveryHandler = new BricksGridRecoveryHandler(
            () => {
                this.context.clearRect(this.bricksGrid.startPosition.x,
                    this.bricksGrid.startPosition.y,
                    this.bricksGrid.width, this.bricksGrid.height);
                this.bricksGrid.reanimateAllBricks();
                this.bricksGrid.draw();
            }
        );
    }

    start(): void {
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        document.addEventListener('mousemove', this.mouseMoveHandler);
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    private drawScore(score: number): void {
        this.context.font = '16px Arial, sans-serif';
        this.context.fillStyle = 'white';
        this.context.fillText('Score: ' + score, this.scorePositionBottomLeft.x, this.scorePositionBottomLeft.y);
    }

    private drawLivesCount(livesCount: number): void {
        this.context.font = '16px Arial, sans-serif';
        this.context.fillStyle = 'white';
        this.context.fillText('Lives: ' + livesCount, this.livesCountPositionBottomLeft.x, this.livesCountPositionBottomLeft.y);
    }


    get ballPositionChangeHandler(): BallPositionChangeHandler {
        return this._ballPositionChangeHandler;
    }

    get paddlePositionChangeHandler(): PaddlePositionChangeHandler {
        return this._paddlePositionChangeHandler;
    }

    get bricksGridChangeHandler(): BricksGridChangeHandler {
        return this._bricksGridChangeHandler;
    }

    get scoreChangeHandler(): ScoreChangeHandler {
        return this._scoreChangeHandler;
    }

    get livesCountChangeHandler(): LivesCountChangeHandler {
        return this._livesCountChangeHandler;
    }

    get bricksGridRecoveryHandler(): BricksGridRecoveryHandler {
        return this._bricksGridRecoveryHandler;
    }

    keyDownHandler(e: KeyboardEvent): void {
        if (e.keyCode === 37) {
            this._keyboardEventNotifier.notify(Key.LeftArrow);
        } else if (e.keyCode === 39) {
            this._keyboardEventNotifier.notify(Key.RightArrow);
        }
    }

    keyUpHandler(e: KeyboardEvent): void {
        if (e.keyCode === 37 || e.keyCode === 39) {
            this._keyboardEventNotifier.notify(Key.None);
        }
    }

    mouseMoveHandler(e: MouseEvent) {
        let mouseX: number = e.clientX - this.context.canvas.offsetLeft;
        if (mouseX >= this.borders.leftBorder + this.paddle.width / 2 &&
            mouseX <= this.borders.rightBorder - this.paddle.width / 2) {
            this._mouseEventNotifier.notify(mouseX);
        }
    }

    get keyboardEventNotifier(): Observable<Key> {
        return this._keyboardEventNotifier;
    }

    get mouseEventNotifier(): Observable<number> {
        return this._mouseEventNotifier;
    }
}

class BallPositionChangeHandler implements Observer<Vector2D> {
    private onUpdate: (Vector2D) => void;

    constructor(onUpdate: (Vector2D) => void) {
        this.onUpdate = onUpdate;
    }

    update(position: Vector2D): void {
        this.onUpdate(position);
    }
}

class PaddlePositionChangeHandler implements Observer<Vector2D> {
    private onUpdate: (Vector2D) => void;

    constructor(onUpdate: (Vector2D) => void) {
        this.onUpdate = onUpdate;
    }

    update(position: Vector2D): void {
        this.onUpdate(position);
    }
}

class BricksGridChangeHandler implements Observer<BrickGridNumber> {
    private onUpdate: (BrickGridNumber) => void;

    constructor(onUpdate: (BrickGridNumber) => void) {
        this.onUpdate = onUpdate;
    }

    update(destroyedBrickNumber: BrickGridNumber): void {
        this.onUpdate(destroyedBrickNumber);
    }
}

class ScoreChangeHandler implements Observer<number> {
    private onUpdate: (number) => void;

    constructor(onUpdate: (number) => void) {
        this.onUpdate = onUpdate;
    }

    update(score: number): void {
        this.onUpdate(score);
    }
}

class LivesCountChangeHandler implements Observer<number> {
    private onUpdate: (number) => void;

    constructor(onUpdate: (number) => void) {
        this.onUpdate = onUpdate;
    }

    update(livesCount: number): void {
        this.onUpdate(livesCount);
    }
}

class BricksGridRecoveryHandler implements Observer<void> {
    private onUpdate: () => void;

    constructor(onUpdate: () => void) {
        this.onUpdate = onUpdate;
    }

    update(): void {
        this.onUpdate();
    }
}
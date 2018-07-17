import {BallView} from "./BallView";
import {PaddleView} from "./PaddleView";
import {Observable, ObservableImpl, Observer} from "../model/Observer";
import {BrickGridNumber, GridSize, Key, Vector2D} from "../model/Utils";
import {BricksGridView} from "./BricksGridView";
import {Layout} from "./Components/Layout";
import {Padding} from "./Components/Padding";
import {Button} from "./Components/Button";
import {Text} from "./Components/Text";
import {HorizontalAlignment} from "./Components/Alignment";

export class GameView {
    readonly BRICK_GRID_SIZE: GridSize = {rowCount: 3, columnCount: 8};
    readonly BRICKS_START_POSITION: Vector2D = new Vector2D(50, 42);

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
    private _pauseGameNotifier: ObservableImpl<void> = new ObservableImpl<void>();
    private _resumeGameNotifier: ObservableImpl<void> = new ObservableImpl<void>();

    private scorePositionBottomLeft: Vector2D = new Vector2D(15, 20);
    private footerPositionBottomLeft: Vector2D;
    private livesCountPositionBottomLeft: Vector2D;
    private scoreTextWidth: number = 100;
    private scoreTextHeight: number = 16;
    private livesCountTextWidth: number = 65;
    private livesCountTextHeight: number = 16;

    private menu: Layout;
    // private menuWidth = 350;
    // private menuHeight = 170;

    private borders: { leftBorder: number, rightBorder: number, topBorder: number, bottomBorder: number };

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this._width = this.canvas.width;
        this._height = this.canvas.height;

        this.borders = {
            leftBorder: 0,
            rightBorder: this._width,
            topBorder: 30,
            bottomBorder: this._height - 20
        };

        this.ball = new BallView(this.context);
        this.paddle = new PaddleView(this.context);
        this.bricksGrid = new BricksGridView(this.context, this.BRICK_GRID_SIZE, this.BRICKS_START_POSITION);

        this.footerPositionBottomLeft = new Vector2D(15, this._height - 7);
        this.drawFooter();

        this.livesCountPositionBottomLeft = new Vector2D(this.borders.rightBorder - 65, 20);

        this._scoreChangeHandler = new ScoreChangeHandler(score => this.drawScore(score));

        this._livesCountChangeHandler = new LivesCountChangeHandler(livesCount => this.drawLivesCount(livesCount));

        this._ballPositionChangeHandler = new BallPositionChangeHandler(
            position => {
                this.ball.draw(position);
                this.ball.lastPosition = position;
            }
        );

        this._paddlePositionChangeHandler = new PaddlePositionChangeHandler(
            topLeftPosition => {
                this.paddle.draw(topLeftPosition);
                this.paddle.lastTopLeftPosition = topLeftPosition;
            }
        );

        this._bricksGridChangeHandler = new BricksGridChangeHandler(
            destroyedBrickNumber => {
                this.bricksGrid.destroyBrick(destroyedBrickNumber);
                this.bricksGrid.draw();
            }
        );

        this._bricksGridRecoveryHandler = new BricksGridRecoveryHandler(
            () => {
                this.bricksGrid.reanimateAllBricks();
                this.bricksGrid.draw();
            }
        );

        this.createMenu();
    }

    start(): void {
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        document.addEventListener('mousemove', this.mouseMoveHandler);
    }

    drawFooter(): void {
        this.context.fillStyle = 'rgba(36, 41, 46, 0.6)';
        this.context.fillRect(0, this.borders.bottomBorder, this._width, this._height - this.borders.bottomBorder);
        this.context.fillStyle = 'white';
        this.context.font = '10px Arial, sans-serif';
        this.context.fillText("Press 'ESC' to show menu",
                              this.footerPositionBottomLeft.x,
                              this.footerPositionBottomLeft.y);
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    private drawScore(score: number): void {
        this.context.clearRect(0, 0, this._width/2, 30);
        this.context.fillStyle = 'rgba(36, 41, 46, 0.6)';
        this.context.fillRect(0, 0, this._width/2, 30);
        this.context.font = '14px Arial, sans-serif';
        this.context.fillStyle = 'white';
        this.context.fillText('Score: ' + score, this.scorePositionBottomLeft.x, this.scorePositionBottomLeft.y);
    }

    private drawLivesCount(livesCount: number): void {
        this.context.clearRect(this._width/2, 0, this._width/2, 30);
        this.context.fillStyle =  'rgba(36, 41, 46, 0.6)';
        this.context.fillRect(this._width/2, 0, this._width/2, 30);
        this.context.font = '14px Arial, sans-serif';
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

    private createMenu() {
        this.menu = new Layout(this.context);
        this.menu.setPadding(new Padding(20, 20, 20, 20));

        const resumeText = new Text(this.context, "Resume");
        resumeText.setFontSize(30);
        resumeText.setTextAlignment(HorizontalAlignment.Center);

        const restartText = new Text(this.context, "Restart");
        restartText.setFontSize(30);
        restartText.setTextAlignment(HorizontalAlignment.Center);

        const mainMenuText = new Text(this.context, "Main menu");
        mainMenuText.setFontSize(30);
        mainMenuText.setTextAlignment(HorizontalAlignment.Center);

        let resumeButton = new Button(this.context, resumeText);
        let restartButton = new Button(this.context, restartText);
        let mainMenuButton = new Button(this.context, mainMenuText);

        resumeButton.setBackgroundColor("yellow");
        restartButton.setBackgroundColor("red");
        mainMenuButton.setBackgroundColor("green");

        this.menu.addComponent(resumeButton);
        this.menu.addComponent(restartButton);
        this.menu.addComponent(mainMenuButton);
    }

    private drawMenu(): void {
        this.context.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.context.fillRect(0, 0, this._width, this._height);
        // this.context.fillStyle = 'rgba(36, 41, 46, 1)';

        let menuTopLeftPoint = new Vector2D(175, 115);
        this.menu.draw(menuTopLeftPoint);
    }

    keyDownHandler(e: KeyboardEvent): void {
        if (e.keyCode === 37) {
            this._keyboardEventNotifier.notify(Key.LeftArrow);
        } else if (e.keyCode === 39) {
            this._keyboardEventNotifier.notify(Key.RightArrow);
        } else if(e.keyCode === 27) {
            this._pauseGameNotifier.notify(null);
            this.drawMenu();
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

    get pauseGameNotifier(): Observable<void> {
        return this._pauseGameNotifier;
    }

    get resumeGameNotifier(): Observable<void> {
        return this._resumeGameNotifier;
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
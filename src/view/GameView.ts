import {Button} from "./Components/Button";
import {TextOption} from "./Components/Option";
import {BallView} from "./BallView";
import {PaddleView} from "./PaddleView";
import {Observable, ObservableImpl, Observer} from "../model/Observer";
import {BrickGridNumber, GridSize, Key, Size, Vector2D} from "../model/Utils";
import {BricksGridView} from "./BricksGridView";
import {Layout} from "./Components/Layout";
import {Padding} from "./Components/Padding";
import {Text} from "./Components/Text";
import {HorizontalAlignment} from "./Components/Alignment";
import {Menu} from "./Components/Menu";
import {Component} from "./Components/Component";
import {Redrawer} from "./Components/Redrawer";

export class GameView implements Redrawer{
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
    private _restartGameNotifier: ObservableImpl<void> = new ObservableImpl<void>();

    private scorePositionBottomLeft: Vector2D = new Vector2D(15, 20);
    private footerPositionBottomLeft: Vector2D;
    private livesCountPositionBottomLeft: Vector2D;
    private scoreTextWidth: number = 100;
    private scoreTextHeight: number = 16;
    private livesCountTextWidth: number = 65;
    private livesCountTextHeight: number = 16;

    private livesCount: number;
    private score: number;

    private menu: Menu;
    // private mainMenu: Menu;
    private menuMode: boolean = false;

    private titleTopLeftPosition: Vector2D;

    private childs = new Map();


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
        // this.createMainMenu();
    }

    private createMenu() {
        this.menu = new Menu(this.context, this);

        const resumeText = new Text(this.context, "Resume");
        resumeText.setFontSize(24);
        resumeText.setAlignment(HorizontalAlignment.Center);
        resumeText.setColor("#ffffff");

        const restartText = new Text(this.context, "Restart");
        restartText.setFontSize(24);
        restartText.setAlignment(HorizontalAlignment.Center);
        restartText.setColor("#ffffff");

        const mainMenuText = new Text(this.context, "Main menu");
        mainMenuText.setFontSize(24);
        mainMenuText.setAlignment(HorizontalAlignment.Center);
        mainMenuText.setColor("#ffffff");

        const buttonPadding: Padding = new Padding(5, 10, 5, 10);
        const buttonColor: string = 'rgba(36, 41, 46, 0)';
        const buttonWidth: number = 350;

        const onResume: () => void = () => {
            this.menuMode = false;
            this.context.clearRect(0, 0, this.width, this.height);
            this.draw();
            this._resumeGameNotifier.notify(null);
        };
        const resumeOption = new TextOption(resumeText, onResume.bind(this), this.context, this.menu, true);
        resumeOption.setPadding(buttonPadding);
        resumeOption.setPreferredWidth(buttonWidth);
        resumeOption.setBackgroundColor(buttonColor);

        const onRestart: () => void = () => {
            this.menuMode = false;
            this.context.clearRect(0, 0, this.width, this.height);
            this.draw();
            this._restartGameNotifier.notify(null);
        };
        const restartOption = new TextOption(restartText, onRestart.bind(this), this.context, this.menu, false);
        restartOption.setPadding(buttonPadding);
        restartOption.setPreferredWidth(buttonWidth);
        restartOption.setBackgroundColor(buttonColor);

        const mainMenuOption = new TextOption(mainMenuText, ()=> {}, this.context, this.menu, false);
        mainMenuOption.setPadding(buttonPadding);
        mainMenuOption.setPreferredWidth(buttonWidth);
        mainMenuOption.setBackgroundColor(buttonColor);

        // resumeOption.setBackgroundColor("yellow");
        // restartOption.setBackgroundColor("red");
        // mainMenuOption.setBackgroundColor("green");

        this.menu.addOption(resumeOption);
        this.menu.addOption(restartOption);
        this.menu.addOption(mainMenuOption);

        const topLeftPoint: Vector2D = new Vector2D((this._width - this.menu.width())/2, (this.height - this.menu.height())/2);
        this.childs.set(this.menu, topLeftPoint);
    }

    // createMainMenu(): void {
    //     this.mainMenu = new Menu(this.context, this);
    //     const padding: Padding = new Padding(100, 0, 100, 0);
    //     this.mainMenu.setPadding(padding);
    //
    //     const newGameText = new Text(this.context, "New Game");
    //     newGameText.setFontSize(26);
    //     newGameText.setAlignment(HorizontalAlignment.Center);
    //     newGameText.setColor("#ffffff");
    //
    //     const bestResultsText = new Text(this.context, "Best Results");
    //     bestResultsText.setFontSize(26);
    //     bestResultsText.setAlignment(HorizontalAlignment.Center);
    //     bestResultsText.setColor("#ffffff");
    //
    //     const howToPlayText = new Text(this.context, "How to play");
    //     howToPlayText.setFontSize(26);
    //     howToPlayText.setAlignment(HorizontalAlignment.Center);
    //     howToPlayText.setColor("#ffffff");
    //
    //     const settingsText = new Text(this.context, "Settings");
    //     settingsText.setFontSize(26);
    //     settingsText.setAlignment(HorizontalAlignment.Center);
    //     settingsText.setColor("#ffffff");
    //
    //     const buttonPadding : Padding = new Padding(7, 10, 7, 10);
    //     const buttonColor: string = 'rgba(36, 41, 46, 0)';
    //     const buttonWidth : number = 350;
    //
    //     const onResume: () => void = () => {
    //         this.context.clearRect(0, 0, this.width, this.height);
    //         this.draw();
    //         this._resumeGameNotifier.notify(null);
    //     };
    //     const newGameOption = new TextOption(newGameText, onResume, this.context, this.mainMenu, true);
    //     newGameOption.setPadding(buttonPadding);
    //     newGameOption.setPreferredWidth(buttonWidth);
    //     newGameOption.setBackgroundColor(buttonColor);
    //
    //     const onRestart: () => void = () => {
    //         this.context.clearRect(0, 0, this.width, this.height);
    //         this.draw();
    //         this._restartGameNotifier.notify(null);
    //     };
    //     const bestResultsOption = new TextOption(bestResultsText, ()=> {}, this.context, this.mainMenu, false);
    //     bestResultsOption.setPadding(buttonPadding);
    //     bestResultsOption.setPreferredWidth(buttonWidth);
    //     bestResultsOption.setBackgroundColor(buttonColor);
    //
    //     const howToPlayOption = new TextOption(howToPlayText, ()=> {}, this.context, this.mainMenu, false);
    //     howToPlayOption.setPadding(buttonPadding);
    //     howToPlayOption.setPreferredWidth(buttonWidth);
    //     howToPlayOption.setBackgroundColor(buttonColor);
    //
    //     const settingsOption = new TextOption(settingsText, ()=> {}, this.context, this.mainMenu, false);
    //     settingsOption.setPadding(buttonPadding);
    //     settingsOption.setPreferredWidth(buttonWidth);
    //     settingsOption.setBackgroundColor(buttonColor);
    //
    //     // resumeOption.setBackgroundColor("yellow");
    //     // restartOption.setBackgroundColor("red");
    //     // mainMenuOption.setBackgroundColor("green");
    //
    //     this.mainMenu.addOption(newGameOption);
    //     this.mainMenu.addOption(bestResultsOption);
    //     this.mainMenu.addOption(howToPlayOption);
    //     this.mainMenu.addOption(settingsOption);
    //
    //     const topLeftPoint: Vector2D = new Vector2D((this._width - this.mainMenu.width())/2, (this.height - this.mainMenu.height())/2);
    //     this.childs.set(this.mainMenu, topLeftPoint);
    // }
    //
    // drawMainMenu(): void {
    //     this.menuMode = true;
    //     this.context.clearRect(0, 0, this.width, this.height);
    //     let menuTopLeftPoint = new Vector2D((this._width - this.mainMenu.width())/2 ,
    //         (this._height - this.mainMenu.height())/2);
    //     this.mainMenu.draw(menuTopLeftPoint);
    //
    //     const titleText = new Text(this.context, "Arkanoid");
    //     titleText.setFontSize(36);
    //     titleText.setAlignment(HorizontalAlignment.Center);
    //     titleText.setColor("#ffffff");
    //
    //     this.titleTopLeftPosition = new Vector2D((this.width - titleText.width())/2, 60);
    //
    //     titleText.draw(this.titleTopLeftPosition);
    //
    //     // this.context.fillRect(this.width - )
    // }

    private drawMenu(): void {
        let menuTopLeftPoint = new Vector2D((this._width - this.menu.width())/2 ,
            (this._height - this.menu.height())/2);
        this.menu.draw(menuTopLeftPoint);
    }

    requestRedraw(child: Component): void {
        const topLeftPoint: Vector2D = this.childs.get(child);
        child.draw(topLeftPoint);
    }

    start(): void {
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        document.addEventListener('mousemove', this.mouseMoveHandler);
        // this._pauseGameNotifier.notify(null);
        // this.drawMainMenu();
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
        this.score = score;
        this.context.clearRect(0, 0, this._width/2, 30);
        this.context.fillStyle = 'rgba(36, 41, 46, 0.6)';
        this.context.fillRect(0, 0, this._width/2, 30);
        this.context.font = '14px Arial, sans-serif';
        this.context.fillStyle = 'white';
        this.context.fillText('Score: ' + score, this.scorePositionBottomLeft.x, this.scorePositionBottomLeft.y);
    }

    private drawLivesCount(livesCount: number): void {
        this.livesCount = livesCount;
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

    draw() {
        this.paddle.draw(this.paddle.lastTopLeftPosition);
        this.ball.draw(this.ball.lastPosition);
        this.bricksGrid.draw();
        this.drawLivesCount(this.livesCount);
        this.drawScore(this.score);
        this.drawFooter();
    }

    private darkenBackground(): void {
        this.context.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.context.fillRect(0, 0, this._width, this._height);
    }

    keyDownHandler(e: KeyboardEvent): void {
        if (e.keyCode === 37) {
            this._keyboardEventNotifier.notify(Key.LeftArrow);
        } else if (e.keyCode === 39) {
            this._keyboardEventNotifier.notify(Key.RightArrow);
        } else if(e.keyCode === 27 && !this.menuMode) {
            this.menuMode = true;
            this._pauseGameNotifier.notify(null);
            this.darkenBackground();
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

    get restartGameNotifier(): Observable<void> {
        return this._restartGameNotifier;
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
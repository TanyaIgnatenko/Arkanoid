import Ball from "./Ball";
import Paddle from "./Paddle";
import BrickGrid from "./BrickGrid";
import {BrickGridNumber, Direction, GridSize, Key, Vector2D} from "../Utils/Utils";
import {Observable, Notifier, Observer} from "../Utils/Observer";
import {EventHandler} from "../Utils/EventHandler";

export class Game {
    readonly BRICK_GRID_SIZE: GridSize = {rowCount: 3, columnCount: 8};
    readonly BRICKS_START_POSITION: Vector2D = new Vector2D(50, 40);
    readonly MAGIC_NUMBER: number = 4.0;

    private borders: { leftBorder: number, rightBorder: number, topBorder: number, bottomBorder: number };

    private ball: Ball = new Ball();
    private paddle: Paddle;
    private bricks: BrickGrid = new BrickGrid(this.BRICKS_START_POSITION, this.BRICK_GRID_SIZE);

    private pointsChangeHandler: EventHandler<number>;
    private brickCountChangeHandler: EventHandler<number>;
    private brickDestructionHandler: EventHandler<BrickGridNumber>;

    private _keyboardEventHandler: EventHandler<Key>;
    private _mouseEventHandler: EventHandler<number>;

    private _ballPositionChangeNotifier: Notifier<Vector2D> = new Notifier<Vector2D>();
    private _paddlePositionChangeNotifier: Notifier<Vector2D> = new Notifier<Vector2D>();
    private _bricksGridChangeNotifier: Notifier<BrickGridNumber> = new Notifier<BrickGridNumber>();
    private _livesCountChangeNotifier: Notifier<number> = new Notifier<number>();
    private _scoreChangeNotifier: Notifier<number> = new Notifier<number>();
    private _bricksGridRecoveryNotifier: Notifier<void> = new Notifier<void>();

    private gameFinished: boolean = false;
    private gamePaused: boolean = false;
    private gameLost: boolean = false;
    private doesBallMove: Boolean = false;

    livesCount: number = 3;
    score: number = 0;

    constructor(width: number, height: number) {
        this.borders = {
            leftBorder: 0,
            rightBorder: width,
            topBorder: 30,
            bottomBorder: height - 20
        };

        this.paddle = new Paddle(this.borders);

        this.pointsChangeHandler = new EventHandler<number>(
            pointsAdded => this.addPoints(pointsAdded)
        );
        this.brickCountChangeHandler = new EventHandler<number>(
            bricksLeftCount => {
                this.checkWinCondition();
            }
        );
        this.brickDestructionHandler = new EventHandler<BrickGridNumber>(
            brickGridNumber => {
                this._bricksGridChangeNotifier.notify(brickGridNumber);
            }
        );
        this._keyboardEventHandler = new EventHandler<Key>(
            key => {
                let direction;
                switch(key) {
                    case Key.RightArrow:
                        direction = Direction.Right;
                        break;

                    case Key.LeftArrow:
                        direction = Direction.Left;
                        break;

                    case Key.None:
                        direction = Direction.None;
                }
                this.paddle.direction = direction;
            }
        );
        this._mouseEventHandler = new EventHandler<number>(
            mouseX => {
                this.paddle.topCenterPosition.x = mouseX;
            }
        );
    }

    start() {
        this.setBallInitialPosition();

        this.subscribeToBricksGridEvents();

        this.nextStep = this.nextStep.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);

        this._scoreChangeNotifier.notify(this.score);
        this._livesCountChangeNotifier.notify(this.livesCount);
        this._ballPositionChangeNotifier.notify(this.ball.position);
        this._paddlePositionChangeNotifier.notify(this.paddle.topLeftPosition);
        this._bricksGridRecoveryNotifier.notify(null);
    }

    pause() {
        this.gamePaused = true;
    }

    resume() {
        this.gamePaused = false;
    }

    restart() {
        this.gamePaused = false;
        this.gameFinished = false;
        this.gameLost = false;
        this.doesBallMove = false;
        this.livesCount = 3;
        this.score = 0;

        this.ball.reset();
        this.paddle.reset();
        this.ball.position = new Vector2D(
            this.paddle.topCenterPosition.x,
            this.paddle.topCenterPosition.y - this.ball.radius
        );

        this.bricks.recoverAllBricks();

        this._scoreChangeNotifier.notify(this.score);
        this._livesCountChangeNotifier.notify(this.livesCount);
        this._ballPositionChangeNotifier.notify(this.ball.position);
        this._paddlePositionChangeNotifier.notify(this.paddle.topLeftPosition);
        this._bricksGridRecoveryNotifier.notify(null);
    }

    setPaddleDirection(direction: Direction): void {
        this.paddle.direction = direction;
    }

    setPaddleX(x: number): void {
        x = Math.max(x, this.paddle.width/2);
        x = Math.min(x, this.borders.rightBorder - this.paddle.width/2);
        const newPosition: Vector2D = new Vector2D(x, this.paddle.topCenterPosition.y);
        this.paddle.topCenterPosition = newPosition;
    }

    releaseBall(): void {
        this.doesBallMove = true;
    }

    private subscribeToBricksGridEvents() {
        this.bricks.pointsChangeNotifier.subscribe(this.pointsChangeHandler);
        this.bricks.bricksCountChangeNotifier.subscribe(this.brickCountChangeHandler);
        this.bricks.brickDestructionNotifier.subscribe(this.brickDestructionHandler);
    }

    nextStep(): void {
        if(this.gamePaused) return;

        if (this.gameFinished) {
            if(this.gameLost) {
                // alert('GAME OVER');
            } else {
                // alert('Congratulations! You win!:D');
            }
            this.restart();
            return;
        }

        if (this.doesBallMove) {
            if (this.checkBallCollisionWithPaddle()) {
                this.pushBallFromPaddle();
            }

            if (this.checkBallCollisionWithSideBorders()) {
                this.pushBallFromSideBorders();
            }
            if (this.checkBallCollisionWithTopBorder()) {
                this.pushBallFromTopBorder();
            } else if (this.checkBallCollisionWithBottomBorder()) {
                this.loseLive();
                return;
            }

            this.bricks.checkBallCollisions(this.ball);

            this.ball.move();
            this._ballPositionChangeNotifier.notify(this.ball.position);
        }

        this.paddle.move();
        this._paddlePositionChangeNotifier.notify(this.paddle.topLeftPosition);
        if (!this.doesBallMove) {
            this.setBallPositionToPaddleTopCenter();
            this._ballPositionChangeNotifier.notify(this.ball.position);
        }
    }

    private setBallInitialPosition(): void {
        this.ball.position = new Vector2D(
            this.paddle.topCenterPosition.x,
            this.paddle.topCenterPosition.y - this.ball.radius
        );
        this._ballPositionChangeNotifier.notify(this.ball.position);
    }

    private pushBallFromPaddle(): void {
        let diff = this.ball.position.x - (this.paddle.topLeftPosition.x + this.paddle.width / 2);
        let normDiff = diff / (this.paddle.width / 2);
        let ballSpeed = this.ball.velocity.length();
        this.ball.velocity.x = this.MAGIC_NUMBER * normDiff;
        this.ball.velocity.y = -1;
        this.ball.velocity.changeLength(ballSpeed);
    }

    private checkBallCollisionWithPaddle(): boolean {
        return this.ball.position.x > this.paddle.topLeftPosition.x - this.ball.radius &&
            this.ball.position.x < this.paddle.topLeftPosition.x + this.paddle.width + this.ball.radius &&
            this.ball.position.y > this.paddle.topLeftPosition.y - this.ball.radius &&
            this.ball.position.y < this.paddle.topLeftPosition.y + this.paddle.height / 2;
    }

    private checkBallCollisionWithBottomBorder(): boolean {
        return this.ball.position.y >= this.borders.bottomBorder - this.ball.radius;
    }

    private checkBallCollisionWithSideBorders(): boolean {
        return this.ball.position.x < this.borders.leftBorder + this.ball.radius ||
            this.ball.position.x > this.borders.rightBorder - this.ball.radius;
    }

    private checkBallCollisionWithTopBorder(): boolean {
        return this.ball.position.y < this.borders.topBorder + this.ball.radius;
    }

    private pushBallFromSideBorders(): void {
        this.ball.velocity.x = -this.ball.velocity.x;
    }

    private pushBallFromTopBorder(): void {
        this.ball.velocity.y = -this.ball.velocity.y;
    }

    private setBallPositionToPaddleTopCenter(): void {
        this.ball.position.x = this.paddle.topCenterPosition.x;
        this.ball.position.y = this.paddle.topCenterPosition.y - this.ball.radius;
    }

    private loseLive(): void {
        --this.livesCount;
        this._livesCountChangeNotifier.notify(this.livesCount);
        this.checkLoseCondition();

        this.ball.position.x = this.paddle.topCenterPosition.x;
        this.ball.position.y = this.paddle.topCenterPosition.y - this.ball.radius;
        this.ball.reset();

        this.doesBallMove = false;
    }

    private checkWinCondition(): void {
        if (this.bricks.bricksLeftCount === 0) {
            // alert('Congratulations! You win!:D');
            this.gameFinished = true;
        }
    }

    private checkLoseCondition(): void {
        if (this.livesCount === 0) {
            this.gameFinished = true;
            this.gameLost = true;
        }
    }

    addPoints(points: number) {
        this.score += points;
        this._scoreChangeNotifier.notify(this.score);
    }

    mouseUpHandler() {
        this.doesBallMove = true;
        document.removeEventListener("mouseup", this.mouseUpHandler);
    }


    get ballPositionChangeNotifier(): Observable<Vector2D> {
        return this._ballPositionChangeNotifier;
    }

    get paddlePositionChangeNotifier(): Observable<Vector2D> {
        return this._paddlePositionChangeNotifier;
    }

    get bricksGridChangeNotifier(): Observable<BrickGridNumber> {
        return this._bricksGridChangeNotifier;
    }

    get livesCountChangeNotifier(): Observable<number> {
        return this._livesCountChangeNotifier;
    }

    get scoreChangeNotifier(): Observable<number> {
        return this._scoreChangeNotifier;
    }

    get bricksGridRecoveryNotifier(): Observable<void> {
        return this._bricksGridRecoveryNotifier;
    }

    get keyboardEventHandler(): EventHandler<Key> {
        return this._keyboardEventHandler;
    }

    get mouseEventHandler(): EventHandler<number> {
        return this._mouseEventHandler;
    }
}

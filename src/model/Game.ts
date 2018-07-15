import Ball from "./Ball";
import Paddle from "./Paddle";
import BrickGrid from "./BrickGrid";
import {BrickGridNumber, Direction, GridSize, Key, Vector2D} from "./Utils";
import {Observable, ObservableImpl, Observer} from "./Observer";

export class Game {
    readonly BRICK_GRID_SIZE: GridSize = {rowCount: 3, columnCount: 8};
    readonly BRICKS_START_POSITION: Vector2D = new Vector2D(50, 30);
    readonly MAGIC_NUMBER: number = 4.0;

    private borders: { leftBorder: number, rightBorder: number, topBorder: number, bottomBorder: number };

    private ball: Ball = new Ball();
    private paddle: Paddle;
    private bricks: BrickGrid = new BrickGrid(this.BRICKS_START_POSITION, this.BRICK_GRID_SIZE);
    private bricksLeftCount: number = this.bricks.bricksLeftCount;

    private pointsChangeHandler: PointsChangeHandler;
    private brickCountChangeHandler: BricksCountChangeHandler;
    private brickDestructionHandler: BrickDestructionHandler;
    private _keyboardEventHandler: KeyboardEventHandler;
    private _mouseEventHandler: MouseEventHandler;

    private _ballPositionChangeNotifier: ObservableImpl<Vector2D> = new ObservableImpl<Vector2D>();
    private _paddlePositionChangeNotifier: ObservableImpl<Vector2D> = new ObservableImpl<Vector2D>();
    private _bricksGridChangeNotifier: ObservableImpl<BrickGridNumber> = new ObservableImpl<BrickGridNumber>();
    private _livesCountChangeNotifier: ObservableImpl<number> = new ObservableImpl<number>();
    private _scoreChangeNotifier: ObservableImpl<number> = new ObservableImpl<number>();
    private _bricksGridRecoveryNotifier: ObservableImpl<void> = new ObservableImpl<void>();

    private lostGame: boolean = false;
    private doesBallMove: Boolean = false;

    livesCount: number = 3;
    score: number = 0;

    constructor(width: number, height: number) {
        this.borders = {
            leftBorder: 0,
            rightBorder: width,
            topBorder: 0,
            bottomBorder: height
        };

        this.paddle = new Paddle(this.borders);

        this.pointsChangeHandler = new PointsChangeHandler(
            pointsAdded => this.addPoints(pointsAdded)
        );
        this.brickCountChangeHandler = new BricksCountChangeHandler(
            bricksLeftCount => {
                this.bricksLeftCount = bricksLeftCount;
                this.checkWinCondition();
            }
        );
        this.brickDestructionHandler = new BrickDestructionHandler(
            brickGridNumber => {
                this._bricksGridChangeNotifier.notify(brickGridNumber);
            }
        );
        this._keyboardEventHandler = new KeyboardEventHandler(
            key => {
                let direction;
                switch(key)
                {
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
        this._mouseEventHandler = new MouseEventHandler(
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

        document.addEventListener('mouseup', this.mouseUpHandler);
        window.requestAnimationFrame(this.nextStep);
    }

    stop() {

    }

    restart() {
        this.lostGame = false;
        this.doesBallMove = false;
        this.livesCount = 3;
        this.score = 0;

        this.ball.reset();
        this.ball.position = new Vector2D(
            this.paddle.topCenterPosition.x,
            this.paddle.topCenterPosition.y - this.ball.radius
        );
        this.paddle.reset();

        this.bricks.recoverAllBricks();
        this.bricksLeftCount = this.bricks.bricksLeftCount;

        this._scoreChangeNotifier.notify(this.score);
        this._livesCountChangeNotifier.notify(this.livesCount);
        this._ballPositionChangeNotifier.notify(this.ball.position);
        this._paddlePositionChangeNotifier.notify(this.paddle.topLeftPosition);
        this._bricksGridRecoveryNotifier.notify(null);
        document.addEventListener('mouseup', this.mouseUpHandler);

        window.requestAnimationFrame(this.nextStep);
    }

    private onLose(): void {
        alert('GAME OVER');
        this.restart();
    }

    private subscribeToBricksGridEvents() {
        this.bricks.pointsChangeNotifier.subscribe(this.pointsChangeHandler);
        this.bricks.bricksCountChangeNotifier.subscribe(this.brickCountChangeHandler);
        this.bricks.brickDestructionNotifier.subscribe(this.brickDestructionHandler);
    }


    private nextStep(): void {
        if (this.lostGame) {
            this.onLose();
            return;
        }

        if (this.doesBallMove) {
            if (this.checkBallCollisionWithSideBorders()) {
                this.pushBallFromSideBorders();
            }
            if (this.checkBallCollisionWithTopBorder()) {
                this.pushBallFromTopBorder();
            } else if (this.checkBallCollisionWithBottomBorder()) {
                this.loseLive();
            }

            if (this.checkBallCollisionWithPaddle()) {
                this.pushBallFromPaddle();
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

        window.requestAnimationFrame(this.nextStep);
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
        return this.ball.position.y > this.borders.bottomBorder - this.ball.radius;
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
        document.addEventListener('mouseup', this.mouseUpHandler);
    }

    private checkWinCondition(): void {
        if (this.bricksLeftCount === 0) {
            alert('Congratulations! You win!:D');
            this.restart();
        }
    }

    private checkLoseCondition(): void {
        if (this.livesCount === 0) {
            this.lostGame = true;
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

    get keyboardEventHandler(): KeyboardEventHandler {
        return this._keyboardEventHandler;
    }

    get mouseEventHandler(): MouseEventHandler {
        return this._mouseEventHandler;
    }
}

class PointsChangeHandler implements Observer<number> {
    private onUpdate: (number) => void;

    constructor(onUpdate: (number) => void) {
        this.onUpdate = onUpdate;
    }

    update(pointsAdded: number): void {
        this.onUpdate(pointsAdded);
    }
}

class BricksCountChangeHandler implements Observer<number> {
    private onUpdate: (number) => void;

    constructor(onUpdate: (number) => void) {
        this.onUpdate = onUpdate;
    }

    update(bricksLeftCount: number): void {
        this.onUpdate(bricksLeftCount);
    }
}

class BrickDestructionHandler implements Observer<BrickGridNumber> {
    private onUpdate: (BrickGridNumber) => void;

    constructor(onUpdate: (BrickGridNumber) => void) {
        this.onUpdate = onUpdate;
    }

    update(brickGridNumber: BrickGridNumber): void {
        this.onUpdate(brickGridNumber);
    }
}

class KeyboardEventHandler implements Observer<Key> {
    private onUpdate: (Key) => void;

    constructor(onUpdate: (Key) => void) {
        this.onUpdate = onUpdate;
    }

    update(pressedKey: Key): void {
        this.onUpdate(pressedKey);
    }
}

class MouseEventHandler implements Observer<number> {
    private onUpdate: (number) => void;

    constructor(onUpdate: (number) => void) {
        this.onUpdate = onUpdate;
    }

    update(mouseX: number): void {
        this.onUpdate(mouseX);
    }
}
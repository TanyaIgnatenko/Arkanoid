import Ball from "./Ball";
import Paddle from "./Paddle";
import BrickGrid from "./BrickGrid";
import {GridSize, Vector2D} from "./Utils";
import {Observer} from "./Observer";

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

export class Game {
    private borders: { leftBorder: number, rightBorder: number, topBorder: number, bottomBorder: number };
    readonly BRICK_GRID_SIZE: GridSize = {rowCount: 3, columnCount: 8};
    readonly BRICKS_START_POSITION: Vector2D = new Vector2D(50, 30);

    readonly MAGIC_NUMBER: number = 4.0;
    private canvas: HTMLCanvasElement;

    private context: CanvasRenderingContext2D;
    private ball: Ball;
    private paddle: Paddle;
    private bricks: BrickGrid;
    private bricksLeftCount: number;

    private pointsChangeHandler: PointsChangeHandler;
    private brickCountChangeHandler: BricksCountChangeHandler;

    private lostGame: boolean = false;
    private doesBallMove: Boolean = false;

    livesCount: number = 3;
    score: number = 0;

    constructor() {
        this.pointsChangeHandler = new PointsChangeHandler(
            pointsAdded => this.addPoints(pointsAdded)
        );
        this.brickCountChangeHandler = new BricksCountChangeHandler(
            bricksLeftCount => {
                this.bricksLeftCount = bricksLeftCount;
                this.checkWinCondition();
            }
        );
    }

    start() {
        this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');

        this.borders = {
            leftBorder: 0,
            rightBorder: this.canvas.width,
            topBorder: 0,
            bottomBorder: this.canvas.height
        };

        this.paddle = new Paddle(this.borders, this.context);

        this.ball = new Ball(this.context);
        let ballStartPosition = new Vector2D(
            this.paddle.topCenterPosition.x,
            this.paddle.topCenterPosition.y - this.ball.radius
        );
        this.ball.position = ballStartPosition;

        this.bricks = new BrickGrid(this.BRICKS_START_POSITION, this.BRICK_GRID_SIZE, this.context);

        this.bricksLeftCount = this.bricks.bricksLeftCount;
        this.bricks.pointsChangeNotifier.subscribe(this.pointsChangeHandler);
        this.bricks.bricksCountChangeNotifier.subscribe(this.brickCountChangeHandler);

        this.nextStep = this.nextStep.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
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

        this.bricks.pointsChangeNotifier.unsubscribe(this.pointsChangeHandler);
        this.bricks.bricksCountChangeNotifier.unsubscribe(this.brickCountChangeHandler);
        this.bricks = new BrickGrid(this.BRICKS_START_POSITION, this.BRICK_GRID_SIZE, this.context);
        this.bricks.pointsChangeNotifier.subscribe(this.pointsChangeHandler);
        this.bricks.bricksCountChangeNotifier.subscribe(this.brickCountChangeHandler);
        this.bricksLeftCount = this.bricks.bricksLeftCount;

        window.requestAnimationFrame(this.nextStep);
    }

    private onLose(): void {
        alert('GAME OVER');
        this.restart();
    }

    private draw(): void {
        this.context.clearRect(this.borders.leftBorder, this.borders.topBorder,
            this.borders.rightBorder, this.borders.bottomBorder);
        this.bricks.draw();
        this.paddle.draw();
        this.ball.draw();
        this.drawScore();
        this.drawLivesCount();
    }

    private nextStep(): void {
        this.draw();

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

            if(this.checkBallCollisionWithPaddle()) {
                this.pushBallFromPaddle();
            }

            this.bricks.checkBallCollisions(this.ball);

            this.ball.move();
        }

        this.paddle.move();
        if (!this.doesBallMove) this.setBallPositionToPaddleTopCenter();

        window.requestAnimationFrame(this.nextStep);
    }

    private pushBallFromPaddle(): void {
        let diff = this.ball.position.x - (this.paddle.topLeftPosition.x + this.paddle.width / 2);
        let normDiff = diff / (this.paddle.width / 2);
        let ballSpeed = this.ball.velocity.length();
        this.ball.velocity.x = this.MAGIC_NUMBER * normDiff;
        this.ball.velocity.y = -1;
        this.ball.velocity.changeLength(ballSpeed);
    }

    private checkBallCollisionWithPaddle() : boolean {
        return this.ball.position.x > this.paddle.topLeftPosition.x - this.ball.radius &&
        this.ball.position.x < this.paddle.topLeftPosition.x + this.paddle.width + this.ball.radius &&
        this.ball.position.y > this.paddle.topLeftPosition.y - this.ball.radius &&
        this.ball.position.y < this.paddle.topLeftPosition.y + this.paddle.height / 2;
    }

    private checkBallCollisionWithBottomBorder() : boolean {
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

    private drawScore(): void {
        this.context.font = '16px Arial, sans-serif';
        this.context.fillStyle = 'white';
        this.context.fillText('Score: ' + this.score, 8, 20);
    }

    private drawLivesCount(): void {
        this.context.font = '16px Arial, sans-serif';
        this.context.fillStyle = 'white';
        this.context.fillText('Lives: ' + this.livesCount, this.borders.rightBorder - 65, 20);
    }

    addPoints(points: number) {
        this.score += points;
    }

    mouseUpHandler() {
        this.doesBallMove = true;
        document.removeEventListener("mouseup", this.mouseUpHandler);
    }
}
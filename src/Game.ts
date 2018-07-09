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
    readonly BRICK_GRID_SIZE: GridSize = {rowCount: 3, columnCount: 8};
    readonly BRICKS_START_POSITION: Vector2D = new Vector2D(50, 30);
    readonly BALL_START_POSITION: Vector2D = new Vector2D(10, 10);
    readonly MAGIC_NUMBER: number = 4.0;

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private ball: Ball;
    private borders: { leftBorder: number, rightBorder: number, topBorder: number, bottomBorder: number };
    private paddle: Paddle;
    private bricks: BrickGrid;
    private bricksLeftCount: number;

    private pointsChangeHandler: PointsChangeHandler;
    private brickCountChangeHandler: BricksCountChangeHandler;

    private lostGame: boolean = false;

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

        this.ball = new Ball(this.BALL_START_POSITION, this.context);
        this.paddle = new Paddle(this.borders, this.context);
        this.bricks = new BrickGrid(this.BRICKS_START_POSITION, this.BRICK_GRID_SIZE, this.context);

        this.bricksLeftCount = this.bricks.bricksLeftCount;
        this.bricks.pointsChangeNotifier.subscribe(this.pointsChangeHandler);
        this.bricks.bricksCountChangeNotifier.subscribe(this.brickCountChangeHandler);

        this.nextStep = this.nextStep.bind(this);
        window.requestAnimationFrame(this.nextStep);
    }

    stop() {

    }

    restart() {
        this.lostGame = false;
        this.livesCount = 3;
        this.score = 0;
        this.ball.reset();
        this.ball.position = this.BALL_START_POSITION;

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

        if(this.lostGame) {
            this.onLose();
            return;
        }

        //Check Ball and Wall collision
        if (this.ball.position.x < this.borders.leftBorder + this.ball.radius ||
            this.ball.position.x > this.borders.rightBorder - this.ball.radius) {
            this.ball.speedX = -this.ball.speedX;
        }
        if (this.ball.position.y < this.borders.topBorder + this.ball.radius) {
            this.ball.speedY = -this.ball.speedY;
        } else if (this.ball.position.y > this.borders.bottomBorder - this.ball.radius) {
            --this.livesCount;
            this.checkLoseCondition();
            this.ball.position = this.BALL_START_POSITION;
        }

        //Check Ball and Paddle collision
        if (this.ball.position.x > this.paddle.position.x - this.ball.radius &&
            this.ball.position.x < this.paddle.position.x + this.paddle.width + this.ball.radius &&
            this.ball.position.y > this.paddle.position.y - this.ball.radius &&
            this.ball.position.y < this.paddle.position.y + this.paddle.height / 2) {

            let diff = this.ball.position.x - (this.paddle.position.x + this.paddle.width / 2);
            let norm_diff = diff / (this.paddle.width / 2);
            let ballSpeed = this.ball.velocity.length();
            this.ball.speedX = this.MAGIC_NUMBER * norm_diff;
            this.ball.speedY = -1;
            let newBallSpeed = this.ball.velocity.length();
            this.ball.velocity = this.ball.velocity.multiply(ballSpeed/newBallSpeed);
        }

        //Check Ball and BricksGrid collision
        this.bricks.checkBallCollisions(this.ball);

        this.ball.move();
        this.paddle.move();

        window.requestAnimationFrame(this.nextStep);
    }

    checkWinCondition(): void {
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
}
import Ball from "./Ball";
import Paddle from "./Paddle";
import BrickGrid from "./BrickGrid";
import {GridSize, Vector2D} from "./Utils";
import {WinLogic} from "./WinLogic";

export class Game implements ChangedScoreSubscriber, ChangeLeftBricksCountSubscriber {
    readonly BRICK_GRID_SIZE: GridSize = {rowCount: 3, columnCount: 8};
    readonly BRICKS_START_POSITION: Vector2D = {x: 50, y: 30};
    readonly BALL_START_POSITION: Vector2D = {x: 10, y: 10};

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private ball: Ball;
    private borders: { leftBorder: number, rightBorder: number, topBorder: number, bottomBorder: number };
    private paddle: Paddle;
    private bricks: BrickGrid;
    private leftBricksCount: number;

    livesCount: number = 3;
    score: number = 0;

    constructor() {
    }

    updateScore(additionalPoints: number) {
        this.score += additionalPoints;
    }

    updateLeftBricksCount(leftBricksCount: number) {
        this.leftBricksCount = leftBricksCount;
        this.checkWinCondition();
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

        this.leftBricksCount = this.bricks.leftBricksCount;
        this.bricks.subscribeToChangedLeftBricksCount(this);
        this.bricks.subscribeToChangedScore(this);

        this.nextStep = this.nextStep.bind(this);
        window.requestAnimationFrame(this.nextStep);
    }

    stop() {

    }

    restart() {
        document.location.reload(true);
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

        //Check Ball and Wall collision
        if (this.ball.position.x < this.borders.leftBorder + this.ball.radius ||
            this.ball.position.x > this.borders.rightBorder - this.ball.radius) {
            this.ball.speedX = -this.ball.speedX;
        } else if (this.ball.position.y < this.borders.topBorder + this.ball.radius) {
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
            this.ball.speedY = -this.ball.speedY;
        }

        //Check Ball and BricksGrid collision
        this.bricks.checkBallCollisions(this.ball);

        this.ball.move();
        this.paddle.move();

        window.requestAnimationFrame(this.nextStep);
    }

    checkWinCondition(): void {
        if (this.leftBricksCount === 0) {
            alert('Congratulations! You win!:D');
            this.restart();
        }
    }

    private checkLoseCondition(): void {
        if (this.livesCount === 0) {
            alert('GAME OVER');
            this.restart();
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

    decreaseLives(loseLivesCount: number) {
        this.livesCount -= loseLivesCount;
    }
}
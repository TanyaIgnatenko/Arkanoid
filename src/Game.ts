import Ball from "./Ball";
import Paddle from "./Paddle";
import BrickGrid from "./BrickGrid";
import {GridSize, Vector2D} from "./Utils";
import {WinLogic} from "./WinLogic";

export class Game implements WinLogic {
    readonly BRICK_GRID_SIZE: GridSize = {rowCount: 3, columnCount: 8};
    readonly BRICKS_START_POSITION: Vector2D = {x: 20, y: 50};
    readonly BALL_START_POSITION: Vector2D = {x: 10, y: 10};

    private canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
    private context: CanvasRenderingContext2D = this.canvas.getContext('2d');

    private ball: Ball = new Ball(this.BALL_START_POSITION, this.context);
    private borders: { [key: string]: Vector2D };
    private paddle: Paddle = new Paddle(this.borders, this.context);
    private bricks: BrickGrid = new BrickGrid(this.BRICKS_START_POSITION, this.BRICK_GRID_SIZE, this.context, this);

    livesCount: number = 3;
    score: number = 0;
    winScore: number;

    constructor() {
        this.borders['LeftBorder'].x = 0;
        this.borders['RightBorder'].x = this.canvas.width;
        this.borders['TopBorder'].y = 0;
        this.borders['BottomBorder'].y = this.canvas.height;
        this.winScore = this.bricks.cost;
    }

    start() {
        window.requestAnimationFrame(this.nextStep);
    }

    stop() {

    }

    restart() {
        document.location.reload(true);
    }

    private draw(): void {
        this.context.clearRect(this.borders['LeftBorder'].x, this.borders['TopBorder'].y,
                                this.borders['RightBorder'].x, this.borders['BottomBorder'].y);
        this.bricks.draw();
        this.paddle.draw();
        this.drawScore();
        this.drawLivesCount();
    }

    private nextStep(): void {
        this.draw();
        
        //Check Ball and Wall collision
        if (this.ball.position.x < this.borders['LeftBorder'].x + this.ball.radius ||
            this.ball.position.x > this.borders['RightBorder'].x- this.ball.radius) {
            this.ball.speedX = -this.ball.speedX;
        } else if (this.ball.position.y < this.borders['TopBorder'].y + this.ball.radius){
            this.ball.speedY = -this.ball.speedY;
        } else if( this.ball.position.y > this.borders['BottomBorder'].y - this.ball.radius) {
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
        if (this.score === this.winScore) {
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
        this.context.fillText('Score:' + this.score, 8, 20);
    }

    private drawLivesCount(): void {
        this.context.font = '16px Arial, sans-serif';
        this.context.fillStyle = 'white';
        this.context.fillText('Lives:' + this.livesCount, this.borders['RightBorder'].x - 65, 20);
    }

    addPoints(points: number) {
        this.score += points;
    }

    decreaseLives(loseLivesCount: number) {
        this.livesCount -= loseLivesCount;
    }
}
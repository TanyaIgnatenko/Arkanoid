let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
let context: CanvasRenderingContext2D = canvas.getContext('2d');

let ballX: number = 10;
let ballY: number = 10;
let ballSpeedX: number = 4;
let ballSpeedY: number = 4;
const ballRadius: number = 10;
const ballColor: string = 'white';

const paddleWidth: number = 100;
const paddleHeight: number = 20;
let paddleX: number = (canvas.width - paddleWidth) / 2;
const paddleY: number = canvas.height - paddleHeight - 10;
const paddleSpeedX: number = 10;
const paddleColor: string = 'grey';

let leftPressed: boolean = false;
let rightPressed: boolean = false;

function drawBall(x: number, y: number, r: number, ballColor: string): void {
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI, false);
    context.fillStyle = ballColor;
    context.fill();
}

function drawPaddle(paddleX: number, puddleY: number, puddleWidth: number,
                    puddleHeight: number, paddleColor: string): void {
    context.fillStyle = paddleColor;
    context.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}

function draw(): void {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBall(ballX, ballY, ballRadius, ballColor);
    drawPaddle(paddleX, paddleY, paddleWidth, paddleHeight, paddleColor);

    //Detect walls collisions
    if (ballX + ballSpeedX < ballRadius || ballX + ballSpeedX > canvas.width - ballRadius) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY + ballSpeedY < ballRadius || ballY + ballSpeedY > canvas.height - ballRadius) {
        ballSpeedY = -ballSpeedY;
    }
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    //Define paddle position
    if(leftPressed){
        paddleX = Math.max(paddleX-paddleSpeedX, 0);
    } else if(rightPressed){
        paddleX = Math.min(paddleX + paddleSpeedX, canvas.width - paddleWidth);
    }

    window.requestAnimationFrame(draw);
}

function keyDownHandler(e: KeyboardEvent): void {
    if (e.keyCode === 37) {
        leftPressed = true;
    } else if(e.keyCode === 39) {
        rightPressed = true;
    }
}

function keyUpHandler(e: KeyboardEvent): void {
    if (e.keyCode === 37) {
        leftPressed = false;
    } else if(e.keyCode === 39) {
        rightPressed = false;
    }
}

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
window.requestAnimationFrame(draw);
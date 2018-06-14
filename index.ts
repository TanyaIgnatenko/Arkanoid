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

const leftWallX = 0;
const rightWallX = canvas.width;
const topWallY = 0;
const bottomWallY = canvas.height;

let brickRowCount = 3;
let brickColumnCount = 8;
let brickWidth = 75;
let brickHeight = 20;
let brickOffsetTop = 30;
let brickOffsetLeft = 50;

let leftPressed: boolean = false;
let rightPressed: boolean = false;

interface vector2D {
    x: number;
    y: number;
}

let bricks: Array<Array<vector2D>> = [];
for (let col = 0; col < brickColumnCount; ++col) {
    bricks[col] = [];
    for (let row = 0; row < brickRowCount; ++row) {
        bricks[col][row] = {x: 0, y: 0};
    }
}

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

function drawBricks() {
    for (let col = 0; col < brickColumnCount; ++col) {
        for (let row = 0; row < brickRowCount; ++row) {
            let brickX: number = brickOffsetLeft + col * brickWidth;
            let brickY: number = brickOffsetTop + row * brickHeight;
            bricks[col][row].x = brickX;
            bricks[col][row].y = brickY;
            context.fillStyle = 'yellow';
            context.fillRect(brickX, brickY, brickWidth, brickHeight);
            context.strokeRect(brickX, brickY, brickWidth, brickHeight);
        }
    }
}

function draw(): void {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall(ballX, ballY, ballRadius, ballColor);
    drawPaddle(paddleX, paddleY, paddleWidth, paddleHeight, paddleColor);
}

function gameLoop(): void {
    //Detect wall collision
    if (ballX < leftWallX + ballRadius ||
        ballX > rightWallX - ballRadius) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY < topWallY + ballRadius ||
        ballY > bottomWallY - ballRadius) {
        ballSpeedY = -ballSpeedY;
    }

    //Detect paddle and ball collision
    if (ballX > paddleX - ballRadius &&
        ballX < paddleX + paddleWidth + ballRadius &&
        ballY > paddleY - ballRadius &&
        ballY < paddleY + paddleHeight / 2) {
        ballSpeedY = -ballSpeedY;
    }

    //Define paddle position
    if (leftPressed) {
        paddleX = Math.max(paddleX - paddleSpeedX, 0);
    } else if (rightPressed) {
        paddleX = Math.min(paddleX + paddleSpeedX, canvas.width - paddleWidth);
    }

    draw();

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    window.requestAnimationFrame(gameLoop);
}

function keyDownHandler(e: KeyboardEvent): void {
    if (e.keyCode === 37) {
        leftPressed = true;
    } else if (e.keyCode === 39) {
        rightPressed = true;
    }
}

function keyUpHandler(e: KeyboardEvent): void {
    if (e.keyCode === 37) {
        leftPressed = false;
    } else if (e.keyCode === 39) {
        rightPressed = false;
    }
}

function mouseMoveHandler(e: MouseEvent) {
    let mouseX: number = e.clientX - canvas.offsetLeft;
    if (mouseX >= leftWallX + paddleWidth / 2 &&
        mouseX <= rightWallX - paddleWidth / 2) {
        paddleX = mouseX - paddleWidth / 2;
    }
}

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
document.addEventListener('mousemove', mouseMoveHandler);
window.requestAnimationFrame(gameLoop);
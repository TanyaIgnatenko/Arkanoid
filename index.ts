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

interface Vector2D {
    x: number;
    y: number;
}

interface Segment {
    startPoint: Vector2D,
    endPoint: Vector2D
}

interface Brick {
    topLeftPoint: Vector2D,
    alive: boolean
}
enum CollisionType {
    Vertical = 'Vertical',
    Horizontal = 'Horizontal',
    None = 'None'
}

let bricks: Array<Array<Brick>> = [];
for (let col = 0; col < brickColumnCount; ++col) {
    bricks[col] = [];
    for (let row = 0; row < brickRowCount; ++row) {
        bricks[col][row] = {topLeftPoint: {x: 0, y: 0}, alive: true};
    }
}

function checkHorizontalCollision(horizontalSegment: Segment, line: Segment): boolean {
    const x1: number = line.startPoint.x;
    const x2: number = line.endPoint.x;
    const y1: number = line.startPoint.y;
    const y2: number = line.endPoint.y;

    if(y1 === y2) return false;

    const intersectionY: number = horizontalSegment.startPoint.y;
    const intersectionX: number = ((x2 - x1) * intersectionY + (x1 * y2 - x2 * y1)) / (y2 - y1);

    return (intersectionY <= y1 && intersectionY >= y2 ||
        intersectionY <= y2 && intersectionY >= y1) &&
        intersectionX >= horizontalSegment.startPoint.x &&
        intersectionX <= horizontalSegment.endPoint.x;
}

function checkVerticalCollision(verticalSegment: Segment, line: Segment): boolean {
    const x1: number = line.startPoint.x;
    const x2: number = line.endPoint.x;
    const y1: number = line.startPoint.y;
    const y2: number = line.endPoint.y;

    if(x1 === x2) return false;

    const intersectionX: number = verticalSegment.startPoint.x;
    const intersectionY: number = ((y1 - y2) * intersectionX + (x1 * y2 - x2 * y1)) / (x1 - x2);

    return (intersectionX <= x1 && intersectionX >= x2 ||
        intersectionX <= x2 && intersectionX >= x1) &&
        intersectionY >= verticalSegment.startPoint.y &&
        intersectionY <= verticalSegment.endPoint.y;
}

function calculateBrickCollisionType(brickX: number, brickY: number): CollisionType {
    const ballSpeedVector: Segment = {
        startPoint: {x: ballX, y: ballY},
        endPoint: {x: ballX - ballSpeedX, y: ballY - ballSpeedY}
    };
    const brickTopLine: Segment = {
        startPoint: {x: brickX, y: brickY},
        endPoint: {x: brickX + brickWidth, y: brickY}
    };
    const brickBottomLine: Segment = {
        startPoint: {x: brickX, y: brickY + brickHeight},
        endPoint: {x: brickX + brickWidth, y: brickY + brickHeight}
    };
    const brickLeftLine: Segment = {
        startPoint: {x: brickX, y: brickY},
        endPoint: {x: brickX, y: brickY + brickHeight}
    };
    const brickRightLine: Segment = {
        startPoint: {x: brickX + brickWidth, y: brickY},
        endPoint: {x: brickX + brickWidth, y: brickY + brickHeight}
    };

    if (checkHorizontalCollision(brickTopLine, ballSpeedVector)) return CollisionType.Horizontal;
    if (checkHorizontalCollision(brickBottomLine, ballSpeedVector)) return CollisionType.Horizontal;
    if (checkVerticalCollision(brickLeftLine, ballSpeedVector)) return CollisionType.Vertical;
    if (checkVerticalCollision(brickRightLine, ballSpeedVector)) return CollisionType.Vertical;
    return CollisionType.None;
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
            if(bricks[col][row].alive) {
                let brickX: number = brickOffsetLeft + col * brickWidth;
                let brickY: number = brickOffsetTop + row * brickHeight;
                bricks[col][row].topLeftPoint.x = brickX;
                bricks[col][row].topLeftPoint.y = brickY;
                context.fillStyle = 'yellow';
                context.fillRect(brickX, brickY, brickWidth, brickHeight);
                context.strokeRect(brickX, brickY, brickWidth, brickHeight);
            }
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

    //Detect ball and bricks collision
    for(let col = 0; col < brickColumnCount; ++col){
        for(let row = 0; row < brickRowCount; ++row){
            if(bricks[col][row].alive) {
                const collisionType: CollisionType =
                    calculateBrickCollisionType(bricks[col][row].topLeftPoint.x, bricks[col][row].topLeftPoint.y);

                if (collisionType === CollisionType.Vertical) {
                    ballSpeedX = -ballSpeedX;
                    bricks[col][row].alive = false;
                } else if (collisionType === CollisionType.Horizontal) {
                    ballSpeedY = -ballSpeedY;
                    bricks[col][row].alive = false;
                }
            }
        }
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
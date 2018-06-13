let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
let context: CanvasRenderingContext2D = canvas.getContext('2d');
let x: number = 10;
let y: number = 10;
let dx: number = 4;
let dy: number = 4;
let ballRadius: number = 10;
let ballColor: string = "white";

function drawBall(x: number, y: number, r: number, ballColor: string): void {
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI, false);
    context.fillStyle = ballColor;
    context.fill();
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBall(x, y, ballRadius, ballColor);

    //Detect walls collisions
    if(x + dx < ballRadius || x + dx > canvas.width - ballRadius) {
        dx = -dx;
    }
    if(y + dy < ballRadius || y + dy > canvas.height - ballRadius) {
        dy = -dy;
    }

    x += dx;
    y += dy;
    window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);




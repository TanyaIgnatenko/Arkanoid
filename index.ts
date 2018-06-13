let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
let context: CanvasRenderingContext2D = canvas.getContext('2d');
let x: number = 10;
let y: number = 10;
let dx: number = 1;
let dy: number = 1;
let r: number = 10;
let ballColor: string = "white";

function drawBall(x: number, y: number, r: number, ballColor: string): void {
    context.beginPath();
    context.arc(x, y, r, 0, 2 * Math.PI, false);
    context.fillStyle = ballColor;
    context.fill();
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBall(x, y, r, ballColor);
    x += dx;
    y += dy;
    window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);




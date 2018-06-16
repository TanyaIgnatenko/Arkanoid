import {Vector2D} from "./Utils";

export default class Paddle {
    private _position: Vector2D;
    private _width: number = 100;
    private _height: number = 20;

    readonly SPEED_X: number = 10;
    readonly COLOR: string = '#AC7548';

    private borders: { leftBorder: number, rightBorder: number, topBorder: number, bottomBorder: number };

    leftPressed: boolean = false;
    rightPressed: boolean = false;

    private drawContext: CanvasRenderingContext2D;

    constructor(borders: { leftBorder: number, rightBorder: number, topBorder: number, bottomBorder: number },
                drawContext: CanvasRenderingContext2D) {
        this.borders = borders;
        this.drawContext = drawContext;

        this._position = {
            x: (this.borders.rightBorder - this._width) / 2,
            y: this.borders.bottomBorder - this._height - 10
        };

        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        document.addEventListener('mousemove', this.mouseMoveHandler);
    }

    move(): void {
        if (this.leftPressed) {
            this._position.x = Math.max(this._position.x - this.SPEED_X, this.borders.leftBorder);
        } else if (this.rightPressed) {
            this._position.x = Math.min(this._position.x + this.SPEED_X,
                this.borders.rightBorder - this._width);
        }
    }

    draw(): void {
        this.drawContext.fillStyle = this.COLOR;
        this.drawContext.strokeStyle = "#765031";
        this.drawContext.lineWidth = 3;
        this.drawContext.fillRect(this._position.x, this._position.y, this._width, this._height);
        this.drawContext.strokeRect(this._position.x, this._position.y, this._width, this._height);
    }


    keyDownHandler(e: KeyboardEvent): void {
        if (e.keyCode === 37) {
            this.leftPressed = true;
        } else if (e.keyCode === 39) {
            this.rightPressed = true;
        }
    }

    keyUpHandler(e: KeyboardEvent): void {
        if (e.keyCode === 37) {
            this.leftPressed = false;
        } else if (e.keyCode === 39) {
            this.rightPressed = false;
        }
    }

    mouseMoveHandler(e: MouseEvent) {
        let mouseX: number = e.clientX - this.drawContext.canvas.offsetLeft;
        if (mouseX >= this.borders.leftBorder + this._width / 2 &&
            mouseX <= this.borders.rightBorder - this._width / 2) {
            this._position.x = mouseX - this._width / 2;
        }
    }

    get position(): Vector2D {
        return this._position;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }
}
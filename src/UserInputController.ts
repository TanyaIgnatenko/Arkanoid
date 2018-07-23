import {Direction} from "./Utils/Utils";
import {Game} from "./model/Game";
import {GameView} from "./view/GameView";


export class UserInputController {
    private LEFT_ARROW_KEY_CODE: number = 37;
    private RIGHT_ARROW_KEY_CODE: number = 39;
    private ESCAPE_KEY_CODE: number = 27;
    private SPACE_KEY_CODE: number = 32;

    private canvas: HTMLCanvasElement;
    private gameModel: Game;
    private gameView: GameView;

    constructor(canvas: HTMLCanvasElement, gameModel: Game, gameView: GameView) {
        this.canvas = canvas;
        this.gameModel = gameModel;
        this.gameView = gameView;
    }

    start(): void {
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
    }

    stop(): void {
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
    }

    keyDownHandler(e: KeyboardEvent): void {
        switch(e.keyCode) {
            case this.LEFT_ARROW_KEY_CODE:
                this.gameModel.setPaddleDirection(Direction.Left);
                break;

            case this.RIGHT_ARROW_KEY_CODE:
                this.gameModel.setPaddleDirection(Direction.Right);
                break;

            case this.ESCAPE_KEY_CODE:
                this.gameView.showMenu();
                break;

            case this.SPACE_KEY_CODE:
                this.gameModel.releaseBall();
                break;
        }
    }

    keyUpHandler(e: KeyboardEvent): void {
        if (e.keyCode === this.LEFT_ARROW_KEY_CODE || e.keyCode === this.RIGHT_ARROW_KEY_CODE) {
            this.gameModel.setPaddleDirection(Direction.None);
        }
    }

    mouseMoveHandler(e: MouseEvent) {
        let mouseX: number = e.clientX - this.canvas.offsetLeft;
        this.gameModel.setPaddleX(mouseX);
    }
}
import {Game} from "./model/Game";
import {GameView} from "./view/GameView";
import {UserInputController} from "./UserInputController";

let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
const gameWidth: number = canvas.width;
const gameHeight: number = canvas.height;

let gameModel: Game = new Game(gameWidth, gameHeight);
let gameView: GameView = new GameView(canvas, gameModel);
let userInputController: UserInputController = new UserInputController(canvas, gameModel, gameView);

gameModel.ballPositionChangeNotifier.subscribe(gameView.ballPositionChangeHandler);
gameModel.paddlePositionChangeNotifier.subscribe(gameView.paddlePositionChangeHandler);
gameModel.bricksGridChangeNotifier.subscribe(gameView.bricksGridChangeHandler);
gameModel.livesCountChangeNotifier.subscribe(gameView.livesCountChangeHandler);
gameModel.scoreChangeNotifier.subscribe(gameView.scoreChangeHandler);
gameModel.bricksGridRecoveryNotifier.subscribe(gameView.bricksGridRecoveryHandler);

gameView.keyboardEventNotifier.subscribe(gameModel.keyboardEventHandler);
gameView.mouseEventNotifier.subscribe(gameModel.mouseEventHandler);

gameModel.start();
gameView.start();
userInputController.start();

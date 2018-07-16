import {Game} from "./model/Game";
import {GameView} from "./view/GameView";

let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
const gameWidth: number = canvas.width;
const gameHeight: number = canvas.height;

let gameView: GameView = new GameView(canvas);
let gameModel: Game = new Game(gameWidth, gameHeight);

gameModel.ballPositionChangeNotifier.subscribe(gameView.ballPositionChangeHandler);
gameModel.paddlePositionChangeNotifier.subscribe(gameView.paddlePositionChangeHandler);
gameModel.bricksGridChangeNotifier.subscribe(gameView.bricksGridChangeHandler);
gameModel.livesCountChangeNotifier.subscribe(gameView.livesCountChangeHandler);
gameModel.scoreChangeNotifier.subscribe(gameView.scoreChangeHandler);
gameModel.bricksGridRecoveryNotifier.subscribe(gameView.bricksGridRecoveryHandler);

gameView.keyboardEventNotifier.subscribe(gameModel.keyboardEventHandler);
gameView.mouseEventNotifier.subscribe(gameModel.mouseEventHandler);
gameView.pauseGameNotifier.subscribe(gameModel.pauseGameHandler);
gameView.resumeGameNotifier.subscribe(gameModel.resumeGameHandler);

gameModel.start();
gameView.start();
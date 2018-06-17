interface ChangedScoreSubscriber {
    updateScore(additionalPoints: number): void;
}

interface ChangeLeftBricksCountSubscriber {
    updateLeftBricksCount(leftBricksCount: number): void;
}
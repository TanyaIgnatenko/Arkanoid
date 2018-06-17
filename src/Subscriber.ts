interface ChangedScoreSubscriber {
    updateScore(additionalPoints: number);
}

interface ChangeLeftBricksCountSubscriber {
    updateLeftBricksCount(leftBricksCount: number);
}
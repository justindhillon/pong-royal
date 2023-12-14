function enoughPlayers(playerCount) {
    if (playerCount < 3) {
        fill(255);
        textSize(32 * canvasSize / 800);
        textAlign(CENTER, CENTER);
        text('We need ' + (3 - playerCount) + " more players to start", canvasSize / 4, canvasSize / 2, canvasSize / 2);
        return false;
    }

    return true;
}

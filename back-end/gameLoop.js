const { calculateVertices } = require('./calculateVertex.js');
const { paddle } = require('./paddle.js');
const { collisionDetection } = require('./collisionDetection.js');
const { getDistance } = require('./getDistance.js');

function gameLoop(players, balls) {
    const alivePlayers = Object.values(players)
                               .filter(player => !player.dead);

    // Reset when game over
    if (alivePlayers.length === 0) {
        for (const id in players) {
            players[id].dead = false;
        }
        return [players, balls];
    }

    const vertices = calculateVertices(alivePlayers.length, 400, 400, 400);
    const gameBoundaryVertices = calculateVertices(alivePlayers.length, 450, 400, 400);

    i = 0;
    for (const player of alivePlayers) {
        let nextI = parseInt(i) + 1;
        if (Object.keys(vertices).length <= nextI) {
            nextI = 0;
        }

        [player.x, player.y] = paddle({
            x: vertices[i].x,
            y: vertices[i].y
        }, {
            x: vertices[nextI].x,
            y: vertices[nextI].y
        }, player.pos);
        player.rotation = vertices[i].rotation;

        const xydistance = getDistance(vertices[nextI].x, vertices[nextI].y, vertices[i].x, vertices[i].y);
        player.height = xydistance / 4;
        player.width = xydistance / 16;

        if (player.moveLeft) {
            if (player.pos <= 27 / 32) {
                player.pos += 1 / 60;
            }
        }
        if (player.moveRight) {
            if (5 / 32 <= player.pos) {
                player.pos -= 1 / 60;
            }
        }

        // Colision Detection
        const xDistance = vertices[nextI].x - vertices[i].x;
        const yDistance = vertices[nextI].y - vertices[i].y;
        const startX = vertices[i].x + (player.pos - 1 / 8) * xDistance;
        const endX = vertices[i].x + (player.pos + 1 / 8) * xDistance;
        const startY = vertices[i].y + (player.pos - 1 / 8) * yDistance;
        const endY = vertices[i].y + (player.pos + 1 / 8) * yDistance;

        for (const id2 in balls) {
            // Check if player lost
            if (collisionDetection(balls[id2].x, balls[id2].y, balls[id2].r, gameBoundaryVertices[i].x, gameBoundaryVertices[i].y, gameBoundaryVertices[nextI].x, gameBoundaryVertices[nextI].y)) {
                // Resets ball
                balls[id2].x = 400;
                balls[id2].y = 400;
                balls[id2].direction = Math.random() * 360;
                balls[id2].speed = 2;
                balls[id2].lastPlayer = undefined;

                // Removes player
                player.dead = true;
            }

            // Check for paddle colisions
            if (collisionDetection(balls[id2].x, balls[id2].y, balls[id2].r, startX, startY, endX, endY)) {
                const direction = player.rotation * 2 + 360 - balls[id2].direction;

                balls[id2].direction = direction;
                balls[id2].speed += 1;
            }
        }

        i++;
    }

    for (const id in balls) {
        const direction = balls[id].direction * (Math.PI / 180);
        const moveX = Math.cos(direction) * balls[id].speed;
        const moveY = Math.sin(direction) * balls[id].speed;

        balls[id].x += moveX;
        balls[id].y += moveY;

        // If the ball is ever off screen for some reason
        if (balls[id].x < -100 || 900 < balls[id].x || balls[id].y < -100 || 900 < balls[id].y) {
            // Reset ball
            balls[id].x = 400;
            balls[id].y = 400;
            balls[id].direction = Math.random() * 360;
            balls[id].speed = 2;
            balls[id].lastPlayer = undefined;
        }
    }

    return [players, balls];
}

module.exports = { gameLoop };

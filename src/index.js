import _ from 'lodash';
import './index.less';
const shared = require('./shared');

let ws;

const $newGameContainer = $('#new-game-container');
const $newGame = $('#btn-new-game');
const $game = $('#game');
const gameSize = 500;
const padding = 5;

const ballSize = 8;

const speed = 200;

const $paddles = [], walls = [];
let paddleLength, paddlePlacement;

let ball;
let lastBounce;
let uuid;

$(document).ready(() => {
    ws = new WebSocket('ws://localhost:9001');

    $(document).on('keydown', ({ which }) => {
        switch (which) {
            case 37:
                ws.send(JSON.stringify({
                    type: shared.MSG_TYPE.MOVE,
                    playerId: uuid,
                    direction: -1, // -1 = left, 1 = right
                }));
                break;
            case 39:
                ws.send(JSON.stringify({
                    type: shared.MSG_TYPE.MOVE,
                    playerId: uuid,
                    direction: 1, // -1 = left, 1 = right
                }));
                break;
            default:
                break;
        }
    })

    ws.onopen = () => {
        // Create an ID for the player
        uuid = `${Math.floor(Math.random() * 10000000000000001)}`;

        // Send a join message and playerId back to the server
        ws.send(JSON.stringify({
            type: shared.MSG_TYPE.JOIN,
            playerId: uuid,
        }));
    };

    ws.onmessage = function (msg) {
        msg = JSON.parse(msg.data);
        if (msg.type === shared.MSG_TYPE.STARTED) {
            const angle = +msg.ball.angle;
            setupBall(angle);
            startAnimating();
            $newGameContainer.hide();
        }
        if (msg.type === shared.MSG_TYPE.JOINED) {
            $('line').remove();
            paddleLength = null;
            const playerIdx = msg.players.indexOf(uuid);
            setupWalls(msg.players, playerIdx);
            setupPaddles(msg.players, playerIdx);
        }
        if (msg.type === shared.MSG_TYPE.PADDLEPOSITIONS) {
            console.log(msg.paddlePositions);
        }
    };
});

$newGame.on('click', () => {
    ws.send(JSON.stringify({
        type: shared.MSG_TYPE.START,
    }));
})

// Setup methods

function setupWalls(players) {
    $game.attr('viewBox', `0 0 ${gameSize} ${gameSize}`);
    const radius = gameSize / 2 - padding;
    const centerPt = { x: gameSize / 2, y: gameSize / 2 };
    const numWalls = Math.max(players.length, 3);
    const angleDelta = (Math.PI * 2) / numWalls;
    for (let i = 0; i < numWalls; i++) {
        const startAngle = angleDelta * i;
        const endAngle = angleDelta * (i + 1);

        const startPt = projectAngle(centerPt, radius, startAngle);
        const endPt = projectAngle(centerPt, radius, endAngle);

        const $wall = drawLine(startPt, endPt)
            .addClass('wall')
            .attr({
                stroke: `hsl(${360 * i / numWalls} , 100%, 50%)`,
                'data-player-id': (i < players.length - 1) ? players[i] : ''
            });

        const wallAngle = (startAngle + endAngle) / 2;
        walls.push([startPt, endPt, wallAngle]);
    }
}

function setupPaddles(players, playerIdx) {
    paddlePlacement = 0.5;
    $('line').each((idx, line) => {
        if (idx >= players.length) return;
        const $line = $(line);
        const center = getCenter($line);
        const slope = getSlope($line);
        if (!paddleLength) {
            paddleLength = getLength($line) * 0.3;
        }
        const startPt = projectSlope(center, -paddleLength / 2, slope);
        const endPt = projectSlope(center, paddleLength / 2, slope);
        const $paddle = drawLine(startPt, endPt)
            .addClass(`paddle${idx === playerIdx ? ' active-player' : ''}`)
            .attr({
                stroke: $line.attr('stroke'),
                'data-player-id': $line.attr('data-player-id')
            });
        $paddles.push($paddle);
    });
}

function setupBall(angle) {
    const x = gameSize / 2;
    const y = gameSize / 2;

    const $ball = drawCircle(x, y, ballSize).addClass('ball');

    ball = { x, y, angle, $ball };
}


// Animation methods

function updatePaddles() {
    $paddles.forEach(($paddle) => {

    })
}

function updateBall(dt) {
    ball.x += Math.cos(ball.angle) * speed * dt;
    ball.y += Math.sin(ball.angle) * speed * dt;
    updateCircle(ball.$ball, ball.x, ball.y);
}


function startAnimating() {
    let lastUpdate = Date.now();
    setInterval(() => {
        const time = Date.now();

        const timeDelta = (time - lastUpdate) / 1000;
        if (timeDelta < 1) {
            updateBall(timeDelta);
            const newAngle = detectCollisions();
            if (newAngle !== false) {
                ball.angle = newAngle;
            }
        }
        lastUpdate = time;

    }, 30);
}

function detectCollisions() {
    const minDist = ballSize * 1.25;
    lastBounce = lastBounce || Date.now();

    if (Date.now() - lastBounce < 100) return false;

    for (let i = 0; i < walls.length; i++) {
        const wall = walls[i];
        const doesCollide = distToLine(wall[0], wall[1], ball) < minDist;
        if (doesCollide) {
            lastBounce = Date.now();
            const wallAngle = wall[2];
            return (Math.PI + 2 * wallAngle - ball.angle) % (Math.PI * 2);
        }
    }
    return false;
}

// SVG utility methods
function createSvg(element) {
    return document.createElementNS('http://www.w3.org/2000/svg', element);
}

function drawLine({ x: x1, y: y1 }, { x: x2, y: y2 }) {
    return $(createSvg('line'))
        .attr({ x1, y1, x2, y2 })
        .appendTo($game);
}

function drawCircle(cx, cy, r) {
    return $(createSvg('circle'))
        .attr({ cx, cy, r })
        .appendTo($game);
}
function updateCircle($circle, cx, cy) {
    $circle.attr({ cx, cy });
}

// Math utility methods

function projectAngle(start, dist, angle) {
    return {
        x: start.x + Math.cos(angle) * dist,
        y: start.y + Math.sin(angle) * dist
    }
}

function projectSlope(start, dist, slope) {
    const deltaX = Math.sqrt(Math.pow(dist, 2) / (Math.pow(slope, 2) + 1)) * (dist > 0 ? 1 : -1);
    return {
        x: start.x + deltaX,
        y: start.y + deltaX * slope
    }
}

function interpolatePoint($line, percent) {
    const startPt = { x: parseInt($line.attr('x1')), y: parseInt($line.attr('y1')) };
    const endPt = { x: parseInt($line.attr('x2')), y: parseInt($line.attr('y2')) };
    const deltaY = endPt.y - startPt.y;
    const deltaX = endPt.x - startPt.x;
    return {
        x: startPt.x + deltaX * percent,
        y: startPt.y + deltaY * percent
    }
}

function getCenter($line) {
    return interpolatePoint($line, 0.5);
}

function getSlope($line) {
    const deltaX = $line.attr('x2') - $line.attr('x1');
    return (deltaX !== 0) ? ($line.attr('y2') - $line.attr('y1')) / deltaX : false;
}

function getLength($line) {
    return Math.sqrt(
        Math.pow($line.attr('x2') - $line.attr('x1'), 2) +
        Math.pow($line.attr('y2') - $line.attr('y1'), 2)
    );
}

function getAngle(wall) {
    return Math.atan2(wall[1].y - wall[0].y, wall[0].x - wall[1].x);
}

function getDist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
function distToLine(l1, l2, p) {
    const m1 = (l2.y - l1.y) / (l2.x - l1.x);
    const b1 = l1.y - l1.x * m1;

    const m2 = -1 / m1;
    const b2 = p.y - p.x * m2;

    const cX = (b2 - b1) / (m1 - m2);
    const cY = m1 * cX + b1;

    let closest = { x: cX, y: cY };
    if (getDist(l1, closest) > getDist(l1, l2)) closest = l2;
    else if (getDist(l2, closest) > getDist(l1, l2)) closest = l1;

    return getDist(closest, p);
}

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}
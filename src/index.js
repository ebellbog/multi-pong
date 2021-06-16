import _ from 'lodash';
import './index.less';
const shared = require('./shared');

const ws = new WebSocket('ws://localhost:9001');

const $game = $('#game');
const gameSize = 500;
const padding = 5;

const ballSize = 8;

const speed = 200;

const $paddles = [], walls = [];
let paddleLength, paddlePlacement;

let ball;
let lastBounce;

$(document).ready(() => {
    const numPlayers = 8;
    setupWalls(numPlayers);
    setupPaddles(numPlayers);

    $(document).on('keydown', ({ which }) => {
        switch (which) {
            case 37:
                paddlePlacement -= .05;
                break;
            case 39:
                paddlePlacement += .05;
                break;
            default:
                break;
        }
    })

    ws.onopen = () => {
        const uuid = Math.floor(Math.random() * 10000000000000001);

        ws.send(JSON.stringify({
            type: shared.MSG_TYPE.JOIN,
            playerId: uuid,
        }));
    };

    ws.onmessage = function (msg) {
        console.log(msg.data);
    };
});

$('#btn-new-game').on('click', (e) => {
    setupBall();
    startAnimating();

    ws.send(JSON.stringify({
        type: shared.MSG_TYPE.START,
    }));

    $(e.target).hide();
})

// Setup methods

function setupWalls(numPlayers) {
    $game.attr('viewBox', `0 0 ${gameSize} ${gameSize}`);
    const radius = gameSize / 2 - padding;
    const centerPt = { x: gameSize / 2, y: gameSize / 2 };
    const angleDelta = (Math.PI * 2) / numPlayers;
    for (let i = 0; i < numPlayers; i++) {
        const startAngle = angleDelta * i;
        const endAngle = angleDelta * (i+ 1);

        const startPt = projectAngle(centerPt, radius, startAngle);
        const endPt = projectAngle(centerPt, radius, endAngle);

        const $wall = drawLine(startPt, endPt)
            .addClass('wall')
            .attr({
                stroke: `hsl(${360 * i / numPlayers} , 100%, 50%)`,
                'data-player-id': i
            });

        const wallAngle = (startAngle + endAngle) / 2;
        walls.push([startPt, endPt, wallAngle]);
    }
}

function setupPaddles() {
    paddlePlacement = 0.5;
    $('line').each((idx, line) => {
        const $line = $(line);
        const center = getCenter($line);
        const slope = getSlope($line);
        if (!paddleLength) {
            paddleLength = getLength($line) * 0.3;
        }
        const startPt = projectSlope(center, -paddleLength / 2, slope);
        const endPt = projectSlope(center, paddleLength / 2, slope);
        const $paddle = drawLine(startPt, endPt)
            .addClass('paddle')
            .attr({
                stroke: $line.attr('stroke'),
                'data-player-id': $line.attr('data-player-id')
            });
        $paddles.push($paddle);
    });
}

function setupBall() {
    const x = gameSize / 2;
    const y = gameSize / 2;
    const angle = randFloat(0, Math.PI * 2);

    const $ball = drawCircle(x, y, ballSize).addClass('ball');

    ball = {x, y, angle, $ball};
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
    const _animate = () => {
        window.requestAnimationFrame(() => {
            const time = Date.now();

            updateBall((time - lastUpdate)/1000);
            const newAngle = detectCollisions();
            if (newAngle !== false) {
                ball.angle = newAngle;
            }

            lastUpdate = time;
            _animate();
        });
    }
    _animate();
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
        .attr({cx, cy, r})
        .appendTo($game);
}
function updateCircle($circle, cx, cy) {
    $circle.attr({cx, cy});
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
    const startPt = {x: parseInt($line.attr('x1')), y: parseInt($line.attr('y1'))};
    const endPt = {x: parseInt($line.attr('x2')), y: parseInt($line.attr('y2'))};
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

    let closest = {x: cX, y: cY};
    if (getDist(l1 , closest) > getDist(l1, l2)) closest = l2;
    else if (getDist(l2, closest) > getDist(l1, l2)) closest = l1;

    return getDist(closest, p);
}

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}
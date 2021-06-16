import _ from 'lodash';
import './index.less';

const ws = new WebSocket('ws://localhost:9001');

const $game = $('#game');
const gameSize = 500;
const padding = 5;

const $paddles = [];
let paddleLength;

$(document).ready(() => {
    setupWalls(8);
    setupPaddles(8);

    $(document).on('keydown', ({ which }) => {
        switch (which) {
            case 37:
                console.log('left arrow');
                break;
            case 39:
                console.log('right arrow');
                break;
            default:
                break;
        }
    })

    ws.onopen = () => {
        ws.send('ready');
    };

    ws.onmessage = function (msg) {
        console.log(msg.data);
    };
});

$('#btn-new-game').on('click', () => {
    ws.send('A new game has begun!')
})

function setupWalls(numPlayers) {
    $game.attr('viewBox', `0 0 ${gameSize} ${gameSize}`);
    const radius = gameSize / 2 - padding;
    const centerPt = { x: gameSize / 2, y: gameSize / 2 };
    const angleDelta = (Math.PI * 2) / numPlayers;
    for (let i = 0; i < numPlayers; i++) {
        const startPt = projectAngle(centerPt, radius, angleDelta * i);
        const endPt = projectAngle(centerPt, radius, angleDelta * (i + 1));
        drawLine(startPt, endPt).addClass('wall').attr('stroke', `hsl(${360 * i / numPlayers} , 100%, 50%)`);
    }
}

function setupPaddles() {
    $('line').each((idx, line) => {
        const $line = $(line);
        const center = getCenter($line);
        const slope = getSlope($line);
        if (!paddleLength) {
            paddleLength = getLength($line) * 0.3;
        }
        const startPt = projectSlope(center, -paddleLength / 2, slope);
        const endPt = projectSlope(center, paddleLength / 2, slope);
        const $paddle = drawLine(startPt, endPt).addClass('paddle').attr('stroke', $line.attr('stroke'));
        $paddles.push($paddle);
    });
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

function getCenter($line) {
    return {
        x: (parseInt($line.attr('x2')) + parseInt($line.attr('x1'))) / 2,
        y: (parseInt($line.attr('y2')) + parseInt($line.attr('y1'))) / 2
    };
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

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}


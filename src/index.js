import _ from 'lodash';
import './index.less';

const $game = $('#game');
const gameSize = 500;
const padding = 5;

$(document).ready(() => {
    setupGame(8);

    // Test websockets
    const ws = new WebSocket('ws://localhost:9001');
    ws.onopen = () => {
        ws.send('ready');
    };
});

function setupGame(numPlayers) {
    $game.attr('viewBox', `0 0 ${gameSize} ${gameSize}`);
    const radius = gameSize / 2 - padding;
    const centerPt = {x: gameSize / 2, y: gameSize / 2};
    const angleDelta = (Math.PI * 2) / numPlayers;
    for (let i = 0; i < numPlayers; i++) {
        const startPt = projectPoint(centerPt, angleDelta * i, radius);
        const endPt = projectPoint(centerPt, angleDelta * (i + 1), radius); 
        drawLine(startPt, endPt).attr('stroke', `hsl(${360 * i / numPlayers} , 100%, 50%)`);
    }
}

// SVG utility methods

function createSvg(element) {
    return document.createElementNS('http://www.w3.org/2000/svg', element);
}

function drawLine({x: x1, y: y1}, {x: x2, y: y2}) {
    return $(createSvg('line'))
        .attr({x1, y1, x2, y2})
        .appendTo($game);
}

// Math utility methods

function projectPoint(start, angle, dist) {
    return {
        x: start.x + Math.cos(angle) * dist,
        y: start.y + Math.sin(angle) * dist
    }
}

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

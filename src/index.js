import _ from 'lodash';
import './index.less';

const ws = new WebSocket('ws://localhost:9001');

$(document).ready(() => {
    console.log('ready to go!');

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
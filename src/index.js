import _ from 'lodash';
import './index.less';

$(document).ready(() => {
    console.log('ready to go!');
    const ws = new WebSocket('ws://localhost:9001');
    ws.onopen = () => {
        ws.send('ready');
    };
});

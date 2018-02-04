import sockette from 'sockette';

import {eventTypes} from '../constants';
import {isWaiting} from './dataService';
import {getModel, setModel} from '../model';

let ws;

function onReceive(event) {
	const {type, payload} = JSON.parse(event.data);

	// the dataService is expecting and has handled the web socket message
	if (isWaiting(payload)) {
		return;
	}

	switch (type) {
		case eventTypes.POLL_VOTED_ON:
			// TODO: UI for voting results
			console.info(type, payload);
			break;
		default:
			console.info(type, payload);
			break;
	}
}

export function connectSocket() {
	// using sockette for auto reconnect
	ws = sockette('ws://localhost:5000/web-socket', {
		timeout: 5e3,
		maxAttempts: 3,
		onopen: console.debug,
		onmessage: onReceive,
		onreconnect: console.debug,
		onclose: console.debug,
		onerror: console.error,
	});
}

export function joinChannel(channel) {
	if (ws) {
		ws.json({type: 'join channel', payload: channel});
	}
}

export function leaveChannel(channel) {
	if (ws) {
		ws.json({type: 'leave channel', payload: channel});
	}
}

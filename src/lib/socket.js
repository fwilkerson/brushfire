import sockette from 'sockette';

import {getModel, setModel} from '../model';
import {eventTypes} from '../constants';

let ws;

// Find a way to limit messages to what the user is viewing
function onReceive(event) {
	const {type, payload} = JSON.parse(event.data);

	switch (type) {
		case eventTypes.POLL_CREATED:
			const {route, voteOnPoll} = getModel();
			const {path} = route;
			const id = path.slice(path.lastIndexOf('/') + 1);

			// first check that the active route is interested in this poll
			// then see if the user has already received the poll
			if (payload.id === id && voteOnPoll.poll.id !== id) {
				setModel({voteOnPoll: {poll: payload}});
			}
			break;
		default:
			console.info(type, payload);
			break;
	}
}

export function connectSocket() {
	// use sockette for auto reconnect
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

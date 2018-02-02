import socketio from 'socket.io-client';
import {getModel, setModel} from '../model';
import {eventTypes} from '../../../shared';

let socket;

export function connectSocket() {
	socket = socketio();

	// Find a way to limit messages to what the user is viewing
	socket.on(eventTypes.POLL_CREATED, poll => {
		const {route, voteOnPoll} = getModel();
		const {path} = route;
		const id = path.slice(path.lastIndexOf('/') + 1);

		// first check that the active route is interested in this poll
		// then see if the user has already received the poll
		if (poll.id === id && voteOnPoll.poll.id !== id) {
			setModel({voteOnPoll: {poll}});
		}
	});
}

export function joinChannel(channel) {
	if (socket) {
		socket.emit('join channel', channel);
	}
}

export function leaveChannel(channel) {
	if (socket) {
		socket.emit('leave channel', channel);
	}
}

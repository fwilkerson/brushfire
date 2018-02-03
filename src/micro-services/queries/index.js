import {parse} from 'url';

import micro, {send} from 'micro';
import {consumer} from 'persevere-io';
import socketio from 'socket.io';

import {eventHandler} from './handlers';

let io;
let state = {};

function publishClientMessage(aggregateId, event) {
	if (io) {
		io.sockets.in(aggregateId).emit(event.type, state[aggregateId]);
	}
}

function app() {
	return async (request, response) => {
		// TODO: Check request method, route url's to functions, handle errors
		const {pathname, query} = parse(request.url, true);

		let result = [];
		switch (pathname) {
			case '/api/poll':
				result = state[query.id]
					? [200, state[query.id]]
					: [404, {error: `No poll with with the given id (${query.id})`}];
				break;
			case '/api/poll/votes':
				result = state[query.id]
					? [200, state[query.id].votes]
					: [404, {error: `No poll with with the given id (${query.id})`}];
				break;
			default:
				// TODO: Throw error
				break;
		}
		send(response, ...result);
	};
}

async function start() {
	await consumer({
		subscriber: {
			address: process.env.EVENT_STORE_PUB_SUB,
			handler(aggregateId, event) {
				state = eventHandler(state, event);
				publishClientMessage(aggregateId, event);
			},
		},
		dealer: {
			address: process.env.EVENT_STORE_SYNCHRONIZE,
			data: {eventId: 0},
			handler(events) {
				state = events.reduce(eventHandler, state);
			},
		},
	});

	const server = micro(app());

	io = socketio(server);

	io.sockets.on('connection', function(socket) {
		socket.on('join channel', function(channel) {
			socket.join(channel);
		});

		socket.on('leave channel', function(channel) {
			socket.leave(channel);
		});
	});

	server.listen(process.env.QUERIES_PORT, () => {
		console.info(`query is listening on port: ${process.env.QUERIES_PORT}`);
	});
}

start();

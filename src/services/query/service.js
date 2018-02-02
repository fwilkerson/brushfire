import {Server} from 'http';
import {parse} from 'url';

import dotenv from 'dotenv';
import micro, {send} from 'micro';
import {consumer} from 'persevere-io';
import socketio from 'socket.io';

const config = dotenv.config({path: __dirname + '/.env'});

import {eventTypes} from '../../constants';

// Blow the service up if there is an env config error
if (config.error) {
	throw config.error;
}

let state = {};
const webSocketServer = Server((req, res) => {});
const io = socketio(webSocketServer);

io.sockets.on('connection', function(socket) {
	socket.on('join channel', function(channel) {
		socket.join(channel);
	});

	socket.on('leave channel', function(channel) {
		socket.leave(channel);
	});
});

const eventHandlers = {
	[eventTypes.POLL_CREATED]: (state, event) => {
		const {aggregate_id, event_id, created_at, payload} = event;
		return {
			...state,
			[aggregate_id]: {
				id: aggregate_id,
				version: event_id,
				pollQuestion: payload.pollQuestion,
				// build the model the view needs here
				pollOptions: payload.pollOptions.map((option, i) => ({
					key: i,
					value: option,
					selected: false,
				})),
				createdAt: created_at,
			},
		};
	},
	[eventTypes.POLL_VOTED_ON]: (state, event) => {
		const {aggregate_id, event_id, created_at, payload} = event;
		return {
			...state,
			[aggregate_id]: {
				...state[aggregate_id],
				votes: (state[aggregate_id].votes || []).concat(payload),
			},
		};
	},
};

function eventHandler(state, event) {
	return eventHandlers[event.type]
		? eventHandlers[event.type](state, event)
		: state;
}

webSocketServer.listen(3303);

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
				io.sockets.in(aggregateId).emit(event.type, state[aggregateId]);
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

	server.listen(process.env.PORT, () => {
		console.info(`query is listening on port: ${process.env.PORT}`);
	});
}

start();

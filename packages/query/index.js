const config = require('dotenv').config();
const http = require('http').Server;
const {send} = require('micro');
const socketio = require('socket.io');
const {parse} = require('url');
const zmq = require('zeromq');

const {eventTypes} = require('../shared');
const {syncWithEventBus} = require('./adapter');

// Blow the service up if there is an env config error
if (config.error) {
	throw config.error;
}

let state = {};
const webSocketServer = http((req, res) => {});
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
			}
		}
	},
	[eventTypes.POLL_VOTED_ON]: (state, event) => {
		const {aggregate_id, event_id, created_at, payload} = event;
		return {
			...state,
			[aggregate_id]: {
				...state[aggregate_id],
				votes: (state[aggregate_id].votes || []).concat(payload)
			}
		}
	}
};

function eventHandler(state, event) {
	return eventHandlers[event.type]
		? eventHandlers[event.type](state, event)
		: state;
}

const subscriber = zmq.socket('sub');

subscriber.on('message', (aggregateId, message) => {
	const event = JSON.parse(message);
	state = eventHandler(state, event);
	io.sockets.in(aggregateId).emit(event.type, state[aggregateId]);
});
subscriber.connect(process.env.EVENT_STORE_PUB_SUB);
subscriber.subscribe(''); // subscribe to all topics

syncWithEventBus(0, snapshot => {
	const events = JSON.parse(snapshot);
	state = events.reduce(eventHandler, state);
});

webSocketServer.listen(3303);

module.exports = async (request, response) => {
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

const config = require('dotenv').config();
const {send} = require('micro');
const {parse} = require('url');
const zmq = require('zeromq');

const {eventTypes} = require('../shared');
const {syncWithEventBus} = require('./adapter');

// Blow the service up if there is an env config error
if (config.error) {
	throw config.error;
}

let state = {};

const eventHandlers = {
	[eventTypes.POLL_CREATED]: (state, event) => {
		const {aggregate_id, event_id, created_at, payload} = event;
		return Object.assign({}, state, {
			[aggregate_id]: {
				id: aggregate_id,
				version: event_id,
				pollQuestion: payload.pollQuestion,
				pollOptions: payload.pollOptions,
				createdAt: created_at,
			},
		});
	},
};

function eventHandler(state, event) {
	return eventHandlers[event.type]
		? eventHandlers[event.type](state, event)
		: state;
}

const subscriber = zmq.socket('sub');

subscriber.on('message', (topic, message) => {
	const events = JSON.parse(message);
	state = events.reduce(eventHandler, state);
});
subscriber.connect(process.env.EVENT_STORE_PUB_SUB);
subscriber.subscribe(''); // subscribe to all topics

syncWithEventBus(0, snapshot => {
	const events = JSON.parse(snapshot);
	state = events.reduce(eventHandler, state);
});

module.exports = async (request, response) => {
	// TODO: Check request method, route url's to functions, handle errors
	const {pathname, query} = parse(request.url, true);

	let result = [];
	switch (pathname) {
		case '/api/poll':
			result = state[query.id]
				? [200, state[query.id]]
				: [404, {error: `No poll with with the given id (${query.id})`}];
		default:
			// TODO: Throw error
			break;
	}
	send(response, ...result);
};

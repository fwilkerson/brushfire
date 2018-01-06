const config = require('dotenv').config();
const {send} = require('micro');
const {parse} = require('url');
const zmq = require('zeromq');

const {eventTypes} = require('../shared');

// Blow the service up if there is an env config error
if (config.error) {
	throw config.error;
}

let state = {};

const eventHandlers = {
	[eventTypes.POLL_CREATED]: (state, {aggregateId, payload}) => {
		return Object.assign({}, state, {
			[aggregateId]: {
				pollQuestion: payload.pollQuestion,
				pollOptions: payload.pollOptions,
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
const dealer = zmq.socket('dealer');

subscriber.on('message', (topic, message) => {
	const event = JSON.parse(message);
	state = eventHandler(state, event);
});
subscriber.connect(process.env.EVENT_STORE_PUB_SUB);
subscriber.subscribe(''); // subscribe to all topics

dealer.on('message', snapshot => {
	const events = JSON.parse(snapshot);
	state = events.reduce(eventHandler, state);
});
try {
	// wrap in try catch for dev mode reload
	dealer.bindSync(process.env.EVENT_STORE_SYNCHRONIZE);
} catch (e) {}
dealer.send(JSON.stringify({eventId: 0}));

module.exports = async (request, response) => {
	// TODO: Check request method, route url's to functions, handle errors
	const {pathname, query} = parse(request.url, true);
	send(response, 200, state[query.aggregateId]);
};

process.on('SIGINT', () => {
	dealer.close();
});

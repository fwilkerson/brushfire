const config = require('dotenv').config();
const {json, send} = require('micro');
const zmq = require('zeromq');

const {appendEvent, getEvents} = require('./db');
const {commandHandlers} = require('./handlers');

// Blow the service up if there is an env config error
if (config.error) {
	throw config.error;
}

const publisher = zmq.socket('pub');
try {
	// wrap in try catch for dev mode reload
	publisher.bindSync(process.env.EVENT_STORE_PUB_SUB);
} catch (e) {}

const router = zmq.socket('router');
router.on('message', async (envelope, data) => {
	const {eventId} = JSON.parse(data);
	const events = await getEvents({eventId});
	router.send([envelope, JSON.stringify(events)]);
});
router.connect(process.env.EVENT_STORE_SYNCHRONIZE);

const handlers = commandHandlers(appendEvent, publisher);
function routeCommand({type, payload}) {
	return new Promise(resolve => {
		if (typeof handlers[type] === 'function') {
			handlers[type](payload, resolve);
		} else resolve([404, {error: 'Unknown Command'}]);
	});
}

// TODO: Error handling and rejecting bad requests
module.exports = async (request, response) => {
	const command = await json(request);
	const [statusCode, data] = await routeCommand(command);
	send(response, statusCode, data);
};

// Ensure publisher socket is closed if process is stopped
process.on('SIGINT', () => {
	publisher.close();
});

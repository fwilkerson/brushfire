const config = require('dotenv').config();
const {json, send} = require('micro');
const uuid = require('uuid/v4');
const zmq = require('zeromq');

const {commandTypes, eventTypes} = require('../shared');
const {appendEvent, getEvents} = require('./db');

// Blow the service up if there is an env config error
if (config.error) {
	throw config.error;
}

const publisher = zmq.socket('pub');
publisher.bindSync(process.env.EVENT_STORE_PUB_SUB);

const router = zmq.socket('router');
router.connect(process.env.EVENT_STORE_SYNCHRONIZE);

const commands = {
	[commandTypes.CREATE_POLL]: async ({pollQuestion, pollOptions}, resolve) => {
		// Step 1. Validate payload
		if (pollQuestion.length === 0) {
			return resolve([400, {error: 'A question is required to create a poll'}]);
		}

		if (pollOptions.filter(option => option.length > 0).length < 2) {
			return resolve([400, {error: 'Polls need at least two options'}]);
		}

		// Step 2. Generate aggregateId
		const aggregateId = uuid();

		// Step 3. Return status code an aggregateId
		resolve([202, {aggregateId}]);

		// Step 4. Publish POLL_CREATED event
		const event = await appendEvent({
			aggregateId,
			type: eventTypes.POLL_CREATED,
			payload: {pollQuestion, pollOptions},
		});

		publisher.send([aggregateId, JSON.stringify(event)]);
	},
};

function routeCommand({type, payload}) {
	return new Promise(resolve => {
		if (typeof commands[type] === 'function') {
			commands[type](payload, resolve);
		} else resolve([404, {error: 'Unknown Command'}]);
	});
}

// TODO: Error handling and rejecting bad requests
module.exports = async (request, response) => {
	const command = await json(request);
	const [statusCode, data] = await routeCommand(command);
	send(response, statusCode, data);
};

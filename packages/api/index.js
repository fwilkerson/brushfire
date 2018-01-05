const config = require('dotenv').config();
const {json, send} = require('micro');
const uuid = require('uuid/v4');

const {commandTypes, eventTypes} = require('../shared');
const {appendEvent, getEvents} = require('./db');

// Blow the service up if there is an env config error
if (config.error) {
	throw config.error;
}

const commands = {
	[commandTypes.CREATE_POLL](payload) {
		// Step 1. Validate payload
		// Step 2. Generate aggregateId
		const aggregateId = uuid();
		// Step 3. Publish POLL_CREATED event
		// Step 4. Return status code an aggregateId
		return [202, {aggregateId}];
	},
};

function routeCommand({type, payload}) {
	return typeof commands[type] === 'function'
		? commands[type](payload)
		: [404, {error: 'Unknown Command'}];
}

module.exports = async (request, response) => {
	const command = await json(request);
	const result = routeCommand(command);
	send(response, ...result);
};

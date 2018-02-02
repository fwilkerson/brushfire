import dotenv from 'dotenv';
import micro, {json, send} from 'micro';
import {producer} from 'persevere-io';

const config = dotenv.config({path: __dirname + '/.env'});

import {appendEvent, getEvents} from './db';
import {commandHandlers} from './handlers';

// Blow the service up if there is an env config error
if (config.error) {
	throw config.error;
}

function app({publisher}) {
	const handlers = commandHandlers(appendEvent, publisher);

	function routeCommand({type, payload}) {
		return new Promise(resolve => {
			if (typeof handlers[type] === 'function') {
				handlers[type](payload, resolve);
			} else {
				resolve([404, {error: 'Unknown Command'}]);
			}
		});
	}

	return async (request, response) => {
		const command = await json(request);
		const [statusCode, data] = await routeCommand(command);
		send(response, statusCode, data);
	};
}

async function start() {
	const publisher = await producer({
		publisher: {address: process.env.EVENT_STORE_PUB_SUB},
		router: {
			address: process.env.EVENT_STORE_SYNCHRONIZE,
			handler({eventId}) {
				return getEvents({eventId});
			},
		},
	});

	const server = micro(app({publisher}));

	server.listen(process.env.PORT, () => {
		console.info(`command is listening on port: ${process.env.PORT}`);
	});
}

start();

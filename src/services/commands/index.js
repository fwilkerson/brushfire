import micro, {json, send} from 'micro';
import {producer} from 'persevere-io';

import {appendEvent, getEvents} from './db';
import {commandHandlers} from './handlers';

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

	server.listen(process.env.COMMANDS_PORT, () => {
		console.info(`command is listening on port: ${process.env.COMMANDS_PORT}`);
	});
}

start();

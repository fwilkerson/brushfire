import {parse} from 'url';

import micro, {send} from 'micro';
import {consumer} from 'persevere-io';
import webSocket from 'ws';

import {systemMessages} from '../../constants';
import {eventHandler} from './handlers';

let state = {};
const channels = {};

function publishClientMessage(aggregateId, {type}) {
	if (Array.isArray(channels[aggregateId])) {
		channels[aggregateId].forEach(socket => {
			if (socket.readyState === webSocket.OPEN) {
				socket.send(JSON.stringify({type, payload: state[aggregateId]}));
			}
		});
	}
}

function app() {
	return async (request, response) => {
		// TODO: Check request method, route url's to functions, handle errors
		const {pathname, query} = parse(request.url, true);

		let result = [];
		switch (pathname) {
			case '/api/poll':
				result = state[query.aggregateId]
					? [200, state[query.aggregateId]]
					: [
							404,
							{error: `No poll with with the given id (${query.aggregateId})`},
						];
				break;
			case '/api/poll/results':
				// in future return a limited result set insead of entire poll object
				result = state[query.aggregateId]
					? [200, state[query.aggregateId]]
					: [
							404,
							{error: `No poll with with the given id (${query.aggregateId})`},
						];
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
		onReceive(aggregateId, event) {
			state = eventHandler(state, event);
			publishClientMessage(aggregateId, event);
		},
		initialize: {
			args: {eventId: 0},
			onInitialized(events) {
				state = events.reduce(eventHandler, state);
			},
		},
	});

	const server = micro(app());

	const wss = new webSocket.Server({server, path: '/web-socket'});

	wss.on('connection', ws => {
		ws.on('message', event => {
			const {type, payload} = JSON.parse(event);

			switch (type) {
				case systemMessages.JOIN_CHANNEL:
					if (!Array.isArray(channels[payload])) {
						channels[payload] = [];
					}
					if (channels[payload].indexOf(ws) === -1) {
						channels[payload].push(ws);
					}
					break;
				case systemMessages.LEAVE_CHANNEL:
					if (!Array.isArray(channels[payload])) {
						channels[payload] = [];
					}
					channels[payload] = channels[payload].filter(socket => socket !== ws);
					break;
				default:
					break;
			}
		});
		ws.on('error', console.error);
	});

	wss.on('error', console.error);

	server.listen(process.env.QUERIES_PORT, () => {
		console.info(`query is listening on port: ${process.env.QUERIES_PORT}`);
	});
}

start();

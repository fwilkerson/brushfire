import {joinChannel} from './socket';

const waiting = {};

export function isWaiting(data) {
	if (typeof waiting[data.aggregateId] === 'function') {
		waiting[data.aggregateId](data);
		delete waiting[data.aggregateId];
		return true;
	}

	return false;
}

function eventually(aggregateId) {
	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			if (waiting[aggregateId]) {
				// you never called :(
				delete waiting[aggregateId];
				return reject(new Error('eventually timed out'));
			}
		}, 5e3);

		// call me maybe?
		waiting[aggregateId] = data => {
			clearTimeout(timeoutId);
			return resolve(data);
		};
	});
}

export default {
	postCommand(command) {
		const options = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(command),
		};
		return fetch('/api/command', options)
			.then(response => response.json())
			.then(data => {
				if (data.error) {
					Promise.reject(data.error);
				} else {
					// tell the server to subscribe us to messages for this aggregate
					joinChannel(data.aggregateId);
					return eventually(data.aggregateId);
				}
			})
			.catch(console.error);
	},
};

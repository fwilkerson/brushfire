const uuid = require('uuid/v4');

const {commandTypes, eventTypes} = require('../../shared');
const {count, isNullOrWhiteSpace} = require('../../utils');

exports.commandHandlers = (appendEvent, publisher) => ({
	[commandTypes.CREATE_POLL]: async (payload, resolve) => {
		// Step 1. Validate payload
		if (payload == null) {
			return resolve([400, {error: 'Invalid payload'}]);
		}

		const {pollOptions, pollQuestion} = payload;

		if (!Array.isArray(pollOptions) || typeof pollQuestion != 'string') {
			return resolve([400, {error: 'Invalid payload'}]);
		}

		if (count(pollQuestion) === 0) {
			return resolve([400, {error: 'A question is required to create a poll'}]);
		}

		if (count(pollOptions, option => !isNullOrWhiteSpace(option)) < 2) {
			return resolve([400, {error: 'Polls need at least two options'}]);
		}

		// Step 2. Generate aggregateId
		const aggregateId = uuid();

		// Step 3. Send the status code and aggregateId to the client
		resolve([202, {aggregateId}]);

		// Step 4. Save the POLL_CREATED event
		const event = await appendEvent({
			aggregateId,
			type: eventTypes.POLL_CREATED,
			payload: {
				pollOptions: pollOptions.filter(option => !isNullOrWhiteSpace(option)),
				pollQuestion,
			},
		});

		// Step 5. Publish POLL_CREATED event
		publisher.send([aggregateId, JSON.stringify(event)]);
	},

	[commandTypes.VOTE_ON_POLL]: async (payload, resolve) => {
		// Step 1. Validate payload
		if (payload == null) {
			return resolve([400, {error: 'Invalid payload'}]);
		}

		// should we normalize to aggregateId everywhere?
		const {pollId, selectedOptions} = payload;

		if (typeof pollId != 'string' || !Array.isArray(selectedOptions)) {
			return resolve([400, {error: 'Invalid payload'}]);
		}

		if (count(selectedOptions) === 0) {
			return resolve([400, {error: 'A selected option is required to vote'}]);
		}

		// Step 3. Send the status code and aggregateId to the client
		resolve([202, {pollId}]);

		// Step 4. Save the POLL_CREATED event
		const event = await appendEvent({
			aggregateId: pollId,
			type: eventTypes.POLL_VOTED_ON,
			payload: {
				// in future record who voted on the poll?
				selectedOptions,
			},
		});

		// Step 5. Publish POLL_CREATED event
		publisher.send([pollId, JSON.stringify(event)]);
	},
});

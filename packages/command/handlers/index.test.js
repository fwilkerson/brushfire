const {test} = require('ava');
const {spy, stub} = require('sinon');

const {commandHandlers} = require('./index');
const {commandTypes, eventTypes} = require('../../shared');

const fakeAppendEventResult = [{}];
const fakeAppendEvent = stub().resolves(fakeAppendEventResult);
const fakePublisher = {send: spy()};

const handlers = commandHandlers(fakeAppendEvent, fakePublisher);

test.serial('CREATE_POLL : exists', t => {
	t.true(typeof handlers[commandTypes.CREATE_POLL] === 'function');
});

const createPoll = handlers[commandTypes.CREATE_POLL];

test.serial('CREATE_POLL : validates command payload', t => {
	createPoll(undefined, result => {
		t.deepEqual(
			result,
			[400, {error: 'Invalid payload'}],
			'Handles null or undefined payload'
		);
	});

	createPoll({}, result => {
		t.deepEqual(
			result,
			[400, {error: 'Invalid payload'}],
			'Handles payloads without required properties'
		);
	});

	createPoll({pollOptions: {}, pollQuestion: ''}, result => {
		t.deepEqual(
			result,
			[400, {error: 'Invalid payload'}],
			'Handles payloads with invalid type of pollOptions'
		);
	});

	createPoll({pollOptions: [], pollQuestion: 5}, result => {
		t.deepEqual(
			result,
			[400, {error: 'Invalid payload'}],
			'Handles payloads with invalid type of pollQuestion'
		);
	});

	createPoll(
		{pollOptions: ['Option 1', 'Option 2'], pollQuestion: ''},
		result => {
			t.deepEqual(
				result,
				[400, {error: 'A question is required to create a poll'}],
				'Requires poll question have a length greater than 0'
			);
		}
	);

	createPoll(
		{
			pollOptions: ['Valid', '', null, undefined, ' ', '	', '\t', '\r\n'],
			pollQuestion: 'Test Question',
		},
		result => {
			t.deepEqual(
				result,
				[400, {error: 'Polls need at least two options'}],
				'Requires poll option have two non null non whitespace options'
			);
		}
	);

	t.true(fakeAppendEvent.notCalled);
	t.true(fakePublisher.send.notCalled);
});

test('CREATE_POLL : functionality', async t => {
	const payload = {
		pollOptions: ['Option 1', 'Option 2'],
		pollQuestion: 'Test Question',
	};

	const [statusCode, data] = await new Promise(resolve =>
		createPoll(payload, resolve)
	);

	t.true(statusCode === 202);
	t.true(data.hasOwnProperty('aggregateId'));

	t.true(
		fakeAppendEvent.calledWith({
			aggregateId: data.aggregateId,
			type: eventTypes.POLL_CREATED,
			payload: payload,
		})
	);

	t.true(fakePublisher.send.calledAfter(fakeAppendEvent));
	t.true(
		fakePublisher.send.calledWith([
			data.aggregateId,
			JSON.stringify(fakeAppendEventResult),
		])
	);
});

test.serial('VOTE_ON_POLL : exists', t => {
	t.true(typeof handlers[commandTypes.VOTE_ON_POLL] === 'function');
});

const voteOnPoll = handlers[commandTypes.VOTE_ON_POLL];

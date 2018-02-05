import {eventTypes} from '../../../constants';
import {count} from '../../../utils';

const eventHandlers = {
	[eventTypes.POLL_CREATED]: (state, event) => {
		const {aggregate_id, event_id, created_at, payload} = event;
		const pollOptions = [];
		const pollResults = {};
		payload.pollOptions.forEach((option, i) => {
			pollOptions.push({key: i, value: option, selected: false});
			pollResults[i] = {key: i, value: option, numberOfVotes: 0};
		});
		return {
			...state,
			[aggregate_id]: {
				aggregateId: aggregate_id,
				createdAt: created_at,
				pollOptions,
				pollQuestion: payload.pollQuestion,
				pollResults,
				totalVotes: 0,
				version: event_id,
			},
		};
	},
	[eventTypes.POLL_VOTED_ON]: (state, event) => {
		const {aggregate_id, event_id, created_at, payload} = event;
		let {pollResults, totalVotes} = state[aggregate_id];
		totalVotes += 1;
		payload.selectedOptions.forEach(option => {
			const previous = pollResults[option.key];
			pollResults[option.key] = {
				...pollResults[option.key],
				numberOfVotes: previous.numberOfVotes + 1,
			};
		});
		return {
			...state,
			[aggregate_id]: {...state[aggregate_id], pollResults, totalVotes},
		};
	},
};

export function eventHandler(state, event) {
	return eventHandlers[event.type]
		? eventHandlers[event.type](state, event)
		: state;
}

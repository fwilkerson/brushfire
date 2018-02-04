import {eventTypes} from '../../../constants';
import {count} from '../../../utils';

const eventHandlers = {
	[eventTypes.POLL_CREATED]: (state, event) => {
		const {aggregate_id, event_id, created_at, payload} = event;
		return {
			...state,
			[aggregate_id]: {
				aggregateId: aggregate_id,
				version: event_id,
				pollQuestion: payload.pollQuestion,
				// build the model the view needs here
				pollOptions: payload.pollOptions.map((option, i) => ({
					key: i,
					value: option,
					selected: false,
				})),
				createdAt: created_at,
			},
		};
	},
	[eventTypes.POLL_VOTED_ON]: (state, event) => {
		const {aggregate_id, event_id, created_at, payload} = event;
		const previous = state[aggregate_id];
		const votes = (previous.votes || []).concat(payload);
		const totalVotes = votes.length;
		const pollResults = previous.pollOptions.reduce((results, option) => {
			// find all votes for the given option
			const numberOfVotes = count(votes, vote => {
				return vote.selectedOptions.some(x => x.key === option.key);
			});
			results.push({
				key: option.key,
				value: option.value,
				numberOfVotes,
				percentage: (numberOfVotes / totalVotes * 100).toFixed(0) + '%',
			});
			return results;
		}, []);
		return {
			...state,
			[aggregate_id]: {
				...previous,
				votes,
				pollResults,
				totalVotes,
			},
		};
	},
};

export function eventHandler(state, event) {
	return eventHandlers[event.type]
		? eventHandlers[event.type](state, event)
		: state;
}

import {eventTypes} from '../../../constants';

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
		return {
			...state,
			[aggregate_id]: {
				...state[aggregate_id],
				votes: (state[aggregate_id].votes || []).concat(payload),
			},
		};
	},
};

export function eventHandler(state, event) {
	return eventHandlers[event.type]
		? eventHandlers[event.type](state, event)
		: state;
}

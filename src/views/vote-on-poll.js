import {h} from 'muve';
import {commandTypes} from '../constants';
import dataService from '../lib/dataService';
import {joinChannel, leaveChannel} from '../lib/socket';
import {getModel, setModel, setRoute} from '../model';

function setVoteOnPoll(partial, updateType) {
	const {voteOnPoll} = getModel();
	setModel({voteOnPoll: {...voteOnPoll, ...partial}}, updateType);
}

function togglePollOptionSelected(key) {
	const {voteOnPoll: {poll}} = getModel();
	const pollOptions = poll.pollOptions.map(option => ({
		...option,
		selected: key === option.key ? !option.selected : false,
	}));

	setVoteOnPoll({poll: {...poll, pollOptions}});
}

function submitVote() {
	const {voteOnPoll: {poll}} = getModel();
	const command = {
		type: commandTypes.VOTE_ON_POLL,
		payload: {
			aggregateId: poll.aggregateId,
			selectedOptions: poll.pollOptions.filter(option => option.selected),
		},
	};

	dataService
		.postCommand(command)
		.then(data => {
			if (data.error) {
			} else {
				// we now have the vote, change the ui to viewResults?
				// viewResults();
			}
		})
		.catch(console.error);
}

function viewResults() {
	const {voteOnPoll: {poll}} = getModel();
	setRoute(`/results/${poll.aggregateId}`);
}

export function didMount() {
	const {route, voteOnPoll} = getModel();

	if (route) {
		const {path} = route;
		const id = path.slice(path.lastIndexOf('/') + 1);

		// tell web socket we want messages for this aggregateId
		joinChannel(id);

		// Don't query if socket already got the data
		if (voteOnPoll.poll.aggregateId !== id) {
			fetch(`/api/poll?aggregateId=${id}`)
				.then(response => response.json())
				.then(data => {
					if (data.error) {
					} else setVoteOnPoll({poll: data});
				})
				.catch(console.error);
		}
	}
}

export function didUnmount() {
	const {voteOnPoll} = getModel();

	if (voteOnPoll.poll.aggregateId) {
		leaveChannel(voteOnPoll.poll.aggregateId);
	}

	// reset to initial state
	setVoteOnPoll({poll: {pollQuestion: '', pollOptions: []}});
}

export default ({poll}) => (
	<section>
		<h3 style={{textAlign: 'center'}}>{poll.pollQuestion}</h3>
		{poll.pollOptions.map(option => (
			<label style={{fontWeight: '400'}} class="control control--checkbox">
				{option.value}
				<input
					type="checkbox"
					checked={option.selected}
					onClick={() => togglePollOptionSelected(option.key)}
				/>
				<div class="control__indicator" />
			</label>
		))}
		<hr />
		<button
			style={{fontSize: 'small', margin: '0 .5rem'}}
			class="button-primary u-pull-right"
			onClick={submitVote}
		>
			Vote
		</button>
		<a
			style={{
				cursor: 'pointer',
				lineHeight: '44px',
				padding: '0 3rem',
			}}
			class="u-pull-right"
			onClick={viewResults}
		>
			View Results
		</a>
	</section>
);

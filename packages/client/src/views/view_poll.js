import {h} from '../lib/muve';

import {getModel, setModel} from '../model';

function setViewPoll(partial, updateType) {
	const {viewPoll} = getModel();
	setModel({viewPoll: Object.assign({}, viewPoll, partial)}, updateType);
}

export function didMount() {
	// Setup socket io subscription for givin aggregateId (poll id)
	const {route, viewPoll} = getModel();

	if (route) {
		const {path} = route;
		const id = path.slice(path.lastIndexOf('/') + 1);

		if (viewPoll.poll.id !== id) {
			// there's a chance that this completes before the poll is created
			// look for a solution to this with the websocket
			fetch(`/api/poll?id=${id}`)
				.then(response => response.json())
				.then(poll => {
					console.log(getModel());
					setViewPoll({poll});
				})
				.catch(console.error);
		}
	}
}

export default ({poll}) => (
	<section>
		<div class="row">
			<div class="columns eight offset-by-two">
				<h5>{poll.pollQuestion}</h5>
			</div>
		</div>
		<div class="row">
			<div class="columns eight offset-by-two">
				<ol>{poll.pollOptions.map(option => <li>{option}</li>)}</ol>
			</div>
		</div>
		<div class="row">
			<div class="columns eight offset-by-two">
				<button
					style={{margin: '0 .5rem', padding: '0 1.5rem'}}
					class="button-primary u-pull-right"
				>
					Submit Answers
				</button>
				<button
					style={{margin: '0 .5rem', padding: '0 1.5rem'}}
					class="u-pull-right"
				>
					View Results
				</button>
			</div>
		</div>
	</section>
);

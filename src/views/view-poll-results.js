import {h} from 'muve';

import dataService from '../lib/dataService';
import {joinChannel, leaveChannel} from '../lib/socket';
import {getModel, setModel} from '../model';

function setViewPollResults(partial, updateType) {
	const {viewPollResults} = getModel();
	setModel({viewPollResults: {...viewPollResults, ...partial}}, updateType);
}

export function didMount() {
	const {route} = getModel();

	if (route) {
		const {path} = route;
		const id = path.slice(path.lastIndexOf('/') + 1);

		// tell web socket we want messages for this aggregateId
		joinChannel(id);

		dataService
			.get(`/api/poll/results?aggregateId=${id}`)
			.then(data => {
				setViewPollResults({results: data});
			})
			.catch(console.error);
	}
}

export function didUnmount() {
	const {viewPollResults} = getModel();

	if (viewPollResults.aggregateId) {
		leaveChannel(viewPollResults.aggregateId);
	}
	setViewPollResults({totalVotes: 0, pollQuestion: '', pollResults: []});
}

const styles = {
	right: {textAlign: 'right'},
};

export default ({results}) => (
	<section>
		<h3>{results.pollQuestion}</h3>
		<ul>
			{results.pollResults.map(answer => (
				<li>
					{answer.value}: <strong>{answer.percentage}</strong>
				</li>
			))}
		</ul>
		<h5 style={styles.right}>
			Total Votes: <em>{results.totalVotes}</em>
		</h5>
	</section>
);

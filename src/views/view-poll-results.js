import {h} from 'muve';

import dataService from '../lib/dataService';
import {joinChannel, leaveChannel} from '../lib/socket';
import {getModel, setModel} from '../model';

function setViewPollResults(partial, updateType) {
	const {viewPollResults} = getModel();
	setModel({viewPollResults: {...viewPollResults, ...partial}}, updateType);
}

export function didMount() {
	const {route, viewPollResults} = getModel();

	if (route) {
		const {path} = route;
		const id = path.slice(path.lastIndexOf('/') + 1);

		// tell web socket we want messages for this aggregateId
		joinChannel(id);

		// if server rendered, we may already have the data
		if (viewPollResults.results.aggregateId !== id) {
			dataService
				.get(`/api/poll/results?aggregateId=${id}`)
				.then(data => {
					setViewPollResults({results: data});
				})
				.catch(console.error);
		}
	}
}

export function didUnmount() {
	const {viewPollResults} = getModel();

	if (viewPollResults.aggregateId) {
		leaveChannel(viewPollResults.aggregateId);
	}
	setViewPollResults({totalVotes: 0, pollQuestion: '', pollResults: {}});
}

const styles = {
	right: {textAlign: 'right'},
};

const getPercentage = (numberOfVotes, totalVotes) => {
	return (numberOfVotes / totalVotes * 100).toFixed(0) + '%';
};

export default ({results}) => (
	<section>
		<h3>{results.pollQuestion}</h3>
		{Object.values(results.pollResults).map(answer => {
			const percent = getPercentage(answer.numberOfVotes, results.totalVotes);
			return (
				<div class="progress-bar horizontal rounded">
					<em>{answer.value}</em>
					<div class="progress-track">
						<div class="progress-fill" style={{width: percent}}>
							<span>{percent}</span>
						</div>
					</div>
				</div>
			);
		})}
		<h6 style={styles.right}>
			Total Votes: <em>{results.totalVotes}</em>
		</h6>
	</section>
);

import {h} from '../lib/muve';
import {getModel, setModel, setRoute} from '../model';
import {commandTypes} from '../../../shared';

function setCreatePollForm(partial, updateType) {
	const {createPollForm} = getModel();
	setModel(
		{createPollForm: Object.assign({}, createPollForm, partial)},
		updateType
	);
}

function updatePollQuestion(pollQuestion) {
	setCreatePollForm({pollQuestion});
}

function updatePollOptions(pollOption, index) {
	const {createPollForm} = getModel();
	setCreatePollForm({
		pollOptions: createPollForm.pollOptions.map(
			(option, i) => (index === i ? pollOption : option)
		),
	});
}

function addNewPollOption() {
	const {createPollForm} = getModel();
	setCreatePollForm({pollOptions: createPollForm.pollOptions.concat('')});
}

function createPoll() {
	const {createPollForm} = getModel();
	const command = {
		type: commandTypes.CREATE_POLL,
		payload: createPollForm,
	};

	fetch('/api/command', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(command),
	})
		.then(response => response.json())
		.then(data => {
			if (data.error) {
			} else {
				setRoute('/poll/' + data.aggregateId);
			}
		})
		.catch(console.error);
}

export default model => (
	<section>
		<h2 style={{textAlign: 'center'}}>Brushfire</h2>
		<input
			type="text"
			class="u-full-width"
			style={{fontSize: '2.5rem', height: '5rem'}}
			placeholder="Type the poll question here..."
			value={model.pollQuestion}
			onInput={e => updatePollQuestion(e.target.value)}
		/>
		{model.pollOptions.map((option, i) => (
			<div>
				<span style={{paddingTop: '1rem', position: 'absolute'}}>{i + 1}.</span>
				<input
					type="text"
					class="u-full-width"
					style={{
						borderRadius: '0',
						borderWidth: '0 0 1px 0',
						paddingLeft: '2rem',
					}}
					value={option}
					placeholder="poll option..."
					onInput={e => updatePollOptions(e.target.value, i)}
				/>
			</div>
		))}
		<a style={{cursor: 'pointer'}} onClick={addNewPollOption}>
			Add new poll option
		</a>
		<button onClick={createPoll} class="button-primary u-pull-right">
			Create Poll
		</button>
	</section>
);

import {h} from 'muve';

import {Loading} from '../components';
import {AsyncView, Route, Router} from '../lib';
import {handleRouteChanged, setActiveView} from '../model';

const getDefaultProps = model => ({
	model: model,
	onComplete: setActiveView,
	placeholder: <Loading />,
	view: model.activeView && model.activeView.default,
});

const asyncCreatePoll = model => (
	<AsyncView
		{...getDefaultProps(model)}
		importView={() => import('./create-poll')}
		model={model.createPollForm}
	/>
);

const asyncVoteOnPoll = model => (
	<AsyncView
		{...getDefaultProps(model)}
		importView={() => import('./vote-on-poll')}
		model={model.voteOnPoll}
	/>
);

const asyncViewPollResults = model => (
	<AsyncView
		{...getDefaultProps(model)}
		importView={() => import('./view-poll-results')}
		model={model.viewPollResults}
	/>
);

export const shell = model => (
	<main class="container">
		<Router model={model} routeChanged={handleRouteChanged}>
			<Route exact path="/" view={asyncCreatePoll} />
			<Route path="/poll/:id" view={asyncVoteOnPoll} />
			<Route path="/results/:id" view={asyncViewPollResults} />
		</Router>
	</main>
);

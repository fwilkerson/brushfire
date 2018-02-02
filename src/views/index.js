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
		importView={() => import('./create_poll')}
		model={model.createPollForm}
	/>
);

const asyncVoteOnPoll = model => (
	<AsyncView
		{...getDefaultProps(model)}
		importView={() => import('./vote_on_poll')}
		model={model.voteOnPoll}
	/>
);

export const shell = model => (
	<main class="container">
		<Router model={model} routeChanged={handleRouteChanged}>
			<Route exact path="/" view={asyncCreatePoll} />
			<Route path="/poll/:id" view={asyncVoteOnPoll} />
		</Router>
	</main>
);

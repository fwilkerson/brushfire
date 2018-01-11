import {h} from '../lib/muve';

import {Loading} from '../components';
import {AsyncView, Route, Router} from '../lib';
import {handleRouteChanged, setActiveView} from '../model';

const getDefaultProps = model => ({
	model: model,
	onComplete: setActiveView,
	placeholder: <Loading />,
	view: model.activeView && model.activeView.default,
});

const asynCreatePoll = model => (
	<AsyncView
		{...getDefaultProps(model)}
		importView={() => import('./create_poll')}
		model={model.createPollForm}
	/>
);

const asynViewPoll = model => (
	<AsyncView
		{...getDefaultProps(model)}
		importView={() => import('./view_poll')}
		model={model.viewPoll}
	/>
);

export const shell = model => (
	<main class="container">
		<Router model={model} routeChanged={handleRouteChanged}>
			<Route exact path="/" view={asynCreatePoll} />
			<Route path="/poll/:id" view={asynViewPoll} />
		</Router>
	</main>
);

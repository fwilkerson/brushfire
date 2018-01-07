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

export const shell = model => [
	<h2 style={{textAlign: 'center'}}>Brushfire</h2>,
	<Router model={model} routeChanged={handleRouteChanged}>
		<Route exact path="/" view={asynCreatePoll} />
	</Router>,
];

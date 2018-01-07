import muve from './lib/muve';

import {getModel, initialModel, setActiveView, setModel} from './model';
import {shell} from './views';

const preloadedModel = window.__PRELOADED_STATE__ || initialModel;

function render(model) {
	muve(shell, model, document.getElementById('root'), true);
}

function renderAsyncView(result) {
	setActiveView(result);
	render(getModel());
}

switch (preloadedModel.serverViewName) {
	case 'create_poll':
		import('./views/create_poll').then(renderAsyncView);
		break;
	case 'view_poll_result':
		setModel({viewPollResult: preloadedModel.viewPollResult});
		import('./views/view_poll_result').then(renderAsyncView);
		break;
	default:
		render(initialModel);
		break;
}

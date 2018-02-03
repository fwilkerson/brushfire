import muve from 'muve';

import {getModel, initialModel, setActiveView, setModel} from './model';
import {shell} from './views';
import {connectSocket} from './lib/socket';
import {eventTypes} from './constants';

const preloadedModel = window.__PRELOADED_STATE__ || initialModel;

function render(model) {
	muve(shell, model, document.getElementById('root'), true);
}

function renderAsyncView(result) {
	setActiveView(result);
	render(getModel());
}

connectSocket();

switch (preloadedModel.serverViewName) {
	case 'create-poll':
		import('./views/create-poll').then(renderAsyncView);
		break;
	case 'vote-on-poll':
		setModel({voteOnPoll: preloadedModel.voteOnPoll});
		import('./views/vote-on-poll').then(renderAsyncView);
		break;
	default:
		render(initialModel);
		break;
}

import muve from './lib/muve';

import {initialModel, setActiveView, getModel} from './model';
import {shell} from './views';

const preloadedModel = window.__PRELOADED_STATE__ || initialModel;

function render(model) {
	muve(shell, model, document.getElementById('root'), true);
}

if (preloadedModel.serverViewName) {
	import('./views/' + preloadedModel.serverViewName)
		.then(result => {
			setActiveView(result);
			render(getModel());
		})
		.catch(console.error);
} else render(initialModel);

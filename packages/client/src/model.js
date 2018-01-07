import {interact} from './lib/muve';

export const initialModel = {
	createPollForm: {
		pollQuestion: '',
		pollOptions: ['', '', ''],
	},
	activeView: null,
	route: {path: '/'},
};

export const {getModel, setModel} = interact(initialModel, console.info);

const isPathAlreadySelected = path => {
	const {route} = getModel();
	return path === route.path;
};

export const setRoute = path => {
	if (isPathAlreadySelected(path)) return;

	const {activeView} = getModel();

	const route = {path};
	history.pushState(route, '', path);
	setModel({route, activeView: null});

	if (activeView && activeView.didUnmount) {
		activeView.didUnmount();
	}
};

export const setActiveView = result => {
	setModel({activeView: result});
	if (result.didMount) result.didMount();
};

export const handleRouteChanged = event => {
	const {activeView} = getModel();
	setModel({
		route: event.state || {path: window.location.pathname},
		activeView: null,
	});

	if (activeView.didUnmount) activeView.didUnmount();
};

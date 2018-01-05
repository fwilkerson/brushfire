import {interact} from './lib/muve';

export const initialModel = {
	createPollForm: {
		pollQuestion: '',
		pollOptions: ['', '', ''],
	},
};

export const {getModel, setModel} = interact(initialModel, console.info);

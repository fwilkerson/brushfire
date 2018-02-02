import compression from 'compression';
import express from 'express';
import fetch from 'node-fetch';
import helmet from 'helmet';
import proxy from 'http-proxy-middleware';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';

import webpackConfig from '../webpack.config';
import {renderHTML, renderToString} from './lib/render';
import {initialModel} from './model';
import {shell} from './views';

const server = express();

server.use(compression());
server.use(webpackMiddleware(webpack(webpackConfig), {stats: {colors: true}}));
server.use(express.static('public'));
server.use(helmet());

// TODO: Put the api addresses into env variable

// Command api
server.use('/api/command', proxy({target: 'http://localhost:3301'}));

// Query api
server.use('/api', proxy({target: 'http://localhost:3302'}));
server.use('/socket.io', proxy({target: 'http://localhost:3303', ws: true}));

server.get('/poll/:id', async (request, response) => {
	const voteOnPollPage = require('./views/vote_on_poll').default;

	const data = await fetch(
		`http://localhost:3302/api/poll?id=${request.params.id}`
	);
	const poll = await data.json();
	const {voteOnPoll} = initialModel;
	voteOnPoll.poll = poll;
	const serverView = renderToString(voteOnPollPage(voteOnPoll));

	const model = Object.assign({}, initialModel, {
		serverViewName: 'vote_on_poll',
		serverView,
		voteOnPoll,
	});
	const html = renderHTML(shell(model), model);
	return response.send(html);
});

server.get('/*', async (request, response) => {
	const createPollPage = require('./views/create_poll').default;

	const serverView = renderToString(
		createPollPage(initialModel.createPollForm)
	);

	const model = Object.assign({}, initialModel, {
		serverViewName: 'create_poll',
		serverView,
	});
	const html = renderHTML(shell(model), model);
	return response.send(html);
});

server.listen(process.env.PORT || 5000);

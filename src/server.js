import compression from 'compression';
import express from 'express';
import fetch from 'node-fetch';
import helmet from 'helmet';
import proxy from 'http-proxy-middleware';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';

import webpackConfig from '../config/webpack.config';
import {renderHTML, renderToString} from './lib/render';
import {initialModel} from './model';
import {shell} from './views';

const server = express();

server.use(compression());
server.use(webpackMiddleware(webpack(webpackConfig), {stats: {colors: true}}));
server.use(express.static('public'));
server.use(helmet());

const commandApiUrl = `http://localhost:${process.env.COMMANDS_PORT}`;
const queryApiUrl = `http://localhost:${process.env.QUERIES_PORT}`;

// Command api
server.use('/api/command', proxy({target: commandApiUrl}));

// Query api
server.use('/api', proxy({target: queryApiUrl}));
const wsProxy = proxy(`ws://localhost:${process.env.QUERIES_PORT}/web-socket`);
server.use('/web-socket', wsProxy);

server.get('/poll/:aggregateId', async (request, response) => {
	const voteOnPollPage = require('./views/vote-on-poll').default;

	const data = await fetch(
		`${queryApiUrl}/api/poll?aggregateId=${request.params.aggregateId}`
	);
	const poll = await data.json();
	const {voteOnPoll} = initialModel;
	voteOnPoll.poll = poll;
	const serverView = renderToString(voteOnPollPage(voteOnPoll));

	const model = Object.assign({}, initialModel, {
		serverViewName: 'vote-on-poll',
		serverView,
		voteOnPoll,
	});
	const html = renderHTML(shell(model), model);
	return response.send(html);
});

server.get('/*', async (request, response) => {
	const createPollPage = require('./views/create-poll').default;

	const serverView = renderToString(
		createPollPage(initialModel.createPollForm)
	);

	const model = Object.assign({}, initialModel, {
		serverViewName: 'create-poll',
		serverView,
	});
	const html = renderHTML(shell(model), model);
	return response.send(html);
});

const httpServer = server.listen(process.env.PORT);

httpServer.on('upgrade', wsProxy.upgrade);

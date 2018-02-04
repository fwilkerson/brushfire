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

const COMMAND_API = `http://localhost:${process.env.COMMANDS_PORT}`;
const QUERY_API = `http://localhost:${process.env.QUERIES_PORT}`;
const wsProxy = proxy(`ws://localhost:${process.env.QUERIES_PORT}/web-socket`);

const server = express();

server.use(compression());
server.use(webpackMiddleware(webpack(webpackConfig), {stats: {colors: true}}));
server.use(express.static('public'));
server.use(helmet());

// Command api
server.use('/api/command', proxy({target: COMMAND_API}));

// Query api
server.use('/api', proxy({target: QUERY_API}));
server.use('/web-socket', wsProxy);

server.get('/poll/:aggregateId', async (request, response) => {
	const voteOnPollPage = require('./views/vote-on-poll').default;
	const {aggregateId} = request.params;
	const data = await fetch(QUERY_API + '/api/poll?aggregateId=' + aggregateId);
	const poll = await data.json();
	const {voteOnPoll} = initialModel;
	voteOnPoll.poll = poll;
	const serverView = renderToString(voteOnPollPage(voteOnPoll));
	const model = {
		...initialModel,
		serverViewName: 'vote-on-poll',
		serverView,
		voteOnPoll,
	};
	const html = renderHTML(shell(model), model);
	return response.send(html);
});

server.get('/*', async (request, response) => {
	const createPollPage = require('./views/create-poll').default;
	const serverView = renderToString(
		createPollPage(initialModel.createPollForm)
	);
	const model = {
		...initialModel,
		serverViewName: 'create-poll',
		serverView,
	};
	const html = renderHTML(shell(model), model);
	return response.send(html);
});

const httpServer = server.listen(process.env.PORT);

httpServer.on('upgrade', wsProxy.upgrade);

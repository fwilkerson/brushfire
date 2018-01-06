import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import proxy from 'http-proxy-middleware';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';

import webpackConfig from '../webpack.config';
import {renderHTML} from './lib';
import {initialModel} from './model';
import {indexPage} from './views';

const server = express();

server.use(compression());
server.use(
	webpackMiddleware(webpack(webpackConfig), {stats: {colors: true}, hot: true})
);
server.use(express.static('public'));
server.use(helmet());

// TODO: Put the api addresses into env variable

// Command api
server.use('/api/command', proxy({target: 'http://localhost:3301'}));

// Query api
server.use('/api', proxy({target: 'http://localhost:3302'}));

server.get('*', async (request, response) => {
	const html = renderHTML(indexPage(initialModel));
	return response.send(html);
});

server.listen(process.env.PORT || 5000);

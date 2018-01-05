import compression from 'compression';
import express from 'express';
import fs from 'fs';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';

import webpackConfig from '../webpack.config';
import {renderHTML} from './lib';
import {initialModel} from './model';
import {indexPage} from './views';

const server = express();

server.use(webpackMiddleware(webpack(webpackConfig)));

server.use(compression());
server.use(express.static('public'));
server.use(helmet());
server.use(morgan('dev'));

server.get('*', async (request, response) => {
	const html = renderHTML(indexPage(initialModel));
	return response.send(html);
});

server.listen(process.env.PORT || 8080);

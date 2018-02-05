const {resolve} = require('path');

const MinifyPlugin = require('babel-minify-webpack-plugin');
const webpack = require('webpack');

const rootDir = resolve(__dirname, '..');

module.exports = {
	entry: resolve(rootDir, 'src', 'client.js'),

	output: {
		path: resolve(rootDir, 'public'),
		filename: 'bundle.js',
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {loader: 'babel-loader', options: {compact: true}},
			},
		],
	},

	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production'),
			},
		}),
		new MinifyPlugin(),
	],
};

const {resolve} = require('path');

module.exports = {
	entry: resolve(__dirname, '..', 'src', 'client.js'),
	output: {
		path: resolve(__dirname, '..', 'public'),
		filename: 'bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {loader: 'babel-loader'},
			},
		],
	},
};

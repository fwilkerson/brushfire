import {indexPage} from './views';
import {renderToString} from './lib';

const renderPage = page => `
	<!DOCTYPE html>
	<html lang="en">

	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="X-UA-Compatible" content="ie=edge">
		<title>brushfire</title>
	</head>

	<body>
		<div id="root">${renderToString(page)}</div>
	</body>

	</html>
`;

export default async (request, response) => {
	const model = {
		title: 'Hello, JSX',
		todos: ['Shit', 'Stuff', 'Things'],
	};
	return renderPage(indexPage(model));
};

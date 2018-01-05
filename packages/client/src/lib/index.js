function renderStyleObject(style) {
	if (!style) return '';
	const styleString = Object.keys(style).reduce((styleString, key) => {
		return (styleString += `${key}: ${style[key]};`);
	}, '');

	return `style="${styleString}"`;
}

function renderAttributes(attributes) {
	if (!attributes) return '';
	return Object.keys(attributes).reduce((attributeString, key) => {
		if (key.slice(0, 2) == 'on') return attributeString;

		if (key === 'style' && typeof attributes[key] === 'object') {
			return (attributeString += renderStyleObject(attributes[key]));
		}

		return (attributeString += `${key}="${attributes[key]}"`);
	}, '');
}

function renderElement(acc, next) {
	if (next.type) {
		const attr = renderAttributes(next.attributes);
		const children = renderToString(next.children);
		acc += `<${next.type} ${attr}>${children}</${next.type}>`;
	} else acc += next;

	return acc;
}

function renderToString(elements = []) {
	if (!Array.isArray(elements)) elements = [elements];
	return elements.reduce(renderElement, '');
}

export const renderHTML = vdom => `
	<!DOCTYPE html>
	<html lang="en">

	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="X-UA-Compatible" content="ie=edge">
		<title>brushfire</title>
	</head>

	<body>
		<div id="root">${renderToString(vdom)}</div>
		<script src="bundle.js"></script>
	</body>

	</html>
`;

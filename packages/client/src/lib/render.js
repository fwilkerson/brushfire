function toKebabCase(str) {
	return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function renderStyleObject(style) {
	if (!style) return '';
	const styleString = Object.keys(style).reduce((styleString, key) => {
		return (styleString += `${toKebabCase(key)}: ${style[key]};`);
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

export function renderToString(elements = []) {
	if (!Array.isArray(elements)) elements = [elements];
	return elements.reduce(renderElement, '');
}

export const renderHTML = (vdom, serverModel) => {
	const sanitized = JSON.stringify(serverModel).replace(/</g, '\\u003c');
	return `
	<!DOCTYPE html>
	<html lang="en">

	<head>
		<meta charset="utf-8">
		<title>brushfire</title>	
		<meta name="description" content="">
		<meta name="author" content="">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" href="normalize.css">
		<link rel="stylesheet" href="skeleton.css">
		<link rel="icon" type="image/png" href="favicon.png">
		<style>
			#root {
				padding-top: 10vh;
			}
			.loading span {
				animation: blink 1s infinite both;
			}
			.loading span:nth-child(2) {
					animation-delay: 0.2s;
			}
			.loading span:nth-child(3) {
					animation-delay: 0.4s;
			}
			@keyframes blink {
					0% {
							opacity: 0.2;
					}
					20% {
							opacity: 1;
					}
					100% {
							opacity: 0.2;
					}
			}
		</style>
	</head>

	<body>
		<div id="root">${renderToString(vdom)}</div>
		<script>
			window.__PRELOADED_STATE__ = ${sanitized}
		</script>
		<script src="bundle.js"></script>
	</body>

	</html>
`;
};

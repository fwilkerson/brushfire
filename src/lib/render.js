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

		if (key === 'checked' && attributes[key] === false) {
			return attributeString;
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
		<base href="/">
		<meta charset="utf-8">
		<title>brushfire</title>	
		<meta name="description" content="">
		<meta name="author" content="">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" href="normalize.css">
		<link rel="stylesheet" href="skeleton.css">
		<link rel="icon" type="image/png" href="favicon.png">
		<style>
			.container {
				max-width: 640px;
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
			.control {
				display: block;
				position: relative;
				padding-left: 4rem;
				margin-bottom: 1.5rem;
				cursor: pointer;
				font-size: 2rem;
			}
			.control input {
				position: absolute;
				z-index: -1;
				opacity: 0;
			}
			.control__indicator {
				position: absolute;
				top: 1px;
				left: 0;
				height: 3rem;
				width: 3rem;
				background: #e6e6e6;
				border-radius: 4px
			}
			.control input:checked ~ .control__indicator {
				background: #33c3f0;
			}
			.control:hover input:not([disabled]):checked ~ .control__indicator,
			.control input:checked:focus ~ .control__indicator {
				background: #1eaedb;
			}
			.control input:disabled ~ .control__indicator {
				background: #e6e6e6;
				opacity: 0.6;
				pointer-events: none;
			}
			.control__indicator:after {
				content: '';
				position: absolute;
				display: none;
			}
			.control input:checked ~ .control__indicator:after {
				display: block;
			}
			.control--checkbox .control__indicator:after {
				left: 11px;
				top: 4px;
				width: 7px;
				height: 15px;
				border: solid #fff;
				border-width: 0 2px 2px 0;
				transform: rotate(45deg);
			}
			.control--checkbox input:disabled ~ .control__indicator:after {
				border-color: #7b7b7b;
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

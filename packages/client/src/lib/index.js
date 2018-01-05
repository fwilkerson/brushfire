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

export function renderToString(elements = []) {
	if (!Array.isArray(elements)) elements = [elements];
	return elements.reduce(renderElement, '');
}

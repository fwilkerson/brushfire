function setAttribute(node, name, curr, prev) {
	if (name.slice(0, 2) == 'on') {
		name = name.toLowerCase().substring(2);
		if (curr) {
			if (!prev) node.addEventListener(name, delegateEvent);
		} else {
			node.removeEventListener(name, delegateEvent);
		}
		node._listeners = node._listeners || {};
		node._listeners[name] = curr;
	} else if (name == 'style') {
		if (curr) {
			const styles = Object.assign({}, prev, curr);
			for (let i in styles) {
				node.style[i] = curr[i] || '';
			}
		} else node.style.cssText = '';
	} else {
		try {
			node[name] = curr;
		} catch (e) {}
		if (curr) node.setAttribute(name, curr);
		else node.removeAttribute(name);
	}
}

function delegateEvent(e) {
	return this._listeners[e.type](e);
}

function hydrateAttributes(node, vnode, index) {
	if (typeof vnode === 'string') return;
	const child = node.childNodes[index || 0];

	Object.keys(vnode.attributes).forEach(k =>
		setAttribute(child, k, vnode.attributes[k])
	);

	vnode.children = [].concat(vnode.children);
	const length = vnode.children.length;
	for (let i = 0; i < length; i++) {
		hydrateAttributes(child, vnode.children[i], i);
	}
}

function createNode(vnode) {
	if (typeof vnode === 'string') return document.createTextNode(vnode);

	const node = document.createElement(vnode.type);

	vnode.children.forEach(c => node.appendChild(createNode(c)));
	Object.keys(vnode.attributes).forEach(k =>
		setAttribute(node, k, vnode.attributes[k])
	);

	return node;
}

function patch(node, curr, prev, index) {
	const child =
		node.childNodes[index || 0] || node.childNodes[node.childNodes.length - 1];

	if (!prev && curr) {
		node.appendChild(createNode(curr));
	} else if (!curr) {
		node.removeChild(child);
	} else if (
		typeof curr !== typeof prev ||
		(typeof curr === 'string' && curr !== prev) ||
		curr.type !== prev.type
	) {
		node.replaceChild(createNode(curr), child);
	} else if (curr.type) {
		patchAttributes(child, curr.attributes, prev.attributes);
		curr.children = [].concat(curr.children);
		const length = Math.max(curr.children.length, prev.children.length);
		for (let i = 0; i < length; i++) {
			patch(child, curr.children[i], prev.children[i], i);
		}
	}
}

function patchAttributes(node, curr, prev) {
	const attr = Object.assign({}, prev, curr);
	Object.keys(attr).forEach(k => setAttribute(node, k, curr[k], prev[k]));
}

let render = () => {};

function muve(view, init, target, hydrate = false) {
	let prev;

	render = model => {
		let temp = view(model);
		if (!Array.isArray(temp)) temp = [temp];
		temp = [].concat.apply([], temp);
		temp.forEach((node, i) => patch(target, node, prev[i], i));
		prev = temp;
	};

	prev = view(init);
	if (!Array.isArray(prev)) prev = [prev];
	prev = [].concat.apply([], prev);

	if (hydrate) {
		prev.forEach((node, i) => hydrateAttributes(target, node, i));
	} else {
		prev.forEach((node, i) => patch(target, node, node, i));
	}
}

function interact(model, log) {
	return {
		getModel: () => model,
		setModel: (update, name) => {
			model = Object.assign({}, model, update);
			render(model);
			if (log && name) log(name, update);
		},
	};
}

const stack = [];

function h(type, attributes, ...args) {
	let child, i;
	const children = [];
	attributes = attributes || {};

	for (i = args.length; i--; ) {
		stack.push(args[i]);
	}

	while (stack.length) {
		if ((child = stack.pop()) && child.pop !== undefined) {
			for (i = child.length; i--; ) {
				stack.push(child[i]);
			}
		} else if (child != null && child !== true && child !== false) {
			if (typeof child === 'number') child = String(child);
			children.push(child);
		}
	}
	if (typeof type === 'function') {
		return type(Object.assign({}, attributes, {children}));
	} else return {type, attributes, children};
}

export {interact, h};
export default muve;

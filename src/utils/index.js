export const count = (iterable, predicate) => {
	if (predicate == null || typeof iterable == 'string') return iterable.length;
	return iterable.filter(predicate).length;
};

export const isNullOrWhiteSpace = str => {
	return str == null || str.trim() === '';
};

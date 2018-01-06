exports.count = (iterable, predicate) => {
	if (predicate == null || typeof iterable == 'string') return iterable.length;
	return iterable.filter(predicate).length;
};

exports.isNullOrWhiteSpace = str => {
	return str == null || str.trim() === '';
};

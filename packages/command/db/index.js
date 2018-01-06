const {Pool} = require('pg');

const pool = new Pool();

const appendEventQuery = `INSERT INTO event (aggregate_id, type, payload) VALUES ($1, $2, $3) RETURNING event_id`;

exports.appendEvent = ({aggregateId, type, payload}) => {
	return pool.query(appendEventQuery, [
		aggregateId,
		type,
		JSON.stringify(payload),
	]);
};

const getEventsQuery = `SELECT * FROM event WHERE aggregate_id = $1 ORDER BY event_id`;

exports.getEvents = ({aggregateId}) => {
	return pool.query(getEventsQuery, [aggregateId]);
};

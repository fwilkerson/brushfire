const {Pool} = require('pg');

const pool = new Pool();

const appendEventQuery = `INSERT INTO event (aggregate_id, type, payload) VALUES ($1, $2, $3) RETURNING *`;
exports.appendEvent = async ({aggregateId, type, payload}) => {
	const {rows} = await pool.query(appendEventQuery, [
		aggregateId,
		type,
		JSON.stringify(payload),
	]);
	return rows;
};

const getEventsQuery = `SELECT * FROM event WHERE event_id > $1 ORDER BY event_id`;
exports.getEvents = async ({eventId}) => {
	const {rows} = await pool.query(getEventsQuery, [eventId || 0]);
	return rows;
};

const config = require('dotenv').config();
const zmq = require('zeromq');

const {eventTypes} = require('../shared');

// Blow the service up if there is an env config error
if (config.error) {
	throw config.error;
}

const subscriber = zmq.socket('sub');
const dealer = zmq.socket('dealer');
dealer.bindSync(process.env.EVENT_STORE_SYNCHRONIZE);

// TODO: Figure out aggregates & snapshots

module.exports = async (request, response) => {};

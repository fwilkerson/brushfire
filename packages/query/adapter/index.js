const zmq = require('zeromq');

const dealer = zmq.socket('dealer');

process.on('SIGINT', () => {
	dealer.close();
	process.exit();
});

try {
	dealer.bindSync(process.env.EVENT_STORE_SYNCHRONIZE);
} catch (e) {}

exports.syncWithEventBus = (eventId, handler) => {
	dealer.once('message', handler);
	dealer.send(JSON.stringify({eventId}));
};

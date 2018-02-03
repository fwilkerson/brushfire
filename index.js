const {fork} = require('child_process');
require('babel-register');
require('./src/server');

/**
 * Simplify the development environment by keeping the microservices in
 * child processes. In a production environment, each service would be in
 * it's own node.
 */
fork('./commands.js');
fork('./queries.js');
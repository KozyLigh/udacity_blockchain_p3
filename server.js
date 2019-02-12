'use strict';

const Hapi=require('hapi');
const routesAssign = require('./routes.js');

// Create a server with a host and port
const server=Hapi.server({
    host:'localhost',
    port:8000
});


// Here we assign routes to server
routesAssign(server);

// Start the server
const start =  async function() {

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();
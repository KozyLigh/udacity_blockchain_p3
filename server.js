'use strict';

const Hapi=require('hapi');
const Joi = require('joi');
const Simple = require('./simpleChain.js');
const scb = new Simple.Block();
const sc = new Simple.Blockchain();

// Create a server with a host and port
const server=Hapi.server({
    host:'localhost',
    port:8000
});

// Add the route
server.route({
    method:'GET',
    path:'/block/{height}',
    handler:async function(request,h) {
        let block = await sc.getBlock(parseInt(request.params.height, 10));
        if(block===undefined)
            return h.response("Invalid block height").code(400);
        return block;

    },
    options: {
        validate: {
            params: {
                height: Joi.number().integer().min(0)
            }
        }
    }
});

server.route({
    method:'POST',
    path:'/block',
    handler:async function(request,h) {
        let body = request.payload.body;
        let block = new scb.constructor(body);
        let newBlock = await sc.addBlock(block);
        return newBlock;

    },
    options: {
        validate: {
            payload: {
                body: Joi.string().min(1)
            }
        }
    }
});

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
const Boom = require('boom');
const Joi = require('joi');
const Simple = require('./simpleChain.js');

const MemPool = require('./mempool.js');


module.exports = function assignRoutes(server) {

    let myBlockChain = new Simple.Blockchain();

    let memPool = new MemPool();

    // Accepts a request validation for an address

    server.route({
        method: 'POST',
        path: '/requestValidation',
        handler: async function (request, h) {
            try {
                const requestAddress = request.payload.address;
                // validationResponse
                return await memPool.addARequestValidation(requestAddress);
            } catch (e) {
                return Boom.badRequest(e.message);
            }
        },
        options: {
            validate: {
                payload: {
                    // A Bitcoin address, or simply address, is an identifier of 26-35 alphanumeric characters, beginning with the number 1 or 3
                    // See https://en.bitcoin.it/wiki/Address
                    address: Joi.string().required().min(26).max(35).regex(/^[1|3]/)
                }
            }
        }
    });


    // Accepts a signature validation

    server.route({
        method: 'POST',
        path: '/message-signature/validate',
        handler: async function (request, h) {
            try {
                const address = request.payload.address;
                const signature = request.payload.signature;
                // validationResponse
                return memPool.validateRequestByWallet(address, signature);
            } catch (e) {
                return Boom.badRequest(e.message);
            }
        },
        options: {
            validate: {
                payload: {
                    address: Joi.string().required().min(26).max(35).regex(/^[1|3]/),
                    signature: Joi.string().required()
                }
            }
        }
    });


    // Accepts a block for an address (that is signed in the mempool)

    server.route({
        method: 'POST',
        path: '/block',
        handler: async function (request, h) {
            try {
                const address = request.payload.address;
                const star = request.payload.star;
                const encodedStory = Buffer.from(star.story, 'utf8').toString('hex');
                if (memPool.verifyAddressRequest(address)) {
                    const encodedStar = {
                        ...star,
                        story: encodedStory
                    };
                    const body = {
                        address,
                        star: encodedStar
                    };
                    const block = new Simple.Block(body);
                    console.log("myBlockChain.addBlock(block);");
                    await myBlockChain.addBlock(block);
                    // Make sure only one Star can be send in the request
                    memPool.removeRequestFromPool(address);
                    return block;
                }
            } catch (e) {
                return Boom.badRequest(e.message);
            }
        },
        options: {
            validate: {
                payload: {
                    address: Joi.string().required().min(26).max(35).regex(/^[1|3]/),
                    star: Joi.object().required()
                }
            }
        }
    });


    // Get Star block by hash with JSON response.

    server.route({
            method: 'GET',
            path: '/stars/hash:{hash}',
            handler: async function (request, h) {
                try {
                    const hash = request.params.hash;
                    console.log("checking for hash="+hash)
                    return await myBlockChain.getStarByHash(hash);
                } catch (e) {
                    return Boom.badRequest(e.message);
                }
            },
            options: {
                validate: {
                    params: {
                        hash: Joi.string().required().min(60)
                    }
                }
            }
        }
    );


    // Get Star block by wallet address (blockchain identity)

    server.route({
            method: 'GET',
            path: '/stars/address:{address}',
            handler: async function (request, h) {
                try {
                    const address = request.params.address;
                    // blockArray
                    return await myBlockChain.getStarsByAddress(address);
                } catch (e) {
                    return Boom.badRequest(e.message);
                }
            },
            options: {
                validate: {
                    params: {
                        address: Joi.string().required().min(26).max(35).regex(/^[1|3]/)
                    }
                }
            }
        }
    );


    // Get star block by star block height with JSON response.

    server.route({
            method: 'GET',
            path: '/block/{height}',
            handler: async function (request, h) {
                try {
                    const height = request.params.height;
                    // block
                    return await myBlockChain.getBlockDecodedStory(height);
                } catch (e) {
                    return Boom.badRequest(e.message);
                }
            },
            options: {
                validate: {
                    params: {
                        height: Joi.number().required().min(0)
                    }
                }
            }
        }
    );


    // Get current info.

    server.route({
        method: 'GET',
        path: '/info',
        handler: async function (request, h) {
            try {
                return {height: await myBlockChain.getBlockHeight()};
            } catch (e) {
                return Boom.badImplementation('Unexpected error', e);
            }
        }
    });


    // Validate BlockChain

    server.route({
        method: 'GET',
        path: '/validateChain',
        handler: async function (request, h) {
            try {
                const invalidBlocks = await myBlockChain.validateChain();
                return {valid: true, invalidBlocks};
            } catch (invalidBlocks) {
                if (invalidBlocks) {
                    return {valid: false, invalidBlocks};
                } else {
                    return Boom.serverUnavailable('Unexpected error');
                }
            }
        }
    });

};


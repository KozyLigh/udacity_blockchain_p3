const loki = require('lokijs');
const Request = require('./request');
const BitcoinMessage = require('bitcoinjs-message');
const VALIDATION_WINDOW = 300;

//LokiJS is an in-memory synchronous database

module.exports = class MemPool {

    constructor() {
        this.db = new loki("blockchain.db");
        this.requests = this.db.addCollection("request");
    }

    // Updates an existing request or adds if new

    _handleRequest(request) {
        const existingRequest = this.requests.findObject({walletAddress: request.getWalletAddress()});
        if (existingRequest) {
            if (existingRequest.messageSignature) {
                throw new Error("Request was already signed");
            }
            // Existing request: make sure validation window is current
            let updatedRequest = new Request(existingRequest);
            Object.assign(existingRequest, updatedRequest);
            this.requests.update(existingRequest);
            return existingRequest;
        } else {
            // Once the Validation Window expires, the request will be removed
            request.timeoutID = setTimeout(this._removeRequest(request), VALIDATION_WINDOW * 1000);
            this.requests.insert(request);
            return request;
        }
    }


    // Generates a function to delete a specified request
    _removeRequest({walletAddress}) {
        return () => {
            this.requests.findAndRemove({walletAddress});
        };
    }


    // Updates an existing request (validation window) or creates new
    addARequestValidation(walletAddress) {
        const request = new Request({walletAddress, validationWindow: VALIDATION_WINDOW});
        const newRequest = this._handleRequest(request);
        // LokiJS metadata and additional Request fields are stripped out
        return {
            "walletAddress":newRequest.walletAddress,
            "requestTimeStamp":newRequest.requestTimeStamp,
            "message":newRequest.message,
            "validationWindow":VALIDATION_WINDOW
        };
    }


    // Returns the request for the wallet address

    validateRequestByWallet(walletAddress, signature) {
        const request = this.requests.find({walletAddress})[0];
        if (!request) {
            throw new Error('No pending request for address');
        }
        // if (request.messageSignature) {
        //     throw new Error('Request already successfully signed - you can already register a star');
        // }
        if(request.messageSignature && request.validationWindow>0){
            return {
                "registerStar": true,
                "status": {
                    "address": request.walletAddress,
                    "requestTimeStamp": request.requestTimeStamp,
                    "message": request.message,
                    "validationWindow": request.validationWindow,
                    "messageSignature": true
                }
            };
        }
        console.log(request.message);
        console.log("Validating address=" + walletAddress + ", sig="+signature);

        const isValid = BitcoinMessage.verify(request.message, walletAddress, signature);

        if (!isValid) {
            // Once correctly signed, the timeout is cancelled
            clearTimeout(request.timeoutID);
            // Flag this request as allowed for registering a single star
            request.messageSignature = true;
            this.requests.update(request);
            // Prepare return payload
            return {
                "registerStar": true,
                "status": {
                    "address": request.walletAddress,
                    "requestTimeStamp": request.requestTimeStamp,
                    "message": request.message,
                    "validationWindow": request.validationWindow,
                    "messageSignature": true
                }
            };
        }
        throw new Error("Invalid signature");
    }


    // Verify that the address has been signed

    verifyAddressRequest(walletAddress) {
        const request = this.requests.find({walletAddress})[0];
        if (!request) {
            throw new Error('Not a valid address');
        }
        if (!request.messageSignature) {
            throw new Error('Address not signed/authorized');
        }
        return true;
    }


    // Removes request from MemPool

    removeRequestFromPool(walletAddress) {
        this.requests.findAndRemove({walletAddress});
    }

};

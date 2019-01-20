/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
//Importing levelSandbox class
const LevelSandboxClass = require('./levelSandbox.js');

// Creating the levelSandbox class object
const db = new LevelSandboxClass.LevelSandbox();

const SHA256 = require('crypto-js/sha256');


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/


class Block {
    constructor(data) {
        this.hash = "",
            this.height = 0,
            this.body = data,
            this.time = 0,
            this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
    constructor() {

    }

    // Add new block
    addBlock(newBlock) {
        let self = this;
        return new Promise(function(resolve, reject) {

            //check if Genesis block exists, if not create new Genesis block
            db.getLevelDBData(0).then((result) => {
                if (result == undefined) {
                    let block = new Block("First block in the chain - Genesis block");
                    block.time = new Date().getTime().toString().slice(0, -3);
                    block.hash = SHA256(JSON.stringify(block)).toString();
                    db.addLevelDBData(0, JSON.stringify(block).toString()).then((result) => {
                        if (!result) {
                            reject();
                        }
                    }).catch((err) => {
                        console.log(err);
                    });
                }
                // Block height
                db.getBlocksCount().then((count) => {
                    newBlock.height = parseInt(count, 10);
                    // UTC timestamp
                    newBlock.time = new Date().getTime().toString().slice(0, -3);
                    // previous block hash
                    if (parseInt(newBlock.height, 10) > 0) {
                        let oldBlock;
                        self.getBlock(parseInt(newBlock.height - 1, 10)).then((result) => {
                            oldBlock = result;
                            if (oldBlock == undefined) {
                                newBlock.height = 0;
                            } else {
                                newBlock.previousBlockHash = oldBlock.hash;
                            }
                            // Block hash with SHA256 using newBlock and converting to a string
                            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

                            // Adding block object to chain
                            db.addLevelDBData(parseInt(newBlock.height, 10), JSON.stringify(newBlock).toString()).then((result) => {
                                if (!result) {
                                    console.log("Error Adding data");
                                    reject();
                                } else {
                                    self.validateBlock(result.height).then((result) => {
                                        resolve(result);
                                    }, (err) => {
                                        reject(err);
                                    });


                                }
                            }).catch((err) => {
                                console.log(err);
                            });
                        });

                    }

                }).catch((err) => {
                    console.log(err);
                });

            }).catch((error) => {
                let block = new Block("First block in the chain - Genesis block");
                block.time = new Date().getTime().toString().slice(0, -3);
                block.hash = SHA256(JSON.stringify(block)).toString();
                db.addLevelDBData(0, JSON.stringify(block).toString()).then((result) => {
                    if (!result) {
                        console.log("Error Adding data");
                        reject();
                    }
                }).catch((err) => {
                    console.log(err);
                });
            });
            resolve;
        });

    }

    // Get block height
    getBlockHeight() {
        return new Promise(function(resolve) {
            db.getBlocksHeight().then((data) => {
                resolve(data)
            })
        });
    }

    // get block
    getBlock(blockHeight) {
        let self = this;
        return new Promise(function(resolve, reject) {
            db.getLevelDBData(blockHeight).then((data) => {
                if (data == undefined) {
                    resolve(undefined);
                } else {
                    resolve(JSON.parse(data));
                }

            }).catch((error) => {
                console.log('getBlock error = ' + error);
                reject();
            })
        });

    }

    // validate block
    async validateBlock(blockHeight) {
        let self = this;
        let promise = new Promise((resolve, reject) => {
            let block;
            this.getBlock(blockHeight).then((result) => {
                block = result;
                // get block hash
                let blockHash = block.hash;
                // remove block hash to test block integrity
                block.hash = '';
                // generate block hash
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                // Compare
                if (blockHash === validBlockHash) {
                    console.log('Block #' + blockHeight + ' has valid hash: ' + blockHash);
                    resolve(true);
                } else {
                    console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
                    reject(false);
                }

            });

        });
        let result = await promise;
    }
    // Validate blockchain
    validateChain() {
        return new Promise((resolve, reject) => {
            let errorLog = [];
            db.getBlocksCount().then((count) => {
                if (count === 0) {
                    resolve(); // empty is valid
                    return;
                }
                const promises = [];
                let promiseCount = count;
                for (let i = 0; i < count; i++) {
                    // validate block
                    const promise = new Promise((resolve, reject) => {
                        this.validateBlock(i).then((valid) => {
                            resolve();
                        }, (error) => {
                            errorLog.push(i);
                            reject();
                        }).catch(() => {
                            reject();
                        });
                    });
                    promises.push(promise);
                }
                Promise.all(promises.map(p => p.catch(() => undefined))).then((data) => {
                    resolve(errorLog);
                }, (error) => {
                    reject(errorLog);
                });
            });
        });

    }
}

(function run() {
    let bc = new Blockchain();
    theLoop(1, bc);
})(0);

function theLoop(i, bc) {
    setTimeout(function() {
        let blockTest = new Block("Test Block - " + (i + 1));
        bc.addBlock(blockTest).then((result) => {
            i++;
            if (i < 10) {
                theLoop(i, bc);
            } else {
                console.log('#####validating#####');
                bc.validateChain().then((result) => {
                    if (result.length > 0) {
                        console.log('Chain has errors!');
                        console.log('Blocks with errors = ' + result.length);
                        for (let i = 0; i <= result.length - 1; i++) {
                            console.log('Blocks: ' + result[i]);
                        }
                        bc.getBlockHeight().then((res) => {
                            console.log('block height=' + parseInt(res, 10));
                        });
                    } else {
                        console.log('chain looks good');
                        bc.getBlockHeight().then((res) => {
                            console.log('block height=' + parseInt(res, 10));
                        });
                    }

                })
            }

        });
    }, 100);

};
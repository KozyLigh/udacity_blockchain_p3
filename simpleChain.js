/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
//Importing levelSandbox class
const LevelSandboxClass = require('./levelSandbox.js');
const SHA256 = require('crypto-js/sha256');
const db = new LevelSandboxClass.LevelSandbox();
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
    getBlockHash() {
        return SHA256(SHA256(JSON.stringify({...this,hash:''})).toString()).toString();
    }
}



/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
    constructor() {

    }

    // Add new block
    async addBlock(newBlock) {
        let self = this;
        let prom = new Promise(function(resolve, reject) {

            //check if Genesis block exists, if not create new Genesis block
            db.getLevelDBData(0).then((result) => {
                if (result == undefined) {
                    let block = new Block("First block in the chain - Genesis block");
                    block.time = new Date().getTime().toString().slice(0, -3);
                    block.hash = block.getBlockHash();//SHA256(JSON.stringify(block)).toString();
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
                            newBlock.hash = newBlock.getBlockHash();//SHA256(JSON.stringify(newBlock)).toString();
                            // Adding block object to chain

                            db.addLevelDBData(parseInt(newBlock.height, 10), JSON.stringify(newBlock).toString()).then((result) => {
                                if (!result) {
                                    console.log("Error Adding data");
                                    reject();
                                } else {
                                    self.validateBlock(result.height).then((result) => {
                                        resolve(JSON.stringify(newBlock).toString());
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
        });

        let result = await prom;
        return result;
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
                    resolve(data);
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

    // Utility to inject a decoded story into block (not for genesis)

    _withDecodedStory(block) {
        if (block.height > 0) {
            const encodedStory = block.body.star.story;
            block.body.star.storyDecoded = Buffer.from(encodedStory, 'hex').toString('utf8');
        }
        return block;
    }

    // Block By Height with a decoded story
    getBlockDecodedStory(height) {
        let self = this;

        return db.getLevelDBData(height)
            .then(block => {

                    return self._withDecodedStory(block);
                },
                () => {
                    throw new Error(`No block at height ${height}`);
                });
    }

    // Returns block for Star with hash
    // if no match error is thrown

    getStarByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.getBlockStream()
                .on('data', blockStr => {
                    const testBlock = JSON.parse(blockStr);
                    if (testBlock.hash === hash) {
                        const block = self._withDecodedStory(testBlock);
                        resolve(block);
                    }
                })
                .on('end', () => reject(new Error('No such hash in blockchain')));
        });
    }

    // Returns Stars with matching address

    getStarsByAddress(address) {
        let self = this;
        let blockArray = [];
        return new Promise((resolve, reject) => {
            this.db.getBlockStream()
                .on('data', blockStr => {
                    const testBlock = JSON.parse(blockStr);
                    if (testBlock && testBlock.body && testBlock.body.address === address) {
                        const block = self._withDecodedStory(testBlock);
                        blockArray.push(block);
                    }
                })
                .on('end', () => resolve(blockArray));
        });
    }

}


module.exports = {
    Blockchain : Blockchain,
    Block : Block
}
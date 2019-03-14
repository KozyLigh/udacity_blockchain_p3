/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
//Importing levelSandbox class
const LevelSandboxClass = require('./levelSandbox.js');
const SHA256 = require('crypto-js/sha256');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
    constructor(data) {
        this.hash = '';
        this.height = 0;
        this.body = data;
        this.time = new Date().getTime().toString().slice(0, -3);
        this.previousBlockHash = '';
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
        this.db = new LevelSandboxClass.LevelSandbox();
    }

    genesisBlock() {
        let genesisBlock = new Block("First block in the chain - Genesis block");
        genesisBlock.hash = genesisBlock.getBlockHash();
        return genesisBlock;
    }

    // Add new block
    async addBlock(newBlock) {
        let self = this;
        let prom = new Promise(function(resolve, reject) {
            self.db.getBlocksCount().then(height=> {
                if (height === 0) {
                    // Empty blockchain, create Genesis
                    console.log("Genesis");
                    var genesis=self.genesisBlock();
                    console.log(genesis);
                    return self.db.addLevelDBData(0, genesis)
                        .then(() =>
                            {
                                console.log("genesis added");
                            // pass height of chain, Genisis block makes it 1, since it is the first block
                            return 1});
                } else {
                    // pass height of chain
                    console.log("height="+height);
                    return height;
                }

                })
                .then((height) => {
                    console.log("before getBlock call in addBlock");
                    console.log(height);
                    console.log("getBlock(" + parseInt(height- 1,10)  +")");
                    // Need previous block to determine new height and previous block hash
                    return self.getBlock(parseInt(height- 1,10) );
                })
                .then(prevBlock => {
                    console.log("before prevBlock");
                    newBlock.height = prevBlock.height + 1;
                    newBlock.previousBlockHash = prevBlock.hash;
                    console.log("getBlockHash()");
                    newBlock.hash = newBlock.getBlockHash();
                    console.log("before prevBlock addLevelDBData height="+ newBlock.height);
                    console.log("before prevBlock addLevelDBData block="+ newBlock);
                    return self.db.addLevelDBData(newBlock.height, newBlock);
                })
                .then(result => {
                    resolve(result);
                })
                .catch(err => reject(err));
        });

        let result = await prom;
        return result;
    }

    // Get block height
    getBlockHeight() {
        return this.db.getBlocksHeight();
    }

    // get block
    getBlock(blockHeight) {
        let self = this;
        console.log("in getBlock with height="+blockHeight);
        return this.db.getLevelDBData(blockHeight)
            .then(block => {
                console.log("getBlock returned block = "+block);
                return block},
                () => {
                    throw new Error(`No block at height ${blockHeight}`);
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
            this.db.getBlocksCount().then((count) => {
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

        return this.db.getLevelDBData(height)
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
            self.db.getBlockStream()
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
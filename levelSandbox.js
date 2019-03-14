/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';


class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }
// Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        return this.db.put(key, JSON.stringify(value).toString());
    }
// Get data from levelDB with a key (Promise)
    getLevelDBData(key){
        return this.db.get(key)
            .then(block => {
                return new Promise((resolve, reject) => {
                    try {
                        const jsonText = JSON.parse(block);
                        resolve(jsonText);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
    }

    getBlocksHeight() {
        let self = this;
        let height=0;
        return new Promise(function (resolve, reject) {
            self.db.createReadStream({})
                .on('data', () => height=height+1)
                .on('error', (err) => reject(err))
                .on('end', () => resolve(height));
        });
    }


    getBlocksCount() {
        let self = this;
        // Add your code here
        return new Promise(function(resolve, reject){
            var stream = self.db.createReadStream({reverse:true});
            var number=0;
            stream.on('data', function (data, err) { if(err){reject(err);} number++;
            }).on('error',function(){reject();}).on('close',function(){
                resolve(number);});

        })
    }

    getBlockStream() {
        return this.db.createValueStream();
    }

}

module.exports.LevelSandbox = LevelSandbox;
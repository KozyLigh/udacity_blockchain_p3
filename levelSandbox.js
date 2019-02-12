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
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.put(key, value, function(err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                console.log('Block ' + key + ' submission successful =' + value);
                resolve(JSON.parse(value));
            });
        });
    }
// Get data from levelDB with a key (Promise)
    getLevelDBData(key){
        let self = this;


        return new Promise(function(resolve, reject) {
            self.db.get(key, (err, value) => {
                if(err){
                    if (err.type == 'NotFoundError') {
                        console.log('getLevelDBData NotFoundError');
                        resolve(undefined);
                    }else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                }else {
                    resolve(value);
                }
            });
        });
    }

    getBlocksHeight() {
        let self = this;
        return new Promise(function(resolve, reject){
            var stream = self.db.createReadStream({});
            var height=0;
            stream.on('data', function (data, err) { if(err){reject(err);} if(parseInt(JSON.parse(data.value).height,10)>height) height=parseInt(JSON.parse(data.value).height,10);
            }).on('error',function(){reject();}).on('close',function(){
                resolve(height);
            });
        })
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
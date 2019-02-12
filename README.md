# P4 - Build a Private Blockchain Notary Service

* Blockchain Star Registry Service

## Setup

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

$ node --version
    v11.5.0

    $ npm --version
    6.5.0

### Download project from repo

https://github.com/KozyLigh/udacity_blockchain_p3.git

$ cd udacity-private-blockchain_p3
$ npm install

### Running the project

To start the Web API on **localhost:8000**, run the following:

    $ npm start

## Server

The web server is listening to requests on port 8000

Address: http://localhost:8000

## Rest API methods

The server supports two methods.

GET:
Path:/block/{height}
height can only be an integer value 0 and up.

Method returns a block with the specified height,
if the block does not exist, it returns HttpStatus 400

Response example:
```
{
    "hash": "ad5c9f6c57a604b32be9b94b274b4ada68dd262ec53f6cea4836e7f4f7bfe0d1",
    "height": 50,
    "body": "Test Block - 6",
    "time": "1548019606",
    "previousBlockHash": "96dc365263ab0b098c16b5170267ff04cc811de493b928526fe7be13e475232f"
}
```

POST:
Path:/block
Method expects a payload parameter body with string content, minimum length of 1
Method will return a HttpStatus 400 if payload parameter body is empty or missing

Request payload object example:
```
{
"body":"test adding block 1234"
}
```

Response example:
```
{
    "hash": "78b2459a5185e433156a6d43a85041fe4365a4dbe49b48a42dbc413fbaa99dfd",
    "height": 677,
    "body": "test adding block 12346",
    "time": "1548074386",
    "previousBlockHash": "1e296d22e096b93f7a63efba1190d2d46cdb93a487f169bd3513982f5b0e7a0f"
}
```

POST:
Request Validation 
Path:/requestValidation 
```{    "address":"28ecEqCy8LfsK17b4v5ansJfXpiyhDzB3T"}```

Response example:
```
{
  "walletAddress": "28ecEqCy8LfsK17b4v5ansJfXpiyhDzB3T",
  "requestTimeStamp": "1546257945",
  "message": "28ecEqCy8LfsK17b4v5ansJfXpiyhDzB3T:1546255945:starRegistry",
  "validationWindow": 300
}
````

POST:
Validate a Signature 
Path:/message-signature/validate 
```{"address":"28ecEqCy8LfsK17b4v5ansJfXpiyhDzB3T",   "signature":"H2mEWlo0AnE6XjUIkDpSV93XAawqib3kHa+uIPWGphklO+bF5hrMNdVqu0NTgVvolZ/WV6uJi8mwXB/7by8K0KQ="}```


Response example:
```
{
  "registerStar": true,
  "status": {
    "address": "28ecEqCy8LfsK17b4v5ansJfXpiyhDzB3T",
    "requestTimeStamp": "1546256313",
    "message": "28ecEqCy8LfsK17b4v5ansJfXpiyhDzB3T:1546256313:starRegistry",
    "validationWindow": 300,
    "messageSignature": true
  }
}
```


POST:
Post a claim for a star 
Path: /block 
```
{"address":"28ecEqCy8LfsK17b4v5ansJfXpiyhDzB3T",  
"star": {"dec": "68° 52\' 56.9","ra": "16h 29m 1.0s","story": "Found star using https://www.google.com/sky/"}}
```


Response example:
```
{
  "hash": "78cd0333a2065660785244293241007ac5a029b881fbc873c00ac9d96bca7364",
  "height": 31,
  "body": {
    "address": "18ecEqCy8LfsK17b4v5ansJfXpiyhDzB3T",
    "star": {
      "dec": "68° 52' 56.9",
      "ra": "16h 29m 1.0s",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
    }
  },
  "time": "1546256476",
  "previousBlockHash": "ab499550ea6b727ae5148eda016d4f2b03605b40038943935d8044cd2256e328"
}
```

GET:
Get star block by block hash 
Path:/stars/hash:[HASH] 


Response example:
```
{
  "hash": "78cd0333a2065660785244293241007ac5a029b881fbc873c00ac9d96bca7364",
  "height": 31,
  "body": {
    "address": "28ecEqCy8LfsK17b4v5ansJfXpiyhDzB3T",
    "star": {
      "dec": "68° 52' 56.9",
      "ra": "16h 29m 1.0s",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1546256476",
  "previousBlockHash": "ab499550ea6b727ae5148eda016d4f2b03605b40038943935d8044cd2256e328"
}
```

GET:
Get stars by wallet address 
Path:/stars/address:[ADDRESS] 

Response example:
```
[
  {
    "hash": "78cd0333a2065660785244293241007ac5a029b881fbc873c00ac9d96bca7364",
    "height": 31,
    "body": {
      "address": "28ecEqCy8LfsK17b4v5ansJfXpiyhDzB3T",
      "star": {
        "dec": "68° 52' 56.9",
        "ra": "16h 29m 1.0s",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1546256476",
    "previousBlockHash": "ab499550ea6b727ae5148eda016d4f2b03605b40038943935d8044cd2256e328"
  }
]
```



GET:
Get star block by block height 
Path:/block/{height}

Response example:
```
{
  "hash": "dd3cb5c31adb75702ae97bd0b79e0cf92d4286d9dc0cfe5f41a40158bf1c0d65",
  "height": 1,
  "body": {
    "address": "1DHEcCVTpQisJVwoDtoSzyD86SwzmY4UzG",
    "star": {
      "dec": "68° 52' 56.9",
      "ra": "16h 29m 1.0s",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1546255664",
  "previousBlockHash": "78c601d161387579963fd8462717c53b188ce95f8baffb612edc4df8b50768a5"
}
```

## Testing

To test code:
1: Open a command prompt or shell terminal after install node.js.
2: Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
```
node
```
3: Copy and paste your code into your node session
4: Instantiate blockchain with blockchain variable
```
let blockchain = new Blockchain();
```
5: Generate 10 blocks using a for loop
```
for (var i = 0; i <= 10; i++) {
  blockchain.addBlock(new Block("test data "+i));
}
```
6: Validate blockchain
```
blockchain.validateChain();
```
7: Induce errors by changing block data
```
let inducedErrorBlocks = [2,4,7];
for (var i = 0; i < inducedErrorBlocks.length; i++) {
  blockchain.chain[inducedErrorBlocks[i]].data='induced chain error';
}
```
8: Validate blockchain. The chain should now fail with blocks 2,4, and 7.
```
blockchain.validateChain();
```



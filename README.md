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
```{ "address":"159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R" }```

Response example:
```
{
    "walletAddress": "159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R",
    "requestTimeStamp": "1552682311",
    "message": "159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R:1552682311:starRegistry",
    "validationWindow": 284
}
````

POST:
Validate a Signature 
Path:/message-signature/validate 
```
{
"address":"159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R",
 "signature":"HxHaiPtVbzuac6cTa7kdEuYQkFeolURnU+3jxVnpEd3xf/FcsUYicP1xqGuAXiSqAVm33lJPUEA6EWeOAqn9UbQ="
}
```


Response example:
```
{
    "registerStar": true,
    "status": {
        "address": "159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R",
        "requestTimeStamp": "1552682311",
        "message": "159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R:1552682311:starRegistry",
        "validationWindow": 284,
        "messageSignature": true
    }
}
```


POST:
Post a claim for a star 
Path: /block 
```
{
"address": "159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R",
"star": {
	"dec": "63° 52' 56.9",
    "ra": "15h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
    }
}
```


Response example:
```
{
    "hash": "e2b2e930c79bb607925f0c753c5fdd813fa06e4e6598725ae4ef292cee457079",
    "height": 3,
    "body": {
        "address": "159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R",
        "star": {
            "dec": "63° 52' 56.9",
            "ra": "15h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1552682330",
    "previousBlockHash": "9ea9c46522f136138690c2ed46899c0b77f3a19739ddf1736cce91aa47413c19"
}
```

GET:
Get star block by block hash 
Path:/stars/hash:[HASH] 


Response example:
```
{
    "hash": "91af3febbe08558416f54832f3505d1f0dd990225b9670e35115c73590fcb84f",
    "height": 1,
    "body": {
        "address": "159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R",
        "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1552552932",
    "previousBlockHash": "97899b8d9e6c3a0cd4be38cf87510b7928fd91214a209213d7eeb5b62bc44543"
}
```

GET:
Get stars by wallet address 
Path:/stars/address:[ADDRESS] 

Response example:
```
[
    {
        "hash": "91af3febbe08558416f54832f3505d1f0dd990225b9670e35115c73590fcb84f",
        "height": 1,
        "body": {
            "address": "159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R",
            "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1552552932",
        "previousBlockHash": "97899b8d9e6c3a0cd4be38cf87510b7928fd91214a209213d7eeb5b62bc44543"
    },
    {
        "hash": "9ea9c46522f136138690c2ed46899c0b77f3a19739ddf1736cce91aa47413c19",
        "height": 2,
        "body": {
            "address": "159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R",
            "star": {
                "dec": "63° 52' 56.9",
                "ra": "15h 29m 1.0s",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1552553136",
        "previousBlockHash": "91af3febbe08558416f54832f3505d1f0dd990225b9670e35115c73590fcb84f"
    },
    {
        "hash": "e2b2e930c79bb607925f0c753c5fdd813fa06e4e6598725ae4ef292cee457079",
        "height": 3,
        "body": {
            "address": "159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R",
            "star": {
                "dec": "63° 52' 56.9",
                "ra": "15h 29m 1.0s",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1552682330",
        "previousBlockHash": "9ea9c46522f136138690c2ed46899c0b77f3a19739ddf1736cce91aa47413c19"
    }
]
```



GET:
Get star block by block height 
Path:/block/{height}

Response example:
```
{
    "hash": "91af3febbe08558416f54832f3505d1f0dd990225b9670e35115c73590fcb84f",
    "height": 1,
    "body": {
        "address": "159B6oiSJSHHZKNNyKNCYNTHCt9jSH3P2R",
        "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1552552932",
    "previousBlockHash": "97899b8d9e6c3a0cd4be38cf87510b7928fd91214a209213d7eeb5b62bc44543"
}
```

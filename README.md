# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```

- Install hapi with --save flag
```
npm install hapi --save
```

- Install joi with --save flag
```
npm i joi --save
```

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
"body":"test adding block"
}
```

Response example:
```
{"hash":"b0a6862a502b96ba0655f13fd2ae8b6ed304edc34ded5b976d3a783b36bce54f","height":592,"time":"1548053611","previousBlockHash":"de19912c7f8410d0ca06f6261de593a4af25b6ad0a98f0a3f9ff63525f5edc14"}
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


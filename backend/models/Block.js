const {hasher} = require('../helper.js');

class Block{
    constructor(previousBlockHeaderHash, transactions){
        this.previousBlockHeaderHash = previousBlockHeaderHash;
        this.transactions = transactions;
        this.timeStamp = Date.now();
        this.blockDataHash = hasher(transactions);
    }
}

module.exports = Block;
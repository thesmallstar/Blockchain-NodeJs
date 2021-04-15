const SHA256 = require("crypto-js/sha256");
const hasher = (data) => {
  const hash = SHA256(JSON.stringify(data)).toString();
  //console.log(hash);
  return hash;
};

class Block {
  constructor(previousBlockHeaderHash, transactions) {
    this.previousBlockHeaderHash = previousBlockHeaderHash;
    this.transactions = transactions;
    this.timeStamp = Date.now();
    this.blockDataHash = hasher(transactions);
  }
  getHeaderHash() {
    const { previousBlockHeaderHash, timeStamp, blockDataHash } = this;
    return hasher({ previousBlockHeaderHash, timeStamp, blockDataHash });
  }
}
module.exports = Block;

const SHA256 = require("crypto-js/sha256");
const Transaction = require("./Transaction");

const hasher = (data) => {
  const hash = SHA256(JSON.stringify(data)).toString();
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

  copyFrom({
    previousBlockHeaderHash,
    transactions,
    timeStamp,
    blockDataHash,
  }) {
    this.previousBlockHeaderHash = previousBlockHeaderHash;
    this.transactions = transactions.map((recTransaction) => {
      const transaction = new Transaction(...Object.values(recTransaction));
      return transaction;
    });
    this.timeStamp = timeStamp;
    this.blockDataHash = blockDataHash;
    //  console.log(hasher(this.transactions), blockDataHash);
  }
}
module.exports = Block;

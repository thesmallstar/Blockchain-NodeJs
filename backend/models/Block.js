const SHA256 = require("crypto-js/sha256");
const Transaction = require("./Transaction");

const hasher = (data) => {
  const hash = SHA256(JSON.stringify(data)).toString();
  return hash;
};

class Block {
  constructor(previousBlockHeaderHash, transactions, balances) {
    this.previousBlockHeaderHash = previousBlockHeaderHash;
    this.transactions = transactions;
    this.timeStamp = Date.now();
    this.blockDataHash = hasher(transactions);
    this.balances = balances;
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
    balances,
  }) {
    this.previousBlockHeaderHash = previousBlockHeaderHash;
    this.transactions = transactions.map((recTransaction) => {
      const transaction = new Transaction(...Object.values(recTransaction));
      return transaction;
    });
    this.timeStamp = timeStamp;
    this.blockDataHash = blockDataHash;
    this.balances = JSON.parse(JSON.stringify(balances));
    //  console.log(hasher(this.transactions), blockDataHash);
  }

  // mineBlock(difficulty) {
  //   while (
  //     this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
  //   ) {
  //     this.nonce++;
  //     this.hash = this.calculateHash();
  //   }
  //   console.log("Hash of mined Block: " + this.hash);
  // }
}
module.exports = Block;

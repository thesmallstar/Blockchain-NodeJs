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
    this.nonce = 0;
    this.difficulty = 3;
    this.hash=''
  }

  getHeaderHash() {
    const { previousBlockHeaderHash, timeStamp, blockDataHash } = this;
    return hasher({ previousBlockHeaderHash, timeStamp, blockDataHash });
  }

  calculateHash() {
    const { previousBlockHeaderHash, timeStamp, blockDataHash, nonce, balances } = this;
    return hasher({ previousBlockHeaderHash, timeStamp, blockDataHash, nonce, balances });
  }

  async mine() {
    const ms = Math.floor(Math.random() * 1000)
    while (this.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join('0')) {
      this.nonce+=1;
      this.hash = this.calculateHash();
      console.log(this.hash)
      if(process.env.stop=='true')
      {
        console.log('Block has been mined by someone.')
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  verify() {
    return this.hash.substring(0, this.difficulty) == Array(this.difficulty + 1).join('0');
  }

  copyFrom({
    previousBlockHeaderHash,
    transactions,
    timeStamp,
    blockDataHash,
    balances,
    nonce,
    hash
  }) {
    this.previousBlockHeaderHash = previousBlockHeaderHash;
    this.transactions = transactions.map((recTransaction) => {
      const transaction = new Transaction(...Object.values(recTransaction));
      return transaction;
    });
    this.timeStamp = timeStamp;
    this.blockDataHash = blockDataHash;
    this.balances = JSON.parse(JSON.stringify(balances));
    this.nonce= nonce;
    this.hash=hash;
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

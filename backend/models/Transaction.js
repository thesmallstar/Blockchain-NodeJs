class Transaction {
  constructor(userA, userB, payLoad, signature) {
    this.userA = userA;
    this.userB = userB;
    this.payLoad = payLoad;
    this.signature = signature;
  }
}
module.exports = Transaction;

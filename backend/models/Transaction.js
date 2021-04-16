class Transaction {
  constructor(userA, userB, payload, signature) {
    this.userA = userA;
    this.userB = userB;
    this.payload = payload;
    this.signature = signature;
  }
}
module.exports = Transaction;

class Transaction {
  constructor(userA, userB, payload, signature, timeStamp) {
    this.userA = userA;
    this.userB = userB;
    this.payload = payload;
    this.signature = signature;
    this.timeStamp = timeStamp;
  }
}
module.exports = Transaction;

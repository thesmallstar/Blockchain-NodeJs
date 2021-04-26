const Transaction = require("./models/Transaction");
const Block = require("./models/Block");
const crypto = require("crypto");

const socketEventManager = (
  socket,
  transactions,
  blockChain,
  nodePublicKeys,
  numberOfTransactionPerBlock,
  totalTransaction,
  sio
) => {
  function mining(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function verifySignature(transaction) {
    toVerify =
      transaction.userA +
      transaction.userB +
      transaction.payload.toString() +
      transaction.timeStamp.toString();
    pbKey = crypto.createPublicKey(nodePublicKeys[transaction.userA]);
    const isVerified = crypto.verify(
      "sha256",
      Buffer.from(toVerify),
      {
        key: pbKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      },
      Buffer.from(transaction.signature.data)
    );
    return isVerified;
  }

  function processTransaction(transaction, balancesCopy, validTransactions) {
    isVerified = verifySignature(transaction);
    if (!isVerified) {
      //signature not valid, ignore this transaction
      console.log("Invalid signature for node " + transaction.userA);
      return;
    }
    if (balancesCopy[transaction.userA] - transaction.payload < 0) {
      console.log("node " + transaction.userA + " donot have enough balance!");
      // not enough balance, ignore transaction
      return;
    }
    validTransactions.push(transaction);
    balancesCopy[transaction.userA] -= transaction.payload;
    balancesCopy[transaction.userB] += transaction.payload;
  }

  socket.on("ADD_TRANSACTION", async (transaction) => {
    // /console.log("Recieved transaction " + transaction);
    const { userA, userB, payload, signature, timeStamp_ } = JSON.parse(
      transaction
    );
    transactions.push(
      new Transaction(userA, userB, payload, signature, timeStamp_)
    );
    process.env.stop = "false";
    if (transactions.length >= numberOfTransactionPerBlock) {
      await mining(Math.floor(Math.random() * 1000));
      if (process.env.stop == "false") {
        process.env.stop = "true";
        lastBlockHash = blockChain[blockChain.length - 1].getHeaderHash();
        const balancesCopy = JSON.parse(
          JSON.stringify(blockChain[blockChain.length - 1].balances)
        );
        const validTransactions = [];
        for (var i = 0; i < transactions.length; i++) {
          processTransaction(transactions[i], balancesCopy, validTransactions);
        }
        if (validTransactions.length == 0) {
          return;
        }
        block = new Block(lastBlockHash, validTransactions, balancesCopy);
        sio.emit("STOP", block);
      }
    }
  });

  socket.on("STOP", (minedBlock) => {
    const newBlock = new Block();
    newBlock.copyFrom(minedBlock);
    blockChain.push(newBlock);
    totalTransaction += newBlock.transactions.length;
    process.env.stop = "true";
    transactions.length = 0;
  });

  return socket;
};

module.exports = { socketEventManager };

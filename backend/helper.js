const Transaction = require("./models/Transaction");
const Block = require("./models/Block");
const crypto = require("crypto");

const socketEventManager = (
  socket,
  transactions,
  blockChain,
  nodePublicKeys,
  sio
) => {
  function mining(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    if (transactions.length >= 1) {
      await mining(Math.floor(Math.random() * 1000));
      if (process.env.stop == "false") {
        process.env.stop = "true";
        lastBlockHash = blockChain[blockChain.length - 1].getHeaderHash();
        balancesCopy = JSON.parse(
          JSON.stringify(blockChain[blockChain.length - 1].balances)
        );
        validTransactions = [];
        for (var i = 0; i < transactions.length; i++) {
          toVerify =
            transactions[i].userA +
            transactions[i].userB +
            transactions[i].payload.toString() +
            transactions[i].timeStamp.toString();
          pbKey = crypto.createPublicKey(nodePublicKeys[transactions[i].userA]);
          const isVerified = crypto.verify(
            "sha256",
            Buffer.from(toVerify),
            {
              key: pbKey,
              padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            },
            Buffer.from(transactions[i].signature.data)
          );
          if (!isVerified) {
            //signature not valid, ignore this transaction
            console.log("Invalid signature for node " + transactions[i].userA);
            continue;
          }

          if (
            balancesCopy[transactions[i].userA] - transactions[i].payload <
            0
          ) {
            console.log(
              "node " + transactions[i].userA + " donot have enough balance!"
            );
            // not enough balance, ignore transaction
            continue;
          }
          validTransactions.push(transactions[i]);
          balancesCopy[transactions[i].userA] -= transactions[i].payload;
          balancesCopy[transactions[i].userB] += transactions[i].payload;
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
    process.env.stop = "true";
    transactions.length = 0;
  });

  return socket;
};

module.exports = { socketEventManager };

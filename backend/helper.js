const Transaction = require("./models/Transaction");
const Block = require("./models/Block");

const socketEventManager = (socket, transactions, blockChain, sio) => {
  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  socket.on("ADD_TRANSACTION", async (transaction) => {
    console.log("Recieved transaction " + transaction);
    const { userA, userB, payload, signature } = JSON.parse(transaction);
    transactions.push(new Transaction(userA, userB, payload, signature));
    process.env.stop = "false";
    if (transactions.length >= 1) {
      await timeout(Math.floor(Math.random() * 1000));
      if (process.env.stop == "false") {
        process.env.stop = "true";
        lastBlockHash = blockChain[blockChain.length - 1].getHeaderHash();
        block = new Block(lastBlockHash, transactions);
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

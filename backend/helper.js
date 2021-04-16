const Transaction = require("./models/Transaction");
const Block = require("./models/Block");

const socketEventManager = (socket, transactions, blockChain, sio) => {

  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  socket.on("ADD_TRANSACTION", async (transaction) => {
    console.log("Recieved transaction " + transaction);
    const { userA, userB, payLoad, signature } = JSON.parse(transaction);
    transactions.push(new Transaction(userA, userB, payLoad, signature));
    process.env.stop = "false";
    if (transactions.length >= 1) {
      await timeout(Math.floor(Math.random() * 1000));
      if (process.env.stop == "false") {
        process.env.stop = "true";
        lastBlockHash = "Donot work now!";
        block = new Block(lastBlockHash, transactions);
        sio.emit("STOP", block);
      }
    }
  });

  socket.on("STOP", (block) => {
    blockChain.push(block);
    process.env.stop = "true";
    transactions.length = 0;
  });

  return socket;
};

module.exports = { socketEventManager };

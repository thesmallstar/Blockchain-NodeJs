const Transaction = require("./models/Transaction");
const Block = require("./models/Block");

const socketEventManager = (socket, transactions, blockChain, sio) => {
  socket.on("logme", (msg) => {
    console.log(msg);
  });

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
      console.log("I entered here");
      console.log(process.env.stop);
      if (process.env.stop == "false") {
        process.env.stop = "true";
        console.log("ohma");
        console.log(blockChain);
        lastBlockHash = blockChain[blockChain.length - 1].getHeaderHash();
        blockChain.push(new Block(lastBlockHash, transactions));
        sio.emit("STOP", JSON.stringify(blockChain));
      }
    }
  });

  socket.on("STOP", (newBlockChain) => {
    blockChain = JSON.parse(newBlockChain);
    console.log("huuhaa");
    console.log(blockChain);
    process.env.stop = "true";
    transactions = [];
  });

  return socket;
};

module.exports = { socketEventManager };

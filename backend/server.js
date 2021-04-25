const express = require("express");
const app = express();
const httpServer = require("http").Server(app);
const sio = require("socket.io")(httpServer);
const sio_client = require("socket.io-client");
const axios = require("axios");
const { socketEventManager } = require("./helper");
const Block = require("./models/Block");

// declaring variables
const host = "localhost";
const port = process.env.PORT;
const storageURL = `http://${host}:4000`;
const myURL = `http://${host}:${port}`;
const blockChain = [];
const transactions = [];

// If no port is provided the process quits
if (!port) {
  console.log("Please provide a port for the node to be instantiated");
  process.exit(1);
}

// Adding Middlewares
app.use(express.json());
app.use(express.urlencoded());

//add handlebars
const exphbs = require("express-handlebars");
app.engine(
  "hbs",
  exphbs({
    extname: ".hbs",
  })
);
app.set("view engine", "hbs");

var hbs = exphbs.create({});

hbs.handlebars.registerHelper("count", function (x) {
  return x.length * 2 - 2;
});

/*---------------- ROUTES -----------------*/

// Add a node link
app.post("/addLink", (req, res) => {
  const { host, port } = req.body;
  const node = `http://${host}:${port}`;
  blockChain[blockChain.length - 1].balances[node] = 100;
  socketEventManager(sio_client(node), transactions, blockChain, sio);
});

// Add Transaction

app.post("/handeTransactionRequest", async (req, res) => {
  console.log(req.body);
  toURL = req.body.toURL;
  toAmount = req.body.toAmount;
  console.log(toURL, toAmount);
  await axios.post(toURL + "/transaction", {
    userA: myURL,
    userB: toURL,
    payload: parseInt(toAmount),
    signature: "232",
  });
  nL = await axios.get(storageURL + "/nodes");
  data = nL.data;
  res.redirect("dashboard");
});

app.post("/transaction", (req, res) => {
  transaction = req.body;
  sio.emit("ADD_TRANSACTION", JSON.stringify(transaction));
  res.json({ success: true }).end();
});

// Get a list of transactions
app.get("/transaction", (req, res) => {
  res.json(transactions);
});

app.get("/dashboard", async (req, res) => {
  const nodeList = await axios.get(storageURL + "/nodes");
  data = nodeList.data;

  res.render("dashboard", {
    layout: false,
    nodes: data,
    chain: JSON.stringify(blockChain),
    chainJSON: blockChain,
    balance: blockChain[blockChain.length - 1].balances[myURL],
    myURL: myURL,
  });
});

// Get chain
app.get("/chain", (req, res) => {
  return res.json({ chain: blockChain });
});

const convURL = ({ host, port }) => `http://${host}:${port}`;

// Node addition
async function addNode(socketNode, node) {
  socketEventManager(socketNode, transactions, blockChain, sio);
  if (node.port == port && node.host == host) return;
  await axios.post(convURL(node) + "/addLink", {
    host,
    port,
  });
}

function initGenesisBlock() {
  balances = {};
  balances[myURL] = 100;
  return new Block("Genesis Block", [], balances);
}

async function addNodeToNetwork() {
  await axios.post(storageURL + "/nodes", {
    host,
    port,
  });
  const nodeList = await axios.get(storageURL + "/nodes");
  if (nodeList.data.length == 1) {
    blockChain.push(initGenesisBlock());
  } else {
    const node = nodeList.data[0];
    const nodeURL = convURL(node) + "/chain";
    const resp = await axios.get(nodeURL);
    const constructedChain = resp.data.chain.map((chainBlock) => {
      const block = new Block();
      block.copyFrom(chainBlock);
      return block;
    });
    blockChain.push(...constructedChain);
    blockChain[blockChain.length - 1].balances[myURL] = 100;
  }
  nodeList.data.forEach(({ host, port }) =>
    addNode(sio_client(convURL({ host, port })), { host, port })
  );
}

sio.on("connection", (socket) => {
  console.info(`New Node connected, ID: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Node disconnected, ID: ${socket.id}`);
  });
});

addNodeToNetwork();
httpServer.listen(port, () => console.log(`Node instantiated at ${port}`));

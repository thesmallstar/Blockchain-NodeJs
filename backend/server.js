const express = require("express");
const app = express();
const { initGenesisBlock, addNode, addNodeToNetwork } = require("./helper");
const httpServer = require("http").Server(app);
const sio = require("socket.io")(httpServer);
const sio_client = require("socket.io-client");
const axios = require("axios");

// declaring variables
const storageURL = `http://${host}:3000`;
const port = process.env.PORT;
const host = "localhost";
let blockChain = [];

// Adding Middlewares
app.use(express.json());

// Add Transaction
app.post("/transaction", (req, res) => {
  res.json(req.body);
});

// Get chain
app.get("/chain", (req, res) => {
  return res.json({ chain: blockchain });
});

addNodeToNetwork();

app.listen(port, () => console.log(`Node instantiated at ${port}`));

const express = require("express");
const app = express();
const port = 4000;
const server = require("http").Server(app);

var nodes = [];

// Adding Middlewares
app.use(express.json());

app.post("/nodes", (req, res) => {
  const newNode = {
    host: req.body.host,
    port: req.body.port,
  };
  nodes.push(newNode);
  res.json({ success: true });
});

app.get("/nodes", (req, res) => {
  return res.json(nodes);
});

app.listen(port, () => console.log(`Node instantiated at ${port}`));

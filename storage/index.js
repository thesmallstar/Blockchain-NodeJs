// stores data in json file, provides to get file..
// store old chain, after the program terminates

/* Primary */
// post add node 
// get node List

// post Chain   
// get Chain 

const express = require('express');
const app = express();
const port = 3000;
const server = require('http').Server(app);

var nodes = []

// Adding Middlewares
app.use(express.json());

app.post("/nodes", (req, res)=>{
    const newNode = {
        host : req.body.host,
        port : req.body.port
    };
    nodes.push(newNode);
    res.json({"success":true});
});

app.get("/nodes", (req, res)=>{
    return res.json(nodes);
});

app.listen(port, ()=>console.log(`Node instantiated at ${port}`));








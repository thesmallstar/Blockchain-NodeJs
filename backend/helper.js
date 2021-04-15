const SHA256 = require("crypto-js/sha256");

function addNode(name,port){

}

async function addNodeToNetwork(blockChain, storageURL) {
    const nodeList = await axios.get(storageURL + "/nodes");
    await axios.post(storageURL + "/nodes", {
      host,
      port,
    });
    if (length(nodeList.data) == 0) {
      blockChain = initGenesisBlock();
    } else {
      const { host, port } = nodeList.data[0];
      const resp = await axios.get("http://" + host + ":" + port + "/nodes");
      blockchain = resp.data.chain;
    }
  
    nodeList.data.forEach((node) => addNode(sio_client(node), sio));
  }
  

const hasher = (data) => {
    const hash = SHA256(JSON.stringify(data)).toString();
    console.log(hash);
    return hash;
}

module.exports = {addNode, hasher};
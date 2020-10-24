const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors');
const app = express();

//app.use(express.static(path.join(__dirname, '/build'))) //to host a build website
app.use(bodyParser.json()) // to process params
app.use(cors())
app.get("/stat", (req, res) => {
    res.status(200).send(`server is running`)
})

var nodes = []


app.post("/test/post", (req, res)=>{
    res.send(req.body);
    console.log(req.body.data)
    console.log(req.params)
})

var nodeInitApi = {
    "create": (req, res) => {
        nodes.push([req.params.nodeName, "proc", "stor", "procRes", "storRes", Date.now(), 0]);    
        res.send("node created");
    },    
    "terminate": (req, res)=>{
        for(var node in nodes) {
            if (nodes[node][0] == req.params.nodeName) {
                nodes[node] = ["DEAD"]                
                res.send(`node ${req.params.node} is terminated`)
                
            }

        }
        for(var node in nodes) {
            if(Date.now()-nodes[node][5] >= 20000) {
                if(nodes[node][1] != "proc") {
                    nodes[node][3] == "ERR24#Failed to execute: " + nodes[node][1]
                }
                else {
                    nodes.splice(node, 1);
                }                
            }
            else if(nodes[node][0] == "DEAD"){
                nodes.splice(node, 1);
            }
        }
    },
    "check-for-process": (req, res) => {
        for(var node in nodes) {
            if (nodes[node][0] == req.params.nodeName) {
                node = nodes[node]
                node[5] = Date.now()   
                node[6]+=1             
                if(node[1]!="proc") {
                    res.send(node[1])
                    node[1] = "processTaken"
                    
                }
                else {
                    res.send("empty")
                }
                //5
            }
        }
    }
}

var nodeInteractApi = {
    "complete-task": (req, res)=>{
        for(var node in nodes) {
            if (nodes[node][0] == req.params.nodeName) {                        
                console.log(req.body.data)
                nodes[node][3] = req.body.data;
                nodes[node][1] = "proc"
                res.send("task noted: "+ req.body.data)
            }
        }
    }
}

app.get("/node/init/:nodeName/:path", (req, res) => {
    nodeInitApi[req.params.path](req, res)    
})

app.get("/grid/get/nodes", (req, res)=>{
    var livingNodes = 0
    for(var node in nodes) {
         if(nodes[node][0] != "DEAD") {
            livingNodes+=1
         } 
    }
    res.send({"node": livingNodes, "values": nodes})
})

app.post("/node/interact/:nodeName/:path/", (req, res)=>{
    nodeInteractApi[req.params.path](req, res)
})

app.post("/grid/assign/process/", (req, res) => {
    var nodeI = 0
    var busy = 0
    for (var node in nodes) {
        console.log(Date.now() - nodes[node][5])
        if(nodes[node][1] == "proc" && nodes[node][3] == "procRes" && Date.now() - nodes[node][5] <= 10000 && nodes[node][6]<=8) {
            nodes[node][1]=req.body.proc
            nodeI = node
            res.send("http://localhost:8000/grid/"+nodes[node][0]+"/procRes")
            break;
        }
        else {
            busy+=1
        }
    }
    if(busy == nodes.length) {
        res.send("anbs")
    }
})

app.get("/grid/:nodeName/procRes", (req, res)=> {
    for(var node in nodes) {
        if (nodes[node][0] == req.params.nodeName){
            var resultToSend = nodes[node][3]+"."            
            res.send(resultToSend)
            nodes[node][3] = "procRes"
            if(nodes[node][3].split("#") == "ERR24") {
                nodes.splice(node, 1);
            }
        }
    }
})


//server log
app.listen(8000, () => console.log("server is listening on port 8000, happy coding"))
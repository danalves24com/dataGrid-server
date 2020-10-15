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




var nodeInitApi = {
    "create": (req, res) => {
        nodes.push([req.params.nodeName, "proc", "stor", "procRes", "storRes"]);
        console.log(nodes)
        res.send("node created");
    },    
    "terminate": (req, res)=>{
        for(var node in nodes) {
            if (nodes[node][0] == req.params.nodeName) {
                nodes[node] = ["DEAD"]
                console.log(nodes)
                res.send(`node ${req.params.node} is terminated`)
                
            }

        }
    },
    "check-for-process": (req, res) => {
        for(var node in nodes) {
            if (nodes[node][0] == req.params.nodeName) {
                node = nodes[node]
                if(node[1]!="proc") {
                    res.send(node[1])
                }
                else {
                    res.send("empty")
                }
            }
        }
    }
}

var nodeInteractApi = {
    "complete-task": (req, res)=>{
        for(var node in nodes) {
            if (nodes[node][0] == req.params.nodeName) {
                nodes[node][1] = "proc"                
                console.log(req.params.data)
                nodes[node][3] = req.params.data;
                res.send("task noted: "+ req.params.data)
            }
        }
    }
}

app.get("/node/init/:nodeName/:path", (req, res) => {
    nodeInitApi[req.params.path](req, res)    
})

app.post("/node/interact/:nodeName/:path/:data", (req, res)=>{
    nodeInteractApi[req.params.path](req, res)
})

app.post("/grid/assign/process/", (req, res) => {
    var nodeI = 0
    for (var node in nodes) {
        if(nodes[node][1] == "proc") {
            nodes[node][1]=req.body.proc
            nodeI = node
            res.send("http://localhost:8000/grid/"+nodes[node][0]+"/procRes")
            break;
        }
    }

})

app.get("/grid/:nodeName/procRes", (req, res)=> {
    for(var node in nodes) {
        if (nodes[node][0] == req.params.nodeName){
            res.send(nodes[node][3])
        }
    }
})


//server log
app.listen(8000, () => console.log("server is listening on port 8000, happy coding"))
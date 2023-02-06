const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const spawn = require("child_process").spawn;
const fs = require("fs");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res) => {
  let { company, period, risk } = req.body;
  const pythonProcess = spawn("python", ["./SimulateInvest.py", company, period, risk]);
  pythonProcess.stdout.on("data", (data) => {
    let resp = data.toString();
    let bitmap = fs.readFileSync("img1.png");
    // convert binary data to base64 encoded string
    let x = new Buffer(bitmap).toString("base64");
    console.log(resp);
    res.json({ response: resp, graph: x });
  });
});

app.listen(3200);

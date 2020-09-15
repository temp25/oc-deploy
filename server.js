/*jslint node: true */
/*jshint esversion: 6 */

"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("static"));

app.get("/executeCommand", (request, response) => {
  console.log(new Date() + "    executeCommand invoked");
  console.log("dumping custom request args....");
  let command = request.query.command;
  let args = request.query.args;
  console.log(command);
  console.log(args);

  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache"
  };
  response.writeHead(200, headers);
  
  const childProcess = require("child_process");
  const customProcess = childProcess.spawn("/app/test.sh");

  customProcess.stdout.on("data", data => {
    console.log("STDOUT : " + data);
    response.write("STDOUT : " + data);
  });

  customProcess.stderr.on("data", data => {
    console.log("STDERR : " + data);
    response.write("STDERR : " + data);
  });

  customProcess.on("close", code => {
    response.write(`child process exited with code ${code}`);
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

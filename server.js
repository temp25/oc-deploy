const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/executeCommand', function(req, res) {

  var clientIPAddress = getIPFromRequest(req);

  console.log(`Deployment initiated from client, ${clientIPAddress}`);

  let command = '';
  let args = '';

  if(req.query.command !== undefined) {
    command = req.query.command;
  }

  if(req.query.args !== undefined) {
    args = req.query.args;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const childProcess = require("child_process");
  const customProcess = childProcess.spawn(path.join(__dirname, command), args.split(","));

  customProcess.stdout.on("data", data => {
    sendData(res, `STDOUT : ${data}`);
  });

  customProcess.stderr.on("data", data => {
    sendData(res, `STDERR : ${data}`);
  });

  customProcess.on("close", code => {
    sendData(res, `child process exited with code ${code}`);
    res.end();
  });

});

function sendData(res, data) {
  console.log(data);
  res.write(`data: ${data}\n\n`);
}

function getIPFromRequest(req) {

  let xForwardedFor = req.headers['x-forwarded-for'];
  let reqConnectionRemoteAddress;
  let reqConnectionSocketRemoteAddress;
  let reqSocketRemoteAddress;

  if(xForwardedFor != undefined){
    xForwardedFor = xForwardedFor.split(',').pop().trim();
  }

  if(req.connection !== undefined) {
    reqConnectionRemoteAddress = req.connection.remoteAddress;
    reqConnectionSocketRemoteAddress = req.connection.socket !== undefined ? req.connection.socket.remoteAddress : undefined; 
  } else {
    reqConnectionRemoteAddress = reqConnectionSocketRemoteAddress = undefined;
  }

  if(req.socket != undefined && req.socket.remoteAddress !== undefined) {
    reqSocketRemoteAddress = req.socket.remoteAddress;
  }

  if(xForwardedFor !== undefined) {
    console.debug("Using IP from xForwardedFor header");
    return xForwardedFor;
  } else if(reqConnectionRemoteAddress !== undefined) {
    console.debug('Using IP from req.connection.remoteAddress');
    return reqConnectionRemoteAddress;
  } else if(reqSocketRemoteAddress !== undefined) {
    console.debug('Using IP from req.socket.remoteAddress');
    return reqSocketRemoteAddress;
  } else if(reqConnectionSocketRemoteAddress !== undefined) {
    console.debug('Using IP from req.connection.socket.remoteAddress');
    return reqConnectionSocketRemoteAddress;
  } else {
    console.debug('Couldn\'t fetch IP address from request object');
    return null;
  }

}

app.listen(PORT, () => console.log(`SSE app listening on port ${PORT}!!!`));

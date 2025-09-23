let https = require('https');
let fs = require("fs");
let express = require('express'); 

var ip = require("ip");
var ip_addr=ip.address()

//setup express app
let app = express()

function GetEnvironmentVar(varname, defaultvalue) {
  var result = process.env[varname];
	if (result!=undefined)
    return result;
  else
    return defaultvalue;
}

// default values
const port = GetEnvironmentVar("SERVER_PORT", "80");
const ssl_port = GetEnvironmentVar("SERVER_SSL_PORT", "443");
const service_version = GetEnvironmentVar("SERVICE_VERSION", "0")
const instance = GetEnvironmentVar("HOSTNAME", "localhost")
const zone = GetEnvironmentVar("ZONE", "local")
const region = GetEnvironmentVar("REGION", "local-0")

// Handling GET /hello request
app.get("/", (req, res, next) => {
    res.send("Hello, world!\n");
})

// Handling GET /hello request
app.get("/version", (req, res, next) => {
  let proto = "http";
  if (req.socket.constructor.name == "TLSSocket") {
    proto = "tls";
  }
    res.send("version: "+service_version+", zone: "+zone+", region: "+region+", instance: "+instance+", proto: "+proto+"\n");
})


app.get("/healthz", (req, res, next) => {
    res.send('{"state": "READY"}');
})

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.status === 400) {
    console.error('400 Error:', err.message);
    // Optionally log more details:
    console.error(err.stack);
  }

  // Default error handling
  res.status(err.status || 500).send({ error: err.message });
});

app.listen(port, (err)=>{
  if(err)
  throw err;
  console.log('listening on ' + ip.address() + ":" + port);
});

// Only start SSL server if port defined
if (process.env.SERVER_SSL_PORT) {
  options = {
    key: fs.readFileSync(process.env.SSL_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT),
  };

  let server = https.createServer(options, app);

  server.listen(ssl_port, (err)=>{
    if(err)
      throw err;
    console.log('SSL listening on ' + ip.address() + ":" + ssl_port);
  });
}

let express = require('express'); 

var ip = require("ip");
var ip_addr=ip.address()

//setup express app
let app = express()

// Handling GET /hello request
app.get("/", (req, res, next) => {
    res.send("Hello, world!");
})

// Handling GET /hello request
app.get("/version", (req, res, next) => {
    var service_version = process.env.SERVICE_VERSION;
    var instance = process.env.HOSTNAME;
		var zone = process.env.ZONE;
		var region = process.env.REGION;
    res.send("Hello version: "+service_version+", zone: "+zone+", region: "+region+", instance: "+instance);
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

//server listens to port SERVER_PORT
app.listen(process.env.SERVER_PORT, (err)=>{
  if(err)
  throw err;
  console.log('listening on ' + ip.address() + ":" + process.env.SERVER_PORT);
});


// Example logging HTTP server request and response objects.

var http = require('http');
var bunyan = require('bunyan');

var log = bunyan.createLogger({
  name: 'myserver',
  serializers: {
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res
  }
});

var server = http.createServer(function (req, res) {
  log.info({ req: req }, 'start request');  // <-- this is the guy we're testing
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
  log.info({ res: res }, 'done response');  // <-- this is the guy we're testing
});

server.listen(1337, '127.0.0.1', function() {
  log.info('server listening');

  var options = {
    port: 1337,
    hostname: '127.0.0.1',
    path: '/path?q=1#anchor',
    headers: {
      'X-Hi': 'Mom'
    }
  };

  var req = http.request(options, function(res) {
    res.resume();
    res.on('end', function() {
      process.exit();
    })
  });

  req.write('hi from the client');
  req.end();
});

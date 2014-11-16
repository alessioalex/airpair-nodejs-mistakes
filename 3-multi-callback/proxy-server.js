"use strict";

var request = require('request');
var http = require('http');
var url = require('url');
var PORT = process.env.PORT || 1337;

var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
var isUrl = new RegExp(expression);

var respond = function(err, params) {
  var res = params.res;
  var body = params.body;
  var proxyUrl = params.proxyUrl;

  console.log('%s - %s', new Date(), proxyUrl);

  res.setHeader('Content-type', 'text/html; charset=utf-8');

  if (err) {
    console.error(err);

    res.end('An error occured. Please make sure the domain exists.');
  } else {
    res.end(body);
  }
};

http.createServer(function(req, res) {
  var queryParams = url.parse(req.url, true).query;
  var proxyUrl = queryParams.url;

  if (!proxyUrl || (!isUrl.test(proxyUrl))) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write("Please provide a correct URL param. For ex: ");
    res.end("<a href='http://localhost:1337/?url=http://www.google.com/'>http://localhost:1337/?url=http://www.google.com/</a>");
  } else {
    console.log('trying to proxy to %s', proxyUrl);

    request(proxyUrl, function(err, r, body) {
      if (err) {
        // auch, forgot to return
        respond(err, {
          res: res,
          proxyUrl: proxyUrl
        });

        console.log(0);
      }

      respond(null, {
        res: res,
        body: body,
        proxyUrl: proxyUrl
      });
    });
  }
}).listen(PORT);
console.log('application started on port %s', PORT);

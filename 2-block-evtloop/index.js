"use strict";

var chalk = require('chalk');

var getHrDiffTime = function(time) {
  // ts = [seconds, nanoseconds]
  var ts = process.hrtime(time);
  // convert seconds to miliseconds and nanoseconds to miliseconds as well
  return (ts[0] * 1000) + (ts[1] / 1000000);
};

var outputDelay = function(interval, maxDelay) {
  maxDelay = maxDelay || 100;

  var before = process.hrtime();

  setTimeout(function() {
    var delay = getHrDiffTime(before) - interval;

    if (delay < maxDelay) {
      console.log('delay is %s', chalk.green(delay));
    } else {
      console.log('delay is %s', chalk.red(delay));
    }

    // repeat
    outputDelay(interval, maxDelay);
  }, interval);
};

outputDelay(300);

setInterval(function compute() {
  var sum = 0;

  for (var i = 0; i <= 999999999; i++) {
    sum += i * 2 - (i + 1);
  }
}, 2000);

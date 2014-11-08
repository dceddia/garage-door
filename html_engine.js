var fs = require('fs');
var app = require('express')();

module.exports = function(path, options, fn) {
  var cacheLocation = path + ':html';

  // Return the cached file if available
  // (don't do this in dev mode)
  if (app.get('env') !== 'development') {
    if(typeof module.exports.cache[cacheLocation] === "string"){
      return fn(null, module.exports.cache[cacheLocation]);
    }
  }

  // Otherwise, read the file off disk, cache it, and return it
  fs.readFile(path, 'utf8', function(err, data){
    if(err) { return fn(err); }
    return fn(null, module.exports.cache[cacheLocation] = data);
  });
}

module.exports.cache = {};

function Responder() {
  this.commands = {};
}

Responder.prototype.on = function(cmd, callback) {
  this.commands[cmd] = callback;
}

Responder.prototype.respondTo = function(args, respondWith) {
  this.commands[args[0]] && this.commands[args[0]](respondWith, args);
}

module.exports = function() { return new Responder(); };
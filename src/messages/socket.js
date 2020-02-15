const Socket = require("socket.io");

let io = null;
exports.io = () => {
  return io;
};

exports.initialize = port => {
  return (io = Socket.listen(port));
};

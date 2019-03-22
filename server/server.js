var server = require('./http')

server.listen(3000)
server.on('listening', onListen)

function onListen() {
  console.log('Server listening: http://localhost:3000/')
}
const { conn } = require('../db.js');
const app = require('../app');
const debug = require('debug')('pg-henry-ecommerce-back:server');
const http = require('http');
const { fullDbproducts } = require('../control/default/products')
const { fulldbCat } = require('../control/default/category')


let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);
const force = (process.env.FORCE || false)

conn.sync({force}).then(() =>
server.on('error', onError),
server.on('listening', onListening),
server.listen(port)
)
.then(() => force ? fulldbCat() : null)
.then(() => force ? fullDbproducts() : null)
.then(() => force ? console.log('Productos y categorias precargados en la base de datos') : null)
.then(() => console.log(`funciona en el ${port}`))
.catch(err => console.log(err))


function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}



function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

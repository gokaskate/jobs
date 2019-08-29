let  path = require('path'), //llama el modulo path para establecer rutas
    rootPath = path.normalize(__dirname + '/..'); //establece la ruta raiz

module.exports = config = {
  root: 	rootPath,
  hostname: "hostname temporal",
  port: 	process.env.PORT || 8010,
  secret: "YourSecretIsMySecret",
  db: 	"mongodb://devoct01:Proyecto001@ds153677.mlab.com:53677/devoctdb",
  //online_db: "mongodb://devoct01:Proyecto001@ds153677.mlab.com:53677/devoctdb",
  algorithm: 'aes-256-ctr',
  cryptoPass: "your_secret_is_my_secret"
}

exports.SECRET = config.secret
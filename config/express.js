module.exports = (app, express, config ) => {

  // Firebase Admin Configuration
  let fireAdmin = require('firebase-admin');
  let serviceAccount = require('./easyjobs-94e45-firebase-adminsdk-rfg12-0406fdd557');

  fireAdmin.initializeApp({
    credential: fireAdmin.credential.cert(serviceAccount),
    databaseURL: 'https://easyjobs-94e45.firebaseio.com'
  });

  //configuracion de la capeta public
  app.use(express.static("public"));


  // body Parser
  let bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended:false}));

//configruacion de glob
  var glob = require("glob");
  var routes = glob.sync(config.root + '/routes/*.js');

  routes.forEach(function (routes) {
    require(routes)(app, fireAdmin);  //parametro "routes es la direccion de las rutas" y app es express
  });

  //configuracion de respuesta del servidor
  app.listen(config.port, function () {
    console.log("Aplicacion corriendo en puerto: "+config.port);

  })
}
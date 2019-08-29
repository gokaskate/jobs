let express = require("express");

let bcrypt = require('bcryptjs');
let secret = require('../config/data').secret
let jwt = require('jsonwebtoken');

module.exports = (app, fireAdmin) => {

  // database conection
  let db = fireAdmin.firestore();
  // Auth validator
  let auth = fireAdmin.auth();

  // router login
  let loginRouter = express.Router();

  loginRouter.route('/')
      .post((sol, res)=>{

        db.collection('Users')
        .doc(sol.body.email)
        .get()
        .then(user =>{
          if (!user.exists) res.status(400).json({server_error:"Usuario no registrado"})
          
          let user_info = {...user.data()}
          if (!bcrypt.compareSync(sol.body.password, user_info.password)) res.status(400).json({server_error:"Correo y Contraseña no coinciden."})
          
          delete user_info.password

          let token = jwt.sign({user:user_info}, secret);

          res.status(201).json({
            login_success: true,
            user_info,
            token
          })

        })
        .catch( (err) => {
          console.log(err);

          if (err)
            res.status(500).json({
              server_error: 'Ocurrio un error al logear el usuario',
              firebase_error: err })
        });
         
      });

  app.use('/login', loginRouter);


  // router register
  let signUpRouter = express.Router();
  signUpRouter.route('/')
      // registra, guarda info en la base de datos y envia token
      .post((sol, res)=>{

        //encrypt the pass
        if(sol.body.password) sol.body.password = bcrypt.hashSync(sol.body.password, 10);

        db.collection('Users')
          .doc(sol.body.email)
          .get()
          .then( user => {
            if (user.exists) {
              
              res.status(400).json({
                server_error:"Correo ya registrado"
              })

            } else { 
              return db.collection('Users')
                .doc(sol.body.email)
                .set({ ...sol.body }, {merge:true})  }
          })
          .then(user => { return db.collection('Users').doc(sol.body.email).get()})  
          .then(user => {
              
              new_user = {...user.data()};
              delete new_user.password;
              
              let token = jwt.sign({user:new_user}, secret);

              res.status(201).json({
                uid:user.id,
                new_user,
                token
              })

            })
            .catch( (err) => {
              if (err)
                res.status(500).json({
                  server_error: 'Ocurrio un error al registrar el usuario',
                  firebase_error: err })
            });
      });
  app.use('/signup',signUpRouter);



};



// middleware

// Firebase Admin Configuration
let fireAdmin = require('firebase-admin');
let secret = require('../config/data').secret
let jwt = require('jsonwebtoken');

let db = fireAdmin.firestore();

// verifyToken
module.exports =  function verifyToken (sol, res, next)  {

  let clientHeaderToken = sol.headers.token;

  

  if(clientHeaderToken !== undefined ){

    jwt.verify(clientHeaderToken, secret, (err, decoded) => {

      if(err) res.status(400).json({server_error:"Token invalido"})
            
      sol.loggedUser = decoded.user
        
      next()     
      
      });
    } else { res.status(400).json({server_error:"Token requerido"}) }

  }

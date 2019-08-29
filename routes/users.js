let express = require("express");
let bcrypt = require('bcryptjs');

//middlewares
let verifyToken = require('../middlewares/verifyToken');  //verifyToken

module.exports = (app, fireAdmin) => {

  // database conection
  let db = fireAdmin.firestore();
  // Auth validator
  let auth = fireAdmin.auth();

  //router profile
    let profileRouter = express.Router();
   
  //logged profile
  profileRouter.route('/')
      .post(verifyToken,(sol, res)=>{
        console.log(sol.loggedUser);
        db.doc('Users/'+sol.loggedUser.email).get()
            .then( user =>{
              if  (user.exists) {
                let userInfo = { ...user.data()}
                delete userInfo.password;
                res.json(userInfo)
              } else { res.status(500).json(" si ve esto mrk ust hizo un mierdero ")}
            })
      });
    //profile user info
    profileRouter.route('/:uid')
        .post(verifyToken,(sol, res)=>{
          
            db.collection('Users').doc(sol.params.uid).get()
                .then( user =>{

                  if (!user.exists) res.json({server_error:"Usuario no encontrado."})
                    
                  
                  let userInfo = { ...user.data()}
                  delete userInfo.password;

                  res.json(userInfo)
                })
          

        });
    app.use('/profile',profileRouter);

  
  
    //router user test
    let userRouter = express.Router();
      userRouter.route('/view/:uid')
          .post(verifyToken,(sol, res)=>{
            db.collection('Users').doc(sol.params.uid).get()
                .then( user =>{
                  let userInfo = {...user.data()}
                  delete userInfo.password;
                  res.json({ ...userInfo})
                })
          });
      userRouter.route('/update/:uid')
          .post(verifyToken,(sol, res)=>{

            if(sol.body.password) sol.body.password = bcrypt.hashSync(sol.body.password, 10);

             db.collection('Users').doc(sol.params.uid).update({...sol.body})
                 .then(()=> db.collection('Users').doc(sol.params.uid).get())
                 .then((user)=>{
                   let userInfo = {...user.data()}
                   delete userInfo.password;
                    res.json({ userUpdated:true, ...userInfo})
                  })
                  .catch((err)=>{
                    res.json(err)
                  })
          });
      userRouter.route('/delete/:uid')
          .post(verifyToken,(sol, res)=>{

            db.collection('Users')
            .doc(sol.params.uid)
            .delete()
            .then(()=>{
              res.status(201).json({message:"Usuario "+sol.params.uid+" borrado"})
            })
            .catch((error) => {
              res.status().json({server_error:"Ocurrio un error al borrar usuario", error })
            });
                
          });

    app.use('/user', userRouter)


};
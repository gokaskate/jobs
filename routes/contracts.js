let express = require("express");
let verifyToken = require('../middlewares/verifyToken');  //verifyToken,

module.exports = (app, fireAdmin) => {

  // database conection
  let db = fireAdmin.firestore();

  //router Contracts
  let contractRouter =  express.Router();

  contractRouter.route('/new')
      .post(verifyToken,(sol, res)=>{
        db.collection('Contracts').add({...sol.body})
            .then( contract => db.collection('Contracts').doc(contract.id).get() )
            .then( contract => {res.json({contractCreated:true, contractId:contract.id, ...contract.data()})
            })
            .catch(err => {res.json({contractCreated:false, ...err })})

      })

  contractRouter.route('/all')
      .post(verifyToken,(sol, res)=>{

        db.collection('Contracts').get()
            .then(contracts =>{

              contracts =  contracts.docs.map( c => {
                return { contratId:c.id, ...c.data()}
              })

              res.json({contracts})

            })
            .catch( err => {res.json( err )} )
      });

  contractRouter.route('/view/:sid')
      .post(verifyToken,(sol, res)=>{
        db.collection('Contracts').doc(sol.params.sid).get()
            .then(async (contract)=>{
              if(contract.exists) {
                let finalContract = {
                  constractId:contract.id, 
                  ...contract.data()
                 }
                
                let applicantUser =  await db.collection('Users')
                .doc(finalContract.applicantUser).get()
                
                let providerUser =  await db.collection('Users')
                .doc(finalContract.providerUser).get()
                
                finalContract.applicantUser = applicantUser.data()
                finalContract.providerUser = providerUser.data()
                     
                res.status(201).json({Contract: finalContract})
              } else {
                res.status(400).json( {contractExists: false} )
              }
            })
            .catch((err)=>{
              res.json(err)
            })
      });

  contractRouter.route('/update/:sid')
      .post(verifyToken,(sol, res)=>{
        db.collection('Contracts').doc(sol.params.sid).update({...sol.body})

            .then( ()=> db.collection('Contracts').doc(sol.params.sid).get() )

            .then((contract)=>{
              res.json({contractUpdated:true, contractId: contract.id, ...contract.data()})
            })
            .catch((err)=>{
              res.json(err)
            })
      });

  contractRouter.route('/delete/:sid')
      .post(verifyToken,(sol, res)=>{
        db.collection('Contracts').doc(sol.params.sid).delete()
            .then(()=> {res.json( {contractDeleted:true })})
            .catch(err=> {res.json(err)})
    });
  contractRouter.route('/applicant')
    .post(verifyToken, (sol, res)=>{
      let allUsers = {};
      db.collection('Users').get()
      .then( u => {
        u.forEach( user =>{
          allUsers[user.id] = user.data()
          delete allUsers[user.id].password
        })
        db.collection('Contracts')
        .where('applicantUser', '==', sol.loggedUser.email)
        .get()
        .then( constracts => {
          let Contracts = constracts.docs.map( constract => {
            constract = {constractId: constract.id, ...constract.data() }
            constract.providerUser = allUsers[constract.providerUser]
            constract.applicantUser = allUsers[constract.applicantUser]
            return constract
          })
          res.json({Contracts:Contracts})
        })
        .catch(err => {
          res-status(400).json({
            firebase_error:err, 
            server_error:"Error al consultar contratos de usuario logeado - applicant"
          })
        })
    
      })
      .catch( err => {server_error:"Fallo la consulta de usuarios", err})
    
    })
  
  
  contractRouter.route('/provider')
    .post(verifyToken, (sol, res)=>{
      let allUsers = {};
      db.collection('Users').get()
      .then( u => {
        u.forEach( user =>{
          allUsers[user.id] = user.data()
          delete allUsers[user.id].password
        })

        db.collection('Contracts')
        .where('providerUser', '==', sol.loggedUser.email)
        .get()
        .then( constracts => {
          let Contracts = constracts.docs.map( constract => {
            constract = {constractId: constract.id, ...constract.data() }
            constract.providerUser = allUsers[constract.providerUser]
            constract.applicantUser = allUsers[constract.applicantUser]
            return constract
          })
          res.status(201).json({Contracts:Contracts})
        }).catch(err => {
          res-status(400).json({
            firebase_error:err, 
            server_error:"Error al consultar contratos de usuario logeado - provider"
          })
        })
    

      })
     })
    app.use('/contract', contractRouter)
    
  }
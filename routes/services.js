let express = require("express");

//middlewares
let verifyToken = require('../middlewares/verifyToken');  //verifyToken,

module.exports = (app, fireAdmin) => {

  // database conection
  let db = fireAdmin.firestore();

  //router Servicies
  let serviceRouter =  express.Router();

    serviceRouter.route('/new')
        .post(verifyToken, (sol, res)=>{
          db.collection('Services')
              .add({...sol.body})
              .then(service => db.collection('Services').doc(service.id).get())
              .then(service => {res.json( {serviceId:service.id, ...service.data()}  )})
              .catch(err => {res.json(err)})
        });

    serviceRouter.route('/view/all')
        .post(verifyToken, (sol, res)=>{
          let users = {};
          db.collection('Users').get()
          .then( u => {
            u.forEach( user => {
              users[user.id] = user.data();
            })
            
            db.collection('Services').get()
            .then( services => {
              
              let serv = services.docs.map( s => {
                let service = s.data()
                service.UserId = users[s.data().UserId]
                return service
              })

              res.json(serv)

            }).catch(err => res.json({server_errro:"Error consultar services"}))


          }).catch(err => res.json({server_errro:"Error consultar usuarios services"}))
        })

    serviceRouter.route('/view/:sid')
        .post(verifyToken,(sol, res)=>{
          db.collection('Services').doc(sol.params.sid).get()
              .then(async (service)=>{
                if (service.exists) {
                   let finalService = {
                     serviceId:service.id, 
                     ...service.data()
                    }
                     let infoUser =  await db.collection('Users').doc(finalService.UserId).get()
                     finalService.UserId = { ...infoUser.data()}

                  res.status(201).json({Service: finalService})
                } else {
                  res.status(400).json( {serviceExists: false} )
                }

              })
              .catch((err)=>{
                res.json(err)
              })
        });

    serviceRouter.route('/update/:sid')
        .post(verifyToken,(sol, res)=>{
          db.collection('Services').doc(sol.params.sid).update({...sol.body})

              .then(()=> db.collection('Services').doc(sol.params.sid).get())

              .then((service)=>{
                res.json({serviceUpdated:true, ...service.data()})
              })
              .catch((err)=>{
                res.json(err)
              })
        })

    serviceRouter.route('/delete/:sid')
        .post(verifyToken,(sol, res)=>{
          db.collection('Services').doc(sol.params.sid).delete()
              .then(()=> {res.json( {serviceDeleted: true  } )})
              .catch(err=> {res.json(err)})
        })

    serviceRouter.route('/search')
      .post( (sol, res)=> {
        db.collection('Services')
        .get()
        .then( services => {
          
          let busqueda = sol.body.busqueda
          let results = []
          services.forEach( service => {
            service = { serviceId: service.id, ...service.data() }
            let regex = new RegExp(busqueda, 'i');
            if (regex.test(service.Descripcion)) {
              results.push( service )
            } 
          })
          res.status(200).json({Results:results})  
          
        })
        .catch(() => res.status(400).json({error:"Error al buscar en servicios"}))
      })
    app.use('/service', serviceRouter)

}
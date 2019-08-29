let express = require('express');
let app = express();

// config
let config = require('./config/data');

// dowload apk
app.get('/download', (sol, res) => {
    res.download( __dirname +'/downloads/app-debug.apk', 'easy-jobs-1.0-.apk', (err)=>{
        if (err) res.redirect('/')
        else res.json({ok:true})
    })

    
})

require('./config/express')(app, express, config);










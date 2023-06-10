//=======[ Settings, Imports & Data ]==========================================

var PORT    = 3000;

var express = require('express');
var app     = express();
var utils   = require('./mysql-connector');

// to parse application/json
app.use(express.json()); 
// to serve static files
app.use(express.static('/home/node/app/static/'));

//=======[ Main module code ]==================================================
app.post('/device/',function(req,res){
    console.log("llego = "+req.body.id);
    if(req.body.texto==undefined || req.body.texto==null || req.body.texto.length<4){
        res.status(409);
        res.send("el texto no es valido");
    }else{
        
        res.status(200)
        res.send("Todo ok");
    }
    
});

app.post('/state/',function(req,res){
    // TODO update data base
    console.log("llego = "+JSON.stringify(req.body));
});

app.get('/devices/', function(req, res, next) {
    utils.query("select * from Devices",function(err,rsp,fields){
        if(err!=null){
            console.log("error al buscar los datos");
            res.send("Error al buscar los datos").status(409);
        }
        else{
            console.log("no error");
            res.send(JSON.stringify(rsp)).status(200);
        }
    });
});

app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

//=======[ End of file ]=======================================================

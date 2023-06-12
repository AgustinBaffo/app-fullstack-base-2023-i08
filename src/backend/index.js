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

app.get('/devices/', function(req, res, gnext) {
    utils.query("select * from Devices",function(err,rsp,fields){
        if(err!=null){
            var msg = "Error al buscar los datos.";
            console.log(msg);
            res.send(msg).status(409);
        }
        else{
            console.log("Enviando lista de dispositivos.");
            res.send(JSON.stringify(rsp)).status(200);
        }
    });
});

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

app.delete('/device/',function(req,res){
    utils.query("delete from Devices where id = "+req.body.id,function(err,rsp,fields){
        if(err!=null){
            var msg = "Error al borrar los datos.";
            console.log(msg);
            res.send(msg).status(409);
        }
        else{
            var msg = "Elemento id = "+req.body.id+" borrado correctamente.";
            console.log(msg);
            res.send(msg).status(200);
        }
    });
});



app.post('/state/',function(req,res){
    utils.query("update Devices set state = "+req.body.state+" where id = "+req.body.id,function(err,rsp,fields){
        if(err!=null){
            var msg = "Error al actualizar los datos.";
            console.log(msg);
            res.send(msg).status(409);
        }
        else{
            var msg = "Estdo del elemento id = "+req.body.id+" actualizado correctamente.";
            console.log(msg);
            res.send(msg).status(200);
        }
    });       
});




app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

//=======[ End of file ]=======================================================

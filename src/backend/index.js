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
            var msg = "Error al buscar los datos."+err;
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
    console.log("agregar dispositivo = "+req.body.name+" "+req.body.description+" "+req.body.type+" "+req.body.state);

    //TODO: validar datos.
    var qry =  "insert into Devices (name, description, type, state) values ('"+req.body.name+"','"+req.body.description+"',"+req.body.type+","+req.body.state+")";
    console.log(qry);
    utils.query(qry,function(err,rsp,fields){
        if(err!=null){
            var msg = "Error al insertar los datos: "+err;
            console.log(msg);
            res.send(msg).status(409);
        }
        else{
            var msg = "Elemento insertado correctamente.";
            console.log(msg);
            res.send(msg).status(200);
        }
    });
});

app.delete('/device/',function(req,res){
    console.log("eliminar elemento id = "+req.body.id);
    utils.query("delete from Devices where id = "+req.body.id,function(err,rsp,fields){
        if(err!=null){
            var msg = "Error al borrar los datos."+err;
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

app.put('/device/',function(req,res){
    console.log("editar dispositivo = "+req.body.id+" "+req.body.name+" "+req.body.description+" "+req.body.type+" "+req.body.state);
    
    //TODO: Validar datos.
    utils.query("update Devices set name = '"+req.body.name+"', description = '"+req.body.description+"', type = "+req.body.type+", state = "+req.body.state+" where id = "+req.body.id,function(err,rsp,fields){
        if(err!=null){
            var msg = "Error al actualizar los datos."+err;
            console.log(msg);
            res.send(msg).status(409);
        }
        else{
            var msg = "Elemento id = "+req.body.id+" actualizado correctamente.";
            console.log(msg);
            res.send(msg).status(200);
        }
    });
});


app.post('/state/',function(req,res){
    //TODO: validar datos.
    utils.query("update Devices set state = "+req.body.state+" where id = "+req.body.id,function(err,rsp,fields){
        if(err!=null){
            var msg = "Error al actualizar los datos."+err;
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

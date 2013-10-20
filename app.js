
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
var mongoose = require('mongoose');
var db = mongoose.createConnection('108.166.84.122', 'SIFIIEDB');

var app = module.exports = express.createServer();
var MemoryStore= require('express/node_modules/connect/lib/middleware/session/memory');
var crypto = require('crypto')
var ObjectId = mongoose.Types.ObjectId


// Configuration

  app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
      store: new MemoryStore(),
      secret: 'secret',
      key:'bla'
    }));  
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
  });
/*************************/

  var EscuelasSchema = mongoose.Schema({
    clave:                    Number,
    nombre:               String,
    siglas:                  String,
    dependencia:        Number,
    responsable:         String,
    cargo:                   String,
    direccion:              String,
    coordenadas:        String,
    fecha_registro:      {type: Date, default:Date.now}
    
  });
  var EscuelasDB= db.model('escuelas',EscuelasSchema);



/*********************   DYNAMICHELPERS  *******************************/
  app.dynamicHelpers({
    session:function(req, res){
      return req.session;
    },
    flash:function(req, res){
      return req.flash();
    }
  });

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

app.get('/sifiie', protegido,  function (req, res){
  res.render('sifiie/index', { layout:false } )
});


app.get('/sifiie/escuelas', protegido,  function (req, res){
    //Metodo que ejecuta la busqueda de todas las escuelas en la coleccion en MongoDB
    EscuelasDB.find().lean().exec( function(error, results){        
        if (error){
            //Si se encuentra un error asignarlo a una varible ERROR que se retorne a la vista 
            res.render('sifiie/index', { layout:false, error:error } )
            console.log(error);
        }else {
            //Si no existe error alguno, asignar el resultado de la busqueda a una varible global
            res.render('sifiie/index', { layout:false, listaescuelas:results } );
            console.log(results);
        }
    });
});

app.post('/sifiie/escuelas/borrar', protegido, function (req, res){

});

app.post('/sifiie/escuelas/nuevo', protegido, function (req, res){
  //Se genera el nuevo objeto que se va a insertar en la DB
  var escuela_nueva =new EscuelasDB({
    clave:                   req.param('clave'),
    nombre:               req.param('nombre'),
    siglas:                  req.param('siglas'),
    dependencia:       req.param('dependencia'), //Number
    responsable:        req.param('responsable'),
    cargo:                  req.param('cargo'),
    direccion:            req.param('direccion'),
    coordenadas:      req.param('coordenadas')
  });
  //Mongoose cuenta con una funcion save que parte del objeto creado previamente
  escuela_nueva.save( function (error){
    if(!error){
          EscuelasDB.find().lean().exec( function(error, results){        
            if (!error){
                //Si se encuentra un error asignarlo a una varible ERROR que se retorne a la vista 
                res.render('sifiie/index', { layout:false, error:error, escuela_nueva: {message: 'Error al guardar unidad' }  } )
                console.log(error);
            }else {
                //Si no existe error alguno, asignar el resultado de la busqueda a una varible global
                res.render('sifiie/index', { layout:false, listaescuelas:results, escuela_nueva: {message: 'Escuela creada exitosamente' }  } );
                console.log(results);
            }
        });
       
    }else{

          EscuelasDB.find().lean().exec( function(error, results){        
            if (error){
                //Si se encuentra un error asignarlo a una varible ERROR que se retorne a la vista 
                res.render('sifiie/index', { layout:false, error:error, escuela_nueva: { error:'Error al guardar escuela | '+error}  } )
                console.log(error);
            }else {
                //Si no existe error alguno, asignar el resultado de la busqueda a una varible global
                res.render('sifiie/index', { layout:false, listaescuelas:results, escuela_nueva: {error:'Error al guardar escuela | '+error}  } );
                console.log(results);
            }
        });
      
    }
  });
});

app.post('/sifiie/escuelas/editar', function (req, res){
  var escuela_actualizada = {
    clave:                   req.param('clave'),
    nombre:               req.param('nombre'),
    siglas:                  req.param('siglas'),
    dependencia:       req.param('dependencia'), //Number
    responsable:        req.param('responsable'),
    cargo:                  req.param('cargo'),
    direccion:            req.param('direccion'),
    coordenadas:      req.param('coordenadas')
  }
  EscuelasDB.update( {_id:req.param('id') }, escuela_actualizada).exec( function ( error, total_afectaciones) {
    if(!error){
      res.send
    }else{

    }
  });
});



/*
*   EL SIGUIENTE BLOQUE DE PETICIONES MANEJA LAS SESIONES
*/

app.get('/session/new', function(req,res){// New Session
  res.render('session/new', {
    title:'SIFIIE',
    layout:false,
    locals: {
      redir: req.query.redir,
    }
  })
});

  app.get('/sessions/destroy', function(req,res){//Destroy session 
    delete req.session.user;
    res.redirect('/')
  });

  app.post('/sessions', function(req,res){
    if(req.param('usuario')=='admin' && req.param('password')=='admin' ){
    // POSUser.findOne({'email':req.param('email'), 'password':encrypt(req.param('password'))}, function(error, userPOS){
        var usuario = {usuario:'admin'}
        req.session.user = usuario;
        res.redirect('/sifiie');
    
    } else {
        res.render('session/new', {
            layout:false,
            locals:{
              redir:req.body.redir,
              message:'Usuario y/o contraseña incorrectos'
            }
          });
      }//end else-if 

  });

/**
* Funcion que valida si existe una sesion con un nobre de usuario, si no es así redirige a la pantalla de inicio de sesion
*/
  function protegido(req, res, next){
    if(req.session.user){
      next();
    }else{
      console.log('URL='+req.url);
      res.redirect('/session/new?redir='+req.url);
    }
  }



app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

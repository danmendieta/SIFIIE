
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  
  

var mongoose = require('mongoose')
var mongo = {};
mongo.db =  mongoose.createConnection('108.166.84.122', 'SIFIIEDB');
mongo.administracion= { }

var app = module.exports = express.createServer();
var MemoryStore= require('express/node_modules/connect/lib/middleware/session/memory');
var crypto = require('crypto')



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

    var UnidadSchema = mongoose.Schema({
      clave:                    Number,
      nombre:               String,
      siglas:                  String,
      dependencia:        Number,
      responsable:         String,
      cargo:                   String,
      direccion:              String,
      coordenadas:        String,
      
    });
    mongo.administracion.unidades= mongo.db.model('escuelas',UnidadSchema);

  var AcervoSchema = mongoose.Schema({
      año:                    Number,
      tipo:                    String,
      miniatura:          { data: Buffer, contentType: String },
      titulo:                 String,
      descripcion:        String,
      archivo_uno:      { data: Buffer, contentType: String },
      archivo_dos:      { data: Buffer, contentType: String },
      archivo_tres:      { data: Buffer, contentType: String },
      archivo_cuatro:      { data: Buffer, contentType: String },
      archivo_cinco:      { data: Buffer, contentType: String },
      fecha_registro:      {type: Date, default:Date.now}    
  });
  mongo.administracion.acervo = mongo.db.model ('acervo', AcervoSchema)


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




app.get('/sifiie/administracion/acervo', function (req, res){
    AcervoDB.find().lean().exec( function(error, results){       
        if(error){
          res.render('sifiie/administracion/acervo/index', { layout:false, error:error } )
        }else{
          res.render('sifiie/administracion/acervo/index', { layout:false, tabla:results } )
        }
    });
});

app.post('/sifiie/administracion/acervo/nuevo', function (req, res){
  var acervo_nuevo =new  AcervoDB({
    año:                   req.param('año'),
    tipo:                   req.param('tipo'),
    miniatura:          req.param('miniatura'),
    titulo:                 req.param('titulo'),
    descripcion:       req.param('descripcion'),
    archivo_uno:      req.param('archivo_uno'),
    archivo_dos:       req.param('archivo_dos'),
    archivo_tres:      req.param('archivo_tres'),
    archivo_cuatro:  req.param('archivo_cuatro'),
    archivo_cinco:    req.param('archivo_cinco')
  });


  acervo_nuevo.save( function (erro){
    if(erro){  
      AcervoDB.find().lean().exec( function(error, results){       
          if(error){
           res.render('sifiie/administracion/acervo/index', { layout:false, error:error } )
          }else{
           res.render('sifiie/administracion/acervo/index', { layout:false, error:erro ,tabla:results } )
         }
      });
    }else{
      AcervoDB.find().lean().exec( function(error, results){       
          if(error){
           res.render('sifiie/administracion/acervo/index', { layout:false, error:error } )
          }else{
           res.render('sifiie/administracion/acervo/index', { layout:false, tabla:results } )
         }
      });
    }
  });//end save
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



require('./routes/administracion/acervo.js')(app, mongo.administracion.acervo);
require('./routes/administracion/unidades.js')(app, mongo.administracion.unidades);
require('./routes/administracion/noticias.js')(app, mongo.administracion.noticias);



app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

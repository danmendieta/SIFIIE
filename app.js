
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
    name:          String,
    lastname:      String,
    email:         String,
    password:      String,
    register:      {type: Date, default:Date.now},
    status:        Number//0-Sin Confirmar, 1-Trial, 2-Activo, 3-Sin Pago, 4-Desactivado
  });
  var EscuelasCollection= db.model('escuelas',EscuelasSchema);



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
    var generalError = null;
    var escuelasobject = null
    //Metodo que ejecuta la busqueda de todas las escuelas en la coleccion en MongoDB
    EscuelasCollection.find().lean().exec( function(error, results){        
        if (error){
            //Si se encuentra un error asignarlo a una varible ERROR que se retorne a la vista 
            res.render('sifiie/index', { layout:false, error:generalError } )
        }else {
            //Si no existe error alguno, asignar el resultado de la busqueda a una varible global
            res.render('sifiie/index', { layout:false, listaescuelas:escuelasobject } )
        }
    });
});







app.get('/session/new', function(req,res){// New Session
  res.render('session/new', {
    title:'POSTower',
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



  function protegido(req, res, next){
    if(req.session.user){
      //getStores({id:req.session.user._id});
      next();
    }else{
      console.log('URL='+req.url);
      res.redirect('/session/new?redir='+req.url);
      //res.redirect('/app');
    }
  }



app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

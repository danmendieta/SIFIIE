module.exports = function(){

var mongoose = require('mongoose')
    , db = mongoose.createConnection('108.166.84.122', 'SIFIIEDB');
var ObjectId = mongoose.Types.ObjectId




  var UnidadSchema = mongoose.Schema({
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
  var UnidadDB= db.model('escuelas',UnidadSchema);

  
}
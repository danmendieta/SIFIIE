
module.exports = function (app, unidadesDB){


/********
*		FUNCION QUE PERMITE CONSULTAR LAS UNIDADES QUE SE ENCUENTRAN EN LA DB	
********/
		
	app.get('/sifiie/administracion/unidades',  function (req, res){
	    //Metodo que ejecuta la busqueda de todas las escuelas en la coleccion en unidadesDBDB
	    unidadesDB.find().lean().exec( function(error, results){        
	        if (error){
	            //Si se encuentra un error asignarlo a una varible ERROR que se retorne a la vista 
	            res.render('sifiie/administracion/unidades/index', { layout:false, error:error } )
	            console.log(error);
	        }else {
	            //Si no existe error alguno, asignar el resultado de la busqueda a una varible global
	            res.render('sifiie/index', { layout:false, listaescuelas:results } );
	            console.log(results);
	        }
	    });
	});



/********
*		FUNCION QUE ELIMINA LAS UNIDADES DE ACUERDO A SU ID
********/


	app.post('/sifiie/administracion/unidades/borrar', function (req, res){

	});





/********
*		FUNCION QUE INSERTA UNIDADES EN LA DB	
********/


	app.post('/sifiie/administracion/unidades/nuevo', function (req, res){
	  //Se genera el nuevo objeto que se va a insertar en la DB
	  var escuela_nueva =new unidadesDB({
	    clave:                   req.param('clave'),
	    nombre:               req.param('nombre'),
	    siglas:                  req.param('siglas'),
	    dependencia:       req.param('dependencia'), //Number
	    responsable:        req.param('responsable'),
	    cargo:                  req.param('cargo'),
	    direccion:            req.param('direccion'),
	    coordenadas:      req.param('coordenadas')
	  });
	  //unidadesDBose cuenta con una funcion save que parte del objeto creado previamente
	  escuela_nueva.save( function (error){
	    if(!error){
	          unidadesDB.find().lean().exec( function(error, results){        
	            if (!error){
	                //Si se encuentra un error asignarlo a una varible ERROR que se retorne a la vista 
	                res.render('sifiie/administracion/unidades/index', { layout:false, error:error, escuela_nueva: {message: 'Error al guardar unidad' }  } )
	                console.log(error);
	            }else {
	                //Si no existe error alguno, asignar el resultado de la busqueda a una varible global
	                res.render('sifiie/administracion/unidades/index', { layout:false, listaescuelas:results, escuela_nueva: {message: 'Escuela creada exitosamente' }  } );
	                console.log(results);
	            }
	        });
	       
	    }else{

	          unidadesDB.find().lean().exec( function(error, results){        
	            if (error){
	                //Si se encuentra un error asignarlo a una varible ERROR que se retorne a la vista 
	                res.render('sifiie/administracion/unidades/index', { layout:false, error:error, escuela_nueva: { error:'Error al guardar escuela | '+error}  } )
	                console.log(error);
	            }else {
	                //Si no existe error alguno, asignar el resultado de la busqueda a una varible global
	                res.render('sifiie/administracion/unidades/index', { layout:false, listaescuelas:results, escuela_nueva: {error:'Error al guardar escuela | '+error}  } );
	                console.log(results);
	            }
	        });
	      
	    }
	  });
	});




/********
*		FUNCION QUE EDITA LAS UNIDADES QUE SE ENCUENTRAN EN LA DB	DE ACUERDO A SU ID
********/



	app.post('/sifiie/administracion/unidades/editar', function (req, res){
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
	  unidadesDB.update( {_id:req.param('id') }, escuela_actualizada).exec( function ( error, total_afectaciones) {
	    if(!error){
	      
	    }else{

	    }
	  });
	});



}
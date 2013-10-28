var a = require('../app/database.js')
module.exports = function (app){

	a.mongoose;
	app.get('/sifiie/administracion/noticias', function (req, res){
		console.log('get noticias');
	});



}
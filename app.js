/**
 * Created with tualo IDE.
 * Author: Thomas Hoffmann
 * Date: 2013-04-12
 * Last Changes: 2013-04-16
 *  
 */

var routes = ['ui'];

var express = require('express');
var config = {
	session_secret: 'test',
	port: 8088
};
var http = require('http');
var path = require('path');
var fs = require('fs');

var app = express();


app.configure(function(){
	app.set('port', config.port);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: config.session_secret}));
	app.use(express.static(path.join(__dirname, 'public')));
	
	
	
});

var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log("you can test in your browser http://localhost:" + app.get('port'));
});

app.server = server; // bring the baseDir to the project-route
app.startDirectory = __dirname; // bring the baseDir to the project-route
for(var i in routes){
	require('./routes/'+routes[i]).initRoute(app);
}

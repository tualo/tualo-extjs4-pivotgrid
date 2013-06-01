/**
 * Created with tualo IDE.
 * Author: Thomas Hoffmann
 * Date: 2013-04-22
 */

var fs = require('fs');

var startUI = function(req, res, next) {
	res.render('layout',{
		title: 'tualo webmail'
	});
}

var sampledata= function(req, res, next) {
	var output = {
		success: false,
		data: [],
		msg: 'unkown'
	}
	fs.readFile('../excel/sampledata.csv',function(err,data){
		if (err){
			output.msg = err.message;
			return res.json(200,output);
		}
		console.log(data);
		return res.json(200,output);
	});
	
}

exports.initRoute=function(app){
	app.get("/",startUI);
	app.get("/sampledata",sampledata);
	app.get("/sampledata",sampledata);
}


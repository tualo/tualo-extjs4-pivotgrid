/**
 * Created with tualo IDE.
 * Author: Thomas Hoffmann
 * Date: 2013-04-22
 */

var fs = require('fs');
var path = require('path');

var startUI = function(req, res, next) {
	res.render('layout',{
		title: 'tualo webmail'
	});
}

var sampledata= function(req, res, next) {
	var output = {
		success: false,
		data: [],
		total: 0,
		msg: 'unkown'
	}
	fs.readFile(path.join(__dirname,'..', 'excel','sample-data.csv'),function(err,data){
		if (err){
			output.msg = err.message;
			return res.json(200,output);
		}
		var lines = data.toString().split("\n");
		if (lines.length>0){
			var map  = [];
			var headline = lines[0].split(";");
			for(var i=0;i<headline.length;i++){
				map.push(headline[i]);
			}
			for(var i=1;i<lines.length;i++){
				var columns = lines[i].split(";");
				var dataLine = {};
				for(var c=0;c<columns.length;c++){
					dataLine[map[c]] = columns[c].replace(',','.');
				}
				output.data.push(dataLine);
			}
			output.total = output.data.length;
		}
		return res.json(200,output);
	});
	
}

exports.initRoute=function(app){
	app.get("/",startUI);
	app.get("/sampledata",sampledata);
	app.get("/sampledata",sampledata);
}


var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var bodyParser = require('body-parser');
var app = express();
var basicAuth = require('basic-auth-connect');
var auth = basicAuth(function(user, pass)
{
	return((user ==='test')&&(pass === 'test'));
});

var options = 
{
	host: '127.0.0.1',
	key: fs.readFileSync('ssl/server.key'),
	cert: fs.readFileSync('ssl/server.crt')
};
http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
app.get('/', function (req, res) 
{
	res.send("Get Index");
});

app.use('/', express.static('./html', {maxAge: 60*60*1000}));
app.use(bodyParser());
app.get('/getcity', function (req, res) 
{
	console.log("In getcity route");
	var urlObj = url.parse(req.url, true, false);
	console.log(urlObj.pathname);
	console.log(urlObj.query["q"]);
	var input = urlObj.query["q"];
	var jsonArray = [];
	fs.readFile('cities.dat.txt', function(err, data)
	{
		if(err)
			throw err;
		var cities = data.toString().split('\n');
		for(var i = 0; i < cities.length; i++)
		{
			if(cities[i].substring(0, input.length) === input)
				jsonArray.push({city:cities[i]});
		}
		res.writeHead(200);
		res.end(JSON.stringify(jsonArray));
		console.log(jsonArray);
	});
});

app.get('/comment', function (req, res) 
{
	console.log("GET comment route.");
  		// Read all of the database entries and return them in a JSON array
  		var MongoClient = require('mongodb').MongoClient;
  		MongoClient.connect("mongodb://localhost/weather", function(err, db) 
  		{
  			if(err) throw err;
  			db.collection("comments", function(err, comments)
  			{
  				if(err) throw err;
  				comments.find(function(err, items)
  				{
  					items.toArray(function(err, itemArr)
  					{
  						console.log("Document Array: ");
  						console.log(itemArr);
  						res.writeHead(200);
  						res.end(JSON.stringify(itemArr));
  					});
  				});
  			});
  		});
});

app.post('/comment', auth, function (req, res) 
{
	console.log("In POST comment route");
	console.log(req.body);
	//var jsonData = req.body;
	var reqObj = req.body;
	console.log(reqObj);
	console.log("Name: "+reqObj.Name);
	console.log("Comment: "+reqObj.Comment);

      	// Now put it into the database
      	var MongoClient = require('mongodb').MongoClient;
      	MongoClient.connect("mongodb://localhost/weather", function(err, db) 
      	{
      		if(err) throw err;
      		db.collection('comments').insert(reqObj,function(err, records) 
      		{
      			console.log("Record added as "+records[0]._id);
      		});
      	});

	
	res.writeHead(200);
	res.end("");
});


// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').config();
var redis = require("redis");
var WebSocketServer = require('websocket').server;

// Require keystone
var keystone = require('keystone');


// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.



keystone.init({
	'name': 'CodingGameApp',
	'brand': 'CodingGameApp',
	'port': process.env.PORT || 80,

	'less': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': 'jade',

	'emails': 'templates/emails',

	'auto update': true,
	'session': true,
	'auth': true,
	'user model': 'User',
});

// Load your project's Models
keystone.import('models');

//setting redis - cache object
var redis_config = require("./config.js").redis_config;
var redis_client;
if (redis_config.enable) {
    redis_client = redis.createClient(redis_config.port, redis_config.host);
    redis_client.on('connect', function () {
        console.log("Connected to Redis");
    });

}
// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
	_: require('lodash'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable,
	redis_client: redis_client
});

// Load your project's Routes
keystone.set('routes', require('./routes'));

// Setup common locals for your emails. The following are required by Keystone's
// default email templates, you may remove them if you're using your own.
keystone.set('email locals', {
	logo_src: '/images/logo-email.gif',
	logo_width: 194,
	logo_height: 76,
	theme: {
		email_bg: '#f9f9f9',
		link_color: '#2697de',
		buttons: {
			color: '#fff',
			background_color: '#2697de',
			border_color: '#1a7cb7',
		},
	},
});

// Load your project's email test routes
keystone.set('email tests', require('./routes/emails'));


// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
	users: 'users',
});

// Start Keystone to connect to your database and initialise the web server

keystone.start({
	onHttpServerCreated: function() { 
		initializeSocketServer(keystone.httpServer) 
	}
});

function initializeSocketServer(httpServer){
	console.log("create socket server")
	//WEBSOCKET
	wsServer = new WebSocketServer({
	    httpServer: httpServer,
	    // You should not use autoAcceptConnections for production
	    // applications, as it defeats all standard cross-origin protection
	    // facilities built into the protocol and the browser.  You should
	    // *always* verify the connection's origin and decide whether or not
	    // to accept it.
	    autoAcceptConnections: false
	});

	function originIsAllowed(origin) {
	  // put logic here to detect whether the specified origin is allowed.
	  return true;
	}
	var clients = [];
	wsServer.on('request', function(request) {
		console.log("new socket request")
	    if (!originIsAllowed(request.origin)) {
	      // Make sure we only accept requests from an allowed origin
	      request.reject();
	      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
	      return;
	    }

	    var connection = request.accept('echo-protocol', request.origin);
	    console.log((new Date()) + ' Connection accepted.' + (connection));
	    connection.on('message', function(message) {
	        if (message.type === 'utf8') {

	        	console.log(message);
	        	var data = JSON.parse(decodeURIComponent(message.utf8Data));

	        	var userID = data.userID;
	        	var mapID = data.mapID;

	        	if (data.type == 'initialize'){
	        		clients.push({
	        			userID: userID,
	        			mapID: mapID,
	        			connection: connection
	        		})
	        		return;
	        	}

	        	var userCode = data.userCode;
	        	var event = data.event;
	        	var userCodeRedis = "latestcode3/"+userID +'/' +mapID;
	        	redis_client.get(userCodeRedis, function(err, reply){
	        		console.log("errr get redis " + err);
	        		if (reply){
	        			console.log("still have session");
	        			redis_client.ttl(userCodeRedis, function(err, data) {
						    console.log('I live for this long yet: ' + data);
						    redis_client.set(userCodeRedis,userCode);
						    redis_client.expire(userCodeRedis, data);
						});
        				
	        		} else {
	        			console.log("has no session");
	        			var timeout = 10;
	        			redis_client.set(userCodeRedis,userCode);
	        			redis_client.expire(userCodeRedis, timeout);
	        			setTimeout(function(){
	        				//save to mongodb
	        				//console.log("save latest code to mongodb " + reply)
	        				var GameResult = keystone.list("GameResult");
	        				GameResult.model.findOne({userID: userID, mapID: mapID}, function(err, gameResult){
	        					if (gameResult){
	        						redis_client.get(userCodeRedis, function(err, reply){
	        							if (reply){
	        								gameResult.latestSubmissionID = reply;
			        						gameResult.save(function(err){
			        							console.log("save latest code to mongodb " + reply)
			        						})
	        							}
	        						})
	        						
	        					}
	        				})
	        			}, timeout * 1000 - 1000)
	        		}
	        	})
	            console.log('Received Message: ' + message.utf8Data);
	            
	            
	            

				
	            for (var i = 0; i < clients.length; i++){
	            	if (clients[i].userID == userID && clients[i].mapID == mapID){
	            		clients[i].connection.sendUTF(JSON.stringify(event));
	            	}
	            }
	            

	        }
	        else if (message.type === 'binary') {
	            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
	            connection.sendBytes(message.binaryData);
	        }
	    });
	    connection.on('close', function(reasonCode, description) {
	        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	    });
	});
}

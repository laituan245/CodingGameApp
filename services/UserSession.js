var crypto = require('crypto');

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;
    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
}

module.exports = {
	// Create session for user when they login
  	create: function(req,res, account, callback){
		var locals = res.locals;
		var redis_client = locals.redis_client;
		var utils = locals.utils;
		console.log("Util");
		console.log(utils);
		var hashInfo = {
			ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace("::ffff:",""),
			ua: req.headers['user-agent'],
			userID: account._id,
			time:Date.now()
		}

		var shasum = crypto.createHash('sha1');
		shasum.update(JSON.stringify(hashInfo));
		var sessionID = shasum.digest('hex');
		var result = {
			status: "000",
			sessionID: sessionID
		}

		redis_client.set("sessionservice/"+sessionID,JSON.stringify(hashInfo));
		redis_client.expire("sessionservice/"+sessionID, Number(1)*60*60);
		return callback(result);
	},
	//compare sessionId from cookies to sessionId in redis
  	check: function(req, res, callback){
  		var locals = res.locals;
		var redis = locals.redis_client;
		var cookies = parseCookies(req);
		cookies.dsid = decodeURIComponent(cookies.dsid);
		var session = cookies.dsid.split("@")[0];


		redis.get("sessionservice/"+session, function(err, reply){
			if (reply){
				var result = {
					status: "000",
					data: "ok"
				}
				locals.userID = getUserID(session);
				console.log("local.userID " + locals.userID );
				return callback(result);
			} else {
				var result = {
					status: "001",
					data: "Dont have that session in database"
				}
				return callback(result);
			}
		});
  	},

  	delete: function(req, res, callback){
		var locals = res.locals;
		var redis = locals.redis_client;
	
		var cookies = parseCookies(req);
		cookies.dsid = decodeURIComponent(cookies.dsid);
		var session = cookies.dsid.split("@")[0];


		redis.get("sessionservice/"+session, function(err, reply){
			if (reply){
				redis.expire("sessionservice/"+session, -1);
				var result = {
					status: "success",
					data: "Delete session successfully"
				}
				return callback(result);
			} else {
				var result = {
					status: "error",
					data: "Dont have that session in database"
				}
				return callback(result);
			}
		});
  	}



}
function getUserID(session){
	var startPos = session.indexOf("codinggame") + 10;
	return session.substr(startPos);
}
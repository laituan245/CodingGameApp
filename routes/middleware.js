/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
var UserSession = require("../services/UserSession")
var _ = require('lodash');
function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;
    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
}

//REDIS
var redis = require("redis");
var redis_config = require("../config.js").redis_config;
var redis_client;
if (redis_config.enable) {
    redis_client = redis.createClient(redis_config.port, redis_config.host);
    redis_client.on('connect', function () {
        console.log("Connected to Redis in middleware.js");
    });

}

/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	res.locals.navLinks = [
		{ label: 'Home', key: 'home', href: '/' },
	];
	res.locals.user = req.user;
	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (msgs) { return msgs.length; }) ? flashMessages : false;
	next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};

//server will know user is authenticated or not
exports.checkUserAuthentication = function(req, res, next){
	var locals = res.locals;
	UserSession.check(req, res, function(result){
		if (result.status == '000'){
			locals.authenticated = true;
		} else{
			
			locals.authenticated = false;
		}
		next();
	})
}

exports.attachRedis = function(req, res, next){
	res.locals.redis_client = redis_client;
	next();
}

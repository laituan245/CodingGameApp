var keystone = require('keystone');


module.exports = {
	login: function(req, res){
		var locals =  res.locals;
		if (locals.authenticated === true){
			return res.redirect('/');
		}
		var view = new keystone.View(req, res);
		view.render("UserLogin/login");

	},

	logout: function(req, res){
		
		
	},

	signup: function(req, res){
		var locals =  res.locals;
		if (locals.authenticated === true){
			return res.redirect('/');
		}
		var view = new keystone.View(req, res);
		view.render("UserLogin/signup");
	}
}


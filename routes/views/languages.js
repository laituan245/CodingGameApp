var keystone = require('keystone');

exports = module.exports = function (req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals;
	if (locals.authenticated) {
		// Render the view
		view.render('languages');
	}
	else {
		res.redirect('/login')
	}
};

var keystone = require('keystone');

exports = module.exports = function (req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals;
	if (locals.authenticated) {
		// Render the view
		var language = req.params.language || "none";
		locals.language = language;
		view.render('lesson-list');
	}
	else {
		res.redirect('/login')
	}
};

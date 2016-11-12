var keystone = require('keystone');
var MapTemplate = keystone.list("MapTemplate");

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	var language = req.params.language || "none";
	var lessonID = req.params.lessonID || "none";
	var gameID = req.params.gameID || "none";
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';
	var userID = res.locals.userID || null;
	console.log("UserID " + userID);

	//read database
	var params = {
		mapID : lessonID + "_" + gameID
	}

	MapTemplate.model.findOne(params, function(err, myMapTemplate){
		console.log("mapID " + params.mapID);
		
		// Render the view based on the map template for this game
		locals.mapTemplate = myMapTemplate;
		//Lecture
		view.render('playgame');	
	})
};

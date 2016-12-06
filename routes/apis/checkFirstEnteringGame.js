var keystone = require('keystone');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var GameResult = keystone.list("GameResult");




exports = module.exports = function (req, res) {
	var userID = res.locals.userID;
  	var mapID = req.body.mapID;
  	if (!res.locals.authenticated){
  		res.redirect("/login");
  		return;
  	}

  	GameResult.model.findOne({userID: userID, mapID: mapID}, function(err, gameResult){
  		if (err){
  			return res.json({
  				status: "001",
  				message: "Database Error"
  			})
  		}
  		if (!gameResult){
  			return res.json({
  				status: "000",
  				existing: false
  			})
  		} else {
  			return res.json({
  				status: "000",
  				existing: true,
  				finished: gameResult.isCompleted
  			})
  		}
  	})
}
var keystone = require('keystone');
var fs = require('fs');
var Submission = keystone.list("Submission");
var async = require('async');

exports = module.exports = function (req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals;
	var userID = locals.userID;

	if (!locals.authenticated){
		return res.redirect("/login")
	}
	//main and only object to pass to the template
	var userData = {
		section1:{},
		section2:{},
		section3:{},
		section4:{}
	};



	function section1(callback) {
		//Tuan - data in this section has to be in userData.section1

	    callback(null);

	}
	function section2(callback) {
	    // Duong - data in this section has to be in userData.section2
	    callback(null);
	}
	function section3(callback) {
		// Cuong - data in this section has to be in userData.section3
	    //time, isSuccess, mapID, language, code
		Submission.model.find()
		.limit(20)
		.sort({createdAt: -1})
		.exec(function(err, submissions){
			userData.section3.submissions = submissions;
		})
	    callback(null);
	}

	function section4(callback) {
		// Cuong - data in this section has to be in userData.section4

	    callback(null);
	}


	async.waterfall([
	    section1,
	    section2,
	    section3,
	    section4
	], function (err, data) {
		if (err){
			res.json({success: false, message: err});
			return;
		}
	    // result now equals 'done'
	    locals.userData = userData

	    view.render("userAnalytic");
	});


}

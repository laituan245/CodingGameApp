var keystone = require('keystone');
var fs = require('fs');
var Submission = keystone.list("Submission");
var async = require('async');
var moment = require('moment');

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
		var params = {
			userID : userID
		}
		Submission.model.find(params)
		.exec(function(err, submissions){
			userData.section1.submissions = submissions;
			callback(null);
		})
	    

	}
	function section2(callback) {
	    // Duong - data in this section has to be in userData.section2
	    var params = {
			userID : userID
		}
		Submission.model.find(params)
		.exec(function(err, submissions){
			userData.section2.submissions = submissions;
			callback(null);
		})
	    callback(null);
	}
	function section3(callback) {
		// Cuong - data in this section has to be in userData.section3
	    //time, isSuccess, mapID, language, code
	    var params = {
			userID : userID
		}
		Submission.model.find(params)
		.sort({time: -1})
		.exec(function(err, submissions){
			userData.section3.submissions = submissions;
			callback(null);
		})



		// Submission.paginate({
		// 	page: 1,
		// 	perPage: 30,
		// 	maxPages: 30
		// })
		
		// .exec(function(err, submissions) {
		// 	if (err) return callback(err);
		// 	userData.section3.submissions = submissions;
		// 	console.log("check moment " + submissions.length + " " + userID);
		// 	console.log(moment(submissions[0]._.createdAt).format('MM/DD/YYYY'));
		// 	callback(null);
		// });

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

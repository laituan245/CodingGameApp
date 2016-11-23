var keystone = require('keystone');
var LessonTutorial = keystone.list("LessonTutorial");
var fs = require('fs');

module.exports = {
	createLessonTutorials: createAllLessonTutorials
}

function createAllLessonTutorials(req, res, callback) {
	createLessonTutorial1(function() {
		createLessonTutorial2(function() {
      createLessonTutorial3(function() {
        createLessonTutorial4(function() {
          return res.json({success: "true", message: "Four LessonTutorials have been created"});
        });
      })
		});
	});
}

function createLessonTutorial1(successCallback) {
  var newLessonTutorial = new LessonTutorial.model({
		tutorialID: "basicsyntax",
		title: "Basic Syntax",
	})

	newLessonTutorial.save(function(err){
		successCallback();
	});
}

function createLessonTutorial2(successCallback) {
	var newLessonTutorial = new LessonTutorial.model({
		tutorialID: "loops",
		title: "Loops",
	})

	newLessonTutorial.save(function(err){
		successCallback();
	});
}

function createLessonTutorial3(successCallback) {
  var newLessonTutorial = new LessonTutorial.model({
		tutorialID: "variables",
		title: "Variables",
	})

	newLessonTutorial.save(function(err){
		successCallback();
	});
}

function createLessonTutorial4(successCallback) {
  var newLessonTutorial = new LessonTutorial.model({
		tutorialID: "conditionalstatements",
		title: "Conditional statements",
	})

	newLessonTutorial.save(function(err){
		successCallback();
	});
}

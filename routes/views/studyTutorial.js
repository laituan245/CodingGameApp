var keystone = require('keystone');
var LessonTutorial = keystone.list("LessonTutorial");
var fs = require('fs');

exports = module.exports = function (req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;
  var language = req.params.language || "none";
  var lessonID = req.params.lessonID || "none";
  locals.language = language;
  locals.lessonID = lessonID;
  //read database
  if (lessonID === 'basicsyntax') {
    lessonTitle = 'Basic Syntax';
    gameID = 'lgame';
  } else if (lessonID == 'variables') {
    lessonTitle = 'Variables';
    gameID = 'lgamevariable'
  } else if (lessonID == 'whileloop') {
    lessonTitle = 'Loops'
    gameID = 'findtreasure';
  } else if (lessonID == 'condition') {
    lessonTitle = 'Conditional statements'
    gameID = 'cgame';
  }
  locals.gameID = gameID;
	var params = {
	   title : lessonTitle
	}

	LessonTutorial.model.findOne(params, function(err, myLessonTutorial){
		console.log("Lesson title: " + params.title);
		fs.readFile(__dirname + '/lesson_tutorial_contents/' + params.title +'.html', 'utf8', function (err, lessonContent) {
  		if (err) {
  			return console.error(err);
  		}
      console.log(lessonContent)
      console.log(myLessonTutorial)
      tmpLessonTutorial = JSON.parse(JSON.stringify(myLessonTutorial));
      tmpLessonTutorial["content"] = lessonContent;
      console.log(tmpLessonTutorial)
      locals.lessonTutorial = tmpLessonTutorial;
      view.render('studytutorial');
  	})
	})
}

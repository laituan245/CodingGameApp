var keystone = require('keystone');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var Submission = keystone.list("Submission");

function deleteTmpFile(filePath) {
  // fs.unlink(filePath, function() {});
}


exports = module.exports = function (req, res) {
	var locals = res.locals;
	var result  ={};
	var userID = locals.userID;

	var startPos = [10, 10];
	var steps = [
		{
			"doHere": null,
			"doNext": "right"
		},
		{
			"doHere": null,
			"doNext": "right"
		},
		{
			"doHere": null,
			"doNext": "right"
		},
		{
			"doHere": null,
			"doNext": "right"
		},
		{
			"doHere": null,
			"doNext": "down"
		},
		{
			"doHere": null,
			"doNext": "down"
		},
		{
			"doHere": null,
			"doNext": "down"
		},
		{
			"doHere": null,
			"doNext": "down"
		}
	];
	var instructions = {
		steps: steps,
		startPos: startPos
	}

/*
	Get userCode, insert it into the code template
	Create 2 files:
	- 2nd file: contains mapTemplate
	- 1st file: complete code to run (template + userCode)

*/
	var userCode = decodeURIComponent(req.body.userCode);

	var originalUserCode = userCode;
	var mapTemplate = req.body.mapTemplate;
	//Create the first file
	var d = new Date();
	var timestamp = d.getTime();
	var fullTemplateFilePath =  __dirname + "/tmp/map" + mapTemplate.mapID + "_" + timestamp + "_" + ".txt";
	fs.writeFile(fullTemplateFilePath, JSON.stringify(mapTemplate), function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");

	    //Create the second file (python file)
		// Asynchronous read
		fs.readFile(__dirname + '/codeTemplate.py', function (err, codeTemplate) {
			if (err) {
			  return console.error(err);
			}
			codeTemplate = codeTemplate.toString();
			var lines = userCode.split('\n');
			userCode = "";
			for (var i = 0; i < lines.length; i++){
				userCode += "\n\t"+lines[i];
			}
			var fullCode = codeTemplate + '\ntry:\n' + userCode + "\nexcept Exception,e:\n\terrorMessage = type(e).__name__ + ': ' + str(e)\nfinally:\n\tprint (toJSONString(errorMessage,instruction_arr))";
			var fullCodeFilePath = __dirname + "/tmp/codeTemplate" + timestamp + ".py";
			fs.writeFile(fullCodeFilePath, fullCode, function(err) {
			    if(err) {
			        return console.log(err);
			    }
			    //NOW RUN THE FILE !
			  //   setTimeout(function(){
			  //   	PythonShell.run(fullCodeFilePath, function (err, result) {
					// 	if (err) throw err;
					// 	console.log('finished');
					// 	console.log(result);
					// });
			  //   }, 2000);

			    var pid = null;
			    var processIsDone = false;

				exec("python " + fullCodeFilePath + ' ' + fullTemplateFilePath, function(error, stdout, stderr){
					processIsDone = true;
					if (error) {
						//(*) not success 1: syntax error
						var errorType = processError(error, 1);
						createSubmissionInstance(userID, false, errorType, mapTemplate.mapID, mapTemplate.name, "python", originalUserCode, function(error){
							//done adding submission instance
						})
						console.log("exec error: " + error);
						var tempPos = stderr.indexOf("line") + 5;
						stderr = stderr.substr(stderr.indexOf(" ", tempPos) + 1);
						result.instructions = {
							startPos: mapTemplate.startPoint,
							steps: [{
								'doHere': {
									action: "showMessage",
									data: {
										message: stderr
									}
								}, 'doNext': 'none'
							}]
						}
            deleteTmpFile(fullCodeFilePath);
            deleteTmpFile(fullTemplateFilePath);
						res.json(result);
						return;
					}
					console.log(stdout);
					stdout = JSON.parse(stdout);

					result.instructions = {
						startPos: mapTemplate.startPoint,
						steps: stdout.data
					}

					var realError = stdout.error;    // run-time error, 
					if (realError != "none"){
						//(*) not success 2: process error (semantic, runtime)
						var errorType = processError(realError, 2);
						createSubmissionInstance(userID, false, errorType, mapTemplate.mapID, mapTemplate.name, "python", decodeURIComponent(req.body.userCode), function(error){
								//done adding submission instance
						})
						result.instructions.steps.push({
							'doHere': {
								action: "showMessage",
								data: {
									message: realError
								}
							}, 'doNext': 'none'
						})
					} else {
						//(*) success 
						createSubmissionInstance(userID, true, null, mapTemplate.mapID, mapTemplate.name, "python", decodeURIComponent(req.body.userCode), function(error){
							//done adding submission instance
						})
						
					}
					
					
          			deleteTmpFile(fullCodeFilePath);
          			deleteTmpFile(fullTemplateFilePath);
					res.json(result);
				});

				
				exec("ps -e | grep codeTemplate" + timestamp, function(error, stdout, stderr){
					var lines = stdout.split('\n');
					var foundLine = '';
					for (var i = 0; i < lines.length; i++) {
						if (lines[i].indexOf('python') >= 0) {
							foundLine = lines[i];
							break;
						}
					}
					foundLine = foundLine.trim();
					pid = foundLine.substring(0, foundLine.indexOf(' '));
					setTimeout(function(){
						console.log(processIsDone);
						if (!processIsDone){
							//(*) not success 3: error: infinitive loop
							var errorType = processError("Infinitive loop", 3);
							createSubmissionInstance(userID, false, errorType, mapTemplate.mapID, mapTemplate.name, "python", decodeURIComponent(req.body.userCode), function(error){
									//done adding submission instance
							})
							exec("kill -9 " + pid, function(error, stdout, stderr){
								console.log("DONE KILLING TOO LONG PROCESS");
								result.instructions = {
									startPos: mapTemplate.startPoint,
									steps: [{
										'doHere': {
											action: "showMessage",
											data: {
												message: "Infinitive loop"
											}
										}, 'doNext': 'none'
									}]
								}
                deleteTmpFile(fullCodeFilePath);
                deleteTmpFile(fullTemplateFilePath);
								res.json(result);
								return;
							})
						}
					}, 2000)
				})
			})
		});
	});




};
//return type of error
function processError(error, type){
	if (type === 1){
		return "Syntax Error";
	} else if (type === 2){
		//semantic or run-time
		console.log("Error type 2 " + error); 
		if (error.indexOf("Semantic Error") != -1){
			//sematic
			var endPos = error.indexOf(":");

			return "Semantic Error"
		} else {
			var endPos = error.indexOf(":");
			return error.substring(0, endPos);
		}
	} else {
		return "Infinitive loop";
	}
}


function createSubmissionInstance(userID, isSuccess, errorType, mapID, mapName, language, code, callback){
	var lessonAndGameID = mapID.split("_");

	var codeUrl = "/play/" + language + "/" + lessonAndGameID[0] + "/" + lessonAndGameID[1] + "?submissionID=";
	var newSubmission = new Submission.model({
		userID: userID,
		isSuccess: isSuccess,
		errorType: errorType,
		mapID: mapID,
		mapName: mapName,
		language: language,
		code: code,  
		codeUrl: codeUrl
	})

	newSubmission.save(function(err){
		console.log("New Submission created ");
		newSubmission.codeUrl = newSubmission.codeUrl + newSubmission._id;
		newSubmission.save(function(err){
			callback(null);
		})
		
	});
}
var keystone = require('keystone');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

 



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
	var mapTemplate = req.body.mapTemplate;
	//Create the first file
	var d = new Date();
	var timestamp = d.getTime();
	var fullTemplateFilePath =  __dirname + "/tmp/map" + mapTemplate.mapID + ".txt";
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
			var fullCode = codeTemplate + '\ntry:\n' + userCode + "\nexcept Exception,e:\n\terrorMessage = str(e)\nfinally:\n\tprint (toJSONString(errorMessage,instruction_arr))";
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
						//Syntax error
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
						res.json(result);
						return;
					}
					console.log(stdout);
					stdout = JSON.parse(stdout);

					result.instructions = {
						startPos: mapTemplate.startPoint,
						steps: stdout.data
					} 

					var realError = stdout.error;
					if (realError != "none"){
						result.instructions.steps.push({
							'doHere': {
								action: "showMessage",
								data: {
									message: realError
								}
							}, 'doNext': 'none'
						})
					}
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
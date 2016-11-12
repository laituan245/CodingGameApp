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
			var fullCode = codeTemplate + '\n' + userCode + "\nprint (toJSONString(instruction_arr))";
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
			    

				exec("python " + fullCodeFilePath + ' ' + fullTemplateFilePath, function(error, stdout, stderr){
					if (error) {
						console.log("exec error: " + error);
						return;
					}
					console.log(stdout);
					
					result.instructions = {
						startPos: startPos,

						steps: JSON.parse(stdout).data
					} 
					res.json(result);
				});
			})
		});
	}); 
	
	

	
};
var keystone = require('keystone');
var MapTemplate = keystone.list("MapTemplate");

module.exports = {
	createMap: createAllMapTemplates
}

function createAllMapTemplates(req, res) {
	createMapTemplate1(req, res, function() {
		createMapTemplate2(req, res, function() {
			createMapTemplate3(req, res, function() {
				createMapTemplateCondition(req, res, function() {
					return res.json({success: "true", message: "Four map templates have been created"});
				});
			});
		});
	});
}

function createMapTemplate1(req, res, callback){
	function createMatrix1(map_height, map_width, startPoint, endPoint){
		var res = [];
		for (var i = 0; i < 5; i++){
			var tempRow = [];
			for (var j = 0; j < 5; j++){
				if (i == 0 || j == 4){
					//empty cells
					var element = {
						objectToDisplay: "none",
						roles: [],
						message: null
					}
					tempRow.push(element);
				} else {
					//obstacle
					var element = {
						objectToDisplay: "obstacle",
						roles: ["obstacle"],
						message: null
					}
					tempRow.push(element);
				}
			}
			res.push(tempRow);
		}
		res[startPoint[0]][startPoint[1]].roles.push("startPoint");
		res[startPoint[0]][startPoint[1]].objectToDisplay="startFlag";
		res[endPoint[0]][endPoint[1]].roles.push("endPoint");
		res[endPoint[0]][endPoint[1]].objectToDisplay = "endFlag";

		return res;
	}
	var newMapTemplate = new MapTemplate.model({
		mapID: "basicsyntax_lgame",
		name: "L-Map",
		map_height: 5,
		map_width: 5,
		startPoint : [0,0],
		endPoint : [4,4],
		map: createMatrix1(5, 5, [0,0], [4,4]),
		instruction: "<p> Your mission is to move the robot to the destination."+
		" You are NOT allowed to go out of the board or jump into the obstacles. </p>"+
		" <p> There are 4 functions given: <pre>goLeft(), goRight(), goUp(), goDown()</pre> "+
		" For example, type <pre>goRight()</pre> to move the robot to the right</p>"
	})

	newMapTemplate.save(function(err){
		console.log("MapTemplate 1 is created");
		callback();
	});
}

function createMapTemplate2(req, res, callback){
	var newMapTemplate = new MapTemplate.model({
		mapID: "whileloop_findtreasure",
		name: "Finding treasure",
		map_height: 5,
		map_width: 5,
		startPoint : [0,0],
		endPoint : [-1, -1], // random
		map: null,
		instruction: "<p> Your mission is to find the treasure hidden inside the board."+
		" You are NOT allowed to go out of the board or jump into the hidden obstacles. </p>"+
		" <p> You are given 4 functions to move your robot: <pre>goLeft(), goRight(), goUp(), goDown()</pre>"+
		" For example, type <pre>goRight()</pre> to move the robot to the right</p>"+
		" <p> There are also hidden guidance letters that give you the correct direction. Function <pre>readLetter()</pre>"+
		" returns <em>'left', 'right', 'up' or 'down'</em>. Read the letters and move your robot to the corresponding direction.</p>"+
		" <p> To check if you are on the treasure, use <pre>onTreasure()</pre>"+
		" which returns true if robot is on the treasure, and false otherwise.</p>"+
		" <p> You will win your final destination is on the treasure. Good luck!</p>"
	})

	newMapTemplate.save(function(err){
		console.log("MapTemplate 2 is created");
		callback();
	});
}

function createMapTemplateCondition(req, res, callback){
	var newMapTemplate = new MapTemplate.model({
		mapID: "condition_cgame",
		name: "If-else",
		map_height: 5,
		map_width: 5,
		startPoint : [0,0],
		endPoint : [-1, -1], // random
		map: null,
		instruction: "<p> There is 2 finish flags on the map, but only one of them is the real destination."+
		" Your mission is to move the robot to the correct destination."+
		" You are NOT allowed to go out of the board or jump into the obstacles. </p>"+
		" <p> You are given 4 functions to move your robot: <pre>goLeft(), goRight(), goUp(), goDown()</pre>"+
		" For example, type <pre>goRight()</pre> to move the robot to the right</p>"+
		" <p> There is a guidance letter that gives you the correct direction. Function <pre>readLetter()</pre>"+
		" returns <em>'right' or 'down'</em>. Read the letter and move your robot to the corresponding direction"+
		" or your robot will be trapped by the fake destination. Good luck!</p>"
	})

	newMapTemplate.save(function(err){
		console.log("MapTemplate for Condtions is created");
		callback();
	});
}

function createMapTemplate3(req, res, callback){
	function createMatrix3(map_height, map_width, startPoint, endPoint){
		var res = [];
		for (var i = 0; i < 5; i++){
			var tempRow = [];
			for (var j = 0; j < 5; j++){
				if (i == 0 || j == 4){
					//empty cells
					var element = {
						value: null,
						word: null,
						objectToDisplay: "none",
						roles: [],
						message: null
					}
					tempRow.push(element);
				} else {
					//obstacle
					var element = {
						objectToDisplay: "obstacle",
						roles: ["obstacle"],
						message: null
					}
					tempRow.push(element);
				}
			}
			res.push(tempRow);
		}
		res[startPoint[0]][startPoint[1]].roles.push("startPoint");
		res[startPoint[0]][startPoint[1]].objectToDisplay="startFlag";
		res[endPoint[0]][endPoint[1]].roles.push("endPoint");
		res[endPoint[0]][endPoint[1]].objectToDisplay = "endFlag";

		return res;
	}
	var newMapTemplate = new MapTemplate.model({
		mapID: "variables_lgamevariable",
		name: "L-Map-Variable",
		map_height: 5,
		map_width: 5,
		startPoint : [0,0],
		endPoint : [4,4],
		map: createMatrix3(5, 5, [0,0], [4,4]),
		instruction: "<p> Your mission is to move the robot to the destination and annouce the correct sums."+
		" You are NOT allowed to go out of the board or jump into the obstacles. </p>"+
		" <p> You are given 4 functions to move your robot: <pre>goLeft(), goRight(), goUp(), goDown()</pre> "+
		" For example, type <pre>goRight()</pre> to move the robot to the right</p>"+
		" <p> In each available cell, there are two hidden values: a number and a word. At the destination, "+
		"you have to 'annouce' the sum of every number and the concatination of every word in those cells.</p>"+
		" <p> You are also given three helper functions. <pre>readValue()</pre> returns number of the current cell, <pre>readWord()</pre> returns the word in the current cell. </p>"+
		" <p> At the destination, use <pre>announceSums(YOUR_NUMBER_SUM_VARIABLE, YOUR_WORD_SUM_VARIABLE)</pre> to annouce your results and win! </p>"
	})

	newMapTemplate.save(function(err){
		console.log("MapTemplate 3 is created");
		callback();
	});
}

var keystone = require('keystone');
var MapTemplate = keystone.list("MapTemplate");

module.exports = {
	createMap: createAllMapTemplates
}

function createAllMapTemplates(req, res) {
	//createMapTemplate1(req, res);

	//createMapTemplate3(req, res);

	//createMapTemplate2(req, res);
	createMapTemplateCondition(req, res);

}

function createMapTemplate1(req, res){
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
		instruction: "<p> The robot needs to move to the destination. The instructions given are goLeft(), goRight(), goUp(), goDown(). </p> <p> It is not allowed to go out of the board or go into the stones. </p>"
	})

	newMapTemplate.save(function(err){
		console.log("A New MapTemplate is created");
		return res.json({success: "true"});
	});
}

function createMapTemplate2(req, res){
	var newMapTemplate = new MapTemplate.model({
		mapID: "whileloop_findtreasure",
		name: "Finding treasure",
		map_height: 5,
		map_width: 5,
		startPoint : [0,0],
		endPoint : [-1, -1], // random
		map: null,
		instruction: "The robot needs to find the treasure. You are given 6 functions: goLeft(), goRight(), goDown(), goUp(), onTreasure(), readLetter(). onTreasure() returnS true if robot is on the treasure. Otherwise, it returns false. readLetter() return the direction the robot should follow to find the treasure. The possible output of this function are: 'left', 'right', 'up', 'down'."
	})

	newMapTemplate.save(function(err){
		console.log("A New MapTemplate is created");
		return res.json({success: "true"});
	});
}

function createMapTemplateCondition(req, res){
	var newMapTemplate = new MapTemplate.model({
		mapID: "condition_cgame",
		name: "If-else",
		map_height: 5,
		map_width: 5,
		startPoint : [0,0],
		endPoint : [-1, -1], // random
		map: null,
		instruction: "There is 2 finish flags on the map, but only one of them is real. Use function readLetter(), which returns 'right' or 'down' to find the direction, then follow the direction and functions goDown(), goRight() to go to the real end point, or you will be trapped by the fake endPoint."
	})

	newMapTemplate.save(function(err){
		console.log("A New MapTemplate is created");
		return res.json({success: "true"});
	});
}

function createMapTemplate3(req, res){
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
		instruction: " <p> The robot needs to move to the destination. The instructions given are goLeft(), goRight(), goUp(), goDown(). </p> <p> It is not allowed to go out of the board or go into the stones. </p><p>In each cell, there are two values: a number and a word. Your task is to determine the sum of the number and a string which is the concatination of the words in those cells.</p><p> Here, you are also given three other functions: readValue() which returns number of the current cell, and readWord(), which returns the word in the current cell, and finally announceSums(numberSum, wordSum) to annouce your results. </p>"
	})

	newMapTemplate.save(function(err){
		console.log("A New MapTemplate is created");
		return res.json({success: "true"});
	});
}

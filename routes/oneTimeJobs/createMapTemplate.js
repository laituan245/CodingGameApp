var keystone = require('keystone');
var MapTemplate = keystone.list("MapTemplate");

module.exports = {
	createMap: createAllMapTemplates
}

function createAllMapTemplates(req, res, callback) {
	createMapTemplate1(function() {
		createMapTemplate2(function() {
			return res.json({success: "true", message: "Two MapTemplates have been created"});
		});
	});
}

function createMapTemplate1(successCallback){
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
		instruction: "The robot needs to move to the destination. The instructions given are goLeft(), goRight(), goUp(), goDown()."
	})

	newMapTemplate.save(function(err){
		successCallback();
	});
}


function createMapTemplate2(successCallback){
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
		successCallback();
	});

}

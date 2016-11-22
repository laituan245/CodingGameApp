var keystone = require('keystone');
var MapTemplate = keystone.list("MapTemplate");

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	var language = req.params.language || "none";
	var lessonID = req.params.lessonID || "none";
	var gameID = req.params.gameID || "none";
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';
	var userID = res.locals.userID || null;
	console.log("UserID " + userID);

	//read database
	var params = {
		mapID : lessonID + "_" + gameID
	}

	MapTemplate.model.findOne(params, function(err, myMapTemplate){
		console.log("mapID " + params.mapID);

		// Render the view based on the map template for this game
		if (gameID === "findtreasure") {
			myMapTemplate.endPoint = getEndPoint()
			myMapTemplate.map = createMap2(myMapTemplate.endPoint[0], myMapTemplate.endPoint[1]);
		}
		locals.mapTemplate = myMapTemplate;
		//Lecture
		view.render('playgame');
	})
};

function getEndPoint() {
	var endPointX = 0;
	var endPointY = 0;
	while (endPointX + endPointY <= 4) {
		endPointX = Math.floor((Math.random() * 4));
		endPointY = Math.floor((Math.random() * 4));
	}
	return [endPointX, endPointY];
}

function createMap2(endPointX, endPointY){
	var res = [];

	// Generate random path
	var random_path = [[0,0]]
	var startX = 0; var startY = 0;
	while (startX !== endPointX || startY !== endPointY) {
		var choice = Math.floor((Math.random() * 2))
		if (choice == 0) {
			// go down if possible
			if (startX < endPointX)
				startX = startX + 1;
			else
				startY = startY + 1;
		} else if (choice == 1) {
			// go right if possible
			if (startY < endPointY)
				startY = startY + 1;
			else
				startX = startX + 1;
		}
		random_path.push([startX, startY]);
	}

	for (var i = 0; i < 5; i++){
		var tempRow = [];
		for (var j = 0; j < 5; j++){
			//empty cells
			var element = {
				objectToDisplay: "none",
				roles: ['obstacle'],
				message: null
			}
			tempRow.push(element);
		}
		res.push(tempRow);
	}

	for (var i = 0; i < random_path.length-1; i++) {
		var cur_x = random_path[i][0];
		var cur_y = random_path[i][1];
		var next_x = random_path[i+1][0];
		var next_y = random_path[i+1][1];
		var direction = 'none';
		if (cur_x < next_x) {
			direction = 'down';
		} else if (cur_y < next_y) {
			direction = 'right';
		}
		res[cur_x][cur_y]['objectToDisplay'] = 'letter';
		res[cur_x][cur_y]['roles'] = ['letter'];
		res[cur_x][cur_y]['message'] = 'You should go ' + direction;
		res[cur_x][cur_y]['direction'] = direction;
	}

	res[0][0].roles = ["startPoint"];
	res[0][0].objectToDisplay="startFlag";
	res[endPointX][endPointY].roles = ["endPoint"];
	console.log(endPointX + ' ' + endPointY);
	return res;
}

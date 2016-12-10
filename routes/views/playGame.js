var keystone = require('keystone');
var MapTemplate = keystone.list("MapTemplate");
var User = keystone.list("User");
var Submission = keystone.list("Submission");
var GameResult = keystone.list("GameResult");

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	var language = req.params.language || "none";
	var lessonID = req.params.lessonID || "none";
	var gameID = req.params.gameID || "none";
	var submissionID = req.query.submissionID || null;
	var redis = locals.redis_client;
	console.log("submissionID " + submissionID );
	if (!locals.authenticated) {
		res.redirect('/login');
		return;
	}
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';
	var userID = res.locals.userID || null;
	var userNickname = res.locals.nickname || null;
	console.log("UserID " + userID);

	//read database
	var params = {
		mapID : lessonID + "_" + gameID
	}

	checkGameResult(userID,userNickname, lessonID + "_" + gameID,language, function(err, gameResult){
		locals.gameResult = gameResult;
		console.log("createdTime for gameResult");
		console.log(gameResult.createdTime.getTime());
		if (err) return res.json({Error: err});
		MapTemplate.model.findOne(params, function(err, myMapTemplate){
			console.log("mapID " + params.mapID);
			myMapTemplate = JSON.parse(JSON.stringify(myMapTemplate));
			// Render the view based on the map template for this game
			if (gameID === "findtreasure") {
				myMapTemplate.endPoint = getEndPoint()
				myMapTemplate.map = createMap2(myMapTemplate.endPoint[0], myMapTemplate.endPoint[1]);
			}

			if (gameID === "lgamevariable"){
				createMap3(myMapTemplate);
				console.log("lgamevariable map");
				console.log(JSON.stringify(myMapTemplate));
			}
			if (gameID === "cgame"){
				var rand = Math.floor(Math.random() * 2) * 4; // 0 or 4
				myMapTemplate.endPoint = [rand, 4 - rand];
				myMapTemplate.map = createMapCondition(myMapTemplate.endPoint[0], myMapTemplate.endPoint[1]);

			}
			locals.mapTemplate = myMapTemplate;
			locals.mapID = params.mapID;


			User.model.findById(userID, function(err, user){
				locals.shouldShowTimer = !gameResult.isCompleted;
				if (submissionID != null){
					Submission.model.findById(submissionID, function(err, submission){
						locals.initialCode = submission.code;
						view.render('playgame');
					})
				} else {
					var userCodeRedis = "latestcode3/"+userID+'/'+params.mapID;
	            	//console.log(temp + " " + temp.length);
					redis.get(userCodeRedis, function(err, userCode){
						if (userCode == null){
							GameResult.model.findOne({userID: userID, mapID: params.mapID}, function(err, gameResult){
								console.log(gameResult);
								if (gameResult) locals.initialCode = gameResult.latestSubmissionID;
								else locals.initialCode = "";
								console.log("latest userCode1");
								console.log(locals.initialCode );
								
								view.render('playgame');
							})
							
						} else {

							console.log("latest userCode");
							console.log(userCode);
							if (userCode){
								locals.initialCode = userCode;
							} else {
								locals.initialCode = "";
							}	
							view.render('playgame');
						}
						
					});
					
				}
				
				
			})
		})
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
		res[cur_x][cur_y]['objectToDisplay'] = 'none';
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


function createMap3(myMapTemplate){
	var words = ['bullwhip','atomic', 'settler', 'dogtooth', 'painkiller', 'eternity',
	'detainee', 'heaviest','chilly', 'detox', 'rose', 'insect', 'accepting', 'beard', 'silence', 'periodic'];
	
	var map = myMapTemplate.map;
	myMapTemplate.correctWordSum = "";
	myMapTemplate.correctValueSum = 0;
	for (var i = 0; i < myMapTemplate.map_height; i++)
		for (var j = 0; j < myMapTemplate.map_width; j++){
			if (map[i][j].objectToDisplay !== "obstacle"){
				console.log("empty cell " + i + "," + j);
				map[i][j].value = Math.floor((Math.random() * 1000));
				map[i][j].word = words[Math.floor((Math.random() * words.length))] + " ";
				if (i != myMapTemplate.map_height -1 || j != myMapTemplate.map_width - 1){
					myMapTemplate.correctWordSum += map[i][j].word;
					myMapTemplate.correctValueSum += map[i][j].value;
				}
				
				console.log(map[i][j].word + ".");
			}
		}
}
function createMapCondition(endPointX, endPointY){
	var res = [];

	for (var i = 0; i < 5; i++){
		var tempRow = [];
		for (var j = 0; j < 5; j++){
			if (i == 0 || j == 0){
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

	var direction = endPointX == 4 ? 'down' : 'right';
	res[0][0].roles = ["startPoint", "letter"];
	res[0][0].objectToDisplay = "letter";
	res[0][0]['message'] = 'You should go ' + direction;
	res[0][0]['direction'] = direction;
	res[endPointX][endPointY].roles = ["endPoint"];
	res[endPointY][endPointX].roles = ["fakeEndPoint"];
	res[endPointX][endPointY].objectToDisplay = "endFlag";
	res[endPointY][endPointX].objectToDisplay = "endFlag";
	console.log(endPointX + ' ' + endPointY);
	return res;

}


function checkGameResult(userID,userNickname, mapID,language, callback){
	GameResult.model.findOne({userID: userID, mapID: mapID}, function(err, gameResult){
		if (err){
			return callback(err);
		}
		if (!gameResult){
			var newGameResult = new GameResult.model({
				userID: userID,
				userNickname: userNickname,
				mapID: mapID,
				isCompleted: false,
				language: language,
				timeToFinish: -1, //second
				latestSubmissionID: -1,
				bestSubmissionID: -1
			})

			newGameResult.save(function(err){
				console.log("New GameResult created ");
				return callback(null, newGameResult);
			});
		} else {
			return callback(null,gameResult);
		}
	})
	//Add new instance to GameResult
	
}
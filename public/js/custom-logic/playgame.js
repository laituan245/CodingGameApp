$( document ).ready(function() {
	if (!shouldShowTimer) {
		$('#timer').hide();
		$('#alarm').hide();
	}

	var shouldStopTimer = false;
	startTimer();
	var TIME_PER_STEP = 50;
	var NUM_FRAMES_PER_STEP = 10;

	var originalMapTemplate = jQuery.extend(true, {}, mapTemplate);

    var canvas=document.getElementById('myCanvas');
	var ctx= canvas.getContext('2d');
	//get images for all objects
	var objectsDic = {};
	var background = document.getElementById('background');
	var robot = document.getElementById('robot');
	objectsDic["robot"] = robot;
	var obstacle = document.getElementById('obstacle');
	objectsDic["obstacle"] = obstacle;
	var endFlag = document.getElementById('endFlag');
	objectsDic["endFlag"] = endFlag;
	var letter = document.getElementById('letter');
	objectsDic["letter"] = letter;

	var arrowdown = document.getElementById('arrowdown');
	objectsDic["arrowdown"] = arrowdown;
	var arrowup = document.getElementById('arrowup');
	objectsDic["arrowup"] = arrowup;
	var arrowright = document.getElementById('arrowright');
	objectsDic["arrowright"] = arrowright;
	var arrowleft = document.getElementById('arrowleft');
	objectsDic["arrowleft"] = arrowleft;



	var canvas = ctx.canvas ;
	   var hRatio = canvas.width  / background.width    ;
	   var vRatio =  canvas.height / background.height  ;
	   var ratio  = Math.min ( hRatio, vRatio );
	   var centerShift_x = ( canvas.width - background.width*ratio ) / 2;
	   var centerShift_y = ( canvas.height - background.height*ratio ) / 2;

	function drawAllObjectsExceptRobot(){
		ctx.clearRect(0,0,canvas.width, canvas.height);
	    ctx.drawImage(background, 0,0, background.width, background.height,
	                      centerShift_x,centerShift_y,background.width*ratio, background.height*ratio);

		for (var i = 0; i < mapTemplate.map_height; i++){
	  		for (var j = 0; j < mapTemplate.map_width; j++){
	  			var cell = mapTemplate.map[i][j];
	  			var targetX = 10 + 80 * i;
	  			var targetY = 10 + 80 * j;

	  			if (cell.objectToDisplay != "none"){
	  				if (cell.objectToDisplay === "number"){
	  					console.log("here " );
	  					console.log(JSON.stringify(cell));
	  					drawNumber(cell.value, cell.word, targetX, targetY);
	  				} else {
	  					draw(cell.objectToDisplay, targetX, targetY);
	  				}

	  			}
	  		}
	  	}
	}

    function displayFirst() {
	  	drawAllObjectsExceptRobot();
	  	//draw robot
	  	draw("robot", 10 + 80 * mapTemplate.startPoint[0],
	  		10 + 80 * mapTemplate.startPoint[1]);

	}


	//ANIMATE
	function draw(objectName,x, y){
	    var targetObject = null; //an square image
	    targetObject = objectsDic[objectName] || null;
	    if (targetObject != null){
	    	ctx.drawImage(targetObject, y, x, 60, 60);
	    }

	}

	function drawNumber(number,word,x, y){
		ctx.font = "30px Verdana";
		ctx.fillStyle = 'white';
		ctx.fillText(number,y + 10, x + 20, 60, 60);
		ctx.font = "20px Verdana";
		ctx.fillStyle = 'white';
		ctx.fillText(word,y + 5, x + 50, 60, 60);
	}


	function checkExist(value, array){
		for (var i = 0; i < array.length; i++){
			if (value === array[i]) return true;
		}
		return false;
	}


	function run(timeout, curX, curY, deltaX, deltaY){
		var finalx = curX + deltaX;
		var finaly = curY + deltaY;
	    (function(finalx, finaly){
	    	var numSteps = NUM_FRAMES_PER_STEP;
		   for (var i = 0; i < numSteps; i++){
		      timeout += TIME_PER_STEP;
		      setTimeout(function(){
		          curX += deltaX / numSteps;
		          curY += deltaY / numSteps;
		          drawAllObjectsExceptRobot();
		          if (mapTemplate.mapID === "whileloop_findtreasure"){

		          		if (checkExist("letter", mapTemplate.map[(finalx-10) / 80][(finaly - 10) / 80].roles)){
		          			console.log("Draw letter in advance")
		          			draw("letter", finalx, finaly);
		          		}
		          }


		          // if (mapTemplate.mapID === "whileloop_findtreasure"){

		          // 		if (!checkExist("obstacle", mapTemplate.map[(finalx-10) / 80][(finaly - 10) / 80].roles)){
		          // 			console.log("Draw number in advance")
		          // 			draw("letter", finalx, finaly);
		          // 		}


		          // }



		          draw("robot", curX, curY);

		      }, timeout);
		     }
	    })(finalx,finaly);

	}

	function startTimer() {
	    if (gameResult.isCompleted) return;
	    var today = new Date();
	    var initialSeconds = new Date(gameResult.createdTime).getTime() / 1000;
		var curTimeStamp = today.getTime();
	    var seconds = curTimeStamp / 1000;
		seconds = seconds - initialSeconds;
		var h = checkTime(parseInt(seconds / 3600));
		seconds = seconds - 3600 * h;
		var m = checkTime(parseInt(seconds / 60));
		seconds = seconds - 60 * m;
		var s = checkTime(parseInt(seconds));
		if (!shouldStopTimer) {
		    document.getElementById('timer').innerHTML =
		    h + ":" + m + ":" + s;
		    var t = setTimeout(startTimer, 500);
		}
	}
	function checkTime(i) {
	    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
	    return i;
	}

	function sendUserResult() {
		if (gameResult.isCompleted) return;
		shouldStopTimer = true;
		var initialSeconds = new Date(gameResult.createdTime).getTime() / 1000;
		var finalSeconds = new Date().getTime() / 1000;
		var dataToSend = finalSeconds - initialSeconds;
		var endPoint = "/get_user_result";
		console.log('Starting sending result');
		console.log(dataToSend);
		post(endPoint, {'timeToFinish': dataToSend, 'mapID': mapID}, function(result){
			if (result){
				console.log("Sucessully sent result");
				var rankingTableData = result;
				showRankingTable(rankingTableData);
			}
		});
	}



	function showRankingTable(rankingTableData) {

		var tBody = $('#rankingTableBody');
		tBody.empty();
		for (var i = 0; i < Math.min(rankingTableData.length, 10); i++) {
			var newTr = document.createElement('tr');
			var userTd = document.createElement('td');
			userTd.innerHTML = (rankingTableData[i].nickname);
			var timeTd = document.createElement('td');
			timeTd.innerHTML = (rankingTableData[i].time) + ' seconds';
			$(newTr).append(userTd);
			$(newTr).append(timeTd);
			$(tBody).append(newTr);
		}
		$('#rankingModal').modal('show');
	}

	$('#my-replay-btn').click(function() {
		window.location.href = window.location.href ;
	})

	$('#read-tutorial-btn').click(function() {
		// Hard coding (Responsibility: Tuan)
		var prefix = '/study/python/'
		var full_href;
		if (mapTemplate.mapID === 'basicsyntax_lgame') {
			full_href = prefix + 'basicsyntax/'
		} else if (mapTemplate.mapID === 'variables_lgamevariable') {
			full_href = prefix + 'variables/'
		} else if (mapTemplate.mapID === 'condition_cgame') {
			full_href = prefix + 'condition/'
		} else if (mapTemplate.mapID === 'whileloop_findtreasure') {
			full_href = prefix + 'whileloop/'
		}
		window.location.href = full_href
	})

	$('#my-next-game-btn').click(function() {
		// Hard coding (Responsibility: Tuan)
		if (mapTemplate.mapID === 'basicsyntax_lgame') {
			window.location.href = '/play/python/variables/lgamevariable'
		} else if (mapTemplate.mapID === 'variables_lgamevariable') {
			window.location.href = '/play/python/condition/cgame'
		} else if (mapTemplate.mapID === 'condition_cgame') {
			window.location.href = '/play/python/whileloop/findtreasure'
		} else {
			alert('No more game. New games will be created in the future.\nStay tuned :)')
		}
	})

	$('#my-view-ranking-table-btn').click(function() {
		console.log('Starting sending result');
		var endPoint = "/get_user_result";
		post(endPoint, {'timeToFinish': -1, 'mapID': mapID}, function(result){
			if (result){
				console.log("Sucessully sent result");
			   	$("#instructions-modal").modal({
			    	backdrop: 'static',
			    	keyboard: false
			  	})
			  	$("#instructions-modal").modal('hide');
				var rankingTableData = result;
				showRankingTable(rankingTableData);
			}
		});
	})

	$("#ranking-btn").click(function(){
		console.log('Starting sending result');
		var endPoint = "/get_user_result";
		post(endPoint, {'timeToFinish': -1, 'mapID': mapID}, function(result){
			if (result){
				console.log("Sucessully sent result");
				var rankingTableData = result;
				showRankingTable(rankingTableData);
			}
		});
	})

	function executeInstructions(instructions){
		var curX = instructions.startPos[0] * 80 + 10;
		var curY = instructions.startPos[1] * 80 + 10;
		var steps = instructions.steps;
		var timeout = 0;

		if (mapTemplate.mapID === "whileloop_findtreasure"){
			draw("letter", curX, curY);
		}

		for (var i = 0; i < steps.length; i++){
			var step = steps[i];
			(function (curX, curY){

				//What to do now
				if (step.doHere != "none"){
					if (step.doHere.action === "showVictory") {
						setTimeout(function(){
							if (mapTemplate.mapID !== "variables_lgamevariable")
								displayMessage("general_not_error", "You won! Congratulation ^^");
								sendUserResult();
						}, timeout)
					}
					if (step.doHere.action === "showMessage"){
						setTimeout(function(){
							displayMessage("general_error",step.doHere.data.message);
							//drawAllObjectsExceptRobot();
						}, timeout)
					}
					if (step.doHere.action === "showLetterContent"){
						setTimeout(function(){
							draw("arrow" + mapTemplate.map[(curX-10)/80][(curY-10)/80].direction, curX, curY);
							mapTemplate.map[(curX-10)/80][(curY-10)/80].objectToDisplay = 'arrow' + mapTemplate.map[(curX-10)/80][(curY-10)/80].direction;
							console.log('showLetterContent ' + JSON.stringify(step.doHere))
						}, timeout)
					}

					if (step.doHere.action === "showNumber"){
						setTimeout(function(){
							drawNumber(mapTemplate.map[(curX-10)/80][(curY-10)/80].value, curX, curY);
							mapTemplate.map[(curX-10)/80][(curY-10)/80].objectToDisplay = "number";
							console.log('showNumber ' + JSON.stringify(step.doHere))
						}, timeout)
					}

					if (step.doHere.action === "showLetter"){
						setTimeout(function(){
							draw("letter", curX, curY);
							console.log('showLetter');
						}, timeout)
					}
					if (step.doHere.action === "announceSums"){
						var data = step.doHere.data;
						setTimeout(function(){

							console.log("announceSums");
							console.log(JSON.stringify(data));
							announceSums(data.correctValueSum, data.correctWordSum, data.valueSum, data.wordSum)
						}, timeout)
					}
				}

			})(curX, curY);

			//What to do next
			if (step.doNext === "left"){
				run(timeout, curX, curY, 0, -80);
				curY -= 80;
			} else if(step.doNext === "right"){
				run(timeout, curX, curY, 0, 80);
				curY += 80;
			} else if(step.doNext === "down"){
				run(timeout, curX, curY, 80, 0);
				curX += 80;
			} else if (step.doNext === "up"){
				run(timeout, curX, curY, -80, 0);
				curX -= 80;
			}
			if (step.doHere.action === "announceSums"){
				break;
			}
			timeout += TIME_PER_STEP * NUM_FRAMES_PER_STEP;
		}
	}

	$("#reset-btn").click(function(){
		//alert(window.location.href );
		window.location.href = window.location.href ;
	});


	$("#run-btn").click(function(){
		$("#variable-game-notify").hide();
		$("#noti-message").hide();
		mapTemplate = jQuery.extend(true, {}, originalMapTemplate);
		var userCode = editor.getValue();
		userCode = encodeURIComponent(userCode);
		// console.log(decodeURIComponent(userCode));
		var dataToSend = {
			userCode: userCode,
			mapTemplate: mapTemplate
		}
		var endPoint = "/compiler";
		post(endPoint, dataToSend, function(result){
			if (result.success === true){
				console.log("Sucessully received instructions");
				var instructions = result.instructions;
				executeInstructions(instructions);
			} else {
				console.log("ERROR receiving response from compiler");
			}
		});

	})

	/*
		FUNCTIONS LIBRARY
    */
	function displayMessage(type, message){
		$("#instructions-modal").modal('show');
		$('#run-btn').hide();
		$('#reset-btn').show();
		if (type === "general_not_error"){
			$("#instructions-text").html(message);
			$('#instructions-text').css("color", "blue");
			$('#instructions-text').css("font-size", "15px");
		} else if (type === "general_error") {
			$("#instructions-text").html(message);
			$('#instructions-text').css("color", "red");
			$('#instructions-text').css("font-size", "15px");
		}
	}

	function announceSums(correctValueSum, correctWordSum, valueSum, wordSum){
		$('#run-btn').hide();
		$('#reset-btn').show();
		if (wordSum !== correctWordSum){
			messageStr = "SemanticError: Your final string is not the same as the correct final string.";
			displayMessage("general_error", messageStr);
		} else if (valueSum !== correctValueSum) {
			messageStr = "SemanticError: Your final sum of values is not the same as the final sum of values.";
			displayMessage("general_error", messageStr);
		}
		else {
			messageStr = "Correct answers. You won! Congratulation ^^";
			displayMessage("general_not_error", messageStr);
		}
	}

	function initialize(){
		$(".instruction-content").html(mapTemplate.instruction);

	}
	websocketUrl = "ws://" + hostIP;
	socket = new WebSocket(websocketUrl, "echo-protocol");

    socket.addEventListener("open", function(event) {
    	console.log("Open socket");
    	socket.send(JSON.stringify({
			type: 'initialize',
			mapID: mapID,
			userID: userID
		}))
    });
    var hasSocketMessage = false;
    var latestEditorEvent = {};
    editor.$blockScrolling = Infinity
    // Display messages received from the server
    socket.addEventListener("message", function(event) {

    	var jsonEvent = JSON.parse(event.data);
    	var stringEvent = JSON.stringify(jsonEvent.event);
    	console.log("Get message from server " + stringEvent);
    	console.log(latestEditorEvent);
    	console.log(stringEvent);
    	if (stringEvent == latestEditorEvent)
  			return;
    	hasSocketMessage = true;
      	//console.log("Server Says: " + event.data);
      	console.log("Set new value for editor");
      	// if (jsonEvent.action == 'insert'){
      	// 	// var startRow = jsonEvent.start.row;
      	// 	// var startCol = jsonEvent.start.column;
      	// 	// var endRow = jsonEvent.end.row;
      	// 	// var endCol = jsonEvent.end.column;
      	// 	// editor.session.insert(jsonEvent.end, jsonEvent.lines[0])
      	// 	// for (var i = startRow + 1; i <= endRow; i++){
      	// 	// 	editor.session.insert({row:i,column:1}, '\n' + jsonEvent.lines[i - startRow])
      	// 	// 	//editor.session.insert(jsonEvent.end, jsonEvent.lines.join(''))
      	// 	// }
      	// 	// // for (int i = 0; i < lines.length;i++){
      	// 	// // 	console.log(charCodeAt[lines[]]
      	// 	// // }
      	// 	editor.session.insert(jsonEvent.end, jsonEvent.lines.join('\n'))
      	// } else if (jsonEvent.action == 'remove'){
      	// 	console.log(jsonEvent.start.row);
      	// 	console.log(jsonEvent.end.row);
      	// 	editor.session.remove(jsonEvent)
      	// }
      	editor.setValue(jsonEvent.userCode);
    });

    // Display any errors that occur
    socket.addEventListener("error", function(event) {
      message.textContent = "Error: " + event;
    });

    socket.addEventListener("close", function(event) {
      status.textContent = "Not Connected";
    });
    // Close the connection
 //    close.addEventListener("click", function(event) {
	// 	close.disabled = true;
	// 	send.disabled = true;
	// 	message.textContent = "";
	// 	socket.close();
	// });

	editor.on("change", function(event){
		latestEditorEvent = JSON.stringify(event);
		if (hasSocketMessage){
			if (event.action=='remove'){
				return;
			}
			console.log("Just updated by server. No need to send this update");
			hasSocketMessage = false;
			return;
		}

		var userCode = editor.getValue();
		var dataToSend = {
			userID: userID,
			mapID: mapID,
			userCode: userCode,
			event: event
		}
		dataToSend = encodeURIComponent(JSON.stringify(dataToSend));
		console.log("Sendinnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn " + hasSocketMessage);
		console.log("sending event " + JSON.stringify(event));
		socket.send(dataToSend);
	})








    /*
		EXECUTION
    */

	//DISPLAY FIRST
	//displayFirst();
	/* Setting your options to override the defaults */
	$('#chooseID').joyride({
		postStepCallback : function (index, tip) {
            if (index == 2) {
              $(this).joyride('set_li', false, 1);
            }
          },
	  'tipLocation': 'bottom',         // 'top' or 'bottom' in relation to parent
	  'nubPosition': 'auto',           // override on a per tooltip bases
	  'scrollSpeed': 300,              // Page scrolling speed in ms
	  'timer': 2000,                   // 0 = off, all other numbers = time(ms) 
	  'startTimerOnClick': true,       // true/false to start timer on first click
	  'nextButton': true,              // true/false for next button visibility
	  'tipAnimation': 'pop',           // 'pop' or 'fade' in each tip
	  'pauseAfter': [],                // array of indexes where to pause the tour after
	  'tipAnimationFadeSpeed': 300,    // if 'fade'- speed in ms of transition
	  'cookieMonster': true,           // true/false for whether cookies are used
	  'cookieName': 'JoyRide',         // choose your own cookie name
	  'cookieDomain': false,           // set to false or yoursite.com
	});
	initialize();
	/*$(window).on("load", function() {
		displayFirst()
	    // weave your magic here.
	});*/
	window.onload = displayFirst.bind(null);
});

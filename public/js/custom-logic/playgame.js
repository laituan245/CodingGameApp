$( document ).ready(function() {
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
								displayMessage("general_not_error", "You won. Congratulation.");
						}, timeout)
					}
					if (step.doHere.action === "showMessage"){
						setTimeout(function(){
							displayMessage("general_error",step.doHere.data.message);
							drawAllObjectsExceptRobot();
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
			timeout += TIME_PER_STEP * NUM_FRAMES_PER_STEP;
		}
	}

	$("#run-btn").click(function(){
		$("#variable-game-notify").hide();
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
		if (type === "general_error"){
			$("#modalHeader").html("Error");
			$("#modalBody").html(message);
			$("#myModal").modal("show");
		} else if (type === "general_not_error") {
			$("#modalHeader").html("Info");
			$("#modalBody").html(message);
			$("#myModal").modal("show");
		}
	}

	function announceSums(correctValueSum, correctWordSum, valueSum, wordSum){
		$("#variable-game-notify").show();
		if (valueSum !== correctValueSum || wordSum !== correctWordSum){
			$("#variable-game-result").html("Wrong answer");
			console.log("Wrong answer the correct result is (valueSum = " + correctValueSum + ", wordSum = " + wordSum + ")" );
		} else {
			$("#variable-game-result").html("Correct answer");
			console.log("Correct answer !");
		}
		$("#valueSum").html("Your sum of values = " + valueSum);
		$("#wordSum").html("Your final string: \"" + wordSum + "\"");
		$("#correctValueSum").html("Correct sum of values = " + correctValueSum);
		$("#correctWordSum").html("Correct final string: \"" + correctWordSum + "\"");

	}

	function initialize(){
		$("#variable-game-notify").hide();
		$(".instruction-content").html(mapTemplate.instruction);
	}










    /*
		EXECUTION
    */

	//DISPLAY FIRST
	//displayFirst();
	initialize();
	window.onload = displayFirst.bind(null);
});

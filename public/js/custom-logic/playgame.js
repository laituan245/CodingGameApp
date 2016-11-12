$( document ).ready(function() {
	var TIME_PER_STEP = 50;
	var NUM_FRAMES_PER_STEP = 10;
	var startPos = [10, 10];
	var steps = [
		{
			"dohere": null,
			"doNext": "right"
		},
		{
			"dohere": null,
			"doNext": "right"
		},
		{
			"dohere": null,
			"doNext": "right"
		},
		{
			"dohere": null,
			"doNext": "right"
		},
		{
			"dohere": null,
			"doNext": "down"
		},
		{
			"dohere": null,
			"doNext": "down"
		},
		{
			"dohere": null,
			"doNext": "down"
		},
		{
			"dohere": null,
			"doNext": "down"
		}
	];
	var instructions = {
		steps: steps,
		startPos: startPos
	}
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
	  				draw(cell.objectToDisplay, targetX, targetY);	
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

	function run(timeout, curX, curY, deltaX, deltaY){
	   
	   var numSteps = NUM_FRAMES_PER_STEP;
	   for (var i = 0; i < numSteps; i++){
	      timeout += TIME_PER_STEP;
	      setTimeout(function(){
	          curX += deltaX / numSteps;
	          curY += deltaY / numSteps;
	          drawAllObjectsExceptRobot();
	          draw("robot", curX, curY);
	      }, timeout);
	   }
	}

	function executeInstructions(instructions){
		var curX = instructions.startPos[0];
		var curY = instructions.startPos[1];
		var steps = instructions.steps;
		var timeout = 0;
		for (var i = 0; i < steps.length; i++){
			var step = steps[i];
			
			//What to do now (to be done)
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
		EXECUTION
    */
	
	//DISPLAY FIRST
	//displayFirst();
	window.onload = displayFirst.bind(null);
});
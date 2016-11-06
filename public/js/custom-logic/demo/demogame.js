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

	var background = document.getElementById('background');
	var robot = document.getElementById('robot');

	window.onload = displayFirst.bind(null);



	var canvas = ctx.canvas ;
	   var hRatio = canvas.width  / background.width    ;
	   var vRatio =  canvas.height / background.height  ;
	   var ratio  = Math.min ( hRatio, vRatio );
	   var centerShift_x = ( canvas.width - background.width*ratio ) / 2;
	   var centerShift_y = ( canvas.height - background.height*ratio ) / 2;
	  
	function displayFirst() {
	   draw(10, 10);
	   
	}
	//DISPLAY FIRST



	//ANIMATE 
	function draw(x, y){
	    ctx.clearRect(0,0,canvas.width, canvas.height);
	   ctx.drawImage(background, 0,0, background.width, background.height,
	                      centerShift_x,centerShift_y,background.width*ratio, background.height*ratio);
	    ctx.drawImage(robot, x, y, 60, 60);
	}

	function run(timeout, curX, curY, deltaX, deltaY){
	   
	   var numSteps = NUM_FRAMES_PER_STEP;
	   for (var i = 0; i < numSteps; i++){
	      timeout += TIME_PER_STEP;
	      setTimeout(function(){
	          curX += deltaX / numSteps;
	          curY += deltaY / numSteps;
	          draw(curX, curY);
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
				run(timeout, curX, curY, -80, 0);
				curX -= 80;
			} else if(step.doNext === "right"){
				run(timeout, curX, curY, 80, 0);
				curX += 80;
			} else if(step.doNext === "down"){
				run(timeout, curX, curY, 0, 80);
				curY += 80;
			} else if (step.doNext === "up"){
				run(timeout, curX, curY, 0, -80);
				curY -= 80;
			}
			timeout += TIME_PER_STEP * NUM_FRAMES_PER_STEP;
		}
	}

	$("#run-btn").click(function(){
		executeInstructions(instructions);	
	})
		
    //run(10, 10, 80, 0);
});
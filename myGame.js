var CANVAS_WIDTH = 512; 
var CANVAS_HEIGHT = 256;

var canvasElement = document.createElement('canvas');
canvasElement.width = CANVAS_WIDTH;
canvasElement.height = CANVAS_HEIGHT;

var canvas = canvasElement.getContext("2d");
document.body.appendChild(canvasElement);

var FPS = 30;
setInterval(function() {
	update();
	draw();
}, 1000/FPS);

var player = {
	dx: 0,
	dy: 0,
	xPos: 50,
	yPos: 100,
	width: 32,
	jumpStrength: 4,
	walkSpeed: 2,
	height: 32,
	jumps: 2,
	color: "#00A",
	bottom: function() {
		return this.height + this.yPos;
	},
	right: function() {
		return this.width + this.xPos;
	},
	_xPos: function() {
		this.xPos += this.dx;
	},
	_yPos: function() {
		this.yPos += this.dy;
	},
	_normalize: function() {
		if (this.right() > CANVAS_WIDTH)
		{
			this.xPos = CANVAS_WIDTH - this.width;
		}
		if (this.bottom() > CANVAS_HEIGHT)
		{
			this.yPos = CANVAS_HEIGHT - this.height;
		}
		if (this.xPos < 0)
		{
			this.xPos = 0;
		}
	},
	_resetJumps: function() {
		if (this.bottom() == CANVAS_HEIGHT)
		{
			this.jumps = 2;
		}
	},
	update: function() {
		if (this.yPos + this.height < CANVAS_HEIGHT)
		{
			gravitize([this]);
		}
		this._xPos();
		this._yPos();
		this._normalize();
		this._resetJumps();
	},
	draw: function() {
		canvas.fillStyle = this.color;
		canvas.fillRect(this.xPos, this.yPos, this.width, this.height);
	},
};

document.addEventListener('keydown',function(e){
	switch(e.keyCode)
	{
		case 65: // key = 'a'
			player.dx = -player.walkSpeed;
			break;
		case 83: // key = 's'
			// pick up item
			break
		case 68: // key = 'd'
			player.dx = player.walkSpeed;
			break
		case 87: // key = 'w'
			if (player.jumps > 0)
			{
				player.dy = -player.jumpStrength;
				--player.jumps;
			}
			break;
	}
	//draw();
});
document.addEventListener('keyup',function(e){
	switch(e.keyCode)
	{
		case 65: // key = 'a'
			var leftEase = setInterval(function(){
				if (player.dx < 0)
				{
					player.dx += .1
				}
				else
				{
					clearInterval(leftEase);
				}
			}, 20);
			break;
		case 83: // key = 's'
			// pick up item
			break
		case 68: // key = 'd'
			var rightEase = setInterval(function(){
				if (player.dx > 0)
				{
					player.dx -= .1
				}
				else
				{
					clearInterval(rightEase);
				}
			}, 20);
			break
		case 87: // key = 'w'
			var hop = setInterval(function(){
				if (player.dy < 0)
				{
					player.dy += .2
				}
				else
				{
					clearInterval(hop);
				}
			}, 20);
			break;
	}
	//draw();
});

function gravitize(objects)
{
	var numberOfObject = objects.length, iter;
	for (iter = 0; iter < numberOfObject; ++iter)
		objects[iter].dy += .2;
}

function update(){
	player.update();
	contain(player);
}

function contain(object)
{
	if( object.right() > CANVAS_WIDTH)
	{
		object.xPos = CANVAS_WIDTH - object.width;
	}
	if( object.xPos < 0 )
	{
		object.xPos = 0;
	}
}

function draw(){
	canvas.clearRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
	player.draw();
}



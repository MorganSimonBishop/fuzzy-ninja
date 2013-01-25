var CANVAS_WIDTH = 512; 
var CANVAS_HEIGHT = 256;

var canvasElement = document.createElement('canvas');
canvasElement.width = CANVAS_WIDTH;
canvasElement.height = CANVAS_HEIGHT;

var canvas = canvasElement.getContext("2d");
document.body.appendChild(canvasElement);
document.body.style.backgroundColor = "black";

var FPS = 60;

// OBJECTS
var tree = {
	dx: 0,
	dy: 0,
	xPos: 256,
	yPos: 200,
	trunkWidth: 10,
	trunkHeight: 56,
	trunkColor: "#926F5B",
	foliageWidth: 20,
	foliageHeight: 20,
	foliageColor: "#228B22",
	_xPos: function() {
		this.xPos += this.dx;
	},
	_yPos: function() {
		this.yPos += this.dy;
	},
	update: function (){
		this._xPos(); this._yPos();
	},
	drawTrunk: function ()
	{
		canvas.fillStyle = this.trunkColor; 
		canvas.fillRect(this.xPos, this.yPos, this.trunkWidth, this.trunkHeight);
	},
	drawFoliage: function ()
	{
		var foliageXPos = (this.xPos + this.trunkWidth / 2) - (this.foliageWidth / 2);
		var foliageYPos = this.yPos - this.foliageHeight;
		canvas.fillStyle = this.foliageColor;
		canvas.fillRect(foliageXPos, foliageYPos, this.foliageWidth, this.foliageHeight);
	},
		
	draw: function ()
	{
		this.drawTrunk();
		this.drawFoliage();
	},
};

var gun = {
	dx: 0,
	dy: 0,
	xPos: 50,
	yPos: 250,
	type: "weapon",
	name: "pistol",
	barrelWidth:8,
	barrelHeight:4,
	handleHeight:6,
	handleWidth:2,
	color: "black",
	facingDirection: "right",
	right: function() {
		return this.xPos + this.barrelWidth;
	},
	_xPos: function() {
		this.xPos += this.dx;
	},
	_yPos: function() {
		this.yPos += this.dy;
	},
	update: function (){
		this._xPos(); this._yPos();
	},
	_drawBarrel: function ()
	{
		canvas.fillStyle = this.color;
		canvas.fillRect(this.xPos, this.yPos, this.barrelWidth, this.barrelHeight);
	},
	_drawHandle: function ()
	{
		var _x = this.xPos;

		if (this.facingDirection == "left")
		{
			_x += this.barrelWidth - this.handleWidth;
		}

		canvas.fillStyle = this.color;
		canvas.fillRect(_x, this.yPos, this.handleWidth, this.handleHeight);
	},
	draw: function()
	{
		this._drawHandle();
		this._drawBarrel();
	},
};


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
	visibleItems: [],
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
	pickUp: function(object) {
		this.visibleItems.push(object);
		this._updateItems();
	},
	_updateItems: function()
	{
		var iter, numItems = this.visibleItems.length, object = {};
		for(iter = 0; iter < numItems; ++iter)
		{	
			object = this.visibleItems[iter];
			if (object.type == "weapon")
			{
				if (object.name == "pistol")
				{
					if (this.dx > 0)
					{
						object.facingDirection = "right";
						object.xPos = this.xPos + this.width;
					}
					else if(this.dx < 0)
					{
						object.facingDirection = "left";
						object.xPos = this.xPos - object.barrelWidth;
					}
					object.yPos =
						this.yPos + this.height / 2 - object.handleHeight;
				}
			}
		}
	},
	update: function() {
		if (this.bottom() < CANVAS_HEIGHT)
		{
			gravitize([this]);
		}
		this._xPos();
		this._yPos();
		this._normalize();
		this._updateItems();
		this._resetJumps();
	},
	draw: function() {
		canvas.fillStyle = this.color;
		canvas.fillRect(this.xPos, this.yPos, this.width, this.height);
	},
};


window.requestAnimFrame = (
	function ()
	{
		return window.requestAnimationFrame       ||
			   window.webkitRequestAnimationFrame ||
			   window.mozRequestAnimationFrame    ||
			   window.oRequestAnimationFrame      ||
			   window.msRequestAnimationFrame     ||
			   function (callback)
			   {
			       window.setTimeout(callback, 1000 / FPS);
			   };
	}
)();

(function animloop() 
{
	requestAnimFrame(animloop);
	update();
	draw();
})();

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
					if (player.dx + .1 > 0)
					{
						player.dx = 0;
						clearInterval(leftEase);
					}
					else
					{
						player.dx += .1
					}
				}
			}, 20);
			break;
		case 83: // key = 's'
			if ((gun.right() >= player.xPos) &&
				(gun.xPos <= player.right()))
			{
				//check yPos too
				player.pickUp(gun);
			}
			break;
		case 68: // key = 'd'
			var rightEase = setInterval(function(){
				if (player.dx > 0)
				{
					if (player.dx - .1 < 0)
					{
						player.dx = 0;
						clearInterval(rightEase);
					}
					else
					{
						player.dx -= .1
					}
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

function update()
{
	tree.update();
	gun.update();
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
	canvas.fillStyle="#FFFFFF";
	canvas.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
	tree.draw();
	player.draw();
	gun.draw();
}



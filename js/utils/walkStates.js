// IDLE STATE

var idle = {}

 // returns boolean value (room cell is available and open)
function canWalkHere(x, y, room)
{
    var tiles = room.tiles;
    
    return ((tiles[x] != null) &&
        (tiles[x][y] != null) &&
        (tiles[x][y] <= room.maxWalkableTileNum));
}

idle.enter = function(owner) {
	owner.startFrame = 24;
	owner.endFrame = 24;
	owner.currentFrame = owner.startFrame;
	owner.frameTimeSeconds = 1 / 4;
};

idle.update = function(owner, room, elapsedTime) {
	// do nothing
};

// WALK SOUTH STATE

var walkSouth = {};

walkSouth.enter = function(owner) {
	owner.startFrame = 24;
	owner.endFrame = 31;
	owner.currentFrame = owner.startFrame;
	owner.frameTimeSeconds = 1 / 15;
};

walkSouth.update = function(owner, room, elapsedTime) {   
    var y = Math.floor( owner.x / room.tileWidth );
    var x = Math.floor( (owner.y + owner.frameHeight  ) / room.tileHeight ); 
    if ( canWalkHere( x, y, room ) ){
        owner.y += owner.speed * elapsedTime;
    }
};


// WALK WEST STATE

var walkWest = {};

walkWest.enter = function(owner) {
	owner.startFrame = 0;
	owner.endFrame = 7;
	owner.currentFrame = owner.startFrame;
	owner.frameTimeSeconds = 1 / 15;
};

walkWest.update = function( owner, room, elapsedTime ) {
    var y = Math.floor( (owner.x - 12) / room.tileWidth ); 
    var x = Math.floor( owner.y / room.tileHeight ); 
    if ( canWalkHere( x, y, room ) ){
        owner.x -= owner.speed * elapsedTime;
    }  
	
};

// WALK EAST STATE

var walkEast = {};

walkEast.enter = function(owner) {
	owner.startFrame = 8;
	owner.endFrame = 15;
	owner.currentFrame = owner.startFrame;
	owner.frameTimeSeconds = 1 / 15;
};

walkEast.update = function( owner, room, elapsedTime ) {
    var y = Math.floor( (owner.x + 12) / room.tileWidth ); 
    var x = Math.floor( owner.y/ room.tileHeight ); 
    if ( canWalkHere( x, y, room ) ){
        owner.x += owner.speed * elapsedTime;
    } 
	
};

// WALK NORTH STATE

var walkNorth = {};

walkNorth.enter = function(owner) {
	owner.startFrame = 16;
	owner.endFrame = 23;
	owner.currentFrame = owner.startFrame;
	owner.frameTimeSeconds = 1 / 15;
};

walkNorth.update = function(owner, room, elapsedTime) {
    var y = Math.floor( owner.x / room.tileWidth );
    var x = Math.floor( (owner.y - owner.frameHeight ) / room.tileHeight ); 
    if ( canWalkHere( x, y, room ) ){
        owner.y -= owner.speed * elapsedTime;
    } 	
};


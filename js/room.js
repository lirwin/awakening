
function Room( init ) {

    this.tileWidth = ( init.tileWidth === undefined ) ? 32 : init.tileWidth;
    this.tileHeight = ( init.tileHeight === undefined ) ? 32 : init.tileHeight;

    // size of the room in sprite tiles
    this.numTilesWide= ( init.numTilesWide === undefined ) ? 20 : init.numTilesWide;
    this.numTilesHigh = ( init.numTilesHigh === undefined ) ? 20 : init.numTilesHigh;
    
        
    this.width = this.tileWidth * this.numTilesWide;
    this.height = this.tileHeight * this.numTilesHigh;
    
    this.x = ( init.x === undefined ) ? 0 : init.x;
    this.y = ( init.y === undefined ) ? 0 : init.y;
    
    // index into room array for neighboring rooms
    this.index = ( init.index === undefined ) ? 0 : init.index;
    this.roomTopIndex = ( init.roomTopIndex === undefined ) ? null: init.roomTopIndex;
    this.roomBottomIndex = ( init.roomBottomIndex === undefined ) ? null : init.roomBottomIndex;
    this.roomRightIndex = ( init.roomRightIndex === undefined ) ? null : init.roomRightIndex;
    this.roomLeftIndex = ( init.roomLeftIndex === undefined ) ? null: init.roomLeftIndex;
    
    this.spritesheet = ( init.spritesheet === undefined ) ? '' : init.spritesheet;    
    this.roomData = ( init.roomData === undefined ) ? {} : init.roomData;
    this.tiles = this.createTiles();

    this.maxWalkableTileNum = ( init.maxWalkableTileNum === undefined ) ? 0 : init.maxWalkableTileNum;
    this.monsters = ( init.monsters === undefined ) ? [] : init.monsters;
    this.treasure = ( init.treasure === undefined ) ? null : init.treasure;
}

// fill the room with tiles
// walkable room[x][y] = 0, obstacle room[x][y] = 1, edge room[x][y]
Room.prototype.createTiles = function() {
    var tiles = [[]];
    var x, y;
    
    // create walkable space
   for ( x=0; x < this.numTilesHigh; x++){
        tiles[x] = [];
        for ( y=0; y < this.numTilesWide; y++){
            var tileData = this.roomData.data[ ( y + ( x * this.numTilesWide ) ) ];
                        
            if ( this.roomData.tileproperties[ tileData ] && this.roomData.tileproperties[ tileData ].walkable ) {
                tiles[x][y] = 0;             
            }else {
                tiles[x][y] = 1;
            }            
        }
    }
    return tiles;
};

Room.prototype.draw = function( context ) {
    context.save();
    //dlog('Drawing room tiles...');

    var spriteNum = 0;
    var spriteRow = 0;
    var spriteCol = 0;
    var x, y;
     
    for ( y=0; y < this.numTilesHigh; y++ ){
        for ( x=0; x < this.numTilesWide; x++ ){
                // choose a sprite to draw                
                spriteNum = this.roomData.data[ ( x + ( y * this.numTilesWide ) ) ] - 1;
                spriteRow = Math.floor( spriteNum / this.roomData.numTilesWide );
                spriteCol = spriteNum % this.roomData.numTilesWide;
               
        // draw it
        // context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);

        context.drawImage( this.spritesheet, spriteCol * this.tileWidth, spriteRow * this.tileHeight, this.tileWidth, this.tileHeight, x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight );
        }
    }
    context.restore();
};

Room.prototype.update = function( context, player, currentRoom, world ) {
  if ( utils.getDistance( player.x, player.y, this.width, player.y ) <= world[ currentRoom ].tileWidth && ( this.roomRightIndex !== null ) ){
      currentRoom = this.roomRightIndex;
      player.x = world[ currentRoom ].tileWidth + 20;
  }
  if ( utils.getDistance( player.x, player.y, 0, player.y) <= world[ currentRoom ].tileWidth && ( this.roomLeftIndex !== null ) ){
       currentRoom = this.roomLeftIndex;
       player.x = world[ currentRoom ].tileWidth * ( world[ currentRoom ].numTilesWide - 1 ) - 20;
  }
  if ( utils.getDistance( player.x, player.y, player.x, this.height ) <= world[ currentRoom ].tileHeight && ( this.roomBottomIndex !== null ) ){
        currentRoom = this.roomBottomIndex;
        player.y = world[ currentRoom ].tileHeight + 20;
  }
  if ( utils.getDistance( player.x, player.y, player.x, 0 ) <= world[ currentRoom ].tileHeight && ( this.roomTopIndex !== null ) ){
        currentRoom = this.roomTopIndex;
        player.y = world[ currentRoom ].tileHeight * ( world[ currentRoom ].numTilesHigh - 1 ) - 20;
  }
  return currentRoom;
};

Room.prototype.drawMonsters = function( context ){
    context.save();
  
    //draw monsters
    var n, max;
    
    for (n=0, max=this.monsters.length; n < max; n++){
        if ( !this.monsters[ n ].dead  ){
            spriteNum = this.monsters[ n ].gid - 1;
            spriteRow = Math.floor( spriteNum / this.roomData.numTilesWide );
            spriteCol = spriteNum % this.roomData.numTilesWide;
                
            context.drawImage( this.spritesheet, spriteCol * this.tileWidth, spriteRow * this.tileHeight, this.tileWidth, this.tileHeight, this.monsters[ n ].x, this.monsters[ n ].y, this.tileWidth, this.tileHeight );                            
        }           
    }   
    context.restore();
};

Room.prototype.updateMonsters = function( context, player ) {
   //draw monsters
    var n, max;
    
    for (n=0, max=this.monsters.length; n < max; n++){
        if (! this.monsters[ n ].dead ) {
          //updateEntity(monster, dt);
          if ( utils.overlap( player.x, player.y, this.tileWidth, this.tileHeight, this.monsters[ n ].x, this.monsters[ n ].y, this.tileWidth, this.tileHeight ) ) {          
              this.monsters[ n ].dead = true;             
              player.killed++;              
              monstersLog (player.killed);
              if (player.killed > 2){
                  dlog ('You are getting the hang of it!');
              }
              //player.killDance( context );

          }
        }
    }   
};

function dlog(str) {
    log('<b>' + str + '</b>', 'gameLog');
    return this;
}

var treasureLogShow = false;


function treasureLog(str) {
    if (! monstersLogShow ){
        document.getElementById('treasureFound').style.display = 'block';
        treasureLogShow = true;
    }
    log('<b>' + str + '</b>', 'treasureFound');
    return this;
}
var monstersLogShow = false;

function monstersLog( str ) {
    if (! monstersLogShow ){
        document.getElementById('monsters').style.display = 'block';
        monstersLogShow = true;
    }
    log('<b>' + str + '</b>', 'monsterKilled');
    
}
function log(str, elementId) {
    logElement = document.getElementById( elementId );
    logElement.innerHTML = str;
}
var roomData = [
        // Room 0: Top
       {
         "data" : [ 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 51, 51, 51, 51, 51, 51, 51, 51, 51, 53, 54, 53, 54, 53, 53, 54, 51, 51, 35, 35, 50, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 50, 51, 51, 51, 51, 51, 62, 35, 35, 62, 62, 63, 50, 51, 51, 51, 41, 51, 51, 50, 50, 51, 50, 51, 51, 63, 51, 35, 35, 62, 63, 50, 51, 51, 50, 32, 33, 17, 18, 17, 18, 17, 18, 17, 37, 38, 65, 35, 35, 50, 51, 50, 50, 51, 51, 44, 9, 10, 21, 21, 21, 21, 21, 9, 9, 9, 27, 35, 35, 62, 63, 50, 50, 51, 50, 32, 21, 22, 22, 19, 20, 21, 22, 21, 21, 9, 39, 35, 35, 62, 63, 50, 50, 50, 62, 44, 9, 10, 22, 5, 6, 5, 6, 20, 9, 10, 39, 35, 35, 62, 63, 37, 37, 38, 38, 18, 21, 22, 5, 51, 51, 63, 50, 6, 21, 22, 39, 35, 35, 62, 58, 21, 22, 10, 10, 10, 21, 21, 59, 51, 63, 51, 51, 18, 21, 22, 39, 35, 35, 62, 58, 10, 7, 8, 7, 8, 21, 9, 71, 51, 51, 51, 63, 6, 9, 10, 39, 35, 35, 50, 58, 10, 19, 20, 19, 20, 21, 21, 59, 51, 63, 63, 63, 18, 9, 10, 39, 35, 35, 62, 58, 10, 5, 25, 25, 6, 21, 21, 71, 51, 62, 62, 58, 21, 9, 10, 39, 35, 35, 62, 52, 29, 50, 62, 50, 58, 21, 9, 59, 51, 62, 63, 70, 21, 9, 9, 39, 35, 35, 62, 54, 62, 50, 51, 62, 58, 21, 21, 71, 51, 63, 63, 70, 5, 6, 21, 31, 35, 35, 62, 63, 62, 62, 50, 50, 58, 21, 9, 71, 51, 51, 62, 62, 53, 54, 26, 50, 35, 35, 51, 63, 50, 51, 50, 50, 58, 21, 21, 59, 51, 50, 50, 50, 62, 63, 63, 50, 35, 35, 51, 63, 62, 63, 62, 62, 58, 21, 21, 71, 51, 62, 62, 62, 63, 62, 63, 50, 35, 35, 51, 63, 62, 63, 62, 63, 58, 21, 21, 71, 51, 51, 50, 50, 62, 63, 51, 50, 35, 35, 50, 51, 62, 63, 63, 63, 70, 21, 21, 71, 51, 50, 50, 50, 50, 50, 50, 62, 35],
          
         //"data" : [ 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 51, 51, 51, 51, 51, 51, 51, 51, 51, 53, 54, 53, 54, 53, 53, 54, 51, 51, 35, 35, 50, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 50, 51, 51, 51, 51, 51, 62, 35, 35, 62, 62, 63, 50, 51, 51, 51, 41, 51, 51, 50, 50, 51, 50, 51, 51, 63, 51, 35, 35, 62, 63, 50, 51, 51, 50, 32, 33, 17, 18, 17, 18, 17, 18, 17, 37, 38, 65, 35, 35, 50, 51, 50, 50, 51, 51, 44, 9, 10, 21, 21, 21, 21, 21, 9, 9, 9, 27, 35, 35, 62, 63, 50, 50, 51, 50, 32, 21, 22, 22, 19, 20, 21, 22, 21, 21, 9, 39, 35, 35, 62, 63, 50, 50, 50, 62, 44, 9, 10, 22, 5, 6, 5, 6, 20, 9, 10, 39, 35, 35, 62, 63, 37, 37, 38, 38, 18, 21, 22, 5, 51, 51, 63, 50, 6, 21, 22, 39, 35, 35, 62, 58, 21, 22, 10, 10, 10, 21, 21, 17, 55, 63, 51, 51, 18, 21, 22, 39, 35, 35, 62, 58, 10, 7, 8, 7, 8, 21, 9, 10, 71, 51, 51, 63, 6, 9, 10, 39, 35, 35, 50, 58, 10, 19, 20, 19, 20, 21, 21, 22, 59, 63, 63, 63, 18, 9, 10, 39, 35, 35, 62, 58, 10, 5, 25, 25, 6, 21, 21, 22, 59, 62, 62, 58, 21, 9, 10, 39, 35, 35, 62, 52, 29, 50, 62, 50, 58, 21, 9, 10, 59, 62, 63, 70, 21, 9, 9, 39, 35, 35, 62, 54, 62, 50, 51, 62, 58, 21, 21, 22, 59, 63, 63, 70, 5, 6, 21, 31, 35, 35, 62, 63, 62, 62, 50, 50, 58, 21, 9, 10, 59, 51, 62, 62, 53, 54, 26, 50, 35, 35, 51, 63, 50, 51, 50, 50, 58, 21, 21, 22, 59, 50, 50, 50, 62, 63, 63, 50, 35, 35, 51, 63, 62, 63, 62, 62, 58, 21, 21, 22, 59, 62, 62, 62, 63, 62, 63, 50, 35, 35, 51, 63, 62, 63, 62, 63, 58, 21, 21, 22, 59, 51, 50, 50, 62, 63, 51, 50, 35, 35, 50, 51, 62, 63, 63, 63, 70, 21, 21, 22, 71, 50, 50, 50, 50, 50, 50, 62, 35  ],          
         "image":"images/grass-tiles-2-small.png",
         "imageheight": 192,
         "imagewidth": 384,
         "numTilesWide": 12,
         "numTilesHigh": 6,
         "name":"grass-tiles-2-small",
         "tileproperties":
            {
             "19": { "walkable":"true"},
             "20": { "walkable":"true" },
             "21": { "walkable":"true" },
             "22": { "walkable":"true" },
             "33": { "walkable":"true" },
             "34": { "walkable":"true" },
             "45": { "walkable":"true" },
             "46": { "walkable":"true" },
             "7": { "walkable":"true" },
             "8": { "walkable":"true" },
             "9": { "walkable":"true" },
             "10": { "walkable":"true" }
            },
                     "treasure":
                {
                 "gid":36,
                 "name":"chest",               
                 "visible":false,
                 "x":228,
                 "y":140
                },
          "monsters": [
                {
                 "gid":48,
                 "dead": false,
                 "x":112,
                 "y":324
                }, 
                {
                 "gid":48,
                 "dead": false,
                 "x":496,
                 "y":408            
                }]
        }, 
        // Room 1: Left
       {
         "data": [35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 1, 1, 1, 1, 1, 1, 1, 2, 68, 37, 37, 38, 37, 38, 15, 1, 1, 1, 2, 35, 13, 13, 1, 2, 2, 1, 13, 14, 58, 7, 8, 7, 8, 5, 13, 13, 13, 1, 2, 35, 1, 1, 2, 14, 14, 2, 2, 2, 58, 19, 20, 19, 20, 17, 1, 2, 2, 1, 2, 35, 13, 1, 1, 1, 1, 2, 14, 14, 18, 8, 5, 29, 29, 30, 50, 51, 14, 2, 2, 35, 55, 13, 37, 38, 38, 37, 38, 18, 7, 20, 17, 37, 38, 38, 37, 38, 18, 17, 18, 35, 55, 18, 7, 7, 8, 8, 8, 8, 19, 20, 8, 7, 7, 7, 7, 7, 7, 7, 8, 35, 70, 21, 19, 19, 20, 20, 20, 20, 7, 8, 20, 19, 19, 19, 19, 19, 19, 19, 20, 35, 67, 6, 5, 26, 6, 45, 5, 6, 7, 8, 5, 30, 6, 5, 25, 26, 29, 26, 6, 35, 1, 2, 1, 2, 1, 2, 2, 18, 7, 8, 17, 1, 1, 1, 1, 1, 1, 1, 2, 35, 1, 2, 13, 14, 13, 14, 2, 6, 7, 8, 5, 1, 2, 2, 2, 2, 1, 2, 2, 35, 1, 2, 1, 2, 2, 2, 14, 18, 7, 8, 17, 1, 2, 14, 14, 14, 1, 62, 63, 35, 1, 2, 1, 2, 14, 14, 14, 6, 7, 8, 5, 1, 1, 1, 2, 14, 1, 1, 2, 35, 1, 2, 13, 14, 13, 14, 14, 18, 7, 8, 17, 13, 13, 13, 14, 14, 2, 1, 2, 35, 1, 1, 1, 2, 13, 14, 14, 6, 19, 20, 5, 1, 1, 1, 13, 14, 14, 2, 2, 35, 13, 13, 13, 14, 13, 14, 55, 56, 25, 26, 56, 13, 13, 13, 13, 14, 14, 14, 14, 35, 62, 62, 62, 63, 63, 63, 63, 63, 62, 62, 62, 62, 62, 62, 62, 63, 62, 62, 63,
                  35,  1,  1,  1,  2, 13, 14, 14,  1,  1,  2, 13, 14,  1, 1 , 13, 14, 14,  2,  2, 
                  35,  1,  1,  1,  2, 13, 14, 14,  1,  1,  2, 13, 14,  1, 1 , 13, 14, 14,  2,  2,
                  35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35 ],
         "image":"images/grass-tiles-2-small.png",
         "imageheight": 192,
         "imagewidth": 384,
         "numTilesWide": 12,
         "numTilesHigh": 6,
         "name":"grass-tiles-2-small",
         "tileproperties":
            {
             "19": { "walkable":"true"},
             "20": { "walkable":"true" },
             "21": { "walkable":"true" },
             "22": { "walkable":"true" },
             "33": { "walkable":"true" },
             "34": { "walkable":"true" },
             "45": { "walkable":"true" },
             "46": { "walkable":"true" },
             "7": { "walkable":"true" },
             "8": { "walkable":"true" },
             "9": { "walkable":"true" },
             "10": { "walkable":"true" }
            },
          "treasure":
                {
                 "gid":36,
                 "name":"chest",               
                 "visible":false,
                 "x":180,
                 "y":76
                },
          "monsters": [{
                 "gid":48,
                 "dead": false,
                 "x":108,
                 "y":208
                }, 
                {
                 "gid":48,
                 "dead": false,
                 "x":308,
                 "y":452
                }, 
                {
                 "gid":48,
                 "height":0,
                 "dead": false,
                 "x":440,
                 "y":76            
                }]
        },
        // Room 2: Center    
        {
         "data": [ 67, 67, 67, 67, 67, 66, 54, 28,  7,  8, 27, 54, 54, 54, 54, 54, 54, 54, 54, 54,
                   54, 55, 67, 67, 66, 67, 66, 28,  7,  8, 27, 66, 66, 66, 66, 66, 66, 66, 66, 54, 
                   54, 55, 66, 66, 66, 66, 67, 28, 19, 20, 27, 54, 54, 54, 54, 54, 54, 55, 67, 54,
                   54, 55, 66, 66, 67, 54, 54, 28,  7,  8, 27, 66, 66, 66, 66, 66, 54, 55, 67, 54,
                   54, 55, 54, 54, 41, 42, 66, 28, 19, 20, 27,  1, 54, 54, 55, 55, 55, 55, 54, 55,
                   17, 18, 17, 18, 33, 34, 17, 18,  7,  8, 27,  1, 66, 66, 67, 67, 67, 55, 54, 55,
                    8,  8,  9,  9,  9,  9,  9,  9, 19, 20, 27, 66, 66, 66, 66, 67, 54, 55, 54, 55,
                   20, 20, 21, 21, 21, 21, 21, 21, 21,  8, 27, 66, 67, 67, 67, 67, 54, 55, 54, 55,
                    5,  6,  5,  4,  6,  5,  6, 19,  9,  8, 17, 54, 54, 66, 66, 67, 54, 55, 54, 55,
                   55, 56, 55, 56, 55, 54, 54,  6, 21,  8,  9, 17, 18, 17, 67, 55, 54, 55, 41, 18,
                   55, 66, 66, 67, 67, 67, 54, 18,  9,  9,  8,  8,  8,  8, 17, 18, 17, 18, 19, 19,
                   55, 66, 66, 66, 66, 54, 32, 19,  9, 21, 20, 20, 20, 20,  8,  8,  8,  8,  8,  9,
                   54, 66, 66, 67, 55, 56, 18,  8,  9,  5, 29, 29, 30,  6, 20, 20, 20, 20, 20, 21,
                   66, 67, 66, 67, 67, 58,  8,  9,  9, 43, 66, 67, 66, 56, 29, 30, 29, 29,  6, 45,
                   66, 67, 55, 55, 55, 18,  8,  9,  5, 55, 55, 55, 55, 54, 55, 54, 55, 55, 55, 67, 
                   66, 67, 67, 67, 32,  8,  9,  9, 17, 67, 67, 67, 67, 66, 67, 66, 67, 67, 67, 67,
                   54, 54, 54, 54, 18,  8,  9, 21,  5, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 66,
                   66, 66, 66, 18, 19, 20, 20,  5, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66,
                   54, 54, 18, 19, 20, 20,  5, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 54, 66,
                   66, 18,  8,  9, 21,  5, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 66, 67, 67, 67 ],  
         "image":"images/grass-tiles-2-small.png",
         "imageheight": 192,
         "imagewidth": 384,
         "numTilesWide": 12,
         "numTilesHigh": 6,
         "name":"grass-tiles-2-small",
         "tileproperties":
            {
             "19": { "walkable":"true"},
             "20": { "walkable":"true" },
             "21": { "walkable":"true" },
             "22": { "walkable":"true" },
             "33": { "walkable":"true" },
             "34": { "walkable":"true" },
             "45": { "walkable":"true" },
             "46": { "walkable":"true" },
             "7": { "walkable":"true" },
             "8": { "walkable":"true" },
             "9": { "walkable":"true" },
             "10": { "walkable":"true" }
            },
          "treasure":
                {
                 "gid":36,
                 "name":"chest",               
                 "visible":false,
                 "x":228,
                 "y":140
                },
          "monsters": [{
                 "gid":48,
                 "dead": false,
                 "x":148,
                 "y":168
                }, 
                {
                 "gid":48,
                 "dead": false,
                 "x":272,
                 "y":324
                }, 
                {
                 "gid":48,
                 "dead": false,
                 "x":484,
                 "y":344            
                }]           
        },
        // Room 3: Right       
       {
         "data" : [ 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 54, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 53, 54, 54, 50, 53, 54, 35, 50, 50, 62, 62, 41, 42, 41, 42, 41, 42, 51, 51, 51, 51, 50, 51, 50, 51, 51, 35, 62, 50, 51, 18, 8, 8, 8, 8, 8, 9, 59, 50, 50, 50, 50, 51, 51, 51, 63, 35, 62, 50, 58, 7, 8, 8, 9, 20, 8, 9, 71, 62, 50, 51, 50, 50, 51, 63, 63, 35, 62, 50, 70, 19, 20, 8, 9, 20, 8, 9, 59, 50, 50, 51, 50, 50, 51, 50, 51, 35, 51, 50, 51, 29, 29, 6, 21, 19, 20, 21, 71, 62, 62, 50, 50, 51, 51, 50, 51, 35, 63, 50, 51, 50, 51, 50, 6, 19, 20, 21, 59, 51, 51, 51, 50, 51, 50, 51, 63, 35, 51, 50, 51, 50, 51, 62, 18, 19, 20, 21, 17, 63, 63, 63, 50, 51, 50, 51, 63, 35, 38, 53, 54, 41, 42, 18, 8, 7, 20, 21, 21, 17, 38, 63, 50, 51, 50, 51, 63, 35, 7, 17, 18, 8, 8, 9, 9, 7, 20, 20, 21, 7, 7, 17, 38, 50, 51, 51, 63, 35, 19, 19, 20, 20, 20, 21, 21, 19, 8, 9, 19, 19, 7, 7, 7, 17, 38, 50, 51, 35, 19, 19, 19, 19, 19, 19, 19, 19, 20, 5, 6, 19, 19, 19, 19, 7, 7, 17, 51, 35, 7, 5, 30, 29, 30, 6, 5, 29, 29, 53, 54, 6, 19, 19, 19, 19, 7, 8, 59, 35, 29, 50, 50, 62, 63, 62, 63, 62, 63, 62, 50, 50, 26, 6, 19, 7, 19, 20, 59, 35, 51, 50, 50, 51, 50, 62, 63, 62, 63, 63, 62, 62, 50, 51, 6, 7, 8, 8, 59, 35, 63, 50, 62, 63, 62, 63, 50, 50, 62, 63, 63, 63, 62, 63, 58, 8, 8, 20, 71, 35, 63, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 63, 51, 6, 46, 51, 50, 35, 63, 51, 50, 50, 51, 51, 50, 51, 50, 50, 50, 51, 51, 62, 62, 62, 62, 63, 50, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35],
         "image":"images/grass-tiles-2-small.png",
         "imageheight": 192,
         "imagewidth": 384,
         "numTilesWide": 12,
         "numTilesHigh": 6,
         "name":"grass-tiles-2-small",
         "tileproperties":
            {
             "19": { "walkable":"true"},
             "20": { "walkable":"true" },
             "21": { "walkable":"true" },
             "22": { "walkable":"true" },
             "33": { "walkable":"true" },
             "34": { "walkable":"true" },
             "45": { "walkable":"true" },
             "46": { "walkable":"true" },
             "7": { "walkable":"true" },
             "8": { "walkable":"true" },
             "9": { "walkable":"true" },
             "10": { "walkable":"true" }
            },
         "treasure":
                {
                 "gid":36,
                 "name":"chest",               
                 "visible":false,
                 "x":228,
                 "y":140
                },
          "monsters": [{
                 "gid":48,
                 "dead": false,
                 "x":148,
                 "y":168
                }, 
                {
                 "gid":48,
                 "dead": false,
                 "x":272,
                 "y":324
                }, 
                {
                 "gid":48,
                 "dead": false,
                 "x":484,
                 "y":472            
                }]
        },
        // Room 4: Bottom       
       {
         "data" : [ 47, 7, 9, 10, 7, 5, 62, 62, 63, 62, 50, 50, 51, 50, 51, 50, 51, 50, 51, 35, 35, 6, 21, 22, 10, 17, 50, 50, 50, 62, 62, 62, 11, 62, 41, 38, 42, 50, 51, 35, 35, 51, 6, 21, 22, 34, 50, 50, 50, 11, 11, 11, 50, 32, 9, 9, 9, 17, 65, 35, 35, 63, 32, 21, 9, 10, 62, 62, 11, 62, 62, 63, 62, 32, 21, 21, 21, 21, 71, 35, 35, 62, 44, 45, 9, 10, 17, 51, 51, 51, 51, 11, 51, 44, 21, 22, 5, 29, 51, 35, 35, 62, 63, 50, 6, 9, 10, 17, 63, 63, 63, 11, 63, 32, 22, 22, 59, 51, 51, 35, 35, 62, 63, 62, 62, 6, 9, 10, 17, 65, 62, 63, 50, 44, 9, 10, 59, 63, 63, 35, 35, 50, 51, 50, 51, 50, 6, 22, 9, 17, 51, 11, 51, 32, 21, 22, 59, 63, 51, 35, 35, 62, 63, 62, 33, 17, 18, 21, 9, 10, 17, 38, 38, 18, 9, 10, 59, 50, 51, 35, 35, 62, 63, 18, 20, 7, 8, 33, 9, 9, 9, 9, 9, 10, 9, 10, 59, 50, 51, 35, 35, 62, 63, 9, 10, 19, 20, 10, 10, 21, 9, 9, 9, 9, 10, 22, 59, 50, 51, 35, 35, 62, 18, 19, 20, 5, 3, 30, 29, 30, 29, 30, 6, 9, 10, 22, 59, 50, 51, 35, 35, 58, 9, 10, 22, 59, 62, 63, 51, 51, 51, 51, 58, 9, 10, 10, 59, 50, 51, 35, 35, 70, 9, 9, 10, 71, 62, 63, 63, 63, 63, 63, 58, 9, 10, 22, 59, 51, 51, 35, 35, 70, 21, 9, 10, 59, 50, 50, 11, 50, 50, 50, 70, 9, 10, 22, 71, 63, 51, 35, 35, 62, 6, 21, 22, 71, 62, 62, 62, 62, 62, 62, 18, 10, 22, 5, 51, 51, 51, 35, 35, 50, 62, 26, 26, 62, 63, 63, 51, 50, 51, 18, 9, 10, 5, 63, 63, 63, 63, 35, 35, 62, 63, 62, 11, 50, 51, 62, 63, 62, 18, 21, 21, 10, 59, 51, 11, 62, 63, 35, 35, 62, 63, 62, 63, 62, 63, 63, 62, 54, 45, 45, 46, 45, 63, 63, 11, 50, 62, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35],
         "image":"images/grass-tiles-2-small.png",
         "imageheight": 192,
         "imagewidth": 384,
         "numTilesWide": 12,
         "numTilesHigh": 6,
         "name":"grass-tiles-2-small",
         "tileproperties":
            {
             "19": { "walkable":"true"},
             "20": { "walkable":"true" },
             "21": { "walkable":"true" },
             "22": { "walkable":"true" },
             "33": { "walkable":"true" },
             "34": { "walkable":"true" },
             "45": { "walkable":"true" },
             "46": { "walkable":"true" },
             "7": { "walkable":"true" },
             "8": { "walkable":"true" },
             "9": { "walkable":"true" },
             "10": { "walkable":"true" }
            },
         "treasure":
                {
                 "gid":36,
                 "name":"chest",               
                 "visible":false,
                 "x":99,
                 "y":497
                },
          "monsters": [{
                 "gid":48,
                 "dead": false,
                 "x":148,
                 "y":168
                }, 
                {
                 "gid":48,
                 "dead": false,
                 "x":272,
                 "y":324
                }, 
                {
                 "gid":48,
                 "height":0,
                 "dead": false,
                 "x":469,
                 "y":101
                }, 
                {
                 "gid":48,
                 "dead": false,
                 "x":519,
                 "y":125
                }]
        }
];
            



window.onload = function() {
  
 
var soundready = false;
soundManager.url = '../sound/';
soundManager.flashVersion = 8;
soundManager.useHTML5Audio = true;


function sfx(s) {
    if (soundready && soundManager.supported()) {
        soundManager.play(s);
    }
}

function sfxMusic() {
    if (soundready && soundManager.supported()) {
        soundManager.play('music');
    }
}


function sfxWalkGrass() {
    if (soundready && soundManager.supported()) {
        soundManager.play('walkGrass');
    }
}

function sfxSwordSpin() {
    if (soundready && soundManager.supported()) {
        soundManager.play('swordSpin');
    }
}
soundManager.debugMode = false;
soundManager.onready(function () {
    if (soundManager.supported()) {
        soundManager.createSound({
            id: 'music',
            url: 'sound/LTTP_Flute_Extended.mp3',
            volume: 25,
            stream: true,
            autoLoad: true,
            autoPlay: true,
            onload: sfxMusic,
            loops: 999
        });
        soundManager.createSound({
            id: 'walkGrass',
            url: 'sound/LTTP_Grass_Walk.mp3',
            volume: 25,
            //autoLoad: true
        });
        soundManager.createSound({
            id: 'swordSpin',
            url: 'sound/LTTP_Sword_Spin.mp3',
            volume: 66,
            //autoLoad: true
        });
        soundready = true;
    }
});    
 
soundManager.stopAll();
 
var intromode = 1;
//var logging = true;
var lastWorld = null;
var spritesheet = null;

var titleScreen = null;

var score = 0;
   
var canvas = document.getElementById('worldCanvas');
var context = canvas.getContext("2d");

// an image containing all sprites
var spritesheet = null;
 
// the world grid: an array of rooms
var world = [];

var tileWidth = 32;
var tileHeight = 32;
var numTilesWide = 20;
var numTilesHigh = 20; 
 
// the room grid: a 2d array of tiles 
var currentRoom = 2;
 
var player;
var mouse = utils.captureMouse( canvas );

var allMonstersDead;
var treasureFound;

// animation data
var previousTime = Date.now();
var numMonsters = 15;
var request;

function createWorld(){    
    world.push(
        new Room ({  
            spritesheet: imageLoader.images[ roomData[ 0 ].image ],                                    
            height: canvas.height,
            width: canvas.width,            
            x: 0,
            y: 0,
            roomData: roomData[ 0 ],
            monsters: roomData[ 0 ].monsters,
            treasure: roomData[ 0 ].treasure,
            index: 0,
            roomTopIndex: null,
            roomBottomIndex: 2,
            roomRightIndex: null,
            roomLeftIndex: null  
        }) 
    );
    world.push(
        new Room ({  
            spritesheet: imageLoader.images[ roomData[ 1 ].image ],            
            height: canvas.height,
            width: canvas.width,            
            x: 0,
            y: 0,
            roomData: roomData[ 1 ],
            monsters: roomData[ 1 ].monsters,
            treasure: roomData[ 1 ].treasure,
            index: 1,
            roomTopIndex: null,
            roomBottomIndex: null,
            roomRightIndex: 2,
            roomLeftIndex: null 
            }) 
    );
    world.push(
        new Room ({   
            spritesheet: imageLoader.images[ roomData[ 2 ].image ],                        
            height: canvas.height,
            width: canvas.width,            
            x: 0,
            y: 0,
            roomData: roomData[ 2 ],
            monsters: roomData[ 2 ].monsters,
            treasure: roomData[ 2 ].treasure,
            index: 2,
            roomTopIndex: 0,
            roomBottomIndex: 4,
            roomRightIndex: 3,
            roomLeftIndex: 1  
            }) 
    );
    world.push(
        new Room ({ 
            spritesheet: imageLoader.images[ roomData[ 3 ].image ],                                                 
            height: canvas.height,
            width: canvas.width,            
            x: 0,
            y: 0,
            roomData: roomData[ 3 ],
            monsters: roomData[ 3 ].monsters,
            treasure: roomData[ 3 ].treasure,
            index: 3,
            roomTopIndex: null,
            roomBottomIndex: null,
            roomRightIndex: null,
            roomLeftIndex: 2  
            }) 
    );
    world.push(
        new Room ({
            spritesheet: imageLoader.images[ roomData[ 4 ].image ],                                                  
            height: canvas.height,
            width: canvas.width,            
            x: 0,
            y: 0,
            roomData: roomData[ 4 ],
            monsters: roomData[ 4 ].monsters,
            treasure: roomData[ 4 ].treasure,
            index: 4,
            roomTopIndex: 2,
            roomBottomIndex: null,
            roomRightIndex: null,
            roomLeftIndex: null  
            }) 
    );
}

function checkTreasure() {
    var n, max, t;
    for(n = 0, max = treasure.length ; n < max ; n++) {
      t = treasure[n];
      if (!t.collected && overlap(player.x, player.y, TILE, TILE, t.x, t.y, TILE, TILE))
        collectTreasure(t);
    }
}

 
function collectTreasure(t) {
    player.collected++;
    t.collected = true;
}


function showIntro() {
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('introduction').style.display = 'block';
}
var myGame = new Game();

function playGame(){
    soundManager.stopAll();
    document.getElementById('introduction').style.display = 'none';
    document.getElementById('messages').style.display = 'block';
    tick();
}
(function init() { 
    myGame.init();
        
})();

function checkGameEnd(){
    if (player.killed === numMonsters ){
         dlog ('Great job!  You saved the kingdom of Argoth!');
         setTimeout(function(){
                window.cancelRequestAnimationFrame( request );  
            },1500);                
    }   
}
// main animation loop
function tick() {
    request = window.requestAnimationFrame(tick, canvas);
            
    var currentTime = Date.now();
    
    // divide by 1000 to convert millseconds to seconds....
    var elapsedTime = (currentTime - previousTime) / 1000;
        
    // limit elapsed time to one animation frame so that the
    // the animation does not run too fast when the window loses
    // then regains focus.
    if (elapsedTime > player.frameTimeSeconds) {
        elapsedTime = player.frameTimeSeconds;
    }
    
    selectAgentState( player ); 
    previousTime = currentTime;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
        
    currentRoom = world[ currentRoom ].update( context, player, currentRoom, world );
    
    world[ currentRoom ].draw( context );
    world[ currentRoom ].drawMonsters( context );
    world[ currentRoom ].updateMonsters( context, player );
    
    //checkTreasure( elapsedTime, world[ currentRoom ] );  
      
    player.update( elapsedTime, world[ currentRoom ] );
    player.draw( context );   
    
    checkGameEnd();
    
}

function Game() {
    /*
     * Gets canvas information and context and sets up all game
     * objects.
     * Returns true if the canvas is supported and false if it
     * is not. This is to stop the animation script from constantly
     * running on older browsers.
     */
    this.init = function() {
        sfxMusic();
         
        canvas.width = numTilesWide * tileWidth;
        canvas.height = numTilesHigh * tileHeight;

        canvas.addEventListener("click", canvasClick, false);
        
        player = new Agent({ x: canvas.width / 2 , y: canvas.height / 2 , speed: 120, frameWidth: 24, frameHeight: 24});
          
        window.addEventListener("keydown", onKeyDown, false);
        window.addEventListener("keyup", onKeyUp, false);
        
        utils.disableImageSmoothing(context);
        
        imageLoader.queueImage("images/grass-tiles-2-small.png");

        imageLoader.queueImage("images/playerSprite.png");
        
        imageLoader.loadQueuedImages(onImageLoaded); 
         
        var titleScreen = document.getElementById('titleScreen');
        titleScreen.addEventListener("click", showIntro, false);
        
        var introduction = document.getElementById('a1');
        introduction.addEventListener("click", playGame, false);
             
    };

} 

var logElement = null;

function drawText(str, x, y) {
    context.fillStyle = "white";
    context.font = "bold 16px Arial";
    context.strokeStyle = 'black';
    context.lineWidth = 4;
    context.strokeText(str, x, y);
    context.fillText(str, x, y);
}


function onImageLoaded() { 
    createWorld(); 
    
    player.spriteSheet = imageLoader.images["images/playerSprite.png"];
    var x = Math.floor( player.x/tileWidth);
    var y = Math.floor( player.y/tileHeight);
    
}

 
// handle click events on the canvas

function canvasClick(e){
    var x = Math.floor(mouse.x/tileWidth);
    var y = Math.floor(mouse.y/tileHeight);
  
    // now we know while tile we clicked
    console.log('we clicked tile '+ x + ',' + y + ' Value: ' + world[ currentRoom ].tiles[ x ][ y ]);
}


// if pressing a movement key, clear all other movement request flags
// except for the key that was just pushed.
function onKeyDown(e) {
    switch(e.keyCode) {
        case 37: // left
            player.isMovingNorth = false;
            player.isMovingSouth = false;
            player.isMovingEast = false;
            player.isMovingWest = true;
            break;
        case 38: // up
            player.isMovingNorth = true;
            player.isMovingSouth = false;
            player.isMovingEast = false;
            player.isMovingWest = false;
            break;
        case 39: // right
            player.isMovingNorth = false;
            player.isMovingSouth = false;
            player.isMovingEast = true;
            player.isMovingWest = false;
            break;
        case 40: // down
            player.isMovingNorth = false;
            player.isMovingSouth = true;
            player.isMovingEast = false;
            player.isMovingWest = false;
            break;
    };
    e.stopPropagation();
}

function onKeyUp(e) {
    switch(e.keyCode) {
        case 37: // left
            player.isMovingWest = false;
            break;
        case 38: // up
            player.isMovingNorth = false;
            break;
        case 39: // right
            player.isMovingEast = false;
            break;
        case 40: // down
            player.isMovingSouth = false;
            break;
    };
    e.stopPropagation();
}


// manages state transitions for agent based on travelling direction.
function selectAgentState( agent ) {
    if (agent.isMovingNorth && agent.currentState != walkNorth) {
        agent.changeState(walkNorth);
    } else if (agent.isMovingSouth && agent.currentState != walkSouth) {
        agent.changeState(walkSouth);
    } else if (agent.isMovingEast && agent.currentState != walkEast) {
        agent.changeState(walkEast);
    } else if (agent.isMovingWest && agent.currentState != walkWest) {
        agent.changeState(walkWest);
    } else if (!agent.isMovingNorth && !agent.isMovingSouth && !agent.isMovingEast && !agent.isMovingWest && agent.currentState != idle) {
        agent.changeState(idle);
    }
}
};
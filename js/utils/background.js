var imageRepository = new function() {
    // Define images
    this.background = new Image();

    // Set images src 
    this.background.src = "images/gameLevels.png"; 
};


function Drawable() {
    this.init = function(x, y) {
        // Default variables
        this.x = x;
        this.y = y;
    };
    this.speed = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;

    // Define abstract function to be implemented in child objects 
    this.draw = function() { }; 
} 

function showIntro() {
    //sfxMusic();
    //dlog('Show Intro');
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('introduction').style.display = 'block';
}

// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();

var myGame = new Game();

(function init() { 
    myGame.init();
        
})();

function Background() {
    this.speed = 1; // Redefine speed of the background for panning
    
    // Implement abstract function
    this.draw = function() {
         document.getElementById('introduction').style.display = 'none';

        
        // Pan background
        this.y += this.speed;
        this.context.drawImage(imageRepository.background, this.x, this.y);
        
        // Draw another image at the top edge of the first image
        this.context.drawImage(imageRepository.background, this.x, this.y - this.canvasHeight);
        
        // If the image scrolled off the screen, reset
        if (this.y >= this.canvasHeight)
        this.y = 0;
    };
}



function animate() {
    //console.log("Inside animate");
    window.requestAnimationFrame( animate );
    myGame.background.draw();
    
    var currentTime = Date.now();
    
    // divide by 1000 to convert millseconds to seconds....
    var elapsedTime = (currentTime - previousTime) / 1000;
    
    //console.log(elapsedTime);
    
    // limit elapsed time to one animation frame so that the
    // the animation does not run too fast when the window loses
    // then regains focus.
    if (elapsedTime > player.frameTimeSeconds) {
        elapsedTime = player.frameTimeSeconds;
    }
    
    selectAgentState( player ); 
    previousTime = currentTime;
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    redraw();
    //updateCamera();

    player.update(elapsedTime, world);
    
    player.draw(context);
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
        console.log('Inside init');
        
        var titleScreen = document.getElementById('titleScreen');
        titleScreen.addEventListener("click", showIntro, false);
        
        var introduction = document.getElementById('a1');
        introduction.addEventListener("click", animate, false);
            
        
 
        // Get the canvas element
        this.bgCanvas = document.getElementById('gameCanvas');
        // Test to see if canvas is supported
        if (this.bgCanvas.getContext) {
            this.bgContext = this.bgCanvas.getContext('2d');
            // Initialize objects to contain their context and canvas
            // information
            Background.prototype.context = this.bgContext;
            Background.prototype.canvasWidth = this.bgCanvas.width;
            Background.prototype.canvasHeight = this.bgCanvas.height;
            // Initialize the background object
            this.background = new Background();
            this.background.init(0,0); // Set draw point to 0,0
            return true;
        } else {
            return false;
        }
    };

} 
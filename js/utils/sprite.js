function Agent( init ) {
    this.spriteSheet = ( init.spriteSheet === undefined ) ? null : init.spriteSheet;
    this.speed = ( init.speed === undefined ) ? 5 : init.speed;
    
    this.frameTimeSeconds = 0;
    this.startFrame = 0;
    this.endFrame = 0;
    this.currentFrame = 0;
    this.animationTimer = 0;   
    this.currentState = null;
    this.killed = 0;
    
    this.frameWidth = ( init.frameWidth === undefined ) ? 32 : init.frameWidth;
    this.frameHeight = ( init.frameHeight === undefined ) ? 32 : init.frameHeight;
    
          
    this.x = ( init.x === undefined ) ? canvas.width / 4 : init.x;
    this.y = ( init.y === undefined ) ? canvas.height / 4 : init.y;
    
    this.vx = ( init.vx === undefined ) ? 0 : init.vx;
    this.vy = ( init.vy === undefined ) ? 0 : init.vy;
    this.maxSpeed = ( init.maxSpeed === undefined ) ? 4 : init.maxSpeed;
    this.maxAcceleration = ( init.maxAcceleration === undefined ) ? 8 : init.maxAcceleration;
    this.rotation = ( init.rotation === undefined ) ? 0 : init.rotation;
        
    // control variables for selecting state based on input.
    this.isMovingNorth = false;
    this.isMovingSouth = false;
    this.isMovingEast = false;
    this.isMovingWest = false;
    
    this.tracker = {loc: {x:this.x, y:this.y}, dx:0, dy:0};

}

Agent.prototype.draw = function(context) {
    context.save();
    var row = (this.currentFrame / 8) | 0;
    var col = this.currentFrame % 8;
    context.drawImage(this.spriteSheet, col * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight, (this.x - this.frameWidth * 0.5) | 0, (this.y - this.frameHeight * 0.5) | 0, this.frameWidth * 2, this.frameHeight * 2);
    context.restore();
};

/*
Agent.prototype.killDance = function(context) {
 
  context.save(); 
   
    var row = (this.currentFrame / 8) | 0;
    var col = this.currentFrame % 8;
    context.drawImage(this.spriteSheet, col * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight, (this.x - this.frameWidth * 0.5) | 0, (this.y - this.frameHeight * 0.5) | 0, this.frameWidth * 2, this.frameHeight * 2);
    context.restore();
};
*/
Agent.prototype.update = function( elapsedTime, room ) {
    
    //dlog('Updating agent');
    
     // update agent's orientation and position based on steering forces
     // and current velocity.  
    this.x += this.vx;
    this.y += this.vy;
            
   //this.vx += steeringForce.linearX;
    //this.vy += steeringForce.linearY;
        
    var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    
    if (speed > 0 && speed > this.maxSpeed) {
        this.vx = (this.vx / speed) * this.maxSpeed;
        this.vy = (this.vy / speed) * this.maxSpeed;
    }
    
    //orient to current velocity
    this.rotation = Math.atan2(this.vy, this.vx);   
 
 
    
    // update current state
    if (this.currentState != null) {
        this.currentState.update(this, room, elapsedTime);
    }

    // update animation
    this.animationTimer += elapsedTime;
    
    // flip to the next frame
    if (this.animationTimer >= this.frameTimeSeconds) {
        this.animationTimer -= this.frameTimeSeconds;
        
        this.currentFrame += 1;
        
        // if all frames have been displayed, go back to first frame.
        if (this.currentFrame > this.endFrame) {
            this.currentFrame = this.startFrame;
        }
    }
    
    this.tracker.dx = this.x - this.tracker.loc.x;
    this.tracker.dy = this.y - this.tracker.loc.y;
    this.tracker.loc.x = this.x;
    this.tracker.loc.y = this.y;
};


Agent.prototype.changeState = function(nextState) {
    if (this.currentState != null && this.currentState.exit != undefined) {
        this.currentState.exit(this);
    }
        
    this.currentState = nextState;
    
    if (this.currentState.enter != undefined) {
        this.currentState.enter(this);
    }
};



/**
 * SteeringForce constructor
 * 
 * accumlates influences of all steering behaviors.
 */
function SteeringForce() {
    this.linearX = 0;
    this.linearY = 0;
}
/**
 * Waypoint constructor
 * 
 */
function Waypoint ( x, y, radius, color ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = utils.parseColor( color );
}
Waypoint.prototype.draw = function (context) {
    context.save();
    context.strokeStyle = "purple";
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
    context.stroke();
    context.fill();
    context.restore();
};
Waypoint.prototype.getBounds = function () {
  
};
/**
 * Particle constructor
 * 
 */
function Particle( x, y, radius, color ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = utils.parseColor( color );
    this.friction = 0.9;
    this.bounce = -0.6;
    this.gravity = 0.25;

    //randomize the velocity of the pieces to look like explosion
    this.vx = utils.getRandomFloat( -5, 5 );
    this.vy = utils.getRandomFloat( -5, 5 );
}

Particle.prototype.draw = function (context) {
    context.save();
    context.strokeStyle = "purple";
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
    context.stroke();
    context.fill();
    context.restore();
};

Particle.prototype.update = function () {
    //check if piece is at bottom of canvas
    if (this.y > canvas.height - (this.radius + 1)) {   
        this.y = canvas.height - (this.radius + 1);  //+1 to make it look nice, otherwise it was slightly clipped
        this.vy *= this.bounce;
        //apply friction only when piece is on the floor
        this.vx *= this.friction;
        this.vy *= this.friction;
    } else {
        this.vy += this.gravity;
    }
    //check if piece is hitting either side of canvas
    if (this.x > canvas.width - this.radius || this.x < 0 + this.radius) {   
        this.vx *= -1;
    } 
    
    this.x += this.vx;
    this.y += this.vy;

};
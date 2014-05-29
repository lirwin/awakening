
// fill the world with trees
function createWorld()
{
    console.log('Creating world...');
    // create emptiness
    for (var x=0; x < worldWidth; x++){
        world[x] = [];
        for (var y=0; y < worldHeight; y++){
            world[x][y] = 0;
        }
    }
    // scatter some walls
    for (var x=0; x < worldWidth; x++){
        for (var y=0; y < worldHeight; y++){
            if (Math.random() > 0.75){
                    world[x][y] = 1;
            }
        }
    }
    // calculate initial possible path
    // note: unlikely but possible to never find one...
    currentPath = [];
    while (currentPath.length == 0){
        pathStart = [Math.floor(Math.random()*worldWidth),Math.floor(Math.random()*worldHeight)];
        pathEnd = [Math.floor(Math.random()*worldWidth),Math.floor(Math.random()*worldHeight)];
        if (world[pathStart[0]][pathStart[1]] == 0){
                    currentPath = findPath(world,pathStart,pathEnd,'Manhattan');     
        }
    }
    worldDraw();
}
 
function worldDraw(){
 
    console.log('redrawing...');
     
    var spriteNum = 0;
     
    // clear the screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
     
    for (var x=0; x < worldWidth; x++){
        for (var y=0; y < worldHeight; y++){
        // choose a sprite to draw
                switch(world[x][y]){
                    case 1:
                    spriteNum = 1;
                    break;
                    default:
                    spriteNum = 0;
                    break;
                }
        // draw it
        // ctx.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
        ctx.drawImage(spritesheet,
        spriteNum*tileWidth, 0,
        tileWidth, tileHeight,
        x*tileWidth, y*tileHeight,
        tileWidth, tileHeight);
        }
    }
 
    // draw the path
    console.log('Current path length: '+currentPath.length);
    for (rp=0; rp<currentPath.length; rp++){
        switch(rp){
            case 0:
            spriteNum = 2; // start
            break;
            case currentPath.length-1:
            spriteNum = 3; // end
            break;
            default:
            spriteNum = 4; // path node
            break;
        }
 
        ctx.drawImage(spritesheet,
        spriteNum*tileWidth, 0,
        tileWidth, tileHeight,
        currentPath[rp][0]*tileWidth,
        currentPath[rp][1]*tileHeight,
        tileWidth, tileHeight);
    }   
} 
// handle click events on the canvas
function canvasClick(e){
    var x;
    var y;
    // grab html page coords
    if (e.pageX != undefined && e.pageY != undefined){
        x = e.pageX;
        y = e.pageY;
    }
    else{
        x = e.clientX + document.body.scrollLeft +
        document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop +
        document.documentElement.scrollTop;
    }
    // make them relative to the canvas only
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    // return tile x,y that we clicked
    var cell = [
        Math.floor(x/tileWidth),
        Math.floor(y/tileHeight)
    ];
    // now we know while tile we clicked
    console.log('we clicked tile '+ cell[0] + ',' + cell[1]);
    pathStart = pathEnd;
    pathEnd = cell;
    // calculate path
    currentPath = findPath( world,pathStart,pathEnd );
    worldDraw();
}
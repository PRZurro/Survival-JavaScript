function Box() {
  if (!this instanceof Box) return new Box();
}

Box.prototype = {
  image: new Image(),
  position: { x: 0, y: 0 },
  vertices: [
    ],
  scale: 1,
  enemy: false,

  height: 0.175,
  width: 0.175, // Desired size

  img:{height:0,width:0},

  body: null,
  type: "box",

  physicsInfo: { // Options of this b2Body
    density: 10,
    fixedRotation: true,
    type: b2Body.b2_kinematicBody,
    user_data: Box
  },

  Start: function(positionX, positionY, isEnemy) {
    //define the variables
    this.image.src = "./media/box.png";
    this.enemy = isEnemy;

    this.position.x = positionX;
    this.position.y = positionY;

    this.body = CreateBox( //Create the box for the box
      world,
      this.position.x / scale,
      this.position.y / scale,
      this.width,
      this.height,
      this.physicsInfo
    );

    // if(this.img.width!=0){
    //     this.UpdateVertices(); //Not working
    // }
    

    this.body.SetUserData(this);
  },
  
  Update: function() {
    //It's necessary because there is a leak of variable because the program don´t load correctly the he/wi
    if(this.image.width>0 && this.img.height ==0  ){
        this.img.height = this.image.height;
        this.img.width = this.img.height; // it's a square, must have identical width and height
        
        //this.UpdateVertices();
    }
  },
  Draw: function(ctx) {
    ctx.save();

    ctx.translate(this.position.x, canvas.height - this.position.y); //wrong representation system, canvas.height solves it
    ctx.scale(this.scale, this.scale); // ctx.scale not recommended, its broken respect the box

    ctx.drawImage(
      this.image, 
      -this.width * scale, // the scale is global, don't fall in this fail, go to definition
      -this.height * scale,
      this.width * scale * 2,
      this.height * scale * 2
    );
    ctx.restore();
  },
  UpdateVertices: function(){
    if (!this.enemy) {
        //add all the vertices of this box to the list destined to do this task

        var pX  = this.position.x - this.width/2 ;
        var pY = this.position.y - this.height/2;;
        
        var side = this.img.height;
        
        this.vertices.push({x: pX, y: pY});
        this.vertices.push({x: pX , y: pY +  side});
        this.vertices.push({x: pX + side , y: pY + side});
        this.vertices.push({x: pX + side ,y : pY});
      }
  }
};

function Zombie() {
    if (!this instanceof Zombie)
        return new Zombie();
}

Zombie.prototype = {
    positionX: 0,
    positionY: 0,

    xTarget: 0,
    yTarget: 0,

    img: new Image(),

    speed: 0.008,
    scale: 0.4,
    radius: 0.4,
    body: null,
    angle: 0,
    type: "zombie",

    physicsInfo: {
        density: 1.0,
        friction: 0.5,
        linearDamping: 0.0,
        angularDamping: 0.0,
        user_data: player,
        type: b2Body.b2_kinematicbody,
        restitution: 0.5,
        user_data: Zombie,
        },

    firstFrame: true,

    Start: function (pX, pY) { //Initialize all variables
      this.img.src = "./media/zombie.gif";
      this.positionX = pX;
      this.positionY = pY;
      this.body = CreateBall(world, this.positionX / scale, (this.positionY/scale), this.radius, this.physicsInfo);
      this.body.SetUserData(this);
      this.ApplyVelocity();
    },

    Update: function (deltaTime) { // Very similar to all other objects of the game, it is based on them (a little copy paste)
        //this.CheckCollision(); //If detect a collision in this frame is needed to destroy THIS
        var bodyPosition = this.body.GetPosition(); //Obtains this collider position

        this.positionX = bodyPosition.x * scale ; // It applies the right conversion to the horizontal collider position and operating with the camera position
        this.positionY = canvas.height - bodyPosition.y * scale ; // Convert the position in the canvas axis with the existing canvas height and the position of the collider in its axis and then operate with the camera position

        this.xTarget = player.position.x - this.positionX;
        this.yTarget = player.position.y - this.positionY;
        var currentAngle = Math.atan(this.yTarget / this.xTarget);
        this.angle = currentAngle;
    
        this.body.SetLinearVelocity(new b2Vec2(0,0));
        this.ApplyVelocity();
        var bodyPosition = this.body.GetPosition();
        this.positionX = bodyPosition.x * scale;
        this.positionY = Math.abs((bodyPosition.y * scale) - ctx.canvas.height);

    },

    Draw: function (ctx) {
      var bodyPosition = this.body.GetPosition();
      var posX = bodyPosition.x * scale;
      var posY = Math.abs((bodyPosition.y * scale) - ctx.canvas.height);

      ctx.save();

      ctx.translate(posX, posY);
      ctx.rotate(this.angle)
     if (this.xTarget < 0) {
          ctx.scale(-0.35, 0.35);
      }
      else {
          ctx.scale(0.35, -0.35);
      }

      ctx.drawImage(this.img, 1 / scale, 1 / scale,
          this.img.width, this.img.height,
          -this.img.width / 2, -this.img.height / 2,
          this.img.width, this.img.height);

      ctx.restore();
    },

    ApplyVelocity: function () { //Very similar to player velocity application
        var realVelocity = new b2Vec2(this.xTarget * this.speed, -this.yTarget * this.speed);

        var bodyVel = this.body.GetLinearVelocity();
        bodyVel.Add(-realVelocity);

        bodyVel.x = realVelocity.x;
        bodyVel.y = realVelocity.y;

        this.body.SetLinearVelocity(bodyVel);
    },
}

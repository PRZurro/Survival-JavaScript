function Bullet() {
    if (!this instanceof Bullet)
        return new Bullet();
}

Bullet.prototype = {
    positionX: 0,
    positionY: 0,

    xTarget: 0,
    yTarget: 0,

    img: new Image(),

    speed: 80,
    scale: 0.01,
    radius: 0.03,
    body: null,
    angle: 0,
    type: "bullet",

    firstFrame: true,

    physicsInfo: {
        density: 1.0,
        friction: 0.5,
        linearDamping: 0.0,
        angularDamping: 0.0,
        type: b2Body.b2_dynamicBody,
        restitution: 0.5,
        user_data:Bullet,
    },

    // Make the constructor with damage and scale stats, 
    Start: function (pX, pY, xT, yT, angle) {


        this.img.src = "./media/bullet.png";
        console.log(this.img);
        this.positionX = pX;
        this.positionY = pY;

        this.xTarget = xT;
        this.yTarget = yT;

        this.body = CreateBall(world, this.positionX / scale, (this.positionY/scale), this.radius, this.physicsInfo);
        this.body.SetUserData(this);

        this.ApplyVelocity();

        this.angle = angle;
    },

    Update: function () {
        //this.CheckCollision(); //If detect a collision in this frame is needed to destroy THIS

        var bodyPosition = this.body.GetPosition(); //Obtains this collider position

        this.positionX = bodyPosition.x/this.scale ; // It applies the right conversion to the horizontal collider position and operating with the camera position
        this.positionY = canvas.height - bodyPosition.y/this.scale ; // Convert the position in the canvas axis with the existing canvas height and the position of the collider in its axis and then operate with the camera position 
    },

    Draw: function (ctx) {
        ctx.save();

        ctx.translate(this.positionX, this.positionY); //It is applied the updated position in each frame, the initial rotation of this bullet and a scale 
        ctx.rotate(this.angle);
        ctx.scale(this.scale, this.scale);

        ctx.drawImage(this.img, 1 / scale, 1 / scale,
            this.img.width, this.img.height,
            -this.img.width / 2, -this.img.height / 2,
            this.img.width, this.img.height);

        ctx.restore();
    },
    ApplyVelocity: function () {
        var realVelocity = new b2Vec2(this.xTarget * this.speed, -this.yTarget * this.speed);

        var bodyVel = this.body.GetLinearVelocity();
        bodyVel.Add(-realVelocity);

        bodyVel.x = realVelocity.x;
        bodyVel.y = realVelocity.y;

        this.body.SetLinearVelocity(bodyVel);
    },

    CheckCollision: function(){
        
    }
}
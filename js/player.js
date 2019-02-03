var player = {
  type: "player",

  position: { x: 400, y: 200 },
  rotation: 0,
  rotationSpeed: 5, // Angle units per second
  width: 0.35,
  height: 0.3,
  shootAudio: new Audio("./media/Sounds/9mm.wav"),
  footstepsAudio: new Audio("./media/Sounds/footsteps.wav"),

  stateBody: "handgun",
  substateBody: "idle",
  substateFeet: "idle",

  stateSaved: false,
  stateBodyTemp: "",
  // movement attr
  maxHorizontalVel: 10,
  maxVerticalVel: 10,

  moveLeft: false,
  moveRight: false,
  moveUp: false,
  moveDown: false,

  isMoving: false,
  isRunning: false,

  socketRelativePosition: {
    //Relative positions of this animations
    gun: { x: -20, y: 35 },
    shotgun: { x: 100, y: 100 },
    rifle: { x: 100, y: 100 },
    flashlight: { x: 100, y: 100 }
  },

  // Direction vector
  dX: 0,
  dY: 0,

  shoot: false,

  hp: 10,

  ammo: 15,

  //animation controller, that controls all the frame logic and display the right image
  animation: {
    feetSpriteList: [],
    bodySpriteList: [],
    timePerFrame: 1 / 24,
    currentFrametime: 0,
    actualFrameB: 0,
    actualFrameF: 0,

    Update: function(deltaTime) {
      this.currentFrametime += deltaTime;
      if (this.currentFrametime >= this.timePerFrame) {
        if (this.actualFrameB >= this.bodySpriteList.length - 1) {
          this.actualFrameB = 0;
        }

        if (this.actualFrameF >= this.feetSpriteList.length - 1) {
          this.actualFrameF = 0;
        }
        this.actualFrameB++, this.actualFrameF++;

        if (this.feetSpriteList.length == 1) {
          this.actualFrameF = 0;
        }
        this.currentFrametime = 0.0;
      }
    },

    Draw: function(ctx) {
      var img = this.bodySpriteList[this.actualFrameB];
      var img1 = this.feetSpriteList[this.actualFrameF];

      ctx.drawImage(
        //draw the legs
        img1,
        1 / scale,
        1 / scale,
        img1.width,
        img1.height,
        -img1.width / 2,
        -img1.height / 2,
        img1.width,
        img1.height
      );

      ctx.drawImage(
        // draw the upperbody parts
        img,
        1 / scale,
        1 / scale,
        img.width,
        img.height,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );
    }
  },

  physicsInfo: {
    density: 1.0,
    friction: 0.0,
    linearDamping: 0.0,
    angularDamping: 0.0,
    user_data: player,
    type: b2Body.b2_dynamicBody,
    restitution: 0.0
  },

  body: null,

  Start: function() { // Initialize the player
    this.animation.bodySpriteList = this.AssignCurrentAnimationSprites(
      this.animation.bodySpriteList
    );
    this.animation.feetSpriteList = this.AssignCurrentAnimationSprites(
      this.animation.feetSpriteList
    );

    if (this.body == null) { // Initialize the collider
      this.body = CreateBall(
        world,
        this.position.x / scale,
        this.position.y / scale,
        this.width,
        this.physicsInfo
      );
    }

    this.body.SetUserData(this);

    return this;
  },

  Update: function(deltaTime) {
    // update the animation
    this.animation.Update(deltaTime);

    //check if the player state or movement has changed by input to change the animations
    if (this.CheckIfStateChanged().stateHasChanged == true) {
      this.SwitchAnimations("state");
      if (this.stateBody != "flashlight") torchActivated = false;
    }
    if (this.CheckIfStateChanged().movementHasChanged == true) {
      this.SwitchAnimations("movement");
    }

    if (this.shoot == true && this.stateBody == "handgun" && this.ammo > 0) {
      if (this.substateBody != "shoot") {
        this.ammo--;
        this.Shoot();
        this.SwitchAnimations("shoot");
      } else {
        if (
          this.animation.actualFrameB >=
          this.animation.bodySpriteList.length - 1
        );
        {
          this.shoot = false;
          this.SwitchAnimations("shoot");
        }
      }
      // A wild condition has appeared, don't move because explodes, but this should be in the methods below
    } else if (
      (this.shoot == true &&
        this.stateBody != "handgun" &&
        this.substateBody != "shoot") ||
      this.ammo <= 0
    ) {
      this.shoot = false;
    }

    //Reset velocity for the actual frame
    this.body.SetLinearVelocity(new b2Vec2(0, 0));

    //Apply the correct velocity to the player
    this.ApplyVelocityToPlayer();

    // update the position
    var bodyPosition = this.body.GetPosition();
    this.position.x = bodyPosition.x * scale;
    this.position.y = Math.abs(bodyPosition.y * scale - ctx.canvas.height);
  },

  /**
   * Draw method that calculates with and old way the right position of the sprite for drawing
   * Something feels bugged with this
   */
  Draw: function(ctx) {
    var bodyPosition = this.body.GetPosition();
    var posX = bodyPosition.x * scale;
    var posY = canvas.height - this.body.GetPosition().y * 100;

    ctx.translate(posX, posY);

    this.dX = input.mouse.x + camera.position.x - this.position.x; // p2-p1 with camera offset
    this.dY = input.mouse.y + camera.position.y - this.position.y; // p2- p1 with camera offset
    var currentAngle = Math.atan(this.dY / this.dX);
    this.rotation = currentAngle;

    ctx.rotate(currentAngle);
    if (this.dX < 0) {
      // This is needed to not have the player aiming in the wrong direction
      ctx.scale(-0.35, 0.35);
    } else {
      ctx.scale(0.35, -0.35);
    }

    this.animation.Draw(ctx);

    ctx.restore();
  },

  ApplyVelocity: function(vel) {
    var bodyVel = this.body.GetLinearVelocity(); // Get the body velocity
    bodyVel.Add(vel);

    // horizontal movement cap
    if (Math.abs(bodyVel.x) > this.maxHorizontalVel)
      bodyVel.x = (this.maxHorizontalVel * bodyVel.x) / Math.abs(bodyVel.x);

    // vertical movement cap
    if (Math.abs(bodyVel.y) > this.maxVerticalVel)
      bodyVel.y = (this.maxVerticalVel * bodyVel.y) / Math.abs(bodyVel.y);

    this.body.SetLinearVelocity(bodyVel);
  },

  /**
   * Auxiliar method for SwitchAnimations, recollects all the images that meet the condition,
   * and then load it to this temps lists
   */
  AssignCurrentAnimationSprites: function(spriteArray) {
    var path = "";
    var last = false;
    var first = false;
    var stateB = false;
    var stateSB = false;
    var originalSpriteListLength = 0;
    var fill = false;
    var imageTemp = new Image();
    var feetOrBody = false;
    var arrayTemp = [];

    if (spriteArray == this.animation.feetSpriteList) {
      originalSpriteListLength = feetSprites.length;
      feetOrBody = false;
    } else if (spriteArray == this.animation.bodySpriteList) {
      originalSpriteListLength = bodySprites.length;
      feetOrBody = true;
    }

    for (var i = 0; i < originalSpriteListLength && !last; i++) {
      if (!feetOrBody) {
        path = feetSprites[i].src;
        stateSB = path.includes(this.substateFeet);
        stateB = true;
        imageTemp = feetSprites[i];
      } else {
        path = bodySprites[i].src;
        stateB = path.includes(this.stateBody);
        stateSB = path.includes(this.substateBody);
        imageTemp = bodySprites[i];
      }

      if (stateB && stateSB && !first) {
        first = true;
        fill = true;
      } else if (stateB && stateSB && first) {
        fill = true;
      } else if (first && (!stateB || !stateSB)) {
        last = true;
      }

      if (fill) {
        arrayTemp.push(imageTemp);
      }
      fill = false;
    }
    return arrayTemp;
  },

  /**
   * Switch the animations by the states of this player
   */
  SwitchAnimations: function(movementOrState) {
    if (movementOrState == "movement") {
      if (this.isMoving && !this.isRunning) {
        this.isMoving = false;
      } else if (!this.isMoving && !this.isRunning) {
        this.isMoving = true;
      }

      if (this.isRunning) {
        this.isRunning = false;
      } else if (!this.isRunning) {
        this.isRunning = true;
      }

      switch (this.isMoving) {
        case true:
          this.substateBody = "move";

          if (this.isRunning) {
            this.substateFeet = "run";
          } else {
            this.substateFeet = "walk";
          }
          break;

        case false:
          this.substateBody = "idle";
          this.substateFeet = "idle";
      }

      this.animation.bodySpriteList = this.AssignCurrentAnimationSprites(
        this.animation.bodySpriteList
      );
      this.animation.feetSpriteList = this.AssignCurrentAnimationSprites(
        this.animation.feetSpriteList
      );

      if (this.animation.bodySpriteList.length <= this.animation.actualFrameB) {
        this.animation.actualFrameB = 0;
      }
      if (this.animation.feetSpriteList.length <= this.animation.actualFrameF) {
        this.animation.actualFrameF = 0;
      }
    } else if (movementOrState == "state") {
      this.animation.bodySpriteList = this.AssignCurrentAnimationSprites(
        this.animation.bodySpriteList
      );
      this.animation.actualFrameB = 0;
    } else if (movementOrState == "shoot") {
      this.substateBody = "shoot";
      this.animation.actualFrameB = 0;
      //console.log(this.animation.bodySpriteList.length);

      if (!this.shoot) {
        if (this.isMoving) {
          this.substateBody = "move";
        } else {
          this.substateBody = "idle";
        }
        this.animation.bodySpriteList = this.AssignCurrentAnimationSprites(
          this.animation.bodySpriteList
        );
      }
    }
  },

  /**
   * Check if a state has changed, it's not needed a explanation for that
   */
  CheckIfStateChanged: function() {
    var movementChanged = false;
    var stateChanged = false;

    if (
      this.isMoving &&
      (!this.moveRight && !this.moveLeft && !this.moveDown && !this.moveUp)
    ) {
      movementChanged = true;
    } else if (
      !this.isMoving &&
      (this.moveRight || this.moveLeft || this.moveUp || this.moveDown)
    ) {
      movementChanged = true;
    }

    if (this.isMoving && !this.isRunning && running) {
      movementChanged = true;
    } else if (this.isRunning && !running) {
      movementChanged = true;
    }

    if (this.stateBody != this.stateBodyTemp) {
      this.stateSaved = false;
      stateChanged = true;
    }
    if (!this.stateSaved) {
      this.stateBodyTemp = this.stateBody;
      this.stateSaved = true;
    }
    return {
      movementHasChanged: movementChanged,
      stateHasChanged: stateChanged
    };
  },
  ApplyVelocityToPlayer: function() {
    var vel = 0;
    if (!this.isMoving) {
      this.footstepsAudio.pause();

      //this.footstepsAudio.currentTime = 0;
    }

    if (this.isMoving) {
      vel = 2;
      this.footstepsAudio.play();
    }

    if (this.isRunning) {
      vel = 4;
    }

    // horizontal movement
    if (this.moveRight) {
      this.ApplyVelocity(new b2Vec2(vel, 0));
    }

    if (this.moveLeft) {
      this.ApplyVelocity(new b2Vec2(-vel, 0));
    }

    //vertical movement
    if (this.moveUp) {
      this.ApplyVelocity(new b2Vec2(0, vel * 0.83));
    }
    if (this.moveDown) {
      this.ApplyVelocity(new b2Vec2(0, -vel * 0.83));
    }
  },

  Shoot: function() {
    /** Sound management */
    this.shootAudio.volume = 0.4;
    this.shootAudio.pause();
    this.shootAudio.currentTime = 0;
    this.shootAudio.play();

    var shootTemp = new Bullet();

    // Player rotation

    var transform = this.CalculatePosition(
      //Calculate the transform
      this.socketRelativePosition.gun.x,
      this.socketRelativePosition.gun.y
    );
    // console.log(transform);

    // Shoot with the transform dependent of this
    shootTemp.Start(
      transform[0],
      transform[1],
      transform[2],
      transform[3],
      transform[4]
    ); // canvas.height - this.position.y is the axis conversion to reach the common point between the models

    shoots.push(shootTemp);
  },

  /**
   * Most "complex" method class
   */
  CalculatePosition: function(relativePositionX, relativePositionY) {
    var rotation = Math.atan2(this.dY, this.dX); // Calculate the rotation
    directionY = Math.sin(rotation); // Calculate de x Direction with the rotation
    directionX = Math.cos(rotation); // Calculate de y Direction with the rotation

    var armRotation = Math.atan2(relativePositionX, relativePositionY); // Calculate the arm rotation with the relative position with parent(this)
    // And the length
    var armLength = Math.sqrt(
      relativePositionX * relativePositionX +
        relativePositionY * relativePositionY
    );
    var offSetX = armLength * Math.cos(rotation + armRotation); // Calculate the resultant x offset
    var offSetY = armLength * Math.sin(rotation + armRotation); // Calculate the resultant y offset

    var positionX = this.position.x + offSetX; // Update and add the position of the children with this position
    var positionY = canvas.height - this.position.y - offSetY;

    return [positionX, positionY, directionX, directionY, rotation]; //Return all the used variables
  }
};

//-------- Declaration of variables -------\\
var canvas;
var ctx;

var pi_2 = Math.PI * 2;

var fixedDeltaTime = 0.01666666; // 60fps: 1 frame each 16.66666ms
var deltaTime = fixedDeltaTime;

var time = 0,
  FPS = 0,
  frames = 0,
  acumDelta = 0;

torchAudio: null; //Sound played on the switching action of the torch

var player1 = null;
var torch1 = null;

var bodySprites = new Array(); // list of all the upper parts of the character
var feetSprites = new Array(); // List of all of the

var shoots = [];
var boxImage; // Image destined to be the enemyImage
var boxes = []; // game objects

var buttonPlay = new Image();
var buttonRefresh = new Image();

var zombies = [];

var moveL = false,
  moveR = false,
  moveU = false,
  moveD = false; // axis movement states
var running = false;
var torchActivated = false; //Is the torch activated?

var isSpawning = false;

var gameOver = false;

var camera; // game camera

var selected = false;
/**
 * Symbolic start that defines all of the declared variables, including the sprites destined to
 * be animated
 */
function Init() {
  window.requestAnimationFrame = (function(evt) {
    return (
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, fixedDeltaTime * 1000);
      }
    );
  })();

  canvas = document.getElementById("my_canvas");

  if (canvas.getContext) {
    ctx = canvas.getContext("2d");

    LoadPlayerAnim(); //Loads the player animationset

    torchAudio = new Audio("./media/Sounds/torch.mp3");

    var imagetemp = new Image();
    imagetemp.src = "./media/background.png";

    ctx.save;
    ctx.drawImage(imagetemp, 0, 0);
    ctx.translate(0, 0);

    ctx.restore();
    if (bodySprites.length != 0) {
      bodySprites[bodySprites.length - 1].onLoad = Start();
    } // when all the images are loaded, Start the game
  }
}

/**
 * Initialize almost all of the methods and variables and setup the loop state
 */
function Start() {
  SetupKeyboardEvents(); // setup keyboard events
  SetupMouseEvents(); // setup mouse events

  PreparePhysics(ctx); // initialize Box2D

  background.Start(); // init background

  player1 = player.Start(); // init player

  torch1 = torch.Start(player); //Create the torch and give reference to its parent(player)

  camera = new Camera(player); // init camera
  camera.Start();

  buttonPlay.src = "./media/button play.png"; // Sources of the buttons of the menu

  buttonRefresh.src = "./media/button refresh.png";

  // buttonPlay.addEventListener("click",function(){
  //   selected = true;;
  //   console.log("holaaaaaaaaaaaaaaa");
  //   location.reload;
  // });

  // buttonRefresh.addEventListener("click",function(){
  //   console.log("holaaaaaaaaaaaaaaa");
  //   location.reload;
  // });

  BoxSpawn(); //Instantiate the first box of the game loop

  Loop(); // first call to the game loop that will be waiting for the call to the play button
}

function Loop() {
  requestAnimationFrame(Loop);

  if (!selected) {
    background.Draw(ctx); // draw the background to prevent loneliness in the menu

    ctx.save();

    ctx.scale(0.3, 0.3);
    ctx.drawImage(buttonPlay, 1125, 450); //draw the play button
    ctx.restore();
    ctx.save();
    ctx.scale(0.1, 0.1);
    ctx.drawImage(buttonRefresh, 7400, 420); // draw the refresh button with another context options

    ctx.restore();
  } else { 
    if (!gameOver) { // If in play...
      var now = Date.now();
      deltaTime = now - time;
      if (deltaTime > 1000)
        // discard if time > 1 seg
        deltaTime = 0;
      time = now;

      frames++;
      acumDelta += deltaTime;

      if (acumDelta > 1000) {
        FPS = frames;
        frames = 0;
        acumDelta -= 1000;
      }

      deltaTime /= 1000; // transform the deltaTime from miliseconds to seconds

      input.update(); // update the input data
      Update(); // Game logic -------------------
      Draw(); // Draw the game ---------------
    } else { // If the player has lost...
      background.Draw(ctx);

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "red"; // Draw in big letters that the player has entered in game over state, sorry for that
      ctx.font = "70px Comic Sans MS";
      ctx.fillText("GAME OVER", 175, 240);
      setTimeout(function() { // Be a nice boy for 2 seconds while you are seeing game over in big letters
        location.reload();
      }, 2000);
    }
  }
  input.postUpdate(); // reset input data
}

function Update() {
  if (player.hp <= 0 || player.ammo <= 0) { // If ammo or player hp is lower than 0, player has lost
    gameOver = true; 
  }
  world.Step(deltaTime, 8, 3);
  world.ClearForces();

  shoots.forEach(element => {//Update all shots elements
    element.Update();

    if (element.type == "delete") {
      DeleteObject(element, shoots); //Delete if it is said so
    }
    if (element.firstFrame) {
      setTimeout(function() {
        DeleteObject(element, shoots); // Call to delete at the first frame to prevent to have 1000 bullets on screen
      }, 1000);
      element.firstFrame = false; // It is called only in the first frame.
    }
  });

  boxes.forEach(element => {
    if (element.type == "delete") {
      DeleteObject(element, boxes);

      setTimeout(function() { // When a box its deleted, instantiate another in x seconds
        BoxSpawn();
      }, 6000);
    }
    element.Update();
  });

  UpdateInputs(); //Updates all inputs

  zombies.forEach(element => {
    //Update all zombies

    if (element.type == "delete") DeleteObject(element, zombies);
    element.Update();
  });

  if (isSpawning == false) {
    setTimeout(function() { //Instantiate a zombie per second, a lot of zombies kicking asses with buged sphere collider.
      ZombieSpawn();
    }, 1000);
    isSpawning = true;
  }

  //   if (isSpawning == false) {
  //     setTimeout(function() {
  //       BoxSpawn();
  //     }, 5000);
  //     isSpawning = true;
  //   }

  // player update & torch update
  player1.Update(deltaTime);

  if (torchActivated) torch1.Update(deltaTime); //same as draw, optimization of resources

  // camera update
  camera.Update(deltaTime);
}

function Draw() {
  // clean the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  if (torchActivated) {
    // to save resources, only draw and calculate the shadows when the torch is activated
    torch1.Draw(ctx);
    ctx.globalCompositeOperation = "destination-over"; //New image behind the last image drawn
  }
  // Draw the background (with the parallax)
  background.Draw(ctx);

  ctx.globalCompositeOperation = "source-over"; // Reset to default

  this.zombies.forEach(element => { // Draw al zombies
    element.Draw(ctx);
  });

  //DrawWorld(world); // draw the box2d world for debug purposes

  ctx.save();

  this.shoots.forEach(element => { //Draw all the shoots in this context
    element.Draw(ctx);
  });

  this.boxes.forEach(element => { //And don't forget the boxes too
    element.Draw(ctx);
  });
  // draw all obstacles / objects / boxes

  player.Draw(ctx); // draw the player
  ctx.save();

  ctx.restore();

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "white"; // draw the player's ammo
  ctx.font = "26px Comic Sans MS";
  ctx.fillText("Ammo: " + player.ammo, 660, 70);

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "white"; // draw the player's health
  ctx.font = "26px Comic Sans MS";
  ctx.fillText("Health: " + player.hp, 660, 140);

  ctx.fillStyle = "white"; // draw the FPS
  ctx.font = "10px Arial";
  ctx.fillText("FPS: " + FPS, 10, 10);
  ctx.fillText("deltaTime: " + Math.round(1 / deltaTime), 10, 20);

  ctx.fillStyle = "white"; // draw the controls
  ctx.font = "10px Arial";
  ctx.fillText(
    "MOVE: WASD      SHOOT: LEFT CLICK      RUN: SHIFT + WASD ",
    10,
    450
  );
}

// function DrawWorld(world) {
//   // Transform the canvas coordinates to cartesian coordinates
//   ctx.save();
//   ctx.translate(0, canvas.height);
//   ctx.scale(1, -1);
//   world.DrawDebugData();
//   ctx.restore();
// }

function DeleteObject(element, list) {
  // Delete the bullet object instance and delete it from the shoots list hierarchy
  if (element != null && element != undefined) {
    world.DestroyBody(element.body); // Destroy the body of the bullet object from the world hierarchy
    var index = list.indexOf(element);
    list.splice(index, 1); // Delete at index

    delete element; // Destroy the object
  }
}

function UpdateInputs() {
  if (input.mouseClicked == true) {
    // mouse clicked shoot or activate flashlight
    input.mouseClicked = false;

    if (player1.stateBody == "flashlight") {  // Play a sound when switch of lantern
      torchAudio.pause(); 
      if (torchActivated) torchActivated = false;
      else torchActivated = true;

      torchAudio.play();
    } else if (player1.stateBody == "handgun") player.shoot = true; // It is used the weapon
  }

  if (input.isKeyPressed(KEY_A) == true) {
    // `Player imput movement logic, similar in all the infinite ifs
    player.moveLeft = true;
    moveL = true;
  } else if (input.isKeyPressed(KEY_D) == true) {
    player.moveRight = true;
    moveR = true;
  }

  if (input.isKeyPressed(KEY_W) == true) {
    player.moveUp = true;
    moveU = true;
  } else if (input.isKeyPressed(KEY_S) == true) {
    player.moveDown = true;
    moveD = true;
  }

  if (input.isKeyPressed(KEY_SHIFT) == true) {
    running = true;
  }

  if (input.isKeyPressed(KEY_1) == true) {
    //State input change
    player.stateBody = "handgun";
  }
  if (input.isKeyPressed(KEY_2) == true) {
    player.stateBody = "flashlight";
  }
  if (input.isKeyPressed(KEY_3) == true) {
    player.stateBody = "knife";
  }

  if (input.isKeyPressed(KEY_A) == false && moveL) {
    //if the state remains true and the key is not pressed... simi
    player.moveLeft = false;
    moveL = false;
  }

  if (input.isKeyPressed(KEY_D) == false && moveR) {
    player.moveRight = false;
    moveR = false;
  }
  if (input.isKeyPressed(KEY_W) == false && moveU) {
    player.moveUp = false;
    moveU = false;
  }
  if (input.isKeyPressed(KEY_S) == false && moveD) {
    player.moveDown = false;
    moveD = false;
  }

  if (input.isKeyPressed(KEY_SHIFT) == false && running) {
    running = false;
  }
}

/**
 * Worst area for explanations on this code, this is a resources loading from folder, given the contents of the source link 
 * Self-explanatory names
 */
function LoadPlayerAnim() {
  const root = "./media/Top_Down_Survivor/";
  const lowerBodyRoot = "feet";
  const lowerBodySubStatesRoots = [
    "idle",
    "run",
    "strafe_left",
    "strafe_right",
    "walk"
  ];

  const upperBodyStatesRoots = ["flashlight", "knife", "handgun"];
  const upperBodySubStatesRoots = [
    "idle",
    "meleeattack",
    "move",
    "reload",
    "shoot"
  ];

  for (var i = 0; i < lowerBodySubStatesRoots.length; i++) {
    var nImages = 20;
    if (i == 0) {
      nImages = 1;
    }
    for (var j = 0; j < nImages; j++) {
      tempImage = new Image();
      tempImage.src =
        root +
        lowerBodyRoot +
        "/" +
        lowerBodySubStatesRoots[i] +
        "/survivor-" +
        lowerBodySubStatesRoots[i] +
        "_" +
        j +
        ".png";
      feetSprites.push(tempImage);
    }
  }

  for (var g = 0; g < upperBodyStatesRoots.length; g++) {
    var nImages = 20;
    var nStates = 3;
    if (g == upperBodyStatesRoots.length - 1) {
      nStates = 5;
    }
    for (var h = 0; h < nStates; h++) { // Depending of which state is, there are different sizes of substate
      if (h == 1) {
        nImages = 15;
      } else if (h == 2) {
        nImages = 20;
      } else if (h == 3) {
        nImages = 15;
      } else if (h == 4) {
        nImages = 3;
      }

      for (var k = 0; k < nImages; k++) {
        tempImage = new Image();
        tempImage.src =
          root +
          upperBodyStatesRoots[g] +
          "/" +
          upperBodySubStatesRoots[h] +
          "/survivor-" +
          upperBodySubStatesRoots[h] +
          "_" +
          upperBodyStatesRoots[g] +
          "_" +
          k +
          ".png";
        bodySprites.push(tempImage); //When its is found the right image, load it to the list.
        //console.log(tempImage);
      }
    }
  }
}

/**
 * Get a random int given two values 
 * @param {*} min 
 * @param {*} max 
 */
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Spawn of the zombie, it has special areas to spawn 
 */
function ZombieSpawn() {
  var spawnzone = getRndInteger(1, 4);
  var zombieTemp = new Zombie();

  var spwX = 0;
  var spwY = 0;

  if (spawnzone == 1) {
    // Random positions by canvas cuadrants
    spwX = getRndInteger(0, 150);
    spwY = getRndInteger(0, 450);
    zombieTemp.Start(spwX, spwY); //After choose the position, push zombieTemp in the location
    zombies.push(zombieTemp);
  } else if (spawnzone == 2) {
    spwX = getRndInteger(150, 650);
    spwY = getRndInteger(300, 450);
    zombieTemp.Start(spwX, spwY);
    zombies.push(zombieTemp);
  } else if (spawnzone == 3) {
    spwX = getRndInteger(650, 800);
    spwY = getRndInteger(0, 450);
    zombieTemp.Start(spwX, spwY);
    zombies.push(zombieTemp);
  }

  isSpawning = false; //This should go false in order to not have 2000 zombies on screen
}

/**
 * Spawn a randomized box 
 */
function BoxSpawn() {
  var boxTemp = new Box();

  var spwX = getRndInteger(0, canvas.width); //... inside the canvas dimensions
  var spwY = getRndInteger(20, canvas.height);

  boxTemp.Start(spwX, spwY); //It is initializated 

  boxes.push(boxTemp); //And pushed to it´s correspondient array/List
}
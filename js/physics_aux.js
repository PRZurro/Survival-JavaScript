// auxiliar code for working with Box2D
// requires jQuery

// Box2D lib

var b2Vec2 = Box2D.Common.Math.b2Vec2,
  b2AABB = Box2D.Collision.b2AABB,
  b2BodyDef = Box2D.Dynamics.b2BodyDef,
  b2Body = Box2D.Dynamics.b2Body,
  b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
  b2Fixture = Box2D.Dynamics.b2Fixture,
  b2World = Box2D.Dynamics.b2World,
  b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
  b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
  b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
  b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef,
  b2Shape = Box2D.Collision.Shapes.b2Shape,
  b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef,
  b2Joint = Box2D.Dynamics.Joints.b2Joint,
  b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef,
  b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef,
  b2PulleyJointDef = Box2D.Dynamics.Joints.b2PulleyJointDef,
  b2ContactListener = Box2D.Dynamics.b2ContactListener;

// 1 metro = 100 pixels
var scale = 100;
var gravity;
var world;

// var entityCategory = { // Not needed
//   PLAYER: 0x001,
//   BULLET: 0x002,
//   BOX: 0x003
// };

// aux function for creating boxes
function CreateBox(world, x, y, width, height, options) {
  // default values
  options = $.extend(
    true,
    {
      density: 1.0,
      friction: 1.0,
      restitution: 0.5,

      linearDamping: 0.0,
      angularDamping: 0.0,

      fixedRotation: false,

      type: b2Body.b2_dynamicBody
    },
    options
  );

  // Fixture: define physics propierties (density, friction, restitution)
  var fix_def = new b2FixtureDef();

  fix_def.density = options.density;
  fix_def.friction = options.friction;
  fix_def.restitution = options.restitution;

  // Shape: 2d geometry (circle or polygon)
  fix_def.shape = new b2PolygonShape();

  fix_def.shape.SetAsBox(width, height);

  // Body: position of the object and its type (dynamic, static o kinetic)
  var body_def = new b2BodyDef();
  body_def.position.Set(x, y);

  body_def.linearDamping = options.linearDamping;
  body_def.angularDamping = options.angularDamping;

  body_def.type = options.type; // b2_dynamicBody
  body_def.fixedRotation = options.fixedRotation;
  body_def.userData = options.user_data;

  var b = world.CreateBody(body_def); //Create the body with the bodyDef
  var f = b.CreateFixture(fix_def); // Create the fixture with the body data

  return b;
}

// aux function for creating balls
function CreateBall(world, x, y, r, options) {
  // default values
  options = $.extend(
    true,
    {
      density: 2.0,
      friction: 0.5,
      restitution: 0.5,

      linearDamping: 0.0,
      angularDamping: 0.0,

      type: b2Body.b2_dynamicBody
    },
    options
  );

  var body_def = new b2BodyDef();
  var fix_def = new b2FixtureDef();

  fix_def.density = options.density;
  fix_def.friction = options.friction;
  fix_def.restitution = options.restitution;

  // Shape: 2d geometry (circle or polygon)
  var shape = new b2CircleShape(r);
  fix_def.shape = shape;

  body_def.position.Set(x, y);

  // friction
  body_def.linearDamping = options.linearDamping;
  body_def.angularDamping = options.angularDamping;

  body_def.type = options.type;
  body_def.userData = options.user_data;

  var b = world.CreateBody(body_def); //Create the body with the bodyDef
  var f = b.CreateFixture(fix_def); // Create the fixture with the body data

  return b;
}

// Create a Box2D world object
function CreateWorld(ctx, gravity) {
  var doSleep = false;
  world = new b2World(gravity, doSleep);

  // DebugDraw is used to create the drawing with physics
  var debugDraw = new b2DebugDraw();
  debugDraw.SetSprite(ctx);
  debugDraw.SetDrawScale(scale);
  debugDraw.SetFillAlpha(0.5);
  debugDraw.SetLineThickness(1.0);
  debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

  world.SetDebugDraw(debugDraw);
  //world.SetContactListener(b2ContactListener);

  // create the invisible limits (an static object)
  // left wall
  CreateBox(world, 0, 1, 0.1, 8, { type: b2Body.b2_staticBody });
  // down wall
  CreateBox(world, 8, 0, 16, 0.15, { type: b2Body.b2_staticBody });
  // right wall
  CreateBox(world, 8.1, 1, 0.1, 8, { type: b2Body.b2_staticBody });
  //up wall
  CreateBox(world, 0, 4.75, 18, 0.2, { type: b2Body.b2_staticBody });

  return world;
}

function PreparePhysics(ctx) {
  // gravity vector
  gravity = new b2Vec2(0, 0);

  CreateWorld(ctx, gravity);
  b2ContactListener.prototype.BeginContact = OnContactDetected; // Collision listener
}

function OnContactDetected(contact) {
  //Get the body data 
  var a = contact
    .GetFixtureA()
    .GetBody()
    .GetUserData();
  var b = contact
    .GetFixtureB()
    .GetBody()
    .GetUserData();


    //If the bullet collides with something is deleted, and if its a zombie delete him too (there are 2 comprobations)
 
  if (a != null && typeof a.type !== "undefined") {
    if (a.type == "bullet") {
      a.type = "delete";
      if (b.type == "zombie")
       b.type = "delete";
    }
     } else if (b != null && typeof b.type !== "undefined") {
    if (b.type == "bullet") {
      b.type = "delete";
      if (a.type == "zombie") {
        a.type = "delete";

      }
    }
  }

  if (
    a != null &&
    b != null &&
    typeof a.type !== "undefined" &&
    typeof b.type !== "undefined"
  ) {
    // When it is needed to check the collisions between two objects 
    //PLAYER & ZOMBIE
    if (
      (a.type == "player" && b.type == "zombie") || 
      (b.type == "player" && a.type == "zombie")
    ) {
      player.hp--;
    }

    //BULLET & ZOMBIE
    if (
      (a.type == "bullet" && b.type == "zombie") ||
      (b.type == "bullet" && a.type == "zombie")
    ) {
      a.type = "delete";
      b.type = "delete";
      
    }
  }
  //PLAYER & BOX
  if (
    (a.type == "player" && b.type == "box") ||
    (b.type == "player" && a.type == "box")
  ) {
    player.ammo +=5; //When they collide, it's given to the player 5 units of ammunition

    if(b.type == "box"){
      b.type = "delete"; //And its deleted the box, in order to create another randomized
    }
    else if(a.type == "box"){
      a.type = "delete";
    }
  }
}

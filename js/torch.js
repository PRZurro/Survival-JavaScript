var torch = {
  type: "torch",
  light: new Image(),
  activated: false,
  scale: 0.9,

  transform: {
    relativePosition: { x: 0, y: 50 }, //localPosition respects parent
    position: { x: 0, y: 0 }, //worldPosition
    direction: { x: 0, y: 0 },
    rotation: 0, // angle rotation
    parent: null, // parent
    activated: true, //its basically a torch switch condition: ON/OFF

    Start: function(parent) {
      //Associates the parent of the torch in definition
      this.parent = parent;
    },

    Update: function(deltaTime) {
      //Updates the position and rotation and mask the light with polygons shadows alike
      if (this.activated) {
        var newTransform = player.CalculatePosition(
          //calculate the world position respects the parent
          this.relativePosition.x,
          this.relativePosition.y
        );

        this.position.x = newTransform[0]; // position x of the resultant coordinates
        this.position.y = canvas.height - newTransform[1]; // position y of the resultant coordinates with fixed height (representative system)

        // this.direction.x = newTransform[2]; // Not needed
        // this.direction.y = newTransform[3]; // Not needed

        this.rotation = newTransform[4]; // get the aim rotation
      }
    }
  },
  Start: function(parent) {
    this.light.src = "./media/light_PNG14412.png"; // Image's asset source
    this.transform.Start(parent); // Start the start function of this transform

    return this; // Give me this
  },

  Update: function(deltaTime) {
    this.transform.Update(deltaTime); //update the transform respects the parent
  },

  Draw: function(ctx) {
    ctx.save();

    ctx.translate(this.transform.position.x, this.transform.position.y);

    ctx.scale(1, this.scale); // this is for aesthetic use only
    ctx.rotate(this.transform.rotation); // rotate to the direction of the parent

    ctx.drawImage(
      this.light,
      1,
      1,
      this.light.width,
      this.light.height,
      -this.light.width / 2,
      -this.light.height / 2,
      this.light.width,
      this.light.height
    );

    ctx.restore();

    //ctx.globalCompositeOperation = "destination-out"; //Context reminds last image drawed in this setting, it deletes the part
    // to the first image drawed the whole area of the second. nImage area is deleted to o' Image

    //this.CalculateShadows(); Not working

    ctx.globalCompositeOperation = "source-over"; // Give the context it's default value again
  },

  CalculateShadows: function() {
    boxes.forEach(element => {
      if (!element.enemy) {
        if (element.vertices.length > 4) {
          var i = 5;
          while (i < element.vertices.length) {
            element.vertices.pop();
            ++i;
            console.log("limpiaaandooo");
          }
        }
        element.vertices.push.apply(
          this.GetProyectionPointsCloud(element.vertices)
        );
        this.DrawPolygonWithPoints(element.vertices);
      }
    });
  },

  GetProyectionPointsCloud: function(points) { // Give me the proyection of the vertices
    points.push(this.getProyectionPoint(points[0]));
    points.push(this.getProyectionPoint(points[1]));
    points.push(this.getProyectionPoint(points[2]));
    points.push(this.getProyectionPoint(points[3]));

    //console.log(points);
    return points;
  },

  getProyectionPoint: function(point) {
    var distance = 10; // Distance offset in which obtain the point
    var vecP2P1 = {
      x: point.x - this.transform.position.x,
      y: point.y - this.transform.position.y
    }; //Calculate the vector with two points

    var moduleVx = vecP2P1.x * vecP2P1.x; // ^2
    var moduleVy = vecP2P1.y * vecP2P1.y; // ^2

    var moduleV = Math.sqrt(moduleVx + moduleVy); // Get the module of the vector

    var definitivePoint = {
      x: point.x + (vecP2P1.x / moduleV) * distance,
      y: point.y + (vecP2P1.y / moduleV) * distance
    }; // P3 = P2 + unit vector * d

    return definitivePoint;
  },

  DrawPolygonWithPoints: function(points) {
    // calculate max and min x and y
    var minX = points[0].x;
    var maxX = points[0].x;
    var minY = points[0].y;
    var maxY = points[0].y;

    //Calculates minimum and maximum X, Y points
    for (var i = 1; i < points.length; i++) {
      if (points[i].x < minX) minX = points[i].x;
      if (points[i].x > maxX) maxX = points[i].x;
      if (points[i].y < minY) minY = points[i].y;
      if (points[i].y > maxY) maxY = points[i].y;
    }

    // choose a "central" point
    var center = {
      x: minX + (maxX - minX) / 2,
      y: minY + (maxY - minY) / 2
    };

    // precalculate the angles of each point to avoid multiple calculations on sort
    // this is optimization purpose only, it's a modifation of code alien to me
    for (var i = 0; i < points.length; i++) {
      points[i].angle = Math.acos(
        (points[i].x - center.x) / this.LineDistance(center, points[i])
      );

      if (points[i].y > center.y) {
        points[i].angle = Math.PI + Math.PI - points[i].angle;
      }
    }

    // List method that sort the list by angle
    points = points.sort(function(a, b) {
      return a.angle - b.angle;
    });

    // Draw shape
    ctx.beginPath(); // create new drawing channel
    ctx.moveTo(points[0].x, points[0].y); // First line between the first point and the second

    //draw line between all sorted points
    for (var i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.lineTo(points[0].x, points[0].y); // Last line between the last point to the first

    console.log("dibujandoooo");
    ctx.stroke(); //finish the channel
    ctx.fill(); // fill the lines path
  },

  /**
   * Calculates the distance between a point A to a point B
   */
  LineDistance: function(p1, p2) {
    var vX = 0;
    var vY = 0;

    vX = p2.x - p1.x; //(X2-X1)
    vX = vX * vX; //^2

    vY = p2.y - p1.y; //(Y2-Y1)
    vY = vY * vY; //^2

    return Math.sqrt(vX + vY); // d^2 = (X2-x1)^2 + (Y2-Y1)^2
  }
};

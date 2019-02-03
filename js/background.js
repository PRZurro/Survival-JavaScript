
var background = {
    bgImg: null,
    // inicializamos el array de capas del fondo
    Start: function () {
    this.bgImg = new Image(),
       this.bgImg.src = "./media/background.png" // Get the source of the image
    },

    Draw: function (ctx) {
       ctx.save();

       ctx.translate(0,0);
       ctx.scale(0.65,0.65);

       ctx.drawImage(this.bgImg,0,0); //Draw background image in the init of the axis

       ctx.restore();
    }
};

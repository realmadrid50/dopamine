'use strict';

console.clear();

const colorPositive = '#ffffff';
const colorNegative = '#333333';

const plusSignSize = 120;

class SquareScene {
  constructor (canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // add listener for canvas resize
    window.addEventListener('resize', _ => this.handleResize(), false);
        
    // set initial canvas size
    this.handleResize();
    
    // initiate draw loop
    requestAnimationFrame(_ => this.draw());
  }
  
  handleResize () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    let {canvas} = this;
    
    canvas.width = width;
    canvas.height = height;
  }
  
  draw (framesElapsed = 0) {
    requestAnimationFrame(_ => this.draw(framesElapsed + 1));
    
    const {canvas, ctx} = this;
    const {width, height} = canvas;
    
    // conver elapes frames to radians
    // TODO: add duration option
    let angle = framesElapsed * Math.PI / 180;

    // every half turn a.k.a 90 degress, invert the dominant color as the rotaion switches aswell
    let positiveIsDominant = (angle % Math.PI) > (Math.PI / 2);

    // fill the background with the dominant color
    ctx.fillStyle = positiveIsDominant ? colorPositive : colorNegative;
    ctx.fillRect(0, 0, width, height);

    const size = plusSignSize;
    const halfSize = size / 2;
    const thirdSize = size / 3
    const twoThirdsSize = thirdSize * 2;

    // max offscreen boundries that signs are drawn to fill out the whole canvas
    const maxX = width + thirdSize;
    const maxY = height + thirdSize;
    
    // draw a single sign and recursivly call the next drawSign, by first drawing all signs on a
    // column then moving to a new column until all columns drawn
    const drawSign = (x, y, isNegative, index, sy, wasNegativeAtStart) => {
      ctx.save();
      ctx.translate(x, y);
      
      // to avoid some z-index stuff with objects we just only draw those that are opposite
      // of the background color
      let draw = false;
      
      if (isNegative & !positiveIsDominant) {
        ctx.rotate(angle);
        draw = true;
      }
      
      if (!isNegative & positiveIsDominant) {
        ctx.rotate(-angle);
        draw = true;
      }
      
      if (draw) {
        ctx.fillStyle = isNegative ? colorPositive : colorNegative;
        ctx.fillRect(-halfSize, thirdSize - halfSize, size, thirdSize);
        ctx.fillRect(thirdSize - halfSize, - halfSize, thirdSize, size);        
      }
      
      ctx.restore();
      
      // move the cursor y
      y += size + twoThirdsSize;
      isNegative = !isNegative;

      // if need to start a new line
      if (y > maxY) {
        x += thirdSize;
        y = sy - twoThirdsSize;
        
        // after every 2 columns invert which color is dominant to maintain the pattern
        if (Math.abs(y) >= twoThirdsSize * 2) {
          wasNegativeAtStart = !wasNegativeAtStart; 
          isNegative = wasNegativeAtStart;
        }
        
        sy = y;
      }
       
      // end recursion when all columns drawn
      if (x > maxX) {
        return;
      }
      
      // TODO: rewrite without recursion as max call stack can be exceded on smaller sign size
      drawSign(x, y, isNegative, ++index, sy, wasNegativeAtStart);
    };

    // NOTE: passing all default values as no need then in recursion to check if default value needed
    drawSign(0 - size, 0, false, 0, 0, false);
  }
}

let canvasEl = document.getElementById('scene');
let scene = new SquareScene(canvasEl);
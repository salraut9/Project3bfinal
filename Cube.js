class Cube {
  constructor(x, y, z) {
    this.xPosition = x;
    this.yPosition = y;
    this.zPosition = z;
    this.rotation = new Quaternion();
    this.calculateColors();
  }


  draw() {
    const hSize = sizeBox / 2;
    push();
    const {axis, angle} = this.rotation.axisAngle();
    rotate(angle, axis);

    // Draw the outlines
    strokeWeight(2);
    noFill();
    box(sizeBox);
    strokeWeight(0);

    // Front faces
    push();
    translate(0, 0, hSize);

    fill(this.frontColor);
    plane(sizeBox);
    pop();
    
    // Back faces
    push();
    rotateY(PI);
    translate(0, 0, hSize);

    fill(this.backColor);
    plane(sizeBox);
    pop();
    
    // Left faces
    push();
    rotateY(3*Math.PI/2);
    translate(0, 0, hSize);

    fill(this.leftColor);
    plane(sizeBox);
    pop();

    // Right faces
    push();
    rotateY(Math.PI/2);
    translate(0, 0, hSize);

    fill(this.rightColor);
    plane(sizeBox);
    pop();

    // Top faces
    push();
    translate(0, -hSize, 0);
    rotateX(Math.PI/2);
    fill(this.topColor);
    plane(sizeBox);

    // Bottom faces
    translate(0,0,-sizeBox);
    fill(this.bottomColor);
    plane(sizeBox);
    pop();

    pop();
  }

  // Choose the colors of each rubik's cube face
  calculateColors() {
    this.bottomColor = [255,255,0];  
    this.frontColor =  [255,0,0]    
    this.leftColor = [0,255,0];      
    this.rightColor = [0,0,255]    
    this.topColor = [255,255,255];   
    this.backColor = [255,128,0];  
  }
}

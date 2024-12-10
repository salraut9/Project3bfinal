// // Number of cubes per row/column
let cubeNumber = 3;  

// Size of each cube
let boxSize = 50;
let spacing = 4;

let cubes = [];
let shift = -0.5 * (boxSize + spacing) * (cubeNumber - 1);
let m = boxSize + spacing;
let qTurnTime = 270; // Time in ms
// Quaternions to represent 90 degree rotations along each axis
const xQuat = Quaternion.fromAxisAngle([1,0,0], Math.PI/2);
const yQuat = Quaternion.fromAxisAngle([0,1,0], Math.PI/2);
const zQuat = Quaternion.fromAxisAngle([0,0,1], Math.PI/2);

let selectedAxis  = 0;     // Axis of the cube to rotate
let selectedIndex = 0;     // Currently selected layer on the selected axis
let turnAnimStartTime = 0; // Time that selected layer started turning

// Tracks the number of rotations to apply and remaining number of turn animations
let turnCounter = 0;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Initialize the cubes
  for (let z = 0; z < 3; z++) {
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        cubes.push(new Cube(x, y, z));
      }
    }
  }
  
  // Start the camera at a fixed position
  camera(boxSize*4, -boxSize*4, boxSize*4, 0, 0, 0, boxSize, boxSize, boxSize);
}


function draw() {
  clear();
  orbitControl(); // to move the cube around
  
  
  for (const c of cubes) {  
    push();
    
    // Clicked Enter Key
    if (turnCounter > 0 && isCubeSelected(c)) {
      rotateAnim();
    }

    // Translate so the newest cube being drawn is centered at the origin
    translate(
      c.xPos * m + shift,
      c.yPos * m + shift,
      c.zPos * m + shift
    );
    
    // Change stroke color for selected cubes
    if (isCubeSelected(c)) stroke(0, 255, 255);
    else stroke(0); 

    // Draw the boxes
    c.draw();
    pop();
  }
}
function keyPressed() {
  const SPACE = (' ').charCodeAt(0); // 32
  // const ENTER = 13;

  //if selected index or axis is changed, apply all rotations
  switch(keyCode) {
    case DOWN_ARROW:
      // applyAllRotations();
      
      selectedIndex = (selectedIndex + 1) % cubeNumber;
      
      break;
    
    case UP_ARROW:
      // applyAllRotations();
      --selectedIndex;
      if (selectedIndex < 0) {
        selectedIndex = cubeNumber - 1;
      }
      break;

    case RIGHT_ARROW:
      // applyAllRotations();
      --selectedAxis;      
      if (selectedAxis < 0) {
        selectedAxis = 2;
      }
      break;
    
    case LEFT_ARROW:
      // applyAllRotations();
      selectedAxis = (selectedAxis + 1) % 3;
      break;

    // Rotate the selected face
    case ENTER:
      if (turnCounter === 0) { // For rotation animation
        turnAnimStartTime = millis();
        
      }
      ++turnCounter;
      break;
      
    // Scramble cube  
    case SPACE:
      scrambleCube(20);
      break;
  }
}

// Determine which cubes are selected to rotate
function isCubeSelected({xPos, yPos, zPos}) {
  return [xPos, yPos, zPos][selectedAxis] === selectedIndex;
}


// Performs the rotation for the animation of the active layer spinning
function rotateAnim() {
  // Rotate for the rotation animation
  const elapsedTurnTime = millis() - turnAnimStartTime;
  
  // so that the cube doesn't infinity keep on rotating
  if (elapsedTurnTime >= turnCounter * qTurnTime) {
    applyAllRotations();   
  }
  else {
    // Amount the layer should be turned by in radians
    const turnAmount = elapsedTurnTime / qTurnTime * Math.PI/2;
    // Call the appropriate rotation function based on the selected axis
   
    [rotateX, rotateY, rotateZ][selectedAxis](turnAmount);
  }
}


// Applies turn counter rotations to the current selected layer
function applyAllRotations() {
  const rotCoords = (x, y) => {
    return [(cubeNumber - 1) - y, x];
  }

  const selectedCubes = cubes.filter(isCubeSelected);

  while (turnCounter > 0) {
    --turnCounter;
    
    for (let i = 0; i < selectedCubes.length; i++) {
      let c = selectedCubes[i];
      
      switch(selectedAxis) {
        case 0: //x
          [c.yPos, c.zPos] = rotCoords(c.yPos, c.zPos);
          c.rot = Quaternion.mult(xQuat, c.rot);
          break;

        case 1: //y
          [c.zPos, c.xPos] = rotCoords(c.zPos, c.xPos);
          c.rot = Quaternion.mult(yQuat, c.rot);
          break;

        case 2: //z
          [c.xPos, c.yPos] = rotCoords(c.xPos, c.yPos);
          c.rot = Quaternion.mult(zQuat, c.rot);
          break;
      }
    }
  }
}



function scrambleCube(n) {
  
  // Record the currently selected face
  let axis = selectedAxis;
  let index = selectedIndex;
  let turn = turnCounter;
  
  // Randomly changes the selected face and sets turn counter from 0 to 3
  for (let i = 0; i < n; i++) {
    selectedAxis = Math.floor(Math.random() * cubeNumber - 1);
    selectedIndex = Math.floor(Math.random() * cubeNumber - 1);
    turnCounter = Math.floor(Math.random() * cubeNumber - 1);

    applyAllRotations();
  }
  
  // Reset selected face
  
  selectedAxis = axis;
  selectedIndex = index;
  turnCounter = turn;
}class Cube {
  constructor(x, y, z) {
    this.xPos = x;
    this.yPos = y;
    this.zPos = z;
    this.rot = new Quaternion();
    this.calculateColors();
  }


  draw() {
    const hSize = boxSize / 2;
    push();
    const {axis, angle} = this.rot.axisAngle();
    rotate(angle, axis);

    // Draw the outlines
    strokeWeight(2);
    noFill();
    box(boxSize);
    strokeWeight(0);

    // Front faces
    push();
    translate(0, 0, hSize);

    fill(this.frontColor);
    plane(boxSize);
    pop();
    
    // Back faces
    push();
    rotateY(PI);
    translate(0, 0, hSize);

    fill(this.backColor);
    plane(boxSize);
    pop();
    
    // Left faces
    push();
    rotateY(3*Math.PI/2);
    translate(0, 0, hSize);

    fill(this.leftColor);
    plane(boxSize);
    pop();

    // Right faces
    push();
    rotateY(Math.PI/2);
    translate(0, 0, hSize);

    fill(this.rightColor);
    plane(boxSize);
    pop();

    // Top faces
    push();
    translate(0, -hSize, 0);
    rotateX(Math.PI/2);
    fill(this.topColor);
    plane(boxSize);

    // Bottom faces
    translate(0,0,-boxSize);
    fill(this.bottomColor);
    plane(boxSize);
    pop();

    pop();
  }

  // Choose the colors of each rubik's cube face
  calculateColors() {
    this.bottomColor = [255,255,0];  // Yellow
    this.frontColor =  [255,0,0]     // Red
    this.leftColor = [0,255,0];      // Green
    this.rightColor = [0,0,255]      // Blue
    this.topColor = [255,255,255];   // White
    this.backColor = [255,128,0];    // Orange
  }
}
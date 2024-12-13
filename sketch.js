// // Number of cubes per row/column
let cubeNum = 3;  

// Size of each cube
let sizeBox = 50;
let spacing = 4;

let cubes = [];
let shift = -0.5 * (sizeBox + spacing) * (cubeNum - 1);
let spaceSize = sizeBox + spacing;
let timeTurn = 270;


const Quaternionx = Quaternion.angleAxis([1,0,0], Math.PI/2);
const Quaterniony = Quaternion.angleAxis([0,1,0], Math.PI/2);
const Quaternionz = Quaternion.angleAxis([0,0,1], Math.PI/2);

let Axis  = 0;     // Axis of the cube to rotate
let Index = 0;     // Currently selected layer on the selected axis
let startTimeTurn = 0; // Time that selected layer started turning

// Tracks the number of rotations to apply and remaining number of turn animations
let counturn = 0;

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
  camera(sizeBox*4, -sizeBox*4, sizeBox*4, 0, 0, 0, sizeBox, sizeBox, sizeBox);
}


function draw() {
  clear();
  orbitControl(); // to move the cube around
  
  
  for (const cube of cubes) {  
    push();
    
    // Clicked Enter Key
    if (counturn > 0 && isCubeSelected(cube)) {
      rotation();
    }

    // Translate so the newest cube being drawn is centered at the origin
    translate(
      cube.xPosition * spaceSize + shift,
      cube.yPosition * spaceSize + shift,
      cube.zPosition * spaceSize + shift
    );
    
    // Change stroke color for selected cubes
    if (isCubeSelected(cube)) stroke(0, 255, 255);
    else stroke(0); 

    // Draw the boxes
    cube.draw();
    pop();
  }
}
function keyPressed() {
  const SPACE = (' ').charCodeAt(0); // 32

  //if selected index or axis is changed, apply all rotations
  switch(keyCode) {
    case DOWN_ARROW:
      Index = (Index + 1) % cubeNum;
      
      break;
    
    case UP_ARROW:
      --Index;
      if (Index < 0) {
        Index = cubeNum - 1;
      }
      break;

    case RIGHT_ARROW:
      --Axis;      
      if (Axis < 0) {
        Axis = 2;
      }
      break;
    
    case LEFT_ARROW:
      Axis = (Axis + 1) % 3;
      break;

    // Rotate the selected face
    case ENTER:
      if (counturn === 0) { // For rotation animation
        startTimeTurn = millis();
        
      }
      ++counturn;
      break;
      
    // Scramble cube  
    case SPACE:
      scrambleCube(30);
      break;
  }
}

// Determine which cubes are selected to rotate
function isCubeSelected({xPosition, yPosition, zPosition}) {
  return [xPosition, yPosition, zPosition][Axis] === Index;
}

// Performs the rotation for the animation of the active layer spinning
function rotation() {
  // Rotate for the rotation animation
  const elapsedTurnTime = millis() - startTimeTurn;
  
  // so that the cube doesn't infinity keep on rotating
  if (elapsedTurnTime >= counturn * timeTurn) {
    applyAllRotations();   
  }
  else {
    // Amount the layer should be turned by in radians
    const turnAmount = elapsedTurnTime / timeTurn * Math.PI/2;
    // Call the appropriate rotation function based on the selected axis
   
    [rotateX, rotateY, rotateZ][Axis](turnAmount);
  }
}

// Applies turn counter rotations to the current selected layer
function applyAllRotations() {
  const Coordinates = (x, y) => {
    return [(cubeNum - 1) - y, x];
  }

  const selectedCubes = cubes.filter(isCubeSelected);

  while (counturn > 0) {
    --counturn;
    
    for (let i = 0; i < selectedCubes.length; i++) {
      let cube = selectedCubes[i];
      
      switch(Axis) {
        case 0: //x
          [cube.yPosition, cube.zPosition] = Coordinates(cube.yPosition, cube.zPosition);
          cube.rotation = Quaternion.multiply(Quaternionx, cube.rotation);
          break;

        case 1: //y
          [cube.zPosition, cube.xPosition] = Coordinates(cube.zPosition, cube.xPosition);
          cube.rotation = Quaternion.multiply(Quaterniony, cube.rotation);
          break;

        case 2: //z
          [cube.xPosition, cube.yPosition] = Coordinates(cube.xPosition, cube.yPosition);
          cube.rotation = Quaternion.multiply(Quaternionz, cube.rotation);
          break;
      }
    }
  }
}

function scrambleCube(n) {
  
  // Record the currently selected face
  let axis = Axis;
  let index = Index;
  let turn = counturn;
  
  // Randomly changes the selected face and sets turn counter from 0 to 3
  for (let i = 0; i < n; i++) {
    Axis = Math.floor(Math.random() * cubeNum - 1);
    Index = Math.floor(Math.random() * cubeNum - 1);
    counturn = Math.floor(Math.random() * cubeNum - 1);

    applyAllRotations();
  }
  
  // Reset selected face
  
  Axis = axis;
  Index = index;
  counturn = turn;
}

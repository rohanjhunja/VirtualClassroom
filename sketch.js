const rooms = {
  room1: {
    url: 'https://raw.githubusercontent.com/rohanjhunja/VRSlides/1bdaa885b3254566f6088cc6767d77d96487124a/planet.jpeg',
    coordinates: [
      {x:-362,y:0}, 
{x:-344,y:56}, {x:-492,y:-103}, 
{x:-210,y:-62}, 
{x:-153,y:-66}, 
{x:-340,y:-91}, 
{x:-780,y:-136}, 
{x:-749,y:-59}, 
{x:-1035,y:-34}
      // Additional coordinates as needed
    ]
  },
  room2: {
    url: 'https://raw.githubusercontent.com/rohanjhunja/VRSlides/1bdaa885b3254566f6088cc6767d77d96487124a/lab.jpeg',
    coordinates: [
      // Coordinates specific to room2
    ]
  },
  room3: {
    url: 'https://raw.githubusercontent.com/rohanjhunja/VRSlides/1bdaa885b3254566f6088cc6767d77d96487124a/monument.jpeg',
    coordinates: [
      // Coordinates specific to room3
    ]
  }
  // Add more rooms as needed
};

let roomKeys = Object.keys(rooms); // Convert room keys to an array
let currentRoomIndex = 0; // Index to keep track of the current room
let currentRoom = {};
let curCamZ;
let camX = 0;
let camY = 0;
let isLocked = false;
let smallSpheres = []; // Array to store the positions of small spheres
// Variables for touch
let lastTouchX = 0;
let lastTouchY = 0;

function preload() {
  // img = loadImage('https://raw.githubusercontent.com/rohanjhunja/VRSlides/1bdaa885b3254566f6088cc6767d77d96487124a/monument.jpeg');
  Object.keys(rooms).forEach(roomKey => {
    rooms[roomKey].image = loadImage(rooms[roomKey].url);
  });
  const roomNumber = getURLParam('room'); // Assuming URL parameter is named 'room'
  if (roomNumber) {
    currentRoomIndex = parseInt(roomNumber); // Convert to 0-based index // Function to update the current room based on currentRoomIndex
  }
  else{
    console.log('no param');
  }
   updateRoom();
}

function getURLParam(paramName) {
  const params = new URLSearchParams(window.location.search);
  return params.get(paramName);
}

function updateRoom(){
   currentRoom = rooms[roomKeys[currentRoomIndex]];
  smallSpheres = currentRoom.coordinates.slice();// Initialize currentRoom
  // console.log(currentRoom);
  // console.log(smallSpheres);
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight, WEBGL);
   cnv.elt.setAttribute('tabindex', '0'); // Make the canvas focusable
  noStroke();
  camera(0, 0, 1, 0, 0, 0, 0, 1, 1);
  frameRate(24);

  canvas.addEventListener('click', () => {
    if (isLocked) {
      // Store the current camera rotation angles for the new small sphere
      addSpot();
    } else {
      cnv.elt.focus();
      requestPointerLock();
    }
  });

  document.addEventListener('pointerlockchange', lockChangeAlert, false);
  document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

  // Touch event listeners
   if (isMobileDevice()) {
  canvas.addEventListener('touchstart', touchStarted, false);
  canvas.addEventListener('touchmove', touchMoved, false);
   }
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}


function lockChangeAlert() {
  if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
    document.addEventListener("mousemove", updatePosition, false);
    isLocked = true;
  } else {
    document.removeEventListener("mousemove", updatePosition, false);
    isLocked = false;
  }
}

function updatePosition(e) {
  if (isLocked) {
    camX += e.movementX;
    camY += e.movementY;
  }
}

function touchStarted(e) {
   if (isMobileDevice()) {
   addSpot();
     
  lastTouchX = e.touches[0].pageX;
  lastTouchY = e.touches[0].pageY;
   }
  e.preventDefault();
}

function touchMoved(e) {
  if (isMobileDevice()) {
  let dx = e.touches[0].pageX - lastTouchX;
  let dy = e.touches[0].pageY - lastTouchY;
  lastTouchX = e.touches[0].pageX;
  lastTouchY = e.touches[0].pageY;
  camX += -dx;
  camY += -dy * 1.5;
  }
  e.preventDefault();
}

function addSpot(){
  smallSpheres.push({x: camX%1257, y: camY%1257});
  console.log('{x:'+camX%1257+','+'y:'+camY%1257+'},');
}

function checkSpot(px,py){
  let zone = 5;
  if(abs(camX%1257-px%1257)<5 && abs(camY%1257-py%1257)<5){
    // console.log('match: '+px+' '+py);
    return true;
  }
  else{
    return false;
  }
}

function updateSpots(){
  // Example simplified logic for updating spheres' highlight state
  smallSpheres.forEach(sphere => {
    sphere.active = checkSpot(sphere.x, sphere.y); // Assume each sphere object has a 'active' property
  });
}

function draw() {
 if (frameCount % 5 === 0) {updateSpots();} 
  background(0);
  let radius = min(width, height) * 0.85; // Adjust radius as needed
  
   // Place a small white sphere in the center of the current view
  push(); // Isolate the transformation for the small sphere
  fill(255, 255, 255, 100);// White color for the small sphere
  // Translate the small sphere to be in front of the camera.
  // Since the camera is simulated to be at the origin looking down the Z-axis, 
  // we translate it along the Z-axis to make it visible in front of everything else.
  translate(0, 0, -radius);
  sphere(5); // Draw the small sphere
  pop(); // Restore the transformation state

  // pointSpot(smallSpheres[0].x,smallSpheres[0].y);

  // Camera orientation based on mouse movement
  rotateX(-camY * 0.005);
  rotateY(camX * 0.005);

  // The large sphere with inverted texture mapping
  rotateZ(PI);
  
  texture(currentRoom.image);
  scale(1, -1, 1);
  sphere(min(width * 2, height * 2));

  // Draw small spheres
  push(); // Isolate transformations for small spheres
  fill(255);// White color for small spheres

  smallSpheres.forEach(spherePos => {
    push(); // Isolate each small sphere's transformations

    // Translate then rotate approach
    // Adjusting for the additional PI rotation in Y from the initial setup
    let adjustedY = spherePos.x * 0.005 + PI;
    let adjustedX = -spherePos.y * 0.005;

    // Calculate the translation direction based on the camera's orientation
    let x = radius * sin(adjustedY) * cos(adjustedX);
    let y = -radius * sin(adjustedX);
    let z = radius * cos(adjustedY) * cos(adjustedX);

    // Translate to the calculated position
    translate(x, y, z);
    if(spherePos.active){
      sphere(10);
    }
    else{
      sphere(5);
    } // Draw the small sphere

    pop(); // Restore transformations for the next small sphere
  });
  pop(); // Restore the global state
}



function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    // Increment the index to show the next room
    currentRoomIndex = (currentRoomIndex + 1) % roomKeys.length;
    updateRoom();
  } else if (keyCode === LEFT_ARROW) {
    // Decrement the index to show the previous room
    // Ensure the index wraps around correctly if it goes below 0
    currentRoomIndex = (currentRoomIndex - 1 + roomKeys.length) % roomKeys.length;
    updateRoom();
  }
}

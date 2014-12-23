/*
Listen for double click event to enter full-screen VR mode
*/
document.body.addEventListener( 'dblclick', function() {
  effect.setFullScreen( true );
});

function playPause() {
  if (music.paused) {
    music.play();
  } else{
    music.pause();
  }
}

/*
Listen for keyboard events
*/
function onkey(event) {
  event.preventDefault();

  if (event.keyCode == 90) { // z
    controls.zeroSensor(); //zero rotation
  } else if (event.keyCode == 70 || event.keyCode == 13) { //f or enter
    effect.setFullScreen(true); //fullscreen
  } else if (event.keyCode == 32 || event.keyCode == 80) {//space or p
    playPause();
  }
}

window.addEventListener("keydown", onkey, true);

THREE.Matrix4.prototype.add = function (m) {
  this.set.apply(this, [].map.call(this.elements, function (c, i) { return c + m.elements[i] }));
};

function translateByVector(v) {
  var dx = v.x;
  var dy = v.y;
  var dz = v.z;
  var len = Math.sqrt(dx*dx + dy*dy + dz*dz);
  dx /= len;
  dy /= len;
  dz /= len;
  var m = new THREE.Matrix4().set(
    0, 0, 0, dx,
    0, 0, 0, dy,
    0, 0, 0, dz,
    dx,dy,dz, 0);
  var m2 = new THREE.Matrix4().copy(m).multiply(m);
  var c1 = Math.sinh(len);
  var c2 = Math.cosh(len) - 1;
  m.multiplyScalar(c1);
  m2.multiplyScalar(c2);
  var result = new THREE.Matrix4().identity();
  result.add(m);
  result.add(m2);
  return result;
}

function parabolicBy2DVector(v) {  
  var dx = v.x; /// first make parabolic fixing point at infinity in pos z direction
  var dy = v.y;
  var m = new THREE.Matrix4().set(
    0, 0, -dx, dx,
    0, 0, -dy, dy,
    dx, dy, 0, 0,
    dx, dy, 0, 0);
  var m2 = new THREE.Matrix4().copy(m).multiply(m);
  m2.multiplyScalar(0.5);
  var result = new THREE.Matrix4().identity();
  result.add(m);
  result.add(m2);
  //now conjugate to get based on camera orientation
  var cameraM = new THREE.Matrix4();
  cameraM.makeRotationFromQuaternion(camera.quaternion);
  var cameraMinv = new THREE.Matrix4().getInverse(cameraM);

  return cameraM.multiply(result).multiply(cameraMinv);
}

function getFwdVector() {
  return new THREE.Vector3(0,0,1).applyQuaternion(camera.quaternion);
}
function getRightVector() {
  return new THREE.Vector3(-1,0,0).applyQuaternion(camera.quaternion);
}
function getUpVector() {
  return new THREE.Vector3(0,-1,0).applyQuaternion(camera.quaternion);
}

//hold down keys to do rotations and stuff
function key(event, sign) {
  var control = controls.manualControls[event.keyCode];

  if (sign === 1 && control.active || sign === -1 && !control.active) {
    return;
  }

  control.active = (sign === 1);
  if (control.index <= 2){
    controls.manualRotateRate[control.index] += sign * control.sign;
  }
  else if (control.index <= 5) {
    controls.manualMoveRate[control.index - 3] += sign * control.sign;
  }
  else {
    controls.manualParabolicRate[control.index - 6] += sign * control.sign;
  }
}

document.addEventListener('keydown', function(event) { key(event, 1); }, false);
document.addEventListener('keyup', function(event) { key(event, -1); }, false);

/*
Handle window resizes
*/
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  effect.setSize( window.innerWidth, window.innerHeight );
}
window.addEventListener( 'resize', onWindowResize, false );

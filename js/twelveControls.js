/*
Listen for double click event to enter full-screen VR mode
*/
document.body.addEventListener( 'dblclick', function() {
  effect.setFullScreen( true );
});

var playPause = function() {
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
    effect.setFullScreen(true) //fullscreen
  } else if (event.keyCode == 32 || event.keyCode == 80) {//space or p
    playPause();
  } else if (event.keyCode === 73){ //i
    infoSign.material.visible = !infoSign.material.visible;
  }
};
window.addEventListener("keydown", onkey, true);

var step = 0.05;
var ud = new THREE.Matrix4().set(1,0,0,0,
  0,1,0,0,
  0,0,Math.cosh(step),Math.sinh(step),
  0,0,Math.sinh(step),Math.cosh(step));
var lr = new THREE.Matrix4().set(1,0,0,0,
  0,Math.cosh(step),0,Math.sinh(step),
  0,0,1,0,
  0,Math.sinh(step),0,Math.cosh(step));
var fb = new THREE.Matrix4().set(Math.cosh(step),0,0,Math.sinh(step),
  0,1,0,0,
  0,0,1,0,
  Math.sinh(step),0,0,Math.cosh(step));
var udi = new THREE.Matrix4().getInverse(ud);
var lri = new THREE.Matrix4().getInverse(lr);
var fbi = new THREE.Matrix4().getInverse(fb);

var infinitesimalBoosts = {
  3: ud,
  4: udi,
  5: lr,
  6: lri,
  7: fb,
  8: fbi
};

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
  var letter = String.fromCharCode(event.keyCode).toLowerCase();
  var control = controls.manualControls[letter];
  if (!control) {
    if (infinitesimalBoosts[letter]) {
      var m = new THREE.Matrix4().copy(infinitesimalBoosts[letter]);
      m.multiply(currentBoost);
      currentBoost.copy(m);
    } else if (event.keyCode === 38) {
      var offset = getFwdVector();
      offset.multiplyScalar(step);
      var m = translateByVector(offset);
      m.multiply(currentBoost);
      currentBoost.copy(m);
    } else if (event.keyCode === 40) {
      var offset = getFwdVector();
      offset.multiplyScalar(-step);
      var m = translateByVector(offset);
      m.multiply(currentBoost);
      currentBoost.copy(m);
    } else if (event.keyCode === 37) {
      var offset = getRightVector();
      offset.multiplyScalar(-step);
      var m = translateByVector(offset);
      m.multiply(currentBoost);
      currentBoost.copy(m);
    } else if (event.keyCode === 39) {
      var offset = getRightVector();
      offset.multiplyScalar(step);
      var m = translateByVector(offset);
      m.multiply(currentBoost);
      currentBoost.copy(m);
    }

    return;
  }

  if (sign === 1 && control.active || sign === -1 && !control.active) {
    return;
  }

  control.active = (sign === 1);
  controls.manualRotateRate[control.index] += sign * control.sign;
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

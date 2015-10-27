/**
/**
 * @author dmarcos / https://github.com/dmarcos
 with additions by https://github.com/hawksley
 */

THREE.VRControls = function ( camera, done ) {
	this.phoneVR = new PhoneVR();

	//---game controller stuff---
	this.haveEvents = 'ongamepadconnected' in window;
	this.controllers = {};

	this._camera = camera;

	this._init = function () {
		var self = this;

		//hold down keys to do rotations and stuff
		function key(event, sign) {
			var control = controls.manualControls[event.keyCode];

			if (typeof control === 'undefined' || sign === 1 && control.active || sign === -1 && !control.active) {
				return;
			}

			control.active = (sign === 1);
			if (control.index <= 2){
				controls.manualRotateRate[control.index] += sign * control.sign;
			}
			else if (control.index <= 5) {
				controls.manualMoveRate[control.index - 3] += sign * control.sign;
			}
			else if (control.index <= 8) {
				controls.manualQuatRate[control.index - 6] += sign * control.sign;
			}
		}

		document.addEventListener('keydown', function(event) { key(event, 1); }, false);
		document.addEventListener('keyup', function(event) { key(event, -1); }, false);


		function connecthandler(e) {
			addgamepad(e.gamepad);
		}

		function addgamepad(gamepad) {
			self.controllers[gamepad.index] = gamepad;
		}

		function disconnecthandler(e) {
			removegamepad(e.gamepad);
		}

		function removegamepad(gamepad) {
			delete self.controllers[gamepad.index];
		}

		function scangamepads() {
			var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
			for (var i = 0; i < gamepads.length; i++) {
				if (gamepads[i]) {
					if (gamepads[i].index in self.controllers) {
						self.controllers[gamepads[i].index] = gamepads[i];
					} else {
						addgamepad(gamepads[i]);
					}
				}
			}
		}

		window.addEventListener("gamepadconnected", connecthandler);
		window.addEventListener("gamepaddisconnected", disconnecthandler);
		if (!self.haveEvents) {
			setInterval(scangamepads, 500);
		}

		if ( !navigator.mozGetVRDevices && !navigator.getVRDevices ) {
			if ( done ) {
				done("Your browser is not VR Ready");
			}
			return;
		}

		if ( navigator.getVRDevices ) {
			navigator.getVRDevices().then( gotVRDevices );
		} else {
			navigator.mozGetVRDevices( gotVRDevices );
		}

		function gotVRDevices( devices ) {
			var vrInput;
			var error;
			for ( var i = 0; i < devices.length; ++i ) {
				if ( devices[i] instanceof PositionSensorVRDevice ) {
					vrInput = devices[i]
					self._vrInput = vrInput;
					break; // We keep the first we encounter
				}
			}
			if ( done ) {
				if ( !vrInput ) {
				 error = 'HMD not available';
				}
				done( error );
			}
		}
	};

	this._init();

	this.manualRotation = quat.create();

	this.manualControls = {
		65 : {index: 1, sign: 1, active: 0},  // a
		68 : {index: 1, sign: -1, active: 0}, // d
		87 : {index: 0, sign: 1, active: 0},  // w
		83 : {index: 0, sign: -1, active: 0}, // s
		81 : {index: 2, sign: -1, active: 0}, // q
		69 : {index: 2, sign: 1, active: 0},  // e

		38 : {index: 3, sign: -1, active: 0},  // up
		40 : {index: 3, sign: 1, active: 0}, // down
		37 : {index: 4, sign: 1, active: 0}, // left
		39 : {index: 4, sign: -1, active: 0},   // right
		191 : {index: 5, sign: 1, active: 0}, // fwd slash
		222 : {index: 5, sign: -1, active: 0}   // single quote
  };

	this.manualRotateRate = new Float32Array([0, 0, 0]);
	this.manualMoveRate = new Float32Array([0, 0, 0]);
	this.updateTime = 0;

	this.update = function() {
		var camera = this._camera;
		var vrState = this.getVRState();
		var manualRotation = this.manualRotation;
		var oldTime = this.updateTime;
		var newTime = Date.now();
		this.updateTime = newTime;

		/*
		Get controller button info
		*/
		var j;

		for (j in this.controllers) {
			var controller = this.controllers[j];

			this.manualMoveRate[1] = -1 * Math.round(controller.axes[0]);
			this.manualMoveRate[0] = Math.round(controller.axes[1]);
			this.manualRotateRate[1] = -1 * Math.round(controller.axes[2]);
			this.manualRotateRate[0] = -1 * Math.round(controller.axes[3]);
		}

	  var interval = (newTime - oldTime) * 0.001;
	  var update = quat.fromValues(this.manualRotateRate[0] * interval,
	                               this.manualRotateRate[1] * interval,
	                               this.manualRotateRate[2] * interval, 1.0);
	  quat.normalize(update, update);
	  quat.multiply(manualRotation, manualRotation, update);

		var offset = new THREE.Vector3();
		if (this.manualMoveRate[0] != 0 || this.manualMoveRate[1] != 0 || this.manualMoveRate[2] != 0){
				offset = getFwdVector().multiplyScalar( interval * this.manualMoveRate[0])
						.add(getRightVector().multiplyScalar( interval * this.manualMoveRate[1]))
						.add(getUpVector().multiplyScalar( interval * this.manualMoveRate[2]));
		}

		camera.position = camera.position.add(offset);

		if ( camera ) {
			if ( !vrState ) {
				camera.quaternion.fromArray(manualRotation);
				return;
			}

			// Applies head rotation from sensors data.
			var totalRotation = quat.create();
      var state = vrState.hmd.rotation;
      if (vrState.hmd.rotation[0] !== 0 ||
					vrState.hmd.rotation[1] !== 0 ||
					vrState.hmd.rotation[2] !== 0 ||
					vrState.hmd.rotation[3] !== 0) {
        	quat.multiply(totalRotation, manualRotation, vrState.hmd.rotation);
      } else {
        	totalRotation = manualRotation;
      }

			camera.quaternion.fromArray( totalRotation );
		}
	};

	this.zeroSensor = function() {
		var vrInput = this._vrInput;
		if ( !vrInput ) {
			return null;
		}
		vrInput.zeroSensor();
	};

	this.getVRState = function() {
		var vrInput = this._vrInput;
		var orientation;
		var vrState;

		if ( vrInput ) {
			orientation	= vrInput.getState().orientation;
		} else if (this.phoneVR.rotationQuat()) {
			orientation = this.phoneVR.rotationQuat();
		} else {
			return null;
		}

		if (orientation == null) {
			return null;
		}
		vrState = {
			hmd : {
				rotation : [
					orientation.x,
					orientation.y,
					orientation.z,
					orientation.w
				]
			}
		};
		return vrState;
	};
};

function getFwdVector() {
	return new THREE.Vector3(0,0,1).applyQuaternion(camera.quaternion);
}
function getRightVector() {
	return new THREE.Vector3(-1,0,0).applyQuaternion(camera.quaternion);
}
function getUpVector() {
	return new THREE.Vector3(0,-1,0).applyQuaternion(camera.quaternion);
}

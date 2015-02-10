//---game controller stuff---

var haveEvents = 'ongamepadconnected' in window;
var controllers = {};
var rAF = window.requestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.webkitRequestAnimationFrame;

function connecthandler(e) {
  addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;

  rAF(updateStatus);
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  delete controllers[gamepad.index];
}

function updateStatus() {
  if (!haveEvents) {
    scangamepads();
  }

  /*
    Demo code for getting controller button info
  */

  // var i = 0;
  // var j;
  //
  // for (j in controllers) {
  //   var controller = controllers[j];
  //
  //   for (i = 0; i < controller.buttons.length; i++) {
  //     var val = controller.buttons[i];
  //     var pressed = val == 1.0;
  //     if (typeof(val) == "object") {
  //       pressed = val.pressed;
  //       val = val.value;
  //     }
  //   }
  //
  //   for (i = 0; i < controller.axes.length; i++) {
  //     console.log(controller.axes[i].toFixed(4));
  //     console.log(controller.axes[i]);
  //   }
  // }

  rAF(updateStatus);
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        addgamepad(gamepads[i]);
      }
    }
  }
}


window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) {
  setInterval(scangamepads, 500);
}

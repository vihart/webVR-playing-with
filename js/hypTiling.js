var camera;
var scene;
var renderer;
var mesh;

var infoSprite = new THREE.Mesh();
var effect;
var controls;
// var music = document.querySelector('#music');
var clicky = 0;
var mouseX = 1;
var mouseY = 1;
var currentBoost = new THREE.Matrix4().set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);

var numObjects = 1; //number of obj files to load
var numGens = tilingGens.length;
var tilingDepth = 3;  //not properly working to change this yet...
var numTiles = Math.pow(numGens, tilingDepth);
var bigMatArray = new Array(numObjects * numTiles); 

//// to do!
// var tsfms = new Array ( Math.pow(numGens, tilingDepth) );
// for (i = 0, i < Math.pow(numGens, tilingDepth), i++) {

// }

function init() {
  start = Date.now();
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.x = 0;
  camera.position.z = 0;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  document.body.appendChild(renderer.domElement);

  controls = new THREE.VRControls(camera);

  effect = new THREE.VREffect(renderer);
  effect.setSize(window.innerWidth, window.innerHeight);

  materialBase = new THREE.ShaderMaterial({
    uniforms: { // these are the parameters for the shader
      time: { // global time
        type: "f",
        value: 0.0
      },
      translation: { // quaternion that moves shifts the object, set once per object
        type: "m4",
        value: new THREE.Matrix4().set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)
      },
      boost: {
        type: "m4",
        value: new THREE.Matrix4().set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)
      }
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
  });
  
  materialBase.side = THREE.DoubleSide;



  // one material per object, since they have a different positions
  for (var i = 0; i < bigMatArray.length; i++) {
    bigMatArray[i] = materialBase.clone();
  }

  var manager = new THREE.LoadingManager();
  var loader = new THREE.OBJLoader(manager);

  loader.load('media/monkey_15k_tris.obj', function (object) {
    for (var i = 0; i < numTiles; i++) {
      var newObject = object.clone();
      newObject.children[0].material = bigMatArray[(i)];
      newObject.children[0].frustumCulled = false;
      scene.add(newObject);
    }
  });

  // loader.load('media/12_days_of_xmas_dodec_2.obj', function (object) {
  //   for (var i = 0; i < numTiles; i++) {
  //     var newObject = object.clone();
  //     newObject.children[0].material = bigMatArray[(i + 1*numTiles)];
  //     newObject.children[0].frustumCulled = false;
  //     scene.add(newObject);
  //   }
  // });


  ////// create info overlay
  var infoText = THREE.ImageUtils.loadTexture( "media/twelve-ui.png" ); 
  var infoMaterial = new THREE.MeshBasicMaterial( {map: infoText, wireframe: false, color: 0x777777 }); 
  var infoBox = new THREE.BoxGeometry(2,1,1);
  infoSprite = new THREE.Mesh( infoBox, infoMaterial );
  infoSprite.position.z = -2;
  infoSprite.position.x = -.5;
  infoSprite.position.y = -1;
  infoSprite.rotation.x = -.3;
  scene.add( infoSprite );

  effect.render(scene, camera);
}


function animate() {


  for (var i = 0; i < bigMatArray.length; i++) {
    var j = i%numTiles;
    var k = (i/numTiles)|0;
    // bigMatArray[i].uniforms['translation'].value = new THREE.Matrix4().copy(tilingGens[(j/numGens)|0]).multiply(tilingGens[j%numGens]);
    
    var j0 = j%numGens;
    var ja = (j/numGens)|0;
    var j1 = ja%numGens;
    var j2 = (ja/numGens)|0; 

    bigMatArray[i].uniforms['translation'].value = new THREE.Matrix4().copy(tilingGens[j0]).multiply(tilingGens[j1]).multiply(tilingGens[j2]);

    bigMatArray[i].uniforms['boost'].value = currentBoost;

    // bigMatArray[i].visible = phraseOnOffMaps[currentPhrase][k];
  }

  controls.update();
  effect.render(scene, camera);
  requestAnimationFrame(animate);
}

init();
animate();

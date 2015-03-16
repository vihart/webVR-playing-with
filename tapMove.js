document.body.addEventListener( 'click', function() {
	effect.setFullScreen( true );
});

function tapMovement() {
		var moveVector = new THREE.Vector3(0,0,1).applyQuaternion(camera.quaternion);
		var moveSpeed = moveVector.multiplyScalar(.1);
		camera.position.sub(moveSpeed);
}
//spherical matrix functions

THREE.Matrix4.prototype.add = function (m) {
  this.set.apply(this, [].map.call(this.elements, function (c, i) { return c + m.elements[i] }));
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

function quatMult( p , q ) 
{
    var r = new THREE.Vector4();    
    r.w = + p.w*q.w - p.x*q.x - p.y*q.y - p.z*q.z;
    r.x = + p.w*q.x + p.x*q.w + p.y*q.z - p.z*q.y;
    r.y = + p.w*q.y - p.x*q.z + p.y*q.w + p.z*q.x;
    r.z = + p.w*q.z + p.x*q.y - p.y*q.x + p.z*q.w;    
    return r;
}

function makeHopfColorMatrix( colourDir )
{
    //rotate colourDir to lie along (0,0,z,w), fixing (0,0,0,1) 
    //http://math.stackexchange.com/questions/293116/rotating-one-3-vector-to-another
    
    var A = new THREE.Vector3(colourDir.x, colourDir.y, colourDir.z);
    var B = new THREE.Vector3(0.,0.,1.0);
    var X = new THREE.Vector3();
    X.crossVectors(A,B);
    X.normalize();
    var theta = Math.acos( A.dot(B)/(A.length()*B.length())); ///dont care about sign
    var m = new THREE.Matrix4().set(  0.,-X.z, X.y, 0., //input is row vectors
                                     X.z,  0.,-X.x, 0.,
                                    -X.y, X.x,  0., 0.,
                                      0.,  0.,  0., 0.
                        );
    // console.log(m.elements);
    var m2 = new THREE.Matrix4().copy(m).multiply(m);
    m.multiplyScalar(Math.sin(theta));
    m2.multiplyScalar(1.-Math.cos(theta));
    var Rot = new THREE.Matrix4();
    Rot.add(m);
    Rot.add(m2);

    return Rot;
}

function stereoProj(p)
{
	var result new THREE.Vector3(p.x / (1.0-p.w), p.y / (1.0-p.w), p.z / (1.0-p.w) );
	return result;
}

function invStereoProj(v)
{
	var denom = 1 + v.x*v.x + v.y*v.y + v.z*v.z;
	var result = new THREE.Vector4(2*v.x/denom, 2*v.y/denom, 2*v.z/denom, (denom-2)/denom);
	return result;
}

function S3dist(p,q)
{
	var d = p.dot(q);
	if (d>1.0){
		return 0.0;
	}
	else if (d<-1.0){
		return Math.pi * 0.5;
	}
	else{
		return Math.acos(d);
	}
}






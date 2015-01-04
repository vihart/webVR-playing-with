
function quatMult( p , q ) 
{
    var r = new THREE.Vector4();    
    r.w = + p.w*q.w - p.x*q.x - p.y*q.y - p.z*q.z;
    r.x = + p.w*q.x + p.x*q.w + p.y*q.z - p.z*q.y;
    r.y = + p.w*q.y - p.x*q.z + p.y*q.w + p.z*q.x;
    r.z = + p.w*q.z + p.x*q.y - p.y*q.x + p.z*q.w;    
    return r;
}

var centers_24_cell = [];

for (var i=0;i<2;i++){
  for (var j=0;j<2;j++){
    centers_24_cell[centers_24_cell.length] = new THREE.Vector4((1 - 2*i), (1 - 2*j), 0, 0);
    centers_24_cell[centers_24_cell.length] = new THREE.Vector4((1 - 2*i), 0, (1 - 2*j), 0);
    centers_24_cell[centers_24_cell.length] = new THREE.Vector4((1 - 2*i), 0, 0, (1 - 2*j));
    centers_24_cell[centers_24_cell.length] = new THREE.Vector4(0, (1 - 2*i), (1 - 2*j), 0);
    centers_24_cell[centers_24_cell.length] = new THREE.Vector4(0, (1 - 2*i), 0, (1 - 2*j));
    centers_24_cell[centers_24_cell.length] = new THREE.Vector4(0, 0, (1 - 2*i), (1 - 2*j));
  }
}

for (var i=0;i<24;i++){
  centers_24_cell[i].multiplyScalar(1.0/Math.sqrt(2));
}

var centers_24_cell_dual = [];
var offset = new THREE.Vector4(1,-1,0,0).multiplyScalar(1.0/Math.sqrt(2));
for (var i=0;i<24;i++){
  centers_24_cell_dual[i] = quatMult(offset, centers_24_cell[i]);
}



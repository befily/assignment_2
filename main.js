//IMPORT MODULES
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

//CONSTANT & VARIABLES
let width = window.innerWidth;
let height = window.innerHeight;

//-- GUI PARAMETERS
var gui;
const parameters = {
  maxI: 12,
};



//-- SCENE VARIABLES
var gui;
var scene;
var camera;
var renderer;
var container;
var control;
var ambientLight;
var directionalLight;

//-- GEOMETRY PARAMETERS
//Create an empty array for storing all the geometrie
var nodes = [];
var edges = [];
var level = 3;
 

function main(){
  //GUI
  gui = new GUI();
  gui.add(parameters, 'maxI', 1, 12, 1).name('Number of branches').onChange(() => {
    console.log('MaxI changed to:', parameters.maxI);
  });
    

  //CREATE SCENE AND CAMERA
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 35, width / height, 0.1, 100);
  camera.position.set(0, 0, 30)

  //LIGHTINGS
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
  directionalLight.position.set(2,5,5);
  directionalLight.target.position.set(-1,-1,0);
  scene.add( directionalLight );
  scene.add(directionalLight.target);

  //GEOMETRY INITIATION

  //Testing the Node Class
 
  var location = new THREE.Vector3(0,0,0);
  generateTree(location, level, 30, null);


  //RESPONSIVE WINDOW
  window.addEventListener('resize', handleResize);
 
  //CREATE A RENDERER
  renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container = document.querySelector('#threejs-container');
  container.append(renderer.domElement);
  
  //CREATE MOUSE CONTROL
  control = new OrbitControls( camera, renderer.domElement );

  //EXECUTE THE UPDATE
  animate();
}
 
//-----------------------------------------------------------------------------------
//HELPER FUNCTIONS
//-----------------------------------------------------------------------------------

//RECURSIVE TREE GENERATION
function generateTree(position, level, parentAngle, parent){
  var node = new TreeNode(position, level, parentAngle, parent);
  nodes.push(node);

  if (parent){
    var edge = new Edge(parent.position, node.position);
    edges.push(edge);
  }

  if (level > 0){
    node.createChildren();
    for(var i=0; i<node.children.length; i++){
      var child = node.children[i];
      generateTree(child.position, child.level, child.angle, node);
    }
  }
}

//RESPONSIVE
function handleResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.render(scene, camera);
}

//RANDOM INTEGER IN A RANGE
function getRndInteger(min, max){
  return Math.floor(Math.random() * (max-min+1)) + min;
}

//ANIMATE AND RENDER
function animate() {
	requestAnimationFrame( animate );
 
 
	renderer.render( scene, camera );
}
//-----------------------------------------------------------------------------------
// CLASS
//-----------------------------------------------------------------------------------
class TreeNode{
  constructor(position, level, parentAngle, parent){
    this.position = position;
    this.level = level;
    this.parentAngle = parentAngle * (Math.PI/180);
    this.parentDirection = new THREE.Vector3(0,1,0);
    this.parent = parent;
    this.children = [];

    //Calculate the angle based on the parent's angle
    this.angle = 30 * (Math.PI/180);

    this.length = this.level === 0 ? 2 : 2;

    //Create the shape for the node
    var nodeGeometry = new THREE.SphereGeometry(0.1, 10, 10);
    var material = new THREE.MeshBasicMaterial({color:0xb022c1});
    this.nodeMesh = new THREE.Mesh(nodeGeometry, material);
    this.nodeMesh.position.copy(this.position);

    //Add the node to the scene
    scene.add(this.nodeMesh);

    //Create an edge (branch)connecting to the parent if it exist
    if (parent){
      var edge = new Edge(parent.position, this.position);
      this.edgeMesh = edge.mesh;
      scene.add(this.edgeMesh);
    }
  }

  createChildren(){
    for(var i=0; i< parameters.maxI; i++){
      var childPosition = new THREE.Vector3().copy(this.position);

      let axisZ = new THREE.Vector3(0,0,1);
      let axisY = new THREE.Vector3(0,0,0);

      this.parentDirection.applyAxisAngle(axisZ, this.angle);
      this.parentDirection.applyAxisAngle(axisY, this.angle);

      childPosition.x += this.parentDirection.x * this.length;
      childPosition.y += this.parentDirection.y * this.length;
      childPosition.z += this.parentDirection.z * this.length;

      var child = new TreeNode(childPosition, this.level - 1, this.angle, this);


      this.children.push(child);
      
    }
  }
}

class Edge{
  constructor(start, end){
    this.start = start;
    this.end = end;

    const points = [];
    points.push(this.start);
    points.push(this.end);

    var edgeGeometry = new THREE.BufferGeometry().setFromPoints(points);

    var material = new THREE.MeshBasicMaterial({color:0xff9b00});

    this.mesh = new THREE.Line(edgeGeometry, material);
  }
}

//-----------------------------------------------------------------------------------
// EXECUTE MAIN 
//-----------------------------------------------------------------------------------

main();
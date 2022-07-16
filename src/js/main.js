import '../css/main.css'
import * as THREE from "three";
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { DirectionalLight } from 'three';

//
//THREE.JS
//
const objLoader = new OBJLoader();
objLoader.setPath('/assets')

//Scrollbar at the top before page loads
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
}

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

// Size Vars
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
// Scene
var scene = new THREE.Scene();
const group_intro = GetGroupIntro();

const scene_rmd = new THREE.Scene();
var group_rmd = GetGroupRMD();



// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);

// Canvas and Renderer
const renderer = new THREE.WebGL1Renderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

const controls = new PointerLockControls(camera, document.body);
camera.position.set(0, 20, 100);

function init() {
  const blocker = document.getElementById('blocker');
  const instructions = document.getElementById('instructions');

  instructions.addEventListener('click', function () {

    controls.lock();

  });

  controls.addEventListener('lock', function () {

    instructions.style.display = 'none';
    blocker.style.display = 'none';

  });

  controls.addEventListener('unlock', function () {

    blocker.style.display = 'block';
    instructions.style.display = '';

  });
  scene.add(controls.getObject());

  //Key Input Controls
  const onKeyDown = function (event) {
    switch (event.code) {

      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;

      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;

      case 'Space':
        if (canJump === true) velocity.y += 250;
        canJump = false;
        break;

      case 'KeyE':
        SwitchScenes("intro", "rmd");
        break;

    }

  };

  const onKeyUp = function (event) {
    switch (event.code) {

      case 'ArrowUp':
      case 'KeyW':
        moveForward = false;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false;
        break;

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false;
        break;

      case 'ArrowRight':
      case 'KeyD':
        moveRight = false;
        break;

    }

  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);

  window.addEventListener('resize', onWindowResize);
  blocker.style.display = 'block';
  instructions.style.display = '';

  IntroScene();
}

//
//Materials
//
const mat_plane = new THREE.MeshPhongMaterial({ color: 0xfff, emissive: 0xededed, side: THREE.DoubleSide, reflectivity: 1.0, vertexColors: true, shininess: 10, flatShading: true });

//
//Intro Scene
//
function IntroScene() {
  scene = scene;

  //Fog and Background
  //
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

  scene.add(group_intro);
}

function GetGroupIntro() {
  let group = new THREE.Group();

  //Lighting
  let intro_dir_light = new DirectionalLight(0xffffff, 1);
  scene.add(intro_dir_light);
  group.add(intro_dir_light);


  // floor
  let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 80, 80);
  floorGeometry.rotateX(- Math.PI / 2);

  // vertex displacement
  let position = floorGeometry.attributes.position;

  for (let i = 0, l = position.count; i < l; i++) {

    vertex.fromBufferAttribute(position, i);

    vertex.x += Math.random() * 20 - 10;
    vertex.y += Math.random() * 2;
    vertex.z += Math.random() * 20 - 10;

    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

  position = floorGeometry.attributes.position;
  const colorsFloor = [];

  for (let i = 0, l = position.count; i < l; i++) {
    color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    colorsFloor.push(color.r, color.g, color.b);
  }

  floorGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsFloor, 3));

  const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);

  //Terrain
  objLoader.load('/island.obj',
    function (terrain) {
      terrain.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = mat_plane;
        }
      });
      group.add(terrain);
    }
  );


  group.add(floor);

  function addStar() {
    const geometry = new THREE.SphereGeometry(0.3, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0x000 });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000));

    star.position.set(x, y, z);
    scene.add(star);
    group.add(star);
  }
  Array(1200).fill().forEach(addStar);

  return group;
}


//
//Realm of Many Doors Scene
//
function RMDScene() {
  scene = scene_rmd;

  //Fog and Background
  //
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 0, 750);

  scene.add(group_rmd);
}

function GetGroupRMD() {
  let group = new THREE.Group();

  //Lighting
  let rmd_dir_light = new DirectionalLight(0xffffff, 1);
  scene.add(rmd_dir_light);
  group.add(rmd_dir_light);

  // floor
  let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 80, 80);
  floorGeometry.rotateX(- Math.PI / 2);

  // vertex displacement
  let position = floorGeometry.attributes.position;

  for (let i = 0, l = position.count; i < l; i++) {

    vertex.fromBufferAttribute(position, i);

    vertex.x += Math.random() * 20 - 10;
    vertex.y += Math.random() * 2;
    vertex.z += Math.random() * 20 - 10;

    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

  position = floorGeometry.attributes.position;

  const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  group.add(floor);

  function addStar() {
    const geometry = new THREE.SphereGeometry(0.3, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0xfff });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000));

    star.position.set(x, y, z);
    scene.add(star);
    group.add(star);
  }
  Array(1200).fill().forEach(addStar);

  return group;
}

//
// Custom Functions
//
function DisposeGroup(groupToRemove) {
  scene.remove(groupToRemove);
  console.log("removed: " + groupToRemove);
}

function SwitchScenes(sceneFrom, sceneTo) {
  //scene coming From
  if (sceneFrom == "intro") {
    DisposeGroup(group_intro);
  }
  if (sceneFrom == "rmd") {
    DisposeGroup(group_rmd);
  }

  //scene going To
  if (sceneTo == "intro") {
    IntroScene();
  }
  if (sceneTo == "rmd") {
    RMDScene();
  }

  scene.add(controls.getObject());
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//
// Update Loop
//
const clock = new THREE.Clock();
function animate() {
  const elapsedTime = clock.getElapsedTime();
  console.log("elapsed Time: " + elapsedTime);
  requestAnimationFrame(animate);

  const time = performance.now();

  if (controls.isLocked === true) {

    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects, false);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 12.0 * delta;
    velocity.z -= velocity.z * 12.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(- velocity.x * delta);
    controls.moveForward(- velocity.z * delta);

    controls.getObject().position.y += (velocity.y * delta); // new behavior

    if (controls.getObject().position.y < 20) {
      velocity.y = 0;
      controls.getObject().position.y = 20;

      canJump = true;
    }
  }

  prevTime = time;

  renderer.render(scene, camera);
}

animate();
init();

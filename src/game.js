import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { world, groundMaterial } from './physics.js';
import { scene, textureLoader } from './scene.js';
import { updateScore, showMessage, hideMessage } from './ui.js';
import { Ball } from './components/Ball.js';
import { Goal } from './components/Goal.js';
import { Goalkeeper } from './components/Goalkeeper.js';

// --- Game Elements ---
let score = 0;

// Floor
const grassTexture = textureLoader.load('assets/grass.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(10, 10);

const floorMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ map: grassTexture })
);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);

const floorBody = new CANNON.Body({
  mass: 0, // mass = 0 makes it static
  shape: new CANNON.Plane(),
  material: groundMaterial,
});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(floorBody);

const ball = new Ball();
const goal = new Goal();
const goalkeeper = new Goalkeeper();

// --- Game Logic & Controls ---
let isKicked = false;
let isResetting = false;
let kickStartTime = 0;

function kickBall(force) {
  if (isKicked) return;
  isKicked = true;
  isResetting = false; // Allow goal checking again
  hideMessage();

  ball.body.wakeUp(); // Wake the ball up before applying force
  kickStartTime = performance.now();

  ball.body.applyImpulse(force, ball.body.position);
}

function resetBall() {
  isKicked = false;
  isResetting = true; // Prevent goal check during reset
  ball.reset();

  showMessage('Swipe to Kick');
}

function checkGoal() {
  if (isResetting) return; // Don't check if we're already resetting

  const elapsedTime = performance.now() - kickStartTime;

  // Check for a goal
  if (ball.body.position.z < -goal.depth / 2 &&
    ball.body.position.y < goal.height &&
    Math.abs(ball.body.position.x) < goal.width / 2) {
    score++;
    updateScore(score);
    showMessage('GOAL!');
    isResetting = true;
    setTimeout(resetBall, 2000);
  }
  // Check for a miss (out of bounds or timeout)
  else if (ball.body.position.z < -goal.depth || elapsedTime > 5000) {
    showMessage('MISS!');
    isResetting = true;
    setTimeout(resetBall, 2000);
  }
}

function update() {
    goalkeeper.update();

    // Check for goal or miss
    if (isKicked) {
        checkGoal();
    }

    ball.update();
}

export { kickBall, resetBall, checkGoal, update };

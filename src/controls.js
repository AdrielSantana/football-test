import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { kickBall } from './game.js';
import { renderer } from './scene.js';

let startMouse = new THREE.Vector2();
let endMouse = new THREE.Vector2();

renderer.domElement.addEventListener('mousedown', (event) => {
  startMouse.set(event.clientX, event.clientY);
});

renderer.domElement.addEventListener('mouseup', (event) => {
  endMouse.set(event.clientX, event.clientY);
  
  const swipeVector = new THREE.Vector2().subVectors(endMouse, startMouse);

  // Base force calculation
  const force = new CANNON.Vec3(swipeVector.x * 0.05, Math.abs(swipeVector.y) * 0.05, -15);

  // Clamp the force magnitude to a maximum value
  const maxForce = 15;
  if (force.length() > maxForce) {
    force.normalize();
    force.scale(maxForce, force);
  }

  kickBall(force);
});

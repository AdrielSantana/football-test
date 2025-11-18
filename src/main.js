import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { scene, camera, renderer } from './scene.js';
import { world } from './physics.js';
import { update } from './game.js';
import './controls.js';

// --- Animation Loop ---
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();

  // Update physics world
  world.step(1 / 60, deltaTime, 3);

  // Update game logic
  update(deltaTime);

  renderer.render(scene, camera);
}

animate();

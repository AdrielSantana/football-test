import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { world } from '../physics.js';
import { scene } from '../scene.js';

class Goalkeeper {
  constructor() {
    this.height = 1.8;
    const torsoHeight = 1;
    const headRadius = 0.25;

    // Create a group to hold all the parts of the goalkeeper
    this.mesh = new THREE.Group();

    // Material
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    // Torso
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, torsoHeight, 16), material);
    torso.castShadow = true;
    this.mesh.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(headRadius, 16, 16), material);
    head.position.y = torsoHeight / 2 + headRadius;
    head.castShadow = true;
    this.mesh.add(head);

    scene.add(this.mesh);

    // Physics body
    this.body = new CANNON.Body({
      mass: 80,
      position: new CANNON.Vec3(0, 0.5, 0),
      fixedRotation: true,
      // angularDamping: 1,
    });
    // Compound shape for better physics
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(0.3, torsoHeight / 2, 0.3)), new CANNON.Vec3(0, 0, 0));
    this.body.addShape(new CANNON.Sphere(headRadius), new CANNON.Vec3(0, torsoHeight / 2 + headRadius, 0));
    world.addBody(this.body);

    this.direction = 1; 1
  }

  update() {
    if (this.body.position.x > 2.5) this.direction = -1;
    if (this.body.position.x < -2.5) this.direction = 1;
    this.body.velocity.x = this.direction * 15;

    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}

export { Goalkeeper };

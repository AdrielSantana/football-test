import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { world } from '../physics.js';
import { scene } from '../scene.js';

class Goalkeeper {
  constructor() {
    this.width = 1;
    this.height = 1.8;
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(this.width, this.height, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    this.mesh.castShadow = true;
    scene.add(this.mesh);

    this.body = new CANNON.Body({
      mass: 80,
      shape: new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, 0.25)),
      position: new CANNON.Vec3(0, this.height / 2, 0),
      fixedRotation: true,
      angularDamping: 1.0,
    });
    world.addBody(this.body);

    this.direction = 1;
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

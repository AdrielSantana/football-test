import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { world, ballMaterial } from '../physics.js';
import { scene, textureLoader } from '../scene.js';

class Ball {
  constructor() {
    this.radius = 0.22;
    this.texture = textureLoader.load('assets/soccer.png');
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, 32, 32),
      new THREE.MeshStandardMaterial({ map: this.texture })
    );
    this.mesh.castShadow = true;
    scene.add(this.mesh);

    this.body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(this.radius),
      material: ballMaterial,
      position: new CANNON.Vec3(0, this.radius, 10),
    });
    world.addBody(this.body);
  }

  reset() {
    this.body.position.set(0, this.radius - 0.01, 10);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 0), 0);
    this.body.sleep();
  }

  update() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}

export { Ball };

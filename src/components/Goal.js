import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { world } from '../physics.js';
import { scene, textureLoader } from '../scene.js';

class Goal {
  constructor() {
    this.width = 8;
    this.height = 3;
    this.depth = 2;

    const postMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 });
    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(this.width, 0.2, 0.2), postMaterial);
    crossbar.position.y = this.height;
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.2, this.height, 0.2), postMaterial);
    leftPost.position.set(-this.width / 2, this.height / 2, 0);
    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.2, this.height, 0.2), postMaterial);
    rightPost.position.set(this.width / 2, this.height / 2, 0);

    const netTexture = textureLoader.load('assets/net.png');
    const netMaterial = new THREE.MeshStandardMaterial({
      map: netTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const netMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), netMaterial);
    netMesh.position.y = this.height / 2;
    netMesh.position.z = -this.depth / 2;

    this.mesh = new THREE.Group();
    this.mesh.add(crossbar, leftPost, rightPost, netMesh);
    scene.add(this.mesh);

    this.body = new CANNON.Body({ mass: 0 });
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(this.width / 2, 0.1, this.depth / 2)), new CANNON.Vec3(0, this.height, 0));
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(0.1, this.height / 2, this.depth / 2)), new CANNON.Vec3(-this.width / 2, this.height / 2, 0));
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(0.1, this.height / 2, this.depth / 2)), new CANNON.Vec3(this.width / 2, this.height / 2, 0));
    world.addBody(this.body);
  }
}

export { Goal };

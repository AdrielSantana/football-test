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

    // Remove the old single net mesh
    // const netMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), netMaterial);
    // netMesh.position.y = this.height / 2;
    // netMesh.position.z = -this.depth / 2;

    // Create a box-like net
    const backNet = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), netMaterial);
    backNet.position.y = this.height / 2;
    backNet.position.z = -this.depth;

    const leftNet = new THREE.Mesh(new THREE.PlaneGeometry(this.depth, this.height), netMaterial);
    leftNet.position.x = -this.width / 2;
    leftNet.position.y = this.height / 2;
    leftNet.position.z = -this.depth / 2;
    leftNet.rotation.y = Math.PI / 2;

    const rightNet = new THREE.Mesh(new THREE.PlaneGeometry(this.depth, this.height), netMaterial);
    rightNet.position.x = this.width / 2;
    rightNet.position.y = this.height / 2;
    rightNet.position.z = -this.depth / 2;
    rightNet.rotation.y = -Math.PI / 2;
    
    const topNet = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.depth), netMaterial);
    topNet.position.y = this.height;
    topNet.position.z = -this.depth / 2;
    topNet.rotation.x = -Math.PI / 2;


    this.mesh = new THREE.Group();
    this.mesh.add(crossbar, leftPost, rightPost, backNet, leftNet, rightNet, topNet);
    scene.add(this.mesh);

    this.body = new CANNON.Body({ mass: 0 });
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(this.width / 2, 0.1, this.depth / 2)), new CANNON.Vec3(0, this.height, 0));
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(0.1, this.height / 2, this.depth / 2)), new CANNON.Vec3(-this.width / 2, this.height / 2, 0));
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(0.1, this.height / 2, this.depth / 2)), new CANNON.Vec3(this.width / 2, this.height / 2, 0));
    world.addBody(this.body);

    // Add physics for the net using thin boxes
    const netBodies = [
        // Back net
        { position: [0, this.height / 2, -this.depth], shape: new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, 0.01)) },
        // Left net
        { position: [-this.width / 2, this.height / 2, -this.depth / 2], shape: new CANNON.Box(new CANNON.Vec3(0.01, this.height / 2, this.depth / 2)) },
        // Right net
        { position: [this.width / 2, this.height / 2, -this.depth / 2], shape: new CANNON.Box(new CANNON.Vec3(0.01, this.height / 2, this.depth / 2)) },
        // Top net
        { position: [0, this.height, -this.depth / 2], shape: new CANNON.Box(new CANNON.Vec3(this.width / 2, 0.01, this.depth / 2)) }
    ];

    netBodies.forEach(data => {
        const body = new CANNON.Body({ mass: 0 });
        body.addShape(data.shape);
        body.position.set(...data.position);
        world.addBody(body);
    });
  }
}

export { Goal };

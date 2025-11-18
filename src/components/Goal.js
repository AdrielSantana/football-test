import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { world } from '../physics.js';
import { scene, textureLoader } from '../scene.js';

class Goal {
  constructor() {
    this.width = 8;
    this.height = 3;
    this.depth = 2;
    const postRadius = 0.1;

    // Materials
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.1 });
    const supportMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.5 });
    const netTexture = textureLoader.load('assets/net.png');
    const netMaterial = new THREE.MeshStandardMaterial({
      map: netTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Group();

    // --- Visuals ---

    // 1. Front Frame (Posts & Crossbar)
    const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, this.height, 16);
    const crossbarGeo = new THREE.CylinderGeometry(postRadius, postRadius, this.width, 16);
    const jointGeo = new THREE.SphereGeometry(postRadius, 16, 16); // Smooth joints

    const leftPost = new THREE.Mesh(postGeo, postMaterial);
    leftPost.position.set(-this.width / 2, this.height / 2, 0);
    
    const rightPost = new THREE.Mesh(postGeo, postMaterial);
    rightPost.position.set(this.width / 2, this.height / 2, 0);

    const crossbar = new THREE.Mesh(crossbarGeo, postMaterial);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, this.height, 0);

    // Front Top Joints
    const topLeftJoint = new THREE.Mesh(jointGeo, postMaterial);
    topLeftJoint.position.set(-this.width / 2, this.height, 0);

    const topRightJoint = new THREE.Mesh(jointGeo, postMaterial);
    topRightJoint.position.set(this.width / 2, this.height, 0);

    this.mesh.add(leftPost, rightPost, crossbar, topLeftJoint, topRightJoint);

    // 2. Support Frame (Back & Sides)
    const supportRadius = 0.05;
    const supportGeoV = new THREE.CylinderGeometry(supportRadius, supportRadius, this.height, 8);
    const supportGeoH = new THREE.CylinderGeometry(supportRadius, supportRadius, this.width, 8);
    const supportGeoD = new THREE.CylinderGeometry(supportRadius, supportRadius, this.depth, 8);
    const supportJointGeo = new THREE.SphereGeometry(supportRadius, 8, 8); // Smaller joints for support

    // Back Posts
    const backLeftPost = new THREE.Mesh(supportGeoV, supportMaterial);
    backLeftPost.position.set(-this.width / 2, this.height / 2, -this.depth);

    const backRightPost = new THREE.Mesh(supportGeoV, supportMaterial);
    backRightPost.position.set(this.width / 2, this.height / 2, -this.depth);

    // Top Side Bars
    const topLeftBar = new THREE.Mesh(supportGeoD, supportMaterial);
    topLeftBar.rotation.x = Math.PI / 2;
    topLeftBar.position.set(-this.width / 2, this.height, -this.depth / 2);

    const topRightBar = new THREE.Mesh(supportGeoD, supportMaterial);
    topRightBar.rotation.x = Math.PI / 2;
    topRightBar.position.set(this.width / 2, this.height, -this.depth / 2);

    // Bottom Side Bars
    const bottomLeftBar = new THREE.Mesh(supportGeoD, supportMaterial);
    bottomLeftBar.rotation.x = Math.PI / 2;
    bottomLeftBar.position.set(-this.width / 2, 0, -this.depth / 2);

    const bottomRightBar = new THREE.Mesh(supportGeoD, supportMaterial);
    bottomRightBar.rotation.x = Math.PI / 2;
    bottomRightBar.position.set(this.width / 2, 0, -this.depth / 2);

    // Back Horizontal Bars (Top & Bottom)
    const backTopBar = new THREE.Mesh(supportGeoH, supportMaterial);
    backTopBar.rotation.z = Math.PI / 2;
    backTopBar.position.set(0, this.height, -this.depth);

    const backBottomBar = new THREE.Mesh(supportGeoH, supportMaterial);
    backBottomBar.rotation.z = Math.PI / 2;
    backBottomBar.position.set(0, 0, -this.depth);

    // Support Joints
    const backTopLeftJoint = new THREE.Mesh(supportJointGeo, supportMaterial);
    backTopLeftJoint.position.set(-this.width / 2, this.height, -this.depth);

    const backTopRightJoint = new THREE.Mesh(supportJointGeo, supportMaterial);
    backTopRightJoint.position.set(this.width / 2, this.height, -this.depth);

    const backBottomLeftJoint = new THREE.Mesh(supportJointGeo, supportMaterial);
    backBottomLeftJoint.position.set(-this.width / 2, 0, -this.depth);

    const backBottomRightJoint = new THREE.Mesh(supportJointGeo, supportMaterial);
    backBottomRightJoint.position.set(this.width / 2, 0, -this.depth);

    this.mesh.add(backLeftPost, backRightPost, topLeftBar, topRightBar, bottomLeftBar, bottomRightBar, backTopBar, backBottomBar);
    this.mesh.add(backTopLeftJoint, backTopRightJoint, backBottomLeftJoint, backBottomRightJoint);

    // 3. Net
    // Back Net
    const backNet = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), netMaterial);
    backNet.position.set(0, this.height / 2, -this.depth);
    
    // Side Nets
    const leftNet = new THREE.Mesh(new THREE.PlaneGeometry(this.depth, this.height), netMaterial);
    leftNet.position.set(-this.width / 2, this.height / 2, -this.depth / 2);
    leftNet.rotation.y = Math.PI / 2;

    const rightNet = new THREE.Mesh(new THREE.PlaneGeometry(this.depth, this.height), netMaterial);
    rightNet.position.set(this.width / 2, this.height / 2, -this.depth / 2);
    rightNet.rotation.y = -Math.PI / 2;

    // Top Net
    const topNet = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.depth), netMaterial);
    topNet.position.set(0, this.height, -this.depth / 2);
    topNet.rotation.x = -Math.PI / 2;

    this.mesh.add(backNet, leftNet, rightNet, topNet);
    
    scene.add(this.mesh);

    // --- Physics ---
    this.body = new CANNON.Body({ mass: 0 });

    // Colliders for the solid frame (Posts & Crossbar)
    // Crossbar
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(this.width / 2, postRadius, postRadius)), new CANNON.Vec3(0, this.height, 0));
    // Left Post
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(postRadius, this.height / 2, postRadius)), new CANNON.Vec3(-this.width / 2, this.height / 2, 0));
    // Right Post
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(postRadius, this.height / 2, postRadius)), new CANNON.Vec3(this.width / 2, this.height / 2, 0));

    world.addBody(this.body);

    // Colliders for the Net (to catch the ball)
    const netThickness = 0.05; // Slightly thicker to prevent tunneling
    const netBodies = [
        // Back net
        { position: [0, this.height / 2, -this.depth], shape: new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, netThickness)) },
        // Left net
        { position: [-this.width / 2, this.height / 2, -this.depth / 2], shape: new CANNON.Box(new CANNON.Vec3(netThickness, this.height / 2, this.depth / 2)) },
        // Right net
        { position: [this.width / 2, this.height / 2, -this.depth / 2], shape: new CANNON.Box(new CANNON.Vec3(netThickness, this.height / 2, this.depth / 2)) },
        // Top net
        { position: [0, this.height, -this.depth / 2], shape: new CANNON.Box(new CANNON.Vec3(this.width / 2, netThickness, this.depth / 2)) }
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

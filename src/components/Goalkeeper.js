import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/FBXLoader.js';
import { world } from '../physics.js';
import { scene } from '../scene.js';

class Goalkeeper {
  constructor() {
    this.height = 1.8;
    const torsoHeight = 1.4;
    const headRadius = 0.35;

    // Create a group to hold all the parts of the goalkeeper
    this.mesh = new THREE.Group();
    scene.add(this.mesh);

    // Dedicated light for the goalkeeper
    const keeperLight = new THREE.PointLight(0xffffff, 1, 10);
    keeperLight.position.set(0, 0, 2);
    this.mesh.add(keeperLight);

    // Load FBX Model
    const loader = new FBXLoader();
    loader.load('assets/goal_keeper_model.fbx', (object) => {
      object.scale.set(0.014, 0.014, 0.014);
      object.position.y = -1; // correct height
      object.rotation.y = 0; // Face the camera

      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const meshName = child.name.toLowerCase();

          if (child.material) {
            const isArray = Array.isArray(child.material);
            let materials = isArray ? child.material : [child.material];

            // Check if this mesh is part of the kit (shirt, shorts, socks)
            if (meshName.includes('shirt') || meshName.includes('shorts') || meshName.includes('socks')) {
              // Clone materials to avoid affecting shared materials (like skin)
              materials = materials.map(m => m.clone());
              if (isArray) child.material = materials;
              else child.material = materials[0];

              materials.forEach(m => {
                if (m.color) m.color.setHex(0x0000FF); // Blue Kit
              });
            } else {
              // For body, hair, shoes, etc., ensure white base so texture shows correctly
              materials.forEach(m => {
                if (m.color) m.color.setHex(0xffffff);
              });
            }
          }
        }
      });

      this.mesh.add(object);

      // Animation Mixer
      this.mixer = new THREE.AnimationMixer(object);
      if (object.animations && object.animations.length > 0) {
        const animation = object.animations[1]; // correct index
        // Remove position tracks to prevent root motion
        animation.tracks = animation.tracks.filter(track => !track.name.endsWith('.position'));

        const action = this.mixer.clipAction(animation);
        action.play();
      }
    });

    // Physics body
    this.body = new CANNON.Body({
      mass: 80,
      position: new CANNON.Vec3(0, 0.7, 0),
      fixedRotation: true,
      // angularDamping: 1,
    });
    // Compound shape for better physics
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(0.3, torsoHeight / 2, 0.3)), new CANNON.Vec3(0, 0, 0));
    this.body.addShape(new CANNON.Sphere(headRadius), new CANNON.Vec3(0, torsoHeight / 2 + headRadius, 0));
    world.addBody(this.body);

    this.direction = 1;
  }

  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }

    if (this.body.position.x > 2.5) this.direction = -1;
    if (this.body.position.x < -2.5) this.direction = 1;
    this.body.velocity.x = this.direction * 15;

    // Mirror the mesh based on direction
    if (this.direction === 1) {
      this.mesh.scale.x = 1;
    } else {
      this.mesh.scale.x = -1;
    }

    this.mesh.position.copy(this.body.position);
  }
}

export { Goalkeeper };

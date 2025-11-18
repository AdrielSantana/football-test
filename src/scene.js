import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

// --- Basic Three.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.set(0, 2, 14);
camera.lookAt(0, 1, 0);

// --- Texture Loader ---
const textureLoader = new THREE.TextureLoader();

scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// --- Stadium Stands ---
const adTexture1 = textureLoader.load('assets/ads_1.png');
const adTexture2 = textureLoader.load('assets/ads_2.png');

const adMaterials = [
    new THREE.MeshStandardMaterial({ map: adTexture1 }),
    new THREE.MeshStandardMaterial({ map: adTexture2 })
];

const numAds = 30;
const adWidth = 2;
const adSpacing = 0;
const totalWidth = numAds * adWidth + (numAds - 1) * adSpacing;

for (let i = 0; i < numAds; i++) {
    const adMesh = new THREE.Mesh(
        new THREE.BoxGeometry(adWidth, 2, 0.5),
        adMaterials[i % 2]
    );
    adMesh.position.set(-totalWidth / 2 + adWidth / 2 + i * (adWidth + adSpacing), 1, -4);
    scene.add(adMesh);
}

// --- Field Lines ---
const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

const goalLine = new THREE.Mesh(new THREE.BoxGeometry(60, 0.01, 0.5), lineMaterial);
goalLine.position.set(0, 0, 0);
goalLine.receiveShadow = true
scene.add(goalLine);

const penaltySpot = new THREE.Mesh(new THREE.CircleGeometry(0.25, 16), lineMaterial);
penaltySpot.position.set(0, 0.01, 10);
penaltySpot.rotation.set(-Math.PI / 2, 0, 0);
penaltySpot.receiveShadow = true
scene.add(penaltySpot);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.2);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.position.set(-10, 20, 10);
directionalLight.castShadow = true;
// Shadow properties
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
scene.add(directionalLight);

// Spotlights
const spotLight1 = new THREE.SpotLight(0xffffff, 0.4);
spotLight1.position.set(15, 25, 15);
spotLight1.angle = Math.PI / 8;
spotLight1.penumbra = 0.1;
spotLight1.castShadow = true;
spotLight1.target.position.set(0, 0, 0);
scene.add(spotLight1);
scene.add(spotLight1.target);

const spotLight2 = new THREE.SpotLight(0xffffff, 0.4);
spotLight2.position.set(-15, 25, 15);
spotLight2.angle = Math.PI / 8;
spotLight2.penumbra = 0.1;
spotLight2.castShadow = true;
spotLight2.target.position.set(0, 0, 0);
scene.add(spotLight2);
scene.add(spotLight2.target);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

export { scene, camera, renderer, textureLoader };

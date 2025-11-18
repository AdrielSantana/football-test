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

scene.background = new THREE.Color(0x111111); // Sky blue background

// --- Stadium Stands ---
const adTexture = textureLoader.load('assets/elgin_logo.png');

const adMaterial = new THREE.MeshStandardMaterial({ map: adTexture, transparent: true })

const numAds = 20;
const adWidth = 2;
const adSpacing = 1;
const totalWidth = numAds * adWidth + (numAds - 1) * adSpacing;

for (let i = 0; i < numAds; i++) {
    const adMesh = new THREE.Mesh(
        new THREE.BoxGeometry(adWidth, 2, 0.5),
        adMaterial
    );
    adMesh.position.set(-totalWidth / 2 + adWidth / 2 + i * (adWidth + adSpacing), 1, -4);
    scene.add(adMesh);
}

// --- Floodlights ---
function createFloodlightTower(x, z) {
    const poleHeight = 9;
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, poleHeight),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    pole.position.set(x, poleHeight / 2 - 1, z);
    scene.add(pole);

    const head = new THREE.Mesh(
        new THREE.BoxGeometry(3, 2, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    head.position.set(x, poleHeight, z);
    head.lookAt(0, 0, 5); // Face the field
    scene.add(head);

    // Volumetric Light Beam (Godray)
    // Reduced radius to 1.2 to fit individual bulbs
    const beamGeometry = new THREE.ConeGeometry(1.2, 20, 32, 1, true);
    // Adjust geometry to start at origin and point +Z
    beamGeometry.translate(0, -10, 0);
    beamGeometry.rotateX(-Math.PI / 2);
    
    // Custom Shader for soft volumetric look
    const beamMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0x116DFF) },
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            uniform vec3 color;
            void main() {
                // Fade from tip (v=1) to base (v=0)
                float intensity = pow(vUv.y, 3.0);
                
                // Fresnel effect: brighter at the edges to simulate volume thickness
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float fresnel = dot(normal, viewDir);
                fresnel = clamp(1.0 - abs(fresnel), 0.0, 1.0);
                
                // Combine: Base intensity + Fresnel boost
                float alpha = intensity * (0.1 + fresnel * 0.2);
                
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });

    // Bulbs (Visual only)
    const bulbGeo = new THREE.CircleGeometry(0.3, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xadcdff });
    
    const positions = [
        { ox: -0.8, oy: 0.5 }, { ox: 0.8, oy: 0.5 },
        { ox: 0, oy: 0.5 }, { ox: 0, oy: -0.5 },
        { ox: -0.8, oy: -0.5 }, { ox: 0.8, oy: -0.5 }
    ];

    positions.forEach(pos => {
        // Bulb
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(pos.ox, pos.oy, 0.3); // Slightly in front
        head.add(bulb);

        // Beam
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(pos.ox, pos.oy, 0.3); // Start at bulb
        head.add(beam);
    });

    // Actual Light
    const spot = new THREE.SpotLight(0xffffff, 0.2);
    spot.castShadow = true;
    spot.position.set(x, poleHeight, z);
    spot.angle = Math.PI / 5;
    spot.penumbra = 0.3;
    spot.target.position.set(0, 0, 5);
    scene.add(spot);
    scene.add(spot.target);
}

// Add two towers in the background
createFloodlightTower(-6, -15);
createFloodlightTower(6, -15);

// --- Stadium Walls ---

const stadiumWallsMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const stadiumWalls = new THREE.Mesh(new THREE.BoxGeometry(40, 3, 1), stadiumWallsMaterial);
stadiumWalls.position.set(0, 0.5, -4.27);
stadiumWalls.receiveShadow = true
scene.add(stadiumWalls);

// --- Field Lines ---
const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

const goalLine = new THREE.Mesh(new THREE.BoxGeometry(60, 0.01, 0.5), lineMaterial);
goalLine.position.set(0, 0, 0);
goalLine.receiveShadow = true
scene.add(goalLine);

const penaltySpot = new THREE.Mesh(new THREE.CircleGeometry(0.25, 64), lineMaterial);
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

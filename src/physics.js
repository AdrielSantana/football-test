// --- Physics Setup (Cannon.js) ---
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Realistic gravity

// Materials for physics
const groundMaterial = new CANNON.Material('groundMaterial');
const ballMaterial = new CANNON.Material('ballMaterial');
const contactMaterial = new CANNON.ContactMaterial(groundMaterial, ballMaterial, {
  friction: 0.4,
  restitution: 0.7, // Bounciness
});
world.addContactMaterial(contactMaterial);

export { world, groundMaterial, ballMaterial };

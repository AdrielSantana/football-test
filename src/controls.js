import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { kickBall } from './game.js';
import { renderer } from './scene.js';

let startPos = new THREE.Vector2();
let endPos = new THREE.Vector2();

function getClientCoordinates(event) {
    if (event.changedTouches && event.changedTouches.length > 0) {
        return {
            x: event.changedTouches[0].clientX,
            y: event.changedTouches[0].clientY
        };
    }
    return {
        x: event.clientX,
        y: event.clientY
    };
}

function onInputStart(event) {
    const coords = getClientCoordinates(event);
    startPos.set(coords.x, coords.y);
}

function onInputEnd(event) {
    const coords = getClientCoordinates(event);
    endPos.set(coords.x, coords.y);
    
    const swipeVector = new THREE.Vector2().subVectors(endPos, startPos);

    // Base force calculation
    const force = new CANNON.Vec3(swipeVector.x * 0.05, Math.abs(swipeVector.y) * 0.05, -15);

    // Clamp the force magnitude to a maximum value
    const maxForce = 15;
    if (force.length() > maxForce) {
        force.normalize();
        force.scale(maxForce, force);
    }

    kickBall(force);
}

// Mouse Events
renderer.domElement.addEventListener('mousedown', onInputStart);
renderer.domElement.addEventListener('mouseup', onInputEnd);

// Touch Events
renderer.domElement.addEventListener('touchstart', (event) => {
    // Prevent default to avoid scrolling/refreshing on some browsers
    event.preventDefault();
    onInputStart(event);
}, { passive: false });

renderer.domElement.addEventListener('touchend', (event) => {
    event.preventDefault();
    onInputEnd(event);
}, { passive: false });

// Prevent scrolling during swipe
renderer.domElement.addEventListener('touchmove', (event) => {
    event.preventDefault();
}, { passive: false });
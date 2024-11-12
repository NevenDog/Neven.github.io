import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();
const instanceCount = 500;
let instancedMesh;
const rotationAxes = [];
const rotationSpeeds = [];

loader.load('/Export.glb', (gltf) => {
    const gondola = gltf.scene.children[0];
    const originalMaterial = gondola.material;
    instancedMesh = new THREE.InstancedMesh(gondola.geometry, originalMaterial, instanceCount);

    const matrix = new THREE.Matrix4();
    const scale = 0.5;

    for (let i = 0; i < instanceCount; i++) {
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        matrix.makeScale(scale, scale, scale);
        matrix.setPosition(x, y, z);
        instancedMesh.setMatrixAt(i, matrix);

        rotationAxes.push(new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize());
        rotationSpeeds.push((Math.random() - 0.5) * 0.05);
    }

    scene.add(instancedMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff,2);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(1, 1, 1);
    scene.add(ambientLight);
    scene.add(directionalLight);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);

    if (instancedMesh) {
        const matrix = new THREE.Matrix4();

        for (let i = 0; i < instanceCount; i++) {
            instancedMesh.getMatrixAt(i, matrix);

            matrix.multiply(new THREE.Matrix4().makeRotationAxis(rotationAxes[i], rotationSpeeds[i]));

            instancedMesh.setMatrixAt(i, matrix);
        }

        instancedMesh.instanceMatrix.needsUpdate = true;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();


import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Додаємо OrbitControls

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xCBEFFF, 1);

document.body.appendChild(renderer.domElement);

// Додаємо управління камерою мишкою через OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Додаємо плавність рухів (інерцію)
controls.dampingFactor = 0.05; // Сила інерції
controls.screenSpacePanning = false; // Вимикаємо переміщення в площині екрану
controls.minDistance = 1; // Мінімальна відстань для зуму
controls.maxDistance = 10; // Максимальна відстань для зуму
controls.maxPolarAngle = Math.PI / 2; // Обмежуємо кут обертання по вертикалі (щоб не заходити під підлогу)

// Додаємо освітлення
const lightOne = new THREE.AmbientLight(0xffffff, 0.5); // М'яке загальне освітлення
scene.add(lightOne);

const lightTwo = new THREE.PointLight(0xffffff, 1.0); // Збільшуємо інтенсивність точкового світла
lightTwo.position.set(-1.5, 1, -1); // Піднімаємо світло вгору
scene.add(lightTwo);

const light3 = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(light3);

// Налаштовуємо початкову позицію камери
camera.position.set(0, 1, 3); // Піднімаємо камеру вгору і відсуваємо
camera.lookAt(0, 0, 0); // Направляємо камеру на центр сцени

const progress = document.getElementById("progress");

const loader = new GLTFLoader();

loader.load(
    '../assets/dog.glb', // Локальний шлях до моделі
    function (gltf) {
        console.log(gltf); // Перевіряємо, чи модель завантажилася
        scene.add(gltf.scene);
        gltf.scene.rotation.set(0, -Math.PI / 2, 0); // Поворот моделі
        gltf.scene.position.set(0, 0, 0); // Центруємо модель
        gltf.scene.scale.set(0.5, 0.5, 0.5); // Масштабуємо модель
    },
    function (xhr) {
        progress.innerHTML = (xhr.loaded / xhr.total * 100) + '% loaded';
        if (xhr.loaded == xhr.total)
            progress.innerHTML = "";
    },
    function (error) {
        console.error(error); // Логуємо помилки, якщо вони є
    }
);

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Оновлюємо OrbitControls на кожному кадрі
    renderer.render(scene, camera);
}

animate();

// Додаємо обробник для зміни розміру вікна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

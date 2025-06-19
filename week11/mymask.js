import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';


window.addEventListener("DOMContentLoaded", async () => {

	const mindarThree = new MindARThree({
		container: document.body,
	});
 
	const {renderer, scene, camera, video} = mindarThree;

	var lightOne=new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(lightOne);

	const light3 = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
	scene.add( light3 );

      	const faceMesh = mindarThree.addFaceMesh();

	const loader = new THREE.TextureLoader();

	const texture = loader.load( '../assets/mymask-removebg-preview.png' );
	faceMesh.material.map = texture;
	faceMesh.material.transparent = true;
	faceMesh.material.needsUpdate = true;
	scene.add(faceMesh);

	await mindarThree.start();


	renderer.setAnimationLoop(() => {
		renderer.render(scene, camera);
	});
});

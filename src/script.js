import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons';
import GUI from 'lil-gui';

const gui = new GUI();

// Sizes
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Base Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(-1, 4, 5);
scene.add(camera);

// Textures
const textureLoader = new THREE.TextureLoader();

// Galaxy
const parameters = {
	count: 100000,
	size: 0.01,
	radius: 5,
	branches: 6,
	spin: 0.909,
	randomness: 0.2,
	randomnessPower: 3,
	insideColor: '#ff6030',
	outsideColor: '#1b3984',
};
let particleGeometry, particleMaterial, particles;
const generateGalaxy = function () {
	// Dispose of old galaxy
	if (particles) {
		particleGeometry.dispose();
		particleMaterial.dispose();
		scene.remove(particles);
	}

	// Geometry
	particleGeometry = new THREE.BufferGeometry();

	// Position and colors
	const particlePosition = new Float32Array(parameters.count * 3); // x, y, z
	const colors = new Float32Array(parameters.count * 3); // r, g, b
	const colorOutside = new THREE.Color(parameters.outsideColor);
	const colorInside = new THREE.Color(parameters.insideColor);

	for (let i = 0; i < particlePosition.length; i++) {
		const i3 = i * 3;

		// Position
		const radius = Math.random() * parameters.radius;
		const spinAngle = radius * parameters.spin;
		const branchAngle = ((i % parameters.branches) / parameters.branches) * 2 * Math.PI;

		const randomX =
			Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
		const randomY =
			Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
		const randomZ =
			Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

		particlePosition[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX; // x-axis
		particlePosition[i3 + 1] = randomY; //  y-axis
		particlePosition[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ; //  z-axis

		// Colors
		const mixedColor = colorInside.clone();
		mixedColor.lerp(colorOutside, radius / parameters.radius);

		colors[i3 + 0] = mixedColor.r;
		colors[i3 + 1] = mixedColor.g;
		colors[i3 + 2] = mixedColor.b;
	}
	particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePosition, 3));
	particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

	// Material
	particleMaterial = new THREE.PointsMaterial({
		size: parameters.size,
		sizeAttenuation: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexColors: true,
	});

	// Particles
	particles = new THREE.Points(particleGeometry, particleMaterial);

	// Add to the scene
	scene.add(particles);
};
generateGalaxy();

// GUI
gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, 'size').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Resize
window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();
const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Update particles
	particles.rotation.y = elapsedTime * 0.3;

	// Call tick
	window.requestAnimationFrame(tick);
};
tick();

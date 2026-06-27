import './style.css';
import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// POSTPROCESSING
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';

// ---------------- SCENE ----------------

const scene = new THREE.Scene();

// ---------------- CAMERA ----------------

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 0, 6);

// ---------------- RENDERER ----------------

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
  alpha: true,
  
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// colors
renderer.outputColorSpace = THREE.SRGBColorSpace;

// tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1;

// shadows
renderer.shadowMap.enabled = true;

// ---------------- POSTPROCESSING ----------------

const composer = new EffectComposer(renderer);

// normal render pass
const renderPass = new RenderPass(scene, camera);

composer.addPass(renderPass);

// RGB SHIFT PASS
const rgbShiftPass = new ShaderPass(RGBShiftShader);

// strength of RGB split
rgbShiftPass.uniforms['amount'].value = 0.0015;

composer.addPass(rgbShiftPass);

// ---------------- LIGHTS ----------------

// ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);

scene.add(ambientLight);

// directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);

directionalLight.position.set(5, 5, 5);

directionalLight.castShadow = true;

scene.add(directionalLight);

// ---------------- HDRI ----------------

const rgbeLoader = new RGBELoader();

rgbeLoader.load(

  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr',

  (texture) => {

    texture.mapping =
      THREE.EquirectangularReflectionMapping;

    // reflections
    scene.environment = texture;

    // background
    // scene.background = texture;

  }

);

// ---------------- GLTF MODEL ----------------

const loader = new GLTFLoader();

let model;

loader.load(

  '/DamagedHelmet.gltf',

  // success
  (gltf) => {

    model = gltf.scene;

    // scale
    model.scale.set(2, 2, 2);

    // position
    model.position.set(0, -1, 0);

    // shadows
    model.traverse((child) => {

      if (child.isMesh) {

        child.castShadow = true;

        child.receiveShadow = true;

      }

    });

    scene.add(model);

    console.log('Model Loaded Successfully');

  },

  // progress
  (xhr) => {

    console.log(
      (xhr.loaded / xhr.total) * 100 + '% loaded'
    );

  },

  // error
  (error) => {

    console.log('Error loading model:', error);

  }

);

window.addEventListener("mousemove", (e)=>{
 if (model){
  const rotationX = (e.clientX/ window.innerWidth -.5) * (Math.PI * 0.3)
  const rotationY = (e.clientY/ window.innerHeight -.5) *( Math.PI * 0.3)
  model.rotation.y = rotationX;
  model.rotation.x = rotationY;
 }})

window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight)
})
// ---------------- ANIMATION ----------------

function animate() {

  window.requestAnimationFrame(animate);

  
  // rotate model
  if (model) {

    model.rotation.y += 0.005;

  }

  // render with postprocessing
  composer.render();

}

animate();

// ---------------- RESIZE ----------------

window.addEventListener('resize', () => {

  // update camera
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  // update renderer
  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  // update composer
  composer.setSize(
    window.innerWidth,
    window.innerHeight
  );

});
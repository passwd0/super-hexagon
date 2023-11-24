import * as THREE from 'three';
import {OrbitControls} from "three/addons";
import background from "./background";
import player from "./player";
import obstacle from "./obstacle";
import controller from "./controller";
import {
    cameraHeight, maxScale, maxZoom, minScale, minZoom, obstacleCreationInterval,
    obstacleSpeed,
    playerSpeed, scaleSpeed, sceneRotationSpeed, zoomSpeed
} from "./utils";
import soundtrack from "./sounds/soundtrack.ogg";

const width = window.innerWidth;
const height = window.innerHeight;

const playerModel = {
    angle: 0,
    direction: 0,
};

const gameModel = {
    isPaused: true,
    isMuted: false,

    playerSpeed: playerSpeed,
    obstacleSpeed: obstacleSpeed,

    sceneRotationSpeed: sceneRotationSpeed,
    sceneRotation: 0,

    level: 1,
    levelStartTime: 0,

    obstacleCreationInterval: obstacleCreationInterval,
    obstacleLastCreationTime: 0,

    minZoom: minZoom,
    maxZoom: maxZoom,
    zoomSpeed: zoomSpeed,
    currZoom: 1,
    isZoomingIn: true,

    minScale: minScale,
    maxScale: maxScale,
    scaleSpeed: scaleSpeed,
    currScale: 1,
    isScalingUp: true,

    stopAtCollision: true,
}

const renderer = new THREE.WebGLRenderer( { antialias: true } );
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 70, width / height, 0.1, 800 );
camera.position.set(0, 0, cameraHeight);

const light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 1, 1, 1 );
scene.add( light );

const light2 = new THREE.DirectionalLight( 0xffffff, 1 );
light2.position.set( - 1, - 1, - 1 );
scene.add( light2 );

const light3 = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( light3 );

const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( soundtrack, function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop( true );
    sound.setVolume( 0.5 );
});

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

renderer.setSize( width, height );
renderer.setAnimationLoop( animation );
document.body.appendChild( renderer.domElement );


// background
const backgroundsMesh = background.create(scene);

// triangle
const playersMesh = player.create(scene);

// blocks
const obstaclesMesh = obstacle.create(scene);

// events
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

function onDocumentKeyDown(event) {
    const keyCode = event.which;
    if (keyCode === 37) { // Left arrow
        playerModel.direction = 1;
    } else if (keyCode === 39) { // Right arrow
        playerModel.direction = -1;
    }

    if (keyCode ===  77) { // m
        if (gameModel.isMuted) {
            gameModel.isMuted = false;
            sound.play();
        } else {
            gameModel.isMuted = true;
            sound.pause();
        }
    }

    if (keyCode === 32) { //space
        gameModel.isPaused = !gameModel.isPaused;

        if (gameModel.isPaused) {
            sound.pause();
        } else {
            sound.play();
        }
    }

    if (keyCode === 82) { //r
        camera.position.set(0, 0, cameraHeight);
    }

    if (keyCode === 83) { //s
        gameModel.stopAtCollision = !gameModel.stopAtCollision;
    }
}

function onDocumentKeyUp(event) {
    playerModel.direction = 0;
}

const backgroundsMeshOriginal = backgroundsMesh.map((block) => block.clone());

function animation(time) {
    if (!gameModel.startTime) {
        gameModel.startTime = time;
    }

    if (!gameModel.isPaused) {
        controller.updateScale(backgroundsMesh, backgroundsMeshOriginal, gameModel);

        controller.updatePlayer(time, playersMesh[0], playerModel, gameModel);
        controller.updateObstacles(time, scene, obstaclesMesh, gameModel);
        controller.checkCollision(playersMesh[0], obstaclesMesh, gameModel);

        controller.updateZoom(camera, gameModel);
        controller.updateSpin(scene, gameModel);

        controller.updateScore(time, gameModel);
        controller.updateLevel(time, gameModel);
    }

    controls.update();
    renderer.render(scene, camera);
}

import * as THREE from "three";
import {hexagonWidth, obstacleSpawnDistance} from "./utils";
import controller from "./controller";

function create(scene) {
    const i = Math.floor(Math.random() * 6);
    const angle = i * Math.PI / 3;

    const arcLength = hexagonWidth * Math.sqrt(3) / 2; // Width of the block matches the hexagon's side


    const blockGeometry = new THREE.BoxGeometry(arcLength, 0.1, 6); // Adjust height and depth as needed
    const blockMaterial = new THREE.MeshBasicMaterial({
        // map: gradientTexture,
        color: '#f57542',
    });
    const block = new THREE.Mesh(blockGeometry, blockMaterial);

    block.position.x = obstacleSpawnDistance * Math.cos(angle);
    block.position.y = obstacleSpawnDistance * Math.sin(angle);
    // block.position.z = 15;
    block.rotation.z = angle + Math.PI / 2; // Orient the block along the lane

    controller.updateBlockWidth(block, obstacleSpawnDistance);

    scene.add(block);

    return [block];
}

export default {
    create
}

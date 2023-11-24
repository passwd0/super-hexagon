import * as THREE from 'three';
import {backgroundColors, distance, hexagonWidth} from "./utils";
import controller from "./controller";

const numberOfBackgroundBlocks = 6;

function create(scene) {
    const backgrounds = [];

    for (let i=0; i<numberOfBackgroundBlocks; i++) {
        const angle = i * Math.PI / 3;

        const arcLength = hexagonWidth * Math.sqrt(3) / 2; // Width of the block matches the hexagon's side
        const blockGeometry = new THREE.BoxGeometry(arcLength, 0.1, 400); // Adjust height and depth as needed
        const blockMaterial = new THREE.MeshBasicMaterial({
            color: backgroundColors[i % 2],
            transparent: true,
            fog: false,
            opacity: 0.5
        });
        const mesh = new THREE.Mesh(blockGeometry, blockMaterial);

        mesh.position.x = distance * Math.cos(angle);
        mesh.position.y = distance * Math.sin(angle);
        mesh.position.z = 20;
        mesh.rotation.z = angle + Math.PI / 2; // Orient the block along the lane

        controller.updateBlockWidth(mesh, distance);

        backgrounds.push(mesh);
        scene.add(mesh);
    }

    return backgrounds;
}

export default {
    create
}

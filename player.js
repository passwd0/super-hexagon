import * as THREE from "three";
import {playerHeight, playerWidth} from "./utils";

function create(scene) {
    const shape = new THREE.Shape();
    shape.moveTo(0, -playerHeight / 2);
    shape.lineTo(-playerWidth / 2, playerHeight / 2);
    shape.lineTo(playerWidth / 2, playerHeight / 2);
    shape.lineTo(0, -playerHeight / 2);

    const triangleGeometry = new THREE.ShapeGeometry(shape);
    const triangleMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000
    });

    const mesh = new THREE.Mesh(triangleGeometry, triangleMaterial);
    scene.add(mesh);

    return [mesh];
}

export default {
    create
}

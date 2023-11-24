import * as THREE from "three";
import {cameraHeight, hexagonWidth, maxZoom, minZoom, obstacleSpeed, playerDistance} from "./utils";
import {OBB} from "three/addons";
import obstacle from "./obstacle";

function updateBlockWidth(mesh, distance) {
    mesh.scale.x = distance * Math.tan(Math.PI / 6 / 2);
}

function updateObstacles(time, scene, obstaclesMesh, gameModel) {
    for (let i = obstaclesMesh.length - 1; i >= 0; i--) {
        const block = obstaclesMesh[i];
        const direction = new THREE.Vector3(-block.position.x, -block.position.y, 0).normalize();
        block.position.addScaledVector(direction, obstacleSpeed);

        const distanceToCenter = block.position.length();
        updateBlockWidth(block, distanceToCenter);

        // Remove the block if it reaches the hexagon
        if (distanceToCenter <= hexagonWidth) {
            scene.remove(block);
            // Dispose of the block's geometry and material to free up memory
            block.geometry.dispose();
            block.material.dispose();
            // Remove the block from the array
            obstaclesMesh.splice(i, 1);
        }
    }

    if (time - gameModel.obstacleLastCreationTime > gameModel.obstacleCreationInterval) {
        obstaclesMesh.push(...obstacle.create(scene));
        obstaclesMesh.push(...obstacle.create(scene));
        gameModel.obstacleLastCreationTime = time;
    }
}

function updateLevel(time, gameModel) {
    if (time - gameModel.levelStartTime > 10000) {
        gameModel.level += 1;
        gameModel.obstacleCreationInterval -= 40;
        gameModel.obstacleSpeed += 0.05;
        gameModel.levelStartTime = time;

        document.getElementById('level').innerText = 'Level: ' + gameModel.level;
    }
}

function updateScore(time, gameModel) {
    const score = Math.round((time - gameModel.startTime) / 1000);

    document.getElementById('score').innerText = `Score: ${score}`;
}

function checkCollision(playerMesh, obstaclesMesh, gameModel) {
    if (!gameModel.stopAtCollision) {
        return;
    }

    // Create an OBB for the triangle
    const triangleBox = new THREE.Box3().setFromObject(playerMesh);
    const triangleOBB = new OBB().fromBox3(triangleBox);
    triangleOBB.applyMatrix4(playerMesh.matrixWorld);

    for (let block of obstaclesMesh) {
        // Create an OBB for each block
        const blockBox = new THREE.Box3().setFromObject(block);
        const blockOBB = new OBB().fromBox3(blockBox);
        blockOBB.applyMatrix4(block.matrixWorld);

        // Check for intersection
        if (triangleOBB.intersectsOBB(blockOBB)) {
            console.log("Collision detected!");
            // Handle collision
            gameModel.isPaused = true;
            gameModel.isMuted = true;
            break;
        }
    }
}

function updatePlayer(time, playerMesh, playerModel, gameModel) {
    playerModel.angle += gameModel.playerSpeed * playerModel.direction;

    // Calculate the x and y position based on the angle
    playerMesh.position.x = playerDistance * Math.cos(playerModel.angle);
    playerMesh.position.y = playerDistance * Math.sin(playerModel.angle);

    // Rotate the triangle to align its base with the circle's tangent
    playerMesh.rotation.z = playerModel.angle + Math.PI / 2;
}

function getRandomMaxZoom(minZoom) {
    return Math.random() * (maxZoom - minZoom) + minZoom;
}

function getRandomMinZoom(maxZoom) {
    return Math.random() * (maxZoom - minZoom) + minZoom;
}

function updateZoom(camera, gameModel) {
    if (gameModel.isZoomingIn) {
        if (gameModel.currZoom < gameModel.maxZoom) {
            gameModel.currZoom += gameModel.zoomSpeed;
        } else {
            gameModel.isZoomingIn = false;
            gameModel.minZoom = getRandomMinZoom(gameModel.maxZoom);
        }
    } else {
        if (gameModel.currZoom > gameModel.minZoom) {
            gameModel.currZoom -= gameModel.zoomSpeed;
        } else {
            gameModel.isZoomingIn = true;
            gameModel.maxZoom = getRandomMaxZoom(gameModel.minZoom);
        }
    }

    camera.position.z = cameraHeight * gameModel.currZoom;
}

function updateSpin(scene, gameModel) {
    gameModel.sceneRotation += gameModel.sceneRotationSpeed;
    scene.rotation.z = gameModel.sceneRotation;
}

function getRandomMaxScale() {
    return Math.random() * (1.2 - 1.0) + 1.1; // Random scale between 1.0 and 1.2
}

function updateScale(backgroundsMesh, backgroundsMeshOriginal, gameModel) {
    if (gameModel.isScalingUp) {
        if (gameModel.currScale < gameModel.maxScale) {
            gameModel.currScale += gameModel.scaleSpeed;
        } else {
            gameModel.isScalingUp = false;
            gameModel.maxScale = getRandomMaxScale();
        }
    } else {
        if (gameModel.currScale > gameModel.minScale) {
            gameModel.currScale -= gameModel.scaleSpeed;
        } else {
            gameModel.isScalingUp = true;
            gameModel.maxScale = getRandomMaxScale();
        }
    }

    backgroundsMesh.forEach((block, i) => {
        block.scale.set(
            backgroundsMeshOriginal[i].scale.x * gameModel.currScale,
            backgroundsMeshOriginal[i].scale.y * gameModel.currScale,
            backgroundsMeshOriginal[i].scale.z * gameModel.currScale
        );

        block.position.x = backgroundsMeshOriginal[i].position.x * gameModel.currScale;
        block.position.y = backgroundsMeshOriginal[i].position.y * gameModel.currScale;
    })
}

export default {
    updateBlockWidth,
    updateObstacles,
    updateLevel,
    updateScore,
    checkCollision,
    updatePlayer,
    updateZoom,
    updateSpin,
    updateScale,
}

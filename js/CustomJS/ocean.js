window.PLANET = window.PLANET || {};
PLANET.ocean = PLANET.ocean || {};

PLANET.ocean.Ocean = function (bufferGeometry) {
    let geometry = new THREE.Geometry();
    geometry.fromBufferGeometry(bufferGeometry);
    let material = new THREE.MeshStandardMaterial({
        flatShading: true,
        color: new THREE.Color(colors.SeaColor),
        transparent: true,
        opacity: params.WaterOpacity / 100
    });
    let ocean = new THREE.Mesh(geometry, material);
    ocean.castShadow = true;
    ocean.receiveShadow = true;
    ocean.name = "Ocean";
    ocean.frozen = false;
    ocean.frustumCulled = false;
    ocean.animate = function () {
        if (params.Temperature > CONSTANTS.FREEZE_POINT) {
            let seaLevel = utils.getSeaLevel();
            this.frozen = false;
            let length;
            let step = timer * params.WaveSpeed;
            for (let vertex of geometry.vertices) {
                length = simplex.noise3d(
                    (vertex.x + step) / params.WaveLength,
                    (vertex.y + step) / params.WaveLength,
                    (vertex.z + step) / params.WaveLength
                );
                vertex.setLength(seaLevel + length * params.WaveHeight);
            }
            geometry.verticesNeedUpdate = true;
        } else if (!this.frozen) {
            let seaLevel = utils.getSeaLevel();
            for (let vertex of geometry.vertices) {
                vertex.setLength(seaLevel);
            }
            geometry.verticesNeedUpdate = true;
            this.frozen = true;
        }
    };
    ocean.update = function () {
        material.color.setHex(colors.SeaColor);
        material.opacity = params.WaterOpacity / 100;
        material.needsUpdate = true;
        geometry.colorsNeedUpdate = true;
    };
    return ocean;
};
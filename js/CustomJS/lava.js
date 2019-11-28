window.PLANET = window.PLANET || {};
PLANET.lava = PLANET.lava || {};

PLANET.lava.Lava = function (bufferGeometry) {
    let level = utils.getLavaLevel();
    let material = new THREE.ShaderMaterial({
        uniforms: {
            time: {
                type: 'f',
                value: 0.0
            },
            level: {
                type: 'f',
                value: level
            }
        },
        vertexShader: document.getElementById('lavaVertShader').textContent,
        fragmentShader: document.getElementById('lavaFragShader').textContent,
    });
    let lava = new THREE.Mesh(bufferGeometry, material);
    lava.castShadow = true;
    lava.receiveShadow = true;
    lava.name = "Lava";
    lava.frustumCulled = false;
    lava.animate = function () {
        if (params.LavaLevel > 0) {
            material.uniforms['level'].value = utils.getLavaLevel();
            material.uniforms['time'].value = timer * .01;
        }
    };
    lava.update = function () {

    };
    return lava;
};
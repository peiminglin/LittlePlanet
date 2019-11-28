window.PLANET = window.PLANET || {};
PLANET.lighting = PLANET.lighting || {};

//GLOBAL VARIABLES: Used in multiple functions
let moonAxis = new THREE.Vector3(1, -0.6, 0).normalize();
let distance = 5000;
let inclination = 0;
let quaternion = new THREE.Quaternion();
let material = new THREE.MeshBasicMaterial({color: 0xffffff});

let starController  = {
  StarColor: 0xffffff
};

//UPDATE LOOP: Updates sun position and keeps it in line with the sky. Also updates star color
PLANET.lighting.update = function () {
    let uniforms = sky.material.uniforms;
    uniforms.turbidity.value = 1;
    uniforms.rayleigh.value = 0;
    uniforms.luminance.value = 1;
    uniforms.mieCoefficient.value = 0.005;
    uniforms.mieDirectionalG.value = 0.8;
    let theta = Math.PI * (inclination - 0.5);
    sunSphere.position.x = distance * Math.sin(theta);
    sunSphere.position.y = 0;
    sunSphere.position.z = distance * Math.cos(theta);
    uniforms.sunPosition.value.copy(sunSphere.position);
    material.color.setHex(starController.StarColor);
};

//MAIN FUNCTION: Calls in the celestial objects and glows
PLANET.lighting.Lighting = function () {
    THREE.Object3D.call(this);
    function initSky() {

        //Adds the skybox, sun and moon mesh
        sky = new THREE.Sky();
        sky.scale.setScalar(distance*1.2);
        scene.add(sky);

        let sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunSphere = new THREE.Mesh(
            new THREE.IcosahedronBufferGeometry(250, 1),
            new THREE.MeshBasicMaterial({color: 0xffff7f})
        );

        let moonLight = new THREE.DirectionalLight(0xeeeeff, 0.2);
        moonSphere = new THREE.Mesh(
            new THREE.IcosahedronBufferGeometry(75, 1),
            new THREE.MeshBasicMaterial({color: 0xeeeeee})
        );

        //SHADOW CASTER: Gives the sunlight the ability for objects to cast shadows
        sunLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(100, 1));
        sunLight.shadow.mapSize.width = 512;
        sunLight.shadow.mapSize.height = 512;
        sunLight.castShadow = true;

        //Creating the starfield and star light
        let starLight = new THREE.AmbientLight(0x7f7f7f, 0.2);
        let mergedGeometry = new THREE.Geometry();
        let geometry = new THREE.SphereGeometry(20, 1);

        //Loop to create and place a star every 50y
        for (let i = -distance * 2; i < distance * 2; i += 50) {
            let x = Math.random() * distance * 2 - distance;
            let y = i;
            let z = Math.random() * distance * 2 - distance;

            //Push stars away that are too close to the planet
            if (-distance < x < distance && -distance < y < distance && -distance < z < distance) {
                let minVal = Math.min(Math.abs(x), Math.abs(y), Math.abs(z));
                if (Math.abs(x) === minVal) {
                    if (x < 0) {
                        x = x - distance;
                    } else {
                        x = x + distance;
                    }
                }
                if (Math.abs(y) === minVal) {
                    if (y < 0) {
                        y = y - distance;
                    } else {
                        y = y + distance;
                    }
                }
                if (Math.abs(z) === minVal) {
                    if (z < 0) {
                        z = z - distance;
                    } else {
                        z = z + distance;
                    }
                }
            }

            geometry.translate(x, y, z);
            mergedGeometry.merge(geometry);
            geometry.translate(-x, -y, -z);
        }

        starField = new THREE.Mesh(mergedGeometry, material);

        sunSphere.add(sunLight);
        moonSphere.add(moonLight);
        starField.add(starLight);
        scene.add(starField);
        scene.add(sunSphere);
        scene.add(moonSphere);

    }

    //Sprites loaded for the sun and moon glow
    function addGlows() {

        let sunMaterial = new THREE.SpriteMaterial({
            map: new THREE.ImageUtils.loadTexture('res/img/glow.png'),
            color: 0xffff00,
            transparent: false,
            blending: THREE.AdditiveBlending
        });
        let sunGlow = new THREE.Sprite(sunMaterial);
        sunGlow.scale.set(1500, 750, 1.0);
        sunSphere.add(sunGlow);

        let moonMaterial = new THREE.SpriteMaterial({
            map: new THREE.ImageUtils.loadTexture('res/img/glow.png'),
            color: 0xffffff,
            transparent: false,
            blending: THREE.AdditiveBlending
        });
        let moonGlow = new THREE.Sprite(moonMaterial);
        moonGlow.scale.set(500, 250, 1.0);
        moonSphere.position.setZ(distance);
        moonSphere.add(moonGlow);
    }

    initSky();
    addGlows();
    return this;
};

PLANET.lighting.Lighting.prototype = Object.create(THREE.Object3D.prototype);

//LIGHTING ANIMATE LOOP: Called in the render loop
PLANET.lighting.animate = function () {

    //Used to set sun position, called in update loop
    inclination += 0.005;
    if (inclination > 1) {
        inclination = -1;
    }

    //Used to set moon position, different axis from sun loop
    quaternion.setFromAxisAngle(moonAxis, .005);
    moonSphere.position.applyQuaternion(quaternion);

    //Used to rotate the star field
    starField.rotateY(0.001);

    PLANET.lighting.update();
};

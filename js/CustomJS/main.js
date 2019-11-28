window.PLANET = window.PLANET || {};
PLANET.main = PLANET.main || {};

//variables that need global access
let scene, camera, renderer, light, canvas, gui, simplex, timer, manager, color, utils, raycaster, controls;

const CONSTANTS = {
    OPT_TEMP: 25.5,
    FREEZE_POINT: -10,
    BOIL_POINT: 100,
    LAVA_POINT: 200
};
let params = {
    PlanetRadius: 100,
    PlanetDetail: 6,

    //params regarding temperature
    Temperature: 25.5,

    Color: 0,

    //params regarding terrain generation
    TerrainDisplacement: 10,//10% of radius
    TerrainDensity: 0.1,//frequency of noise generator
    TerrainDetail: 9,//number of layers of noise

    //params regarding terrain type
    SnowLevel: 50,//50% of height above water from top
    SandLevel: 10,//10% of height above water
    SeaLevel: 50,//50% of terrain displacement
    LavaLevel: 0,//0% of terrain displacement
    TreeSpread: -0.5,//0.6, //less the number, wider each forest, -1/+1
    GrassSpread: -0.5,//0, //less the number, wider each grassland, -1/+1
    ForestDensity: 0.3, //more the number, more forests, 0.1/0.3

    //params regarding tree models
    TreeScale: 0.01,
    TreeCount: 2000,

    //params regarding ocean
    WaterOpacity: 90,
    WaveSpeed: 0.25,
    WaveLength: 1,
    WaveHeight: 0.05,

    CameraMax: 2,

    BrushSize: 2,
};

let colors = colorSchemes[0];
let res = {
    TreesGeometry: [],
    TreesMaterials: [],
    DeadTreesGeometry: [],
    DeadTreesMaterials: []
};
let planet;
let axis = new THREE.Vector3(1, 0, 0);

PLANET.main.main = function () {
    timer = 0;
    utils = new PLANET.utils();
    colors = colorSchemes[params.Color];
    //init scene
    scene = new THREE.Scene();
    PLANET.main.loadModels();
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas = document.createElement('div');
    canvas.appendChild(renderer.domElement);
    document.body.appendChild(canvas);
    PLANET.controls.Controls();

    light = new PLANET.lighting.Lighting();
    raycaster = new THREE.Raycaster();
    scene.add(light);
    PLANET.main.render();

    window.addEventListener('resize', function () {
        let width = window.innerWidth;
        let height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
};

//Load models using a loading manager
PLANET.main.loadModels = function () {
    manager = new THREE.LoadingManager();

    manager.onStart = function (url, itemsLoaded, itemsTotal) {
        console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

    };

    //Initiate function calls after all models have loaded
    manager.onLoad = function () {
        console.log('Loading complete!');
        planet = new PLANET.planet.Planet(planetGeometry, lavaGeometry);
        scene.add(planet);
        planet.castShadow = true;
        planet.receiveShadow = true;
        document.addEventListener('mousedown', planet.terrain.modifyTerrain, false);
        document.addEventListener('mousemove', planet.terrain.onMouseMove, false);
        document.addEventListener('mouseup', planet.terrain.onMouseUp, false);
        PLANET.debug.Debug();
        let loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
        loadingScreen.addEventListener('transitionend', onTransitionEnd);
    };

    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };

    let plyLoader = new THREE.PLYLoader(manager);
    let planetGeometry;
    let lavaGeometry;
    let fbxLoader = new THREE.FBXLoader(manager);

    plyLoader.load('res/models/sphere-' + params.PlanetDetail + '.ply', function (bufferGeometry) {
        planetGeometry = bufferGeometry;
    });

    plyLoader.load('res/models/sphere-6.ply', function (bufferGeometry) {
        lavaGeometry = bufferGeometry;
    });

    fbxLoader.load('res/models/trees.fbx', function (object) {
        object.traverse(function (child) {
            if (child.isMesh) {
                for (let material of child.material) {
                    if (material.name === "Trunk") {
                        material.color.setHex(colors.TrunkColor);
                    } else {
                        material.color.setHex(colors.LeafColor);
                    }
                }
                if (child.name.includes("009")) {
                    res.DeadTreesGeometry.push(child.geometry);
                    res.DeadTreesMaterials.push(child.material);
                } else {
                    res.TreesGeometry.push(child.geometry);
                    res.TreesMaterials.push(child.material);
                }
            }
        });
    });
};

PLANET.main.render = function () {
    requestAnimationFrame(PLANET.main.render);
    timer += 1 / 10;
    if (timer > 1000000) timer = 0;
    if (planet) {
        planet.animate();
    }
    if (light) {
        PLANET.lighting.animate();
    }

    controls.update();

    renderer.render(scene, camera);
};

function onTransitionEnd(event) {

    event.target.remove();

}

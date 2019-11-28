window.PLANET = window.PLANET || {};
PLANET.planet = PLANET.planet || {};

PLANET.planet.Planet = function(bufferGeometry, lavaGeometry) {
    THREE.Object3D.call(this);
    this.name = "Planet";
    simplex = new SimplexNoise();
    this.ocean = PLANET.ocean.Ocean(bufferGeometry);
    this.add(this.ocean);
    this.terrain = PLANET.terrain.Terrain(bufferGeometry);
    this.add(this.terrain);
    this.lava = PLANET.lava.Lava(lavaGeometry);
    this.add(this.lava);
    this.climate = PLANET.climate.Climate();
    this.animate = function () {
        this.terrain.animate();
        this.ocean.animate();
        this.lava.animate();
    };
    this.update = function (rebuildTerrain) {
        if (rebuildTerrain === true){
            this.terrain.generateTerrain();
        }
        this.terrain.update();
        this.ocean.update();
    };
    this.update(false);
};

PLANET.planet.Planet.prototype = Object.create(THREE.Object3D.prototype);
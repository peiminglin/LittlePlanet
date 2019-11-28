window.PLANET = window.PLANET || {};
PLANET.utils = PLANET.utils || {};

PLANET.utils = function () {
    THREE.Object3D.call(this);

    this.map = function (x, a1, a2, b1, b2) {
        if (x < a1) return b1;
        if (x > a2) return b2;
        return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
    };

    this.getPeakLevel = function () {
        return params.PlanetRadius * (1 + params.TerrainDisplacement / 100);
    };

    this.getBottomLevel = function () {
        return params.PlanetRadius * (1 - params.TerrainDisplacement / 100);
    };

    this.GET_FROM = {TOP: 0, BOTTOM: 1};
    this.getLevel = function (max, min, from, percentage) {
        switch (from) {
            case this.GET_FROM.TOP:
                return max - (max - min) * percentage;
            case this.GET_FROM.BOTTOM:
                return (max - min) * percentage + min;
        }
    };

    this.getSeaLevel = function () {
        return this.getLevel(this.getPeakLevel(), this.getBottomLevel(), this.GET_FROM.BOTTOM, params.SeaLevel / 100);
    };

    this.getLavaLevel = function () {
        return this.getLevel(this.getPeakLevel(), this.getBottomLevel(), this.GET_FROM.BOTTOM, params.LavaLevel / 100);
    };

    this.getSnowLevel = function () {
        return this.getLevel(this.getPeakLevel(), this.getSeaLevel(), this.GET_FROM.TOP, params.SnowLevel / 100);
    };

    this.getSandLevel = function () {
        return this.getLevel(this.getPeakLevel(), this.getSeaLevel(), this.GET_FROM.BOTTOM, params.SandLevel / 100);
    };

    this.getSeabedLevel = function () {
        return this.getSeaLevel() - params.WaveHeight * 10;
    };
};

PLANET.planet.Planet.prototype = Object.create(THREE.Object3D.prototype);
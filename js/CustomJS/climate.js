window.PLANET = window.PLANET || {};
PLANET.climate = PLANET.climate || {};

//TODO damping, separating it from params

PLANET.climate.Climate = function () {
    let climate = {};
    climate.temperature = params.Climate;
    climate.set = function (value) {
        climate.temperature = value;
        let opt = CONSTANTS.OPT_TEMP;
        let freeze = CONSTANTS.FREEZE_POINT;
        let melt = opt * 2 - freeze;
        let boil = CONSTANTS.BOIL_POINT;
        let lava = CONSTANTS.LAVA_POINT;
        climate.temperature = Math.min(Math.max(value, freeze), boil);
        params.SnowLevel = utils.map(value, freeze, melt, 100, 0);
        params.SandLevel = utils.map(value, melt, boil, 10, 100);
        params.SeaLevel = utils.map(value, melt, boil, 50, 0);
        planet.ocean.visible = params.SeaLevel > 0;
        params.LavaLevel = utils.map(value, boil, lava, 0, 50);
        planet.lava.visible = params.LavaLevel > 0;
        params.GrassSpread = Math.max(utils.map(value, freeze, opt, 0.6, -0.5), utils.map(value, opt, boil, -0.5, 0.6));
        params.TreeSpread = Math.max(utils.map(value, freeze, opt, 0.8, 0.5), utils.map(value, opt, boil, 0.5, 0.8));
        planet.update();
    };
    return climate;
};

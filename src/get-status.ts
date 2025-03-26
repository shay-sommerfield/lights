import { findWizLights, getOnBulbs, Light, saveOnBulbsToGroup, getLightsFromBulbGroup } from './find-wizlights';

async function discover() {

    const lights = await getLightsFromBulbGroup('office');
    console.log(lights)
    lights.forEach((light) => {
        light.turnOn();
    })
}

// sendMsg(onMsg)
Promise.resolve()
    .then(() => discover())
    .catch(console.error);
import { findWizLights, getOnBulbs, Light, saveOnBulbsToGroup, getLightsFromBulbGroup, partyFilter } from './find-wizlights';

async function discover() {

    const light_info = await getOnBulbs(partyFilter);
    light_info.forEach((light) => {
        console.log(light)
})
}

// sendMsg(onMsg)
Promise.resolve()
    .then(() => discover())
    .catch(console.error);
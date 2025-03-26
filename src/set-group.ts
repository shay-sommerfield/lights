import { findWizLights, getOnBulbs, Light, savePartyBulbsToGroup, getLightsFromBulbGroup, partyFilter } from './find-wizlights';
import * as readline from "readline";

// Promise.resolve()
//     .then(() => savePartyBulbsToGroup())
//     .catch(console.error);


async function main() {
    const lights = await getLightsFromBulbGroup('office');
    console.log(lights);
    await Promise.all(lights.map(lights => lights.turnOn()));
}
Promise.resolve()
    .then(() => main())
    .catch(console.error);
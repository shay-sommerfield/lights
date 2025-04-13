import { getLightsFromBulbGroup } from './configuration';

/**
 * A main script for testing out various functionality
 */
async function main() {
    const lights = await getLightsFromBulbGroup('dining');
    lights.forEach(light => console.log(light.lastStatus));
}

Promise.resolve()
    .then(() => main())
    .catch(console.error);


import { getLightsFromBulbGroup } from "./configuration";

const TIMEOUT = 1000; // ms

/**
 * 
 * @param timout Number of ms to sleep or a default of 1000
 */
async function sleep(timout: number = TIMEOUT): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, TIMEOUT));

}

/**
 * A main script for testing out various functionality
 */
async function main() {
  const lights = await getLightsFromBulbGroup("dining");
  lights.forEach(async (light) => {
    // Enter what you want each light from the room to do:
    await light.turnOff();
    await sleep()
    await light.turnOn();
  });
  
}

Promise.resolve()
  .then(() => main())
  .catch(console.error);

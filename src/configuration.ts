import * as fs from "fs";
import { join } from "path";
import { discover } from "./discover";
import * as readline from "readline";
import { WizLights } from "./wizlights";
import { findWizLights } from "./wiz-udp";

/**
 * This file covers general configuration, that is, saveing and
 * retrieving bulbs from json files in the 'bulb_groups' directory.
 *
 * Each bulb group is saved to a json file, with the format:
 * <group_name>.json
 *
 * TODO: This all should be a small DB, like SQLITE instead of just json files.
 */

/**
 * Filters for lights in party mode
 *
 * @param light WizLights.Light
 * @returns boolean
 */
export function partyFilter(light: WizLights.Light): boolean {
  return light.lastStatus.state === true && light.lastStatus.sceneId === 4;
}

/**
 * Sets up user input, so that the user can name a light group from the command line.
 */
function askQuestion(rl: any, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) =>
      resolve(answer.trim().toLowerCase()),
    );
  });
}

/**
 * Finds all bulbs set to party mode and saves them to a json file, with the group
 * name specified by the user.
 */
export async function savePartyBulbsToGroup() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const lights = await discover(partyFilter);

  console.log(`Found ${lights.length} lights in party mode`);

  const response = await askQuestion(
    rl,
    "Do you want to save these lights to a group? (y/n): ",
  );

  let userInputName = undefined;
  if (response === "y") {
    userInputName = await askQuestion(rl, "Enter the desired group name: ");
    console.log("You entered:", userInputName);
  }

  rl.close();

  if (!userInputName) return; // Safety

  const macs = lights.map((light) => light.mac);
  const file = `../bulb_groups/${userInputName}.json`;
  const filePath = join(__dirname, file);

  fs.writeFileSync(filePath, JSON.stringify(macs), "utf-8");

  console.log(`Successfully saved ${userInputName} group to ${filePath}`);
}

/**
 * Returns an array of WizLights.Light for a group that was previously defined
 * using savePartyBulbsToGroup
 * @see {@link savePartyBulbsToGroup}
 *
 * @param name Name of the bulb group (e.g. "office")
 * @returns Array of WizLights.Light with Mac addresses in that group
 */
export async function getLightsFromBulbGroup(
  name: string,
): Promise<WizLights.Light[]> {

  try {
    const file = `../bulb_groups/${name}.json`;
    const filePath = join(__dirname, file);
  
    const rawData = fs.readFileSync(filePath, "utf-8");
    const macs = JSON.parse(rawData);
  
    const onlineLightInfoArr = await findWizLights();
    const lights: WizLights.Light[] = [];
    onlineLightInfoArr.forEach((info) => {
      if (macs.includes(info.mac)) {
        lights.push(new WizLights.Light(info));
      }
    });
  return lights;

  } catch (err: any) {
  if (err.code === 'ENOENT') {
    // Handle the missing file case
    console.error('File not found:', err.path);
    return [];
  } else {
    // Re-throw or handle other errors
    throw err;
  }
}
}

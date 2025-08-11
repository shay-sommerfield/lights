import express from "express";
import env from "dotenv";
import * as fs from "fs";
import path, {join} from "path";
import { getLightsFromBulbGroup } from "./configuration";
import { WizLights } from "./wizlights";

const app = express();
// Load the root .env file
const envPath = path.resolve(process.cwd(), '../.env');
env.config({ path: envPath });

const port = process.env.VITE_EXPRESS_PORT || 3000;

const TIMEOUT = 1000; // ms

/**
 * 
 * @param timout Number of ms to sleep or a default of 1000
 */
async function sleep(timout: number = TIMEOUT): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, TIMEOUT));

}

// Retrieves available bulb groups from the 'bulb_groups' directory
// and returns their names as an array of strings.
function getBulbGroups(): string[] {
    const folderPath = join(__dirname, `../bulb_groups/`);

    //look for all files in the bulb_groups directory
    const groups = fs.readdirSync(folderPath)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', '')); // Remove the .json extension
    console.log(`Available bulb groups: ${groups.join(', ')}`);

  return groups;
}

// Flips all lights in a bulb group off and on
// This resets the lights to their previous state
async function flipBulbGroup(groupName: string): Promise<WizLights.Light[]> {
    console.log(`Resetting bulb group: ${groupName}`);
    const lights = await getLightsFromBulbGroup(groupName);
    //This async loop allows the lights to be turned off and on in parallel
    lights.forEach(async (light) => {
        await light.turnOff();
        await sleep()
        await light.turnOn();
    });
    return lights;
}

//get programs sends the light programs available, 
//for defining frontend buttons and endpoints
app.get("/get_programs/", (req: express.Request, res: express.Response) => {
    // TODO: convert hardcoding of office to choice of bulb group 
    const programs = [
        {"endpoint": "reset_bulb_group/", 
         "name": "Reset Bulbs From Group",
         "param": getBulbGroups(),
        },

        {"endpoint": "turn_on_all", 
         "name": "Turn On All"},

        {"endpoint": "turn_off_all", 
         "name": "Turn Off All"},

        {"endpoint": "start_color_cycle", 
         "name": "Start Color Sequence"},

        {"endpoint": "stop_color_cycle", 
         "name": "Stop Color Sequence"},

         //TODO: enable this endpoints
        {"endpoint": "run_binary_counter", 
         "name": "Binary Counter"},
        ]
    res.send(programs);
});

let colorCycleActive = false;
// Endpoint to start a color cycle across three orb lights
app.get("/start_color_cycle", async (req: express.Request, res: express.Response) => {
    //check if already running
    if (colorCycleActive) {
        return res.json({ message: "Color cycle already running" });
    }
    colorCycleActive = true;
    const groupName = "three_orbs";
    const rgb_palette = [
        { r: 0, g: 0, b: 255, dimming: 100 },
        { r: 0, g: 255, b: 0, dimming: 100 },
        { r: 255, g: 0, b: 0, dimming: 100 }
    ];
    //start the color cycle
    (async () => {
        try {
            const lights = await getLightsFromBulbGroup(groupName);
            let step = 0;
            //while not interrupted, loop through lights and colors continually
            while (colorCycleActive) {
                //happens fast enough that it looks like all lights are changing at once
                for (let i = 0; i < lights.length; i++) {
                    const color = rgb_palette[(i + step) % rgb_palette.length];
                    await lights[i].turnOnColor(color.r, color.g, color.b, color.dimming);
                }
                // Sleep before changing colors
                await sleep();
                step++;
            }
        } catch (error) {
            console.error("Error in color cycle:", error);
        }
    })();
    res.json({ message: "Started color cycle" });
});

// Stop three orb color cycle and reset lights
app.get("/stop_color_cycle", async (req: express.Request, res: express.Response) => {
    colorCycleActive = false;
    try {
        const lights = await flipBulbGroup("three_orbs");
        res.json({ message: "Color cycle stopped and lights reset", lights });
    } catch (error) {
        console.error(`Error resetting lights for group three_orbs:`, error);
        res.status(500).send(`Error resetting lights for group three_orbs`);
    }
});

// Flip bulb group endpoint
app.get("/reset_bulb_group/:name", async (req: express.Request, res: express.Response) => {
    colorCycleActive = false;
    const groupName = req.params.name;
    console.log(`Retrieving bulb group: ${groupName}`);
    try {
        const lights = await flipBulbGroup(groupName);
        res.json({message: `Successfully flipped bulb group: ${groupName}`, lights});
    } catch (error) {
        console.error(`Error flipping bulb group ${groupName}:`, error);
        res.status(500).send(`Error flipping bulb group ${groupName}`);
    }
});

// Endpoint to turn on all lights in all groups
app.get("/turn_on_all/", async (req: express.Request, res: express.Response) => {
    colorCycleActive = false;
    const groupNames = getBulbGroups();
    try {
        //go through each group and turn on all lights (reset by turning off first)
        groupNames.forEach(async (groupName) => {
            const lights = await flipBulbGroup(groupName);
            console.log(`Successfully flipped bulb group: ${groupName}`);
        });
        res.json({ message: "All lights turned on" });
    } catch (error) {
        console.error(`Error turning on all lights`, error);
    }
});

// Endpoint to turn off all lights in all groups
app.get("/turn_off_all/", async (req: express.Request, res: express.Response) => {
    colorCycleActive = false;
    const groupNames = getBulbGroups();
    try {
        //go through each group and turn off all lights
        groupNames.forEach(async (groupName) => {
            console.log(`Retrieving bulb group: ${groupName}`);
            const lights = await getLightsFromBulbGroup(groupName);
            lights.forEach(async (light) => {
                // Turn off each light in the group
                await light.turnOff();
            });
            console.log(`Successfully retrieved bulb group: ${groupName}`);
        });
        res.json({ message: "All lights turned off" });
    } catch (error) {
        console.error(`Error turning off all lights`, error);
    }
});
  
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
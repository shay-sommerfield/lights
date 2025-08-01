import express from "express";
import env from "dotenv";
import * as fs from "fs";
import path, {join} from "path";
import { getLightsFromBulbGroup } from "./configuration";

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

function getBulbGroups(): string[] {
    const folderPath = join(__dirname, `../bulb_groups/`);

    //look for all files in the bulb_groups directory
    const groups = fs.readdirSync(folderPath)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', '')); // Remove the .json extension
    console.log(`Available bulb groups: ${groups.join(', ')}`);

  return groups

}

//get programs sends the light programs available, 
//for defining frontend buttons and endpoints
app.get("/get_programs/", (req: express.Request, res: express.Response) => {
    // TODO: convert hardcoding of office to choice of bulb group 
    const programs = [
        {"endpoint": "get_bulb_group/", 
         "name": "Get Bulbs From Group",
         "param": getBulbGroups(),
        },

        {"endpoint": "start_color_cycle", 
         "name": "Start Color Sequence"},

        {"endpoint": "stop_color_cycle", 
         "name": "Stop Color Sequence"},

        {"endpoint": "run_binary_counter", 
         "name": "Binary Counter"},
         
        {"endpoint": "turn_off_orbs", 
         "name": "Turn off orbs"}
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

//Stop three orb color cycle
app.get("/stop_color_cycle", (req: express.Request, res: express.Response) => {
    colorCycleActive = false;
    res.json({ message: "Stopped color cycle" });
});

app.get("/get_bulb_group/:name", async (req: express.Request, res: express.Response) => {
    const groupName = req.params.name;
    console.log(`Retrieving bulb group: ${groupName}`);
    try {
        const lights = await getLightsFromBulbGroup(groupName);
        lights.forEach(async (light) => {
            // Enter what you want each light from the room to do:
            await light.turnOff();
            await sleep()
            await light.turnOn();
        });
        res.json(lights);
        console.log(`Successfully retrieved bulb group: ${groupName}`);
    } catch (error) {
        console.error(`Error retrieving bulb group ${groupName}:`, error);
        res.status(500).send(`Error retrieving bulb group ${groupName}`);
    }
});
  
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
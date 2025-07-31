import express from "express";
import env from "dotenv";
import path from "path";
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

//get programs sends the light programs available, 
//for defining frontend buttons and endpoints
app.get("/get_programs/", (req: express.Request, res: express.Response) => {
    // TODO: convert hardcoding of office to choice of bulb group 
    const programs = [
        {"endpoint": "get_bulb_group/office", 
         "name": "Get Bulbs From Group"},

        {"endpoint": "run_color_cycle", 
         "name": "Color Sequence"},

        {"endpoint": "run_binary_counter", 
         "name": "Binary Counter"},
         
        {"endpoint": "turn_off_orbs", 
         "name": "Turn off orbs"}
        ]
    res.send(programs);
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
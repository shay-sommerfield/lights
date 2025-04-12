import dgram from 'dgram';
import * as fs from 'fs';
import { join } from 'path';
import * as readline from "readline";

const BROADCAST_ADDR = '255.255.255.255';
const WIZ_PORT = 38899;
const WAIT_TIME = 3000;

// Define types for discovered bulbs
interface WizBulbInfo {
    ip: string;
    mac: string;
    model: string;
}



interface WizBaseRequest {
    id: number;
    method: string;
    params: Object;
}

interface WizStateRequest extends WizBaseRequest {
    method: "setState";
    params: {
        state?: boolean;
        dimming?: number;
    }
}

interface WizTempRequest extends WizBaseRequest {
    method: "setPilot";
    params: {
        temp: number;
        dimming: number;
    }
}

interface WizRgbRequest extends WizBaseRequest {
    method: "setPilot";
    params: {
        r: number;
        g: number;
        b: number;
        dimming: number;
    }
}

type WizRequest = WizStateRequest | WizRgbRequest | WizTempRequest;

// Define expected response structure
interface WizResponse {
    method: string;
    result?: {
        mac?: string;
        moduleName?: string;
        state?: boolean;
        rssi?: number;
        sceneId?: number;
        dimming?: number;
    };
}

export class Light {
    ip: string;
    _id: number;
    // mac: string;
    constructor(ip: string) {
        this.ip = ip;
        // this.mac = info.mac;
        this._id = 0;
    }

    get id(): number {
        this._id++;
        return this._id;
    }

    async turnOn() {
        const onMsg: WizStateRequest = {
            id: 1,
            method: "setState",
            params: {
                state: true,
            }
        }
        await sendMessage(this.ip, onMsg)
    }

    async turnOnWarmWhite() {
        const onMsg: WizTempRequest = {
            id: 1,
            method: "setPilot",
            params: {
                temp: 3000,
                dimming: 75
            }
        }
        await sendMessage(this.ip, onMsg)
    }

    async turnOff() {
        const offMsg: WizStateRequest = {
            id: 1,
            method: "setState",
            params: {
                state: false,
            }
        }
        await sendMessage(this.ip, offMsg)
    }
}


/**
 * Retrieves all Wiz bulbs that are currently turned on.
 * @param waitTime - Time in milliseconds to wait for responses.
 * @returns Promise resolving to an array of IP addresses for bulbs that are on.
 */
export async function sendMessage(ip: string, message: WizRequest, waitTime: number = WAIT_TIME): Promise<WizResponse> {

    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket('udp4');


        let timeoutId = setTimeout(() => {
            socket.close();
            console.error(`Bulb at ${ip} failed to respond before timing out`);
        }, waitTime);

        socket.on('message', (msg, rinfo) => {
            try {
                const data: WizResponse = JSON.parse(msg.toString());

                clearTimeout(timeoutId);
                socket.close();
                resolve(data)
            } catch (err) {
                console.error(`Error parsing response from ${rinfo.address}:`, err);
            }
        });

        socket.on('error', (err) => {
            console.error("Socket error:", err);
            socket.close();
            reject(err);
        });

        // Send request to each bulb
        const bufferMsg = Buffer.from(JSON.stringify(message));
        socket.send(bufferMsg, 0, bufferMsg.length, WIZ_PORT, ip, (err) => {
            if (err) {
                console.error(`Failed to send message to ${ip}:`, err);
            }
        });

    });
}


/**
 * Finds Wiz lights on the network via UDP broadcast.
 * @param waitTime - Time in milliseconds to wait for responses.
 * @returns Promise resolving to an array of discovered WizBulb objects.
 */
export async function findWizLights(waitTime: number = WAIT_TIME): Promise<WizBulbInfo[]> {
    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket('udp4');
        const discoveredBulbs: Map<string, WizBulbInfo> = new Map();

        const message = Buffer.from(JSON.stringify({
            method: "getSystemConfig",
            params: {}
        }));

        socket.on('message', (msg, rinfo) => {
            try {
                const response: WizResponse = JSON.parse(msg.toString());

                if (response.result?.mac) {
                    discoveredBulbs.set(rinfo.address, {
                        ip: rinfo.address,
                        mac: response.result.mac,
                        model: response.result.moduleName || "Unknown"
                    });
                }
            } catch (err) {
                console.error("Error parsing response:", err);
            }
        });

        socket.on('error', (err) => {
            console.error("Socket error:", err);
            socket.close();
            reject(err);
        });

        socket.bind(() => {
            socket.setBroadcast(true);
            socket.send(message, 0, message.length, WIZ_PORT, BROADCAST_ADDR, (err) => {
                if (err) {
                    console.error("Send error:", err);
                    socket.close();
                    reject(err);
                } else {
                    console.log("Broadcast sent, waiting for responses...");
                }
            });
        });

        setTimeout(() => {
            socket.close();
            resolve([...discoveredBulbs.values()]);
        }, waitTime);
    });
}

/**
 * Generates a UDP status message for Wiz bulbs.
 * @param id - Unique identifier for the request.
 * @returns Buffer containing the status request message.
 */
function statusMsgFromId(id: number): Buffer {
    return Buffer.from(JSON.stringify({
        id: id,
        method: "getPilot",
        params: {}
    }));
}


type LightFilterFunction = (data: WizResponse) => boolean;

export function partyFilter(data: WizResponse): boolean {
    return data.method === "getPilot" && data.result?.state === true && data.result?.sceneId === 4;
}

/**
 * Retrieves all Wiz bulbs that are currently turned on.
 * @param waitTime - Time in milliseconds to wait for responses.
 * @returns Promise resolving to an array of IP addresses for bulbs that are on.
 */

export async function getOnBulbsInfo(
    filterFunction: LightFilterFunction = (data) => data.method === "getPilot" && data.result?.state === true,
    waitTime: number = WAIT_TIME, 
): Promise<WizBulbInfo[]> {
    const discoveredBulbs: WizBulbInfo[] = await findWizLights();
    const ips: string[] = discoveredBulbs.map(bulb => bulb.ip);

    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket('udp4');
        const onBulbs: string[] = [];
        const pendingResponses: Set<string> = new Set(ips);

        const message = JSON.stringify({
            method: "getPilot",
            params: {}
        });

        let timeoutId = setTimeout(() => {
            socket.close();
            const onBulbInfo = discoveredBulbs.filter(device => onBulbs.includes(device.ip));
            resolve(onBulbInfo);
        }, waitTime);

        socket.on('message', (msg, rinfo) => {
            try {
                const data: WizResponse = JSON.parse(msg.toString());

                if (filterFunction(data)) {
                    onBulbs.push(rinfo.address);
                }

                // Remove IP from pending responses
                pendingResponses.delete(rinfo.address);

                // If all expected responses are received, close early
                if (pendingResponses.size === 0) {
                    clearTimeout(timeoutId);
                    socket.close();
                    const onBulbInfo = discoveredBulbs.filter(device => onBulbs.includes(device.ip));
                    resolve(onBulbInfo);
                }
            } catch (err) {
                console.error(`Error parsing response from ${rinfo.address}:`, err);
            }
        });

        socket.on('error', (err) => {
            console.error("Socket error:", err);
            socket.close();
            reject(err);
        });

        // Send request to each bulb
        ips.forEach(ip => {
            socket.send(message, 0, message.length, WIZ_PORT, ip, (err) => {
                if (err) {
                    console.error(`Failed to send message to ${ip}:`, err);
                    pendingResponses.delete(ip);
                }
            });
        });
    });
}

export async function getOnBulbs(
    filterFunction: LightFilterFunction = (data) => data.method === "getPilot" && data.result?.state === true,
    waitTime: number = WAIT_TIME, 
): Promise<Light[]> {
    const availableLightInfo = await getOnBulbsInfo(filterFunction, waitTime);
    return availableLightInfo.map((light) => {
            return new Light(light.ip);
    });

}

export function lightsFromWizInfo(info: WizBulbInfo[]) {
    return info.map((light) => {
        return new Light(light.ip);
        });
}

function askQuestion(rl: any, question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer:string) => resolve(answer.trim().toLowerCase()));
    });
}


export async function savePartyBulbsToGroup() {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });


    const info = await getOnBulbsInfo(partyFilter);
    const lights = lightsFromWizInfo(info);
    lights.forEach(light => light.turnOnWarmWhite())

    console.log(`Found ${lights.length} lights in party mode`)

    const response = await askQuestion(rl, "All party lights turned to warm white. Do you want to save these lights to a group? (y/n): ");
    
    let userInputName = undefined;
    if (response === "y") {
        userInputName = await askQuestion(rl, "Enter the desired group name: ");
        console.log("You entered:", userInputName);
    }

    rl.close();

    if(!userInputName) return; // Safety

    const macs = info.map((bulb) => bulb.mac);
    const file = `../bulb_groups/${userInputName}.json`;
    const filePath = join(__dirname, file);

    fs.writeFileSync(filePath, JSON.stringify(macs), "utf-8");

    console.log(`Successfully saved ${userInputName} group to ${filePath}`);
}


export async function getLightsFromBulbGroup(name: string): Promise<Light[]> {

    const file = `../bulb_groups/${name}.json`
    const filePath = join(__dirname, file);

    const rawData = fs.readFileSync(filePath, "utf-8");
    const macs = JSON.parse(rawData);

    const availableLightInfo = await findWizLights();
    const lights: Light[] = [];
    availableLightInfo.forEach((light) => {
        if (macs.includes(light.mac)) {
            lights.push(new Light(light.ip));
        }
    });

    return lights;
}

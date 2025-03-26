import dgram from 'dgram';
import * as fs from 'fs';
import { join } from 'path';

const BROADCAST_ADDR = '255.255.255.255';
const WIZ_PORT = 38899;
const WAIT_TIME = 3000;

// Define types for discovered bulbs
interface WizBulbInfo {
    ip: string;
    mac: string;
    model: string;
}



interface WizRequest {
    id: number;
    method: string;
    params: Object;
}

interface WizStateRequest extends WizRequest {
    method: "setState";
    params: {
        state: boolean;
    }
}

interface WizRgbRequest extends WizRequest {
    method: "setPilot";
    params: {
        r: number;
        g: number;
        b: number;
        dimming: number;
    }
}

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
    // mac: string;
    constructor(ip: string) {
        this.ip = ip;
        // this.mac = info.mac;
    }

    async turnOn() {
        const onMsg: WizStateRequest = {
            id: 1,
            method: "setState",
            params: {
                state: true,
            }
        }
        sendMessage(this.ip, onMsg)
    }

    async turnOff() {
        const offMsg: WizStateRequest = {
            id: 1,
            method: "setState",
            params: {
                state: false,
            }
        }
        sendMessage(this.ip, offMsg)
    }
}


/**
 * Retrieves all Wiz bulbs that are currently turned on.
 * @param waitTime - Time in milliseconds to wait for responses.
 * @returns Promise resolving to an array of IP addresses for bulbs that are on.
 */
export async function sendMessage(ip: string, message: WizRgbRequest | WizStateRequest, waitTime: number = WAIT_TIME): Promise<WizResponse> {

    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket('udp4');


        let timeoutId = setTimeout(() => {
            socket.close();
            console.error(`Bulb at ${ip} failed to respond before timing out`);
        }, waitTime);

        socket.on('message', (msg, rinfo) => {
            try {
                const data: WizResponse = JSON.parse(msg.toString());

                console.log("Light responded with ", data);
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

export async function getOnBulbs(
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


export async function saveOnBulbsToGroup(name: string) {

    const info = await getOnBulbs();
    const macs = info.map((bulb) => bulb.mac);
    const file = `../bulb_groups/${name}.json`;
    const filePath = join(__dirname, file);

    fs.writeFileSync(filePath, JSON.stringify(macs), "utf-8");

    console.log(`Successfully saved ${name} group to ${filePath}`);
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

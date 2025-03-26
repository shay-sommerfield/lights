import dgram from 'dgram';

const BROADCAST_ADDR = '255.255.255.255';
const WIZ_PORT = 38899;
const WAIT_TIME = 3000;

// Define types for discovered bulbs
interface WizBulbInfo {
    ip: string;
    mac: string;
    model: string;
}

// Define expected response structure
interface WizResponse {
    method: string;
    result?: {
        mac?: string;
        moduleName?: string;
        state?: boolean;
    };
}

class Light {
    ip: string;
    mac: string;
    constructor(info: WizBulbInfo){
        this.ip = info.ip;
        this.mac = info.mac;
    }

    async turnOn() {
        
    }
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

/**
 * Retrieves all Wiz bulbs that are currently turned on.
 * @param waitTime - Time in milliseconds to wait for responses.
 * @returns Promise resolving to an array of IP addresses for bulbs that are on.
 */
export async function getOnBulbs(waitTime: number = WAIT_TIME): Promise<string[]> {
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
            resolve(onBulbs);
        }, waitTime);

        socket.on('message', (msg, rinfo) => {
            try {
                const data: WizResponse = JSON.parse(msg.toString());

                if (data.method === "getPilot" && data.result?.state === true) {
                    console.log("pushing bulb")
                    onBulbs.push(rinfo.address);
                }

                // Remove IP from pending responses
                pendingResponses.delete(rinfo.address);

                // If all expected responses are received, close early
                if (pendingResponses.size === 0) {
                    clearTimeout(timeoutId);
                    socket.close();
                    resolve(onBulbs);
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

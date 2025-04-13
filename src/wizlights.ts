
import { findWizLights, sendMessage, WAIT_TIME, WIZ_PORT, WizBulbInfo, WizGetPilotResult, WizResponse, WizStateRequest, WizTempRequest } from './wiz-udp';
import dgram from 'dgram';


export namespace WizLights {

    export class Light {
        ip: string;
        _id: number;
        mac: string;
        lastStatus: Omit<WizGetPilotResult, 'mac'>;

        constructor(info: WizBulbInfo) {
            this._id = 0;
            this.ip = info.ip;
            this.mac = info.mac;
            this.lastStatus = {
                ...info
            }
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


    type LightFilterFunction = (data: WizResponse) => boolean;

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
        const onlineLightInfo = await getOnBulbsInfo(filterFunction, waitTime);
        return onlineLightInfo.map((info) => {
            return new Light(info);
        });

    }

    export function lightsFromWizInfo(infoArr: WizBulbInfo[]) {
        return infoArr.map((info) => {
            return new Light(info);
        });
    }
}

import { findWizLights, sendMessage, WAIT_TIME, WIZ_PORT, WizBulbInfo, WizGetPilotResult, WizResponse, WizStateRequest, WizTempRequest } from './wiz-udp';
import dgram from 'dgram';

/**
 * The class representation for a light. 
 */
export namespace WizLights {

    export class Light {
        ip: string;
        /* An incrementing ID, that makes each request to a light unique **/
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
                id: this.id,
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
}
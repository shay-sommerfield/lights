import {
  sendMessage,
  WizBulbInfo,
  WizGetPilotResult,
  WizStateRequest,
  WizTempRequest,
  WizRgbRequest,
} from "./wiz-udp";

/**
 * The class representation for a light.
 */
export namespace WizLights {
  export class Light {
    ip: string;
    /* An incrementing ID, that makes each request to a light unique **/
    _id: number;
    mac: string;
    lastStatus: Omit<WizGetPilotResult, "mac">;

    constructor(info: WizBulbInfo) {
      this._id = 0;
      this.ip = info.ip;
      this.mac = info.mac;
      this.lastStatus = {
        ...info,
      };
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
        },
      };
      await sendMessage(this.ip, onMsg);
    }

    async turnOnWarmWhite() {
      const onMsg: WizTempRequest = {
        id: 1,
        method: "setPilot",
        params: {
          temp: 3000,
          dimming: 75,
        },
      };
      await sendMessage(this.ip, onMsg);
    }

    async turnOnColor(inR: number, inG: number, inB: number, inDim: number) {
      const onMsg: WizRgbRequest = {
        id: 1,
        method: "setPilot",
        params: {
          r: inR,
          g: inG,
          b: inB,
          dimming: inDim,
        },
      };
      await sendMessage(this.ip, onMsg);
    }

    async turnOff() {
      const offMsg: WizStateRequest = {
        id: 1,
        method: "setState",
        params: {
          state: false,
        },
      };
      await sendMessage(this.ip, offMsg);
    }
  }
}

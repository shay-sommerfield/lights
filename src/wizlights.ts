import {
  isRgbParams,
  isTempParams,
  sendMessage,
  WizBulbInfo,
  WizGetPilotResult,
  WizParams,
  WizRequest,
  WizRgbParams,
  WizRgbRequest,
  WizStateRequest,
  WizTempRequest,
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

    async turnOn(params?: WizParams) {

      let onMsg: WizRequest;
      
      if (!params){
        onMsg = {
                id: this.id,
                method: "setState",
                params: {
                  state: true,
                },
              };
      } else if(isTempParams(params)) {
        const tempOnMsg: WizTempRequest = {
          id: this.id, 
          method: "setPilot",
          params
        }

        onMsg = tempOnMsg;
      } else if (isRgbParams(params)){
        const tempOnMsg: WizRgbRequest = {
          id: this.id, 
          method: "setPilot",
          params
        }

        onMsg = tempOnMsg;
      } 
      else {
        throw new Error('Invalid params passed to light');
      }
      
      await sendMessage(this.ip, onMsg);
      this.lastStatus.state = true;
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

    async turnOff() {
      const offMsg: WizStateRequest = {
        id: 1,
        method: "setState",
        params: {
          state: false,
        },
      };
      await sendMessage(this.ip, offMsg);
      this.lastStatus.state = false;
    }

    async toggle() {
      if (this.lastStatus.state) {
        this.turnOff();
      } else {
        this.turnOn();
      }
    }
  }
}

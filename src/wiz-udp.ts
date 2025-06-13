import dgram from "dgram";

/**
 * This file contains all types and methods that pertain to directly sending UDP messages to lights.
 */

const BROADCAST_ADDR = "255.255.255.255";
export const WIZ_PORT = 38899;
export const WAIT_TIME = 3000;

export type WizEnv =
  | "normal" // Manual control (user or app)
  | "schedule" // Schedule is currently controlling the light
  | "poweron" // State applied on power-on/reset
  | "init" // Default initial state after boot
  | "custom" // Custom settings not part of a predefined scene
  | "rc_scene" // Scene triggered via remote control
  | "rhythm" // Used in circadian rhythm or dynamic light changes
  | "pulse" // Possibly for music or special effect sync
  | "transition" // In a state of transitioning between presets
  | "setup" // In setup or pairing mode
  | "ota" // Over-the-air update state
  | "calibration" // Internal testing or calibration mode
  | "scene" // Actively in a named/static scene
  | "extcontrol"; // Being controlled by an external system (e.g., voice assistant)



export interface WizBaseRequest {
  id: number;
  method: string;
  params: Object;
}


export interface WizRgbParams {
    r: number;
    g: number;
    b: number;
    dimming: number;
  }

export interface WizStateParams {
  state: boolean;
  dimming?: boolean;
}

export interface WizTempParams {
    temp: number;
    dimming: number;
  }

export interface WizStateRequest extends WizBaseRequest {
  method: "setState";
  params: WizStateParams
}

export interface WizTempRequest extends WizBaseRequest {
  method: "setPilot";
  params: WizTempParams
}

export interface WizRgbRequest extends WizBaseRequest {
  method: "setPilot";
  params: WizRgbParams
}

// Type guard for WizTempParams
export function isTempParams(obj: any): obj is WizTempParams {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.temp === 'number'
  );
}

// Type guard for WizTempParams
export function isRgbParams(obj: any): obj is WizRgbParams {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.r === 'number' && 
     typeof obj.g === 'number' && 
      typeof obj.b === 'number'
  );
}

export type WizRequest = WizStateRequest | WizRgbRequest | WizTempRequest;
export type WizParams =  WizTempParams | WizRgbParams;

export interface WizGetPilotResult {
  mac: string;
  rssi: number;
  state: boolean;
  sceneId: number;
  temp: number;
  dimming: number;
  schdPsetId: number;
}

export interface WizGetPilotResponse {
  method: "getPilot";
  env: WizEnv;
  result: WizGetPilotResult;
}

// Define types for discovered bulbs
export interface WizBulbInfo extends WizGetPilotResult {
  ip: string;
}

export interface WizResponse {
  method: string;
  result?: {
    mac?: string;
    moduleName?: string;
    state?: boolean;
    rssi: number;
    sceneId?: number;
    dimming?: number;
  };
}

/**
 * Retrieves all Wiz bulbs that are currently turned on.
 * @param waitTime - Time in milliseconds to wait for responses.
 * @returns Promise resolving to an array of IP addresses for bulbs that are on.
 */
export async function sendMessage(
  ip: string,
  message: WizRequest,
  waitTime: number = WAIT_TIME,
): Promise<WizResponse> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4");

    let timeoutId = setTimeout(() => {
      socket.close();
      console.error(`Bulb at ${ip} failed to respond before timing out`);
    }, waitTime);

    socket.on("message", (msg, rinfo) => {
      try {
        const data: WizResponse = JSON.parse(msg.toString());

        clearTimeout(timeoutId);
        socket.close();
        resolve(data);
      } catch (err) {
        console.error(`Error parsing response from ${rinfo.address}:`, err);
      }
    });

    socket.on("error", (err) => {
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
export async function findWizLights(
  waitTime: number = WAIT_TIME,
): Promise<WizBulbInfo[]> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4");
    const discoveredBulbs: Map<string, WizBulbInfo> = new Map();

    const message = Buffer.from(
      JSON.stringify({
        method: "getPilot",
        params: {},
      }),
    );

    socket.on("message", (msg, rinfo) => {
      try {
        const response: WizGetPilotResponse = JSON.parse(msg.toString());

        if (response.result?.mac) {
          discoveredBulbs.set(rinfo.address, {
            ip: rinfo.address,
            ...response.result,
          });
        }
      } catch (err) {
        console.error("Error parsing response:", err);
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
      socket.close();
      reject(err);
    });

    socket.bind(() => {
      socket.setBroadcast(true);
      socket.send(
        message,
        0,
        message.length,
        WIZ_PORT,
        BROADCAST_ADDR,
        (err) => {
          if (err) {
            console.error("Send error:", err);
            socket.close();
            reject(err);
          } else {
            console.log("Broadcast sent, waiting for responses...");
          }
        },
      );
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
  return Buffer.from(
    JSON.stringify({
      id: id,
      method: "getPilot",
      params: {},
    }),
  );
}

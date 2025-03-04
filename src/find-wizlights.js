import dgram from 'dgram';

const BROADCAST_ADDR = '255.255.255.255';
const WIZ_PORT = 38899;
const WAIT_TIME = 3000;

export async function findWizLights(waitTime = WAIT_TIME) {
    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket('udp4');
        const discoveredBulbs = new Map();

        const message = Buffer.from(JSON.stringify({
            method: "getSystemConfig",
            params: {}
        }));

        socket.on('message', (msg, rinfo) => {
            try {
                const response = JSON.parse(msg.toString());
                const { result } = response;

                if (result && result.mac) {
                    discoveredBulbs.set(rinfo.address, {
                        ip: rinfo.address,
                        mac: result.mac,
                        model: result.moduleName || "Unknown"
                    });

                    // console.log(`Discovered: ${rinfo.address} (MAC: ${result.mac}, Model: ${result.moduleName})`);
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



function statusMsgFromId(id) {
    return Buffer.from(JSON.stringify({
        "id": id,
        "method":"getPilot",
        "params":{}
    }));
} 

export async function getOnBulbs(waitTime = WAIT_TIME) {

    const discoverdBulbs = await findWizLights();

    const ips = discoverdBulbs.map(val => val.ip);
    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket('udp4');
        const onBulbs = []
        const pendingResponses = new Set(ips); // Track which bulbs we are waiting for

        const message = JSON.stringify({
            method: "getPilot",
            params: {}
        });

         // Timeout to ensure resolution even if some bulbs don't respond
        let timeoutId = setTimeout(() => {
            socket.close();
            resolve(onBulbs);
        }, waitTime);

        // Listen for responses
        socket.on('message', (msg, rinfo) => {
            try {
                const data = JSON.parse(msg.toString());

                if (data.method === "getPilot" && data.result?.state === true) {
                    console.log(data);
                    onBulbs.push(rinfo.address);
                }

                // Remove IP from pending responses
                pendingResponses.delete(rinfo.address);

                // If all expected responses are received, close early
                if (pendingResponses.size === 0) {
                    clearTimeout(timeoutId); // Cancel the timeout
                    socket.close();
                    console.log(onBulbs);
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
import dgram from 'dgram';


const BROADCAST_ADDR = '255.255.255.255';
const WIZ_PORT = 38899;
const WAIT_TIME = 3000; // Adjust based on needs

export async function findWizLights(waitTime = WAIT_TIME) {
    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket('udp4');
        const discoveredBulbs = new Map();

        // Message to send (WiZ discovery request)
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

                    console.log(`Discovered: ${rinfo.address} (MAC: ${result.mac}, Model: ${result.moduleName})`);
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

        // Enable broadcasting
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

        // Wait for responses, then close socket and return results
        setTimeout(() => {
            socket.close();
            resolve([...discoveredBulbs.values()]);
        }, waitTime);
    });
}

// Run the discovery function
findWizLights().then((bulbs) => {
    console.log("Discovered bulbs:", bulbs);
}).catch((err) => {
    console.error("Discovery failed:", err);
});

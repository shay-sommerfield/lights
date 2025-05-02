import dgram from 'dgram';
import { findWizLights } from './find-wizlights.js';

const WIZ_PORT = 38899;

/**
 * Sends a UDP request to get the status of a single bulb.
 * @param {string} ip - The IP address of the bulb.
 * @param {number} timeout - The timeout in milliseconds.
 * @returns {Promise<Object>} - Resolves with the bulb's status.
 */
function getBulbStatus(ip,id, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const socket = dgram.createSocket('udp4');
        let socketClosed = false; 
        const message = Buffer.from(JSON.stringify({
            id,
            method: "getPilot",
            params: {}
        }));

        const onMessage = (msg, rinfo) => {
            if (rinfo.address === ip) { // Ensure response is from the correct bulb
                try {
                    const response = JSON.parse(msg.toString());
                    resolve({ ip, status: response.result });
                } catch (error) {
                    reject(new Error(`Invalid JSON response from ${ip}`));
                } finally {
                    socket.close();
                }
            }
        };

        socket.on('message', onMessage);
        socket.on('error', (err) => {
            reject(new Error(`Error with ${ip}: ${err.message}`));
            socket.close();
        });

        socket.send(message, 0, message.length, WIZ_PORT, ip, (err) => {
            if (err) {
                reject(new Error(`Failed to send message to ${ip}`));
                // Close socket only if it's not already closed
                if (!socketClosed) {
                    socket.close();
                    socketClosed = true;
                }
            }
        });

        // Timeout function to reject if no response within the time limit
        setTimeout(() => {
            if (!socketClosed) {
                try {
                    socket.close(); // Attempt to close the socket
                    socketClosed = true; // Mark as closed
                } catch (e) {
                    reject(new Error(`Error closing socket for ${ip}: ${e.message}`)); // Handle error if already closed
                }
                reject(new Error(`Timeout waiting for response from ${ip}`));
            }
        }, timeout);

    });
}

/**
 * Fetches statuses for multiple bulbs in parallel.
 * @param {string[]} bulbs - Array of bulb IP addresses.
 * @returns {Promise<Array>} - Resolves with an array of bulb statuses.
 */
async function getAllBulbStatuses(bulbs) {

    return Promise.allSettled(bulbs.map((ip,i) => getBulbStatus(ip, i)));
}

async function getBulbIps() {
    const bulbs = await findWizLights();
    return bulbs.map(bulb => bulb.ip);
    // const data = fs.readFileSync('data.json', 'utf8');
    // const jsonData = JSON.parse(data);

    // console.log(jsonData);
}


const bulbIPs = await getBulbIps();

getAllBulbStatuses(bulbIPs)
    .then(results => {
        results.forEach(result => {
            if (result.status === "fulfilled") {
                console.log(`✅ Bulb ${result.value.ip}:`, result.value.status);
            } else {
                console.error(`❌ Bulb error:`, result.reason);
            }
        });
    });

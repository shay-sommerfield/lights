const dgram = require('dgram');

const sendUdpMessage = (message, ip, port) => {
    return new Promise((resolve, reject) => {
        const client = dgram.createSocket('udp4');
        
        client.send(message, port, ip, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`Message sent to ${ip}:${port}`);
                resolve();
            }
            client.close();
        });

        client.on('error', (err) => {
            reject(err);
            client.close();
        });
    });
};


const SERVER_PORT = 38899;  // Replace with your server's port
const ipAddresses = [
    '192.168.1.112',
    '192.168.1.115',
    '192.168.1.116',
    ]
// Function to delay execution for a specified number of milliseconds
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const loopSendMessages = async () => {
    let state = false;

    while (true) {
        // Toggle the state
        state = !state;

        // Create the JSON payload
        const jsonPayload = {
            "id": 1,
            "method": "setState",
            "params": {
                "state": state
            }
        };

        // Convert JSON to string and then to a buffer
        const message = Buffer.from(JSON.stringify(jsonPayload));

        // Send the message to all IPs
        const sendPromises = ipAddresses.map(ip => sendUdpMessage(message, ip, SERVER_PORT));

        try {
            await Promise.all(sendPromises);
        } catch (err) {
            console.error('Failed to send messages:', err);
        }

        // Wait for 1 second before sending the next set of messages
        await delay(1000);
    }
};

// Start the loop
loopSendMessages();

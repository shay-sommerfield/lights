const dgram = require('dgram');
const client = dgram.createSocket('udp4');

// UDP server address and port
const SERVER_PORT = 38899;
const SERVER_HOST = '192.168.1.112';

// Message to send
const onMsg = Buffer.from(
    JSON.stringify({
    "id": 1,
    "method": "setState",
    "params": {
        "state": true
    }
}));

const offMsg = Buffer.from(
    JSON.stringify({
    "id": 1,
    "method": "setState",
    "params": {
        "state": false
    }
}));

const ips = [
    '192.168.1.112',
    '192.168.1.115',
    '192.168.1.116',
    ]

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

// const sendPromises = ips.map(ip => sendUdpMessage(onMsg, ip, SERVER_PORT));

// Promise.all(sendPromises)
//     .then(() => {
//         console.log('All messages sent successfully!');
//     })
//     .catch((err) => {
//         console.error('Failed to send messages:', err);
//     });

console.log(JSON.stringify({
    "id": 1,
    "method": "setState",
    "params": {
        "state": false
    }
}));
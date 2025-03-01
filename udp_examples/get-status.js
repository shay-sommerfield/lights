const dgram = require('dgram');
const { send } = require('process');
const { start } = require('repl');

const WIZ_LIGHT_IP = '192.168.1.136'; // Replace with your WiZ light's IP address
const WIZ_PORT = 38899;

// JSON message to request the light's status
const statusMsg = Buffer.from(JSON.stringify({"method":"getPilot","params":{}}));
const onMsg = Buffer.from(JSON.stringify({
    "id": 1,
    "method": "setState",
    "params": {
        "state": true
    }
}));

// Create a UDP socket
const socket = dgram.createSocket('udp4');

function sendMsg(msg) {
    // Send the message to the light
    socket.send(msg, 0, msg.length, WIZ_PORT, WIZ_LIGHT_IP, (err) => {
        if (err) {
            console.error(`Send error: ${err.message}`);
            socket.close();
        } else {
            console.log(`Successfully sent: ${msg}`);
        }
    });
}

// The brightness level for a light
let returnedLevel = 0;
socket.on('message', (msg, rinfo) => {
    console.log(`Received response from ${rinfo.address}: ${msg}`);
    const data = JSON.parse(msg.toString())
    if (data.method === "getPilot" && data.result.dimming) {
        returnedLevel = data.result.dimming
    }
});

socket.on('error', (err) => {
    console.error(`Socket error: ${err.message}`);
    socket.close();
});


// Close socket manually when done (optional)
process.on('SIGINT', () => {
    console.log("\nClosing socket...");
    socket.close();
    process.exit();
});

const daylightMsg = {"id":1,"method":"setPilot","params":{"sceneId":12,"dimming":100}};

const startTime = Date.now();
let dt = Date.now() - startTime;
let running = true;
const timeTo100 = 3000; //ms

let curLevel = 0;

function setBrightness() {
    const val = Math.round(dt*100/timeTo100);
    dt = Date.now() - startTime;
    if (dt > timeTo100 || curLevel >= 100 || val  ) {
        console.log("terminating")
        console.log("dt", dt);
        console.log("level", curLevel)
        running = false;
        return;
    };

    curLevel = 0;
    console.log("Current level: ", curLevel);
    console.log("Returned level: ", returnedLevel);
    if (curLevel !== returnedLevel) return;

    console.log("Time passed: ", dt);
    daylightMsg.params.dimming = val;
    console.log("Setting brightness to: ", val)
    console.log("sending message")
    sendMsg(Buffer.from(JSON.stringify(daylightMsg)));
}


function discover() {
    const fs = require('fs');
    const findWizLights = require('./find-wizlights')

    // Run the discovery function
    findWizLights().then((bulbs) => {
        console.log("Discovered bulbs:", bulbs);
    }).catch((err) => {
        console.error("Discovery failed:", err);
    });
    // const data = fs.readFileSync('data.json', 'utf8');
    // const jsonData = JSON.parse(data);

    // console.log(jsonData);
}

// sendMsg(onMsg)

discover();


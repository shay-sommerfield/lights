ips = [
'192.168.1.112',
'192.168.1.115',
'192.168.1.116',
]

import socket
import json
from time import sleep
import asyncio

# def send_udp_message(ip, port, message_bytes):
#     """Sends a UDP message to the specified IP and port."""
#     # Create a UDP socket
#     sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
#     try:
#         sock.sendto(message_bytes, (ip, port))
#     finally:
#         # Close the socket
#         sock.close()

class UDPClientProtocol(asyncio.DatagramProtocol):
    def __init__(self):
        self.transport = None

    def connection_made(self, transport):
        self.transport = transport

    def error_received(self, exc):
        print(f"Error received: {exc}")

    def connection_lost(self, exc):
        if exc:
            print(f"Connection lost: {exc}")
        self.transport = None

async def send_udp_message(ip, port, message_bytes):
    """Sends a UDP message to the specified IP and port asynchronously."""
    loop = asyncio.get_running_loop()
    protocol = UDPClientProtocol()

    # Create a datagram endpoint
    connect = loop.create_datagram_endpoint(lambda: protocol, remote_addr=(ip, port))
    transport, _ = await connect
    
    try:
        # Send the message
        protocol.transport.sendto(message_bytes)
        print(f"Message sent to {ip}:{port}")
    finally:
        # Close the transport
        transport.close()


async def send_message_to_all_ips(ips, port, message_bytes):
    """Sends the UDP message to all specified IP addresses concurrently."""
    tasks = [send_udp_message(ip, port, message_bytes) for ip in ips]
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    # Replace with your target IP address and port
    TARGET_IP = ips[0]
    TARGET_PORT = 38899

    on_message = json.dumps({
        "id": 1,
        "method": "setState",
        "params": {
            "state": True
        }
    }).encode()

    off_message = json.dumps({
        "id": 1,
        "method": "setState",
        "params": {
            "state": False
        }
    }).encode()

    SLEEP_TIME = 3

    while True:
        asyncio.run(send_message_to_all_ips(ips, TARGET_PORT, on_message))
        sleep(3)
        asyncio.run(send_message_to_all_ips(ips, TARGET_PORT, off_message))
        sleep(3)



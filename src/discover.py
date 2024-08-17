from pywizlight.discovery import discover_lights
from bulb_groups import save_bulb_group

async def discover():
    bulbs = await discover_lights(broadcast_space="192.168.1.255")
    bulb_macs = []
    for bulb in bulbs:
        print(bulb.ip, bulb.mac, bulb.bulbtype)
        bulb_macs.append(bulb.mac)
    
    save_bulb_group('three_orbs', bulb_macs)

# Run the discover function
import asyncio
asyncio.run(discover())
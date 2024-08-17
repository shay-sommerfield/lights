#!/usr/bin/env python
import argparse
import asyncio

from pywizlight.discovery import discover_lights

from bulb_groups import save_bulb_group

async def discover():
    bulbs = await discover_lights(broadcast_space="192.168.1.255")
    bulb_macs = []
    for bulb in bulbs:
        print(bulb.ip, bulb.mac, bulb.bulbtype)
        bulb_macs.append(bulb.mac)
    
    if args.save:
        save_bulb_group(args.save, bulb_macs)

# Run the discover function
if __name__=="__main__":
   # Initialize the parser
    parser = argparse.ArgumentParser(description="Process some optional arguments.")

    # Add optional arguments
    parser.add_argument("--save", help="name to save bulb address to the bulb_groups directory")

    # Parse the arguments
    args = parser.parse_args()

    # Accessing the arguments
    option1 = args.save
    asyncio.run(discover())
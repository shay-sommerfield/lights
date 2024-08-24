#!/usr/bin/env python
import argparse
import asyncio
import json

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

async def iterate():
    bulbs = await discover_lights(broadcast_space="192.168.1.255")
    for bulb in bulbs:
        print(bulb.ip, bulb.mac, bulb.bulbtype)
        await bulb.turn_off()
        await asyncio.sleep(1)
        await bulb.turn_on()
        await asyncio.sleep(1)
        await bulb.turn_off()
        await asyncio.sleep(1)

async def save_group_with_ips():
    ips = args.ip_addresses.split(",")
    bulbs = await discover_lights(broadcast_space="192.168.1.255")
    bulb_macs = []
    for bulb in bulbs:
        if bulb.ip in ips:
            bulb_macs.append(bulb.mac)
    
    save_bulb_group(args.save, bulb_macs)

# Run the discover function
if __name__=="__main__":
   # Initialize the parser
    parser = argparse.ArgumentParser(description="Process some optional arguments.")

    # Add optional arguments
    parser.add_argument("-s","--save", type=str, help="name to save bulb address to the bulb_groups directory")
    parser.add_argument("-i","--iterate", action="store_true", help="Turn the bulbs off one by one to assign them to groups")
    parser.add_argument("--ip_addresses", type=str, help="IP addresses to save to a group, comma seperated: (--ip_addresses '192.168.1.108,192.168.1.100')")

    # Parse the arguments
    args = parser.parse_args()

    # Accessing the arguments
    if args.iterate:
        asyncio.run(iterate())
    elif args.ip_addresses and args.save:
        asyncio.run(save_group_with_ips())
    else:
        asyncio.run(discover())
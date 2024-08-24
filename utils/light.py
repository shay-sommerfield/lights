#!/usr/bin/env python
import argparse
import asyncio
from pywizlight import wizlight
from typing import List

from bulb_groups import get_wiz_light_from_group

async def turn_on(group: str):
    lights: List[wizlight]  = await get_wiz_light_from_group(group)
    for light in lights:
        await light.turn_on()

async def turn_off(group: str):
    lights = await get_wiz_light_from_group(group)
    for light in lights:
        await light.turn_off()
        
# Run the discover function
if __name__=="__main__":
   # Initialize the parser
    parser = argparse.ArgumentParser(description="Process some optional arguments.")

    # Add optional arguments
    parser.add_argument("--on", action="store_true", help="turn the group on")
    parser.add_argument("--off", action="store_true", help="turn the group off")
    parser.add_argument('group', help='bulb group name is ther first positional argument')


    # Parse the arguments
    args = parser.parse_args()

    # Accessing the arguments
    if args.on:
        asyncio.run(turn_on(args.group))
    elif args.off:
        asyncio.run(turn_off(args.group))
    else:
        print("No option passed. Doing nothing.")
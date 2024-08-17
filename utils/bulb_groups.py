import json
import os
from typing import List
import sys

from pywizlight import wizlight, discovery

def save_bulb_group(group_name: str, mac_array: List[str]):
    
    if len(mac_array) <= 0:
        sys.stderr.write((f'\nError:\nThere are no bulb mac addresses to save\n'))
        sys.exit(1)
        
    # Write the array to a JSON file
    file_path = f'../bulb_groups/{group_name}.json'
    if os.path.exists(file_path):
        sys.stderr.write((f'\nError:\n{file_path} already exists. Not saving bulbs\n'))
        sys.exit(1)
    else:
        with open(file_path, "w") as json_file:
            json.dump(mac_array, json_file)
        print(f'Successfully saved bulb group: {group_name}')

    

def get_bulb_group_macs(group_name: str) -> List[str]:
    # Write the array to a JSON file
    with open(f'../bulb_groups/{group_name}.json') as json_file:
        macs = json.load(json_file)
    
    return macs

async def get_wiz_light_from_group(group_name: str) -> List[wizlight]:
    mac_addresses = get_bulb_group_macs(group_name)
    bulbs = await discovery.discover_lights()

    lights = []
    for bulb in bulbs:
        if bulb.mac == mac_addresses:
            lights.append(wizlight(bulb.ip))

    return lights
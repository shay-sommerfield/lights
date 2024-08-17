import json
from typing import List

def save_bulb_group(group_name: str, mac_array: List[str]):
    print('Writing mac array to json:')
    print(mac_array)
    # Write the array to a JSON file
    with open(f'../bulb_groups/{group_name}.json', "w") as json_file:
        json.dump(mac_array, json_file)

def get_bulb_group_macs(group_name: str) -> List[str]:
    # Write the array to a JSON file
    with open(f'../bulb_groups/{group_name}.json') as json_file:
        macs = json.load(json_file)
    
    return macs
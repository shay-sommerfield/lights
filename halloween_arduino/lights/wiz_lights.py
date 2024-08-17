import asyncio
from asyncio.windows_events import SelectorEventLoop
import time
from pywizlight import wizlight, PilotBuilder, discovery
import json
from os.path import exists
import pickle

class Light:
    def __init__(self,bulb):
        self.name = input("Enter a name for the bulb: ")
        self.room = input("Enter the room the bulb is in: ")
        print("\n")
        self.bulb = bulb

    def __init__(self,bulb,dict):
        self.bulb = bulb
        self.name = dict[bulb.ip]["name"]
        self.room = dict[bulb.ip]["room"]

async def get_bulbs():
    """Sample code to work with bulbs."""
    # Discover all bulbs in the network via broadcast datagram (UDP)
    # function takes the discovery object and returns a list with wizlight objects.

    # used a broadcast address calculator. Subnet mask and ip address is used to determine the broadcast address. 
    
    bulbs = await discovery.discover_lights(broadcast_space="192.168.71.255")
    # Print the IP address of the bulb on index 0
    

    if len(bulbs) > 0:
        print(str(len(bulbs)) + " bulbs were found")
    else:
        print("No bulbs were found.")

    return bulbs

async def name_bulbs(bulbs):

    for bulb in bulbs:
        await bulb.turn_on()

    bulb_list = []
    for bulb in bulbs:
        await bulb.turn_off()
        bulb_list.append(Light(bulb))
        await bulb.turn_on()
    
    bulb_dict = {}
    for light in bulb_list:
        bulb_dict[light.bulb.ip] = {"room":light.room, "name":light.name}
    
    json.dump(bulb_dict,open("bulb_info.json",'w'))
    # # Iterate over all returned bulbs
    # for bulb in bulbs:
    #     print(bulb.__dict__)
        # Turn off all available bulbs
        # await bulb.turn_off()

   # Set up a standard light
    #light = wizlight("192.168.68.57")
    # Set up the light with a custom port
    #light = wizlight("your bulb's IP address", port=12345)

    # The following calls need to be done inside an asyncio coroutine
    # to run them fron normal synchronous code, you can wrap them with
    # asyncio.run(..).
    # await light.turn_on(PilotBuilder(rgb = (128, 128, 128)))
    # sleep(3)
    
    # slowly brighten over a period of time
   

    # state = await light.updateState()
    # state = state.get_state()

    # if state == True:
    #     await light.turn_off()
    # else:
    #     await light.turn_on(PilotBuilder(warm_white=255))

async def brighten(light,numSec):
    curTime = time.time()
    startTime = curTime
    endTime = curTime + numSec
    timePassed = 0

    while curTime < endTime:
        lightVal = int(timePassed/numSec*255)
        if lightVal >= 1:
            await light.turn_on(PilotBuilder(warm_white = lightVal))

        # update current time and time passed
        curTime = time.time()
        timePassed = curTime - startTime

async def save_color(lights,room,color_name):
    for light in lights:
        if room in light.room:
            state = light.bulb.getState()
            rgb = state.get_rgb()
            break

    if exists("color.json"):
        data = json.load("color.json")
    else:
        data = {}
        data[color_name] = rgb
    data = json.dump(open("color.json",'w'),indent=4)

async def main():
    
    with open("IP_addresses.bin",'rb') as f:
        IPs = pickle.load(f)
    with open("bulb_info.json") as f:
        bulb_info_dict = json.load(f)
    bulbs = [wizlight(ip,bulb_info_dict) for ip in IPs]


    # light_info = json.load(open("bulb_info.json"))
    # lights = [Light(bulb,light_info[bulb.ip]["name"],light_info[bulb.ip]["room"]) for bulb in bulbs]

    # time.sleep(5)
    # lime_green = (50,205,50)
    # for light in lights:
    #     if light.room in "living room":
    #         await light.bulb.turn_on(PilotBuilder(rgb = (82, 24, 250)))
    #     elif light.room in "office":
    #         await light.bulb.turn_on(PilotBuilder(rgb = lime_green,brightness=255))
    #     elif light.room in "bed room":
    #         await light.bulb.turn_on(PilotBuilder(rgb = (255, 0, 0)))
    #     else:
    #         raise Exception("This light had issues: " + light.name + " in " + light.room)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
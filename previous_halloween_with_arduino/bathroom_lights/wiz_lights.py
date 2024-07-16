import asyncio
from asyncio.windows_events import SelectorEventLoop
import time
from pywizlight import wizlight, PilotBuilder, discovery
import json
from os.path import exists
import pickle
import serial

class Light:
    # def __init__(self,bulb):
    #     self.name = input("Enter a name for the bulb: ")
    #     self.room = input("Enter the room the bulb is in: ")
    #     print("\n")
    #     self.bulb = bulb

     def __init__(self,bulb,bulb_dict):
        # if dict == None:
        #     self.name = input("Enter a name for the bulb: ")
        #     self.room = input("Enter the room the bulb is in: ")
        #     print("\n")
        # else:
        self.name = bulb_dict[bulb.ip]["name"]
        self.room = bulb_dict[bulb.ip]["room"]
        self.bulb = bulb

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

def read(arduino):
    arduino.write(bytes("1", 'utf-8'))
    time.sleep(0.05)
    button_value = int.from_bytes(arduino.readline(),"little") - 658736
    # if button_value > 0:
    #     return True
    # else:
    #     return False
    return button_value


#--------------------- Main -----------------------------------------
async def main():
    
    with open("IP_addresses_new.bin",'rb') as f:
        IPs = pickle.load(f)

    with open("bulb_info_2_dict.json") as f:
        bulb_info_dict = json.load(f)

    bathroom_lights = []
    # filter bathroom lights
    for key in bulb_info_dict.keys():
        for ip in IPs:
            if ip in key:
                bathroom_lights.append(ip)

    lights = [Light(wizlight(ip),bulb_info_dict) for ip in bathroom_lights]

    arduino = serial.Serial(port="COM7",baudrate="9600",timeout=0.1)

    # read a few times to handle initial errors
    button_val = read(arduino)
    time.sleep(0.1)
    button_val = read(arduino)
    time.sleep(0.1)
    button_val = read(arduino)
    time.sleep(0.1)

    red = (255,0,0)
    warm_white = (253,244,220)

    while True:
        last_button_val = button_val
        button_val = read(arduino)
    
        if(button_val > 0 and last_button_val < 1):
            for light in lights:
                await light.bulb.turn_on(PilotBuilder(rgb=red,brightness=128))
            #print("turn on")
        elif(button_val < 1 and last_button_val > 0):
            for light in lights:
                await light.bulb.turn_on(PilotBuilder(rgb=warm_white,brightness=128))
            #print("turn off")
        time.sleep(0.1)


    


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


# ------------- how to add nwe lights, turn off all other lights and run this
  

    # bulbs = await discovery.discover_lights(broadcast_space="192.168.71.255")
    # print(type(bulbs[0].ip))
    # lights = []
    # for bulb in bulbs:
    #     await bulb.turn_on()
    
    # i = 1
    # for bulb in bulbs:
 
    #     light = Light(bulb,i)
    #     lights.append(light)
    #     i += 1

    # new_bulb_dict = {}
    # for light in lights:
    #     new_bulb_dict[light.bulb.ip] = {"room":light.room,"name":light.name}

    # with open("bulb_info_3_dict.json",'w') as f:
    #     json.dump(new_bulb_dict,f,indent=4)

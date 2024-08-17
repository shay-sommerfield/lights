import asyncio
from pywizlight import discovery, PilotBuilder, wizlight
from time import sleep
import time
from typing import List
import sys

from bulb_groups import get_bulb_group_macs

three_orb_macs = get_bulb_group_macs('three_orbs')

MIN_FLOAT=sys.float_info.min

def now():
	return time.time()

async def detect_lights() -> List[wizlight]:
	bulbs = await discovery.discover_lights()
	orb_lights = []
	for number, bulb in enumerate(bulbs):
		if bulb.mac in three_orb_macs:
			orb_lights.append(wizlight(bulb.ip))
	
	return orb_lights

async def main_loop():
	orbs = await detect_lights()
	top = orbs[0]
	middle = orbs[1]
	bottom = orbs[2]

	for light in orbs:
		await light.turn_off()
		sleep(1)

	for light in orbs:
		await light.turn_on()
		sleep(1)

# async def main_loop():

# 	lights = [wizlight(ip) for ip in bathroom_ips]
# 	mixer.init()
# 	mixer.music.load('../deep_singing_monk.mp3')
# 	mixer.music.play()

# 	duration =  2*60 + 13 # seconds
# 	try:
# 		await asyncio.gather(*[light.turn_on(PilotBuilder(rgb=(255,0,0))) for light in lights])
# 	except Exception as e: 
# 		print(e)
	
# 	sleep(duration)
# 	mixer.music.stop()
# 	mixer.music.unload()

if __name__ == "__main__":
	loop = asyncio.get_event_loop()
	loop.run_until_complete(main_loop())




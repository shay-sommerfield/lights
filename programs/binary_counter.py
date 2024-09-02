import asyncio
from itertools import cycle
from pywizlight import discovery, PilotBuilder, wizlight
from time import sleep
import time
from typing import List, Optional
import sys

from utils.bulb_groups import get_wiz_light_from_group

async def turn_all_off(bulbs: List[wizlight]):
	"""Turns off all Wiz lights concurrently."""
	tasks = [bulb.turn_off() for bulb in bulbs]
	await asyncio.gather(*tasks)

async def turn_all_on(bulbs: List[wizlight]):
	"""Turns on all Wiz lights concurrently."""
	tasks = [bulb.turn_on() for bulb in bulbs]
	await asyncio.gather(*tasks)

async def toggle(bulbs: List[wizlight]):
	"""Turns on all Wiz lights concurrently."""
	# tasks = [bulb.lightSwitch() for bulb in bulbs]
	await asyncio.gather(bulbs[0].lightSwitch(), bulbs[1].lightSwitch(), bulbs[2].lightSwitch())

async def change_light_state(orbs: List[wizlight], num: str, old_num: str):
	tasks = []
	for i, digit in enumerate(num):
		old_digit = old_num[i]
		if digit != old_digit:
			if digit == "1":
				tasks.append(orbs[i].turn_on())
			elif digit == "0":
				tasks.append(orbs[i].turn_off())
	
	await asyncio.gather(*tasks)

	
async def main_loop(orb_lights: Optional[List[wizlight]] = None):
	if not orb_lights:
		orb_lights = await get_wiz_light_from_group('three_orbs')	
	await turn_all_off(orb_lights)

	binary_0_to_8 = [
		"000",
		"001",
		"010",
		"011",
		"100",
		"101",
		"110",
		"111",
	]

	lastNum = "000"
	for num in cycle(binary_0_to_8):
		await change_light_state(orb_lights, num, lastNum)
		lastNum = num
		await asyncio.sleep(3)

		

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
	loop = asyncio.new_event_loop()
	loop.run_until_complete(main_loop())




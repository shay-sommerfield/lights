
# library for waiting for network operations to finish
import asyncio 

# Just for knowing what types you can enter in your IDE
from typing import List, Tuple 

# Custom util I made for saving bulbs.
# This function gets you the lights directly via a name
from utils.bulb_groups import get_wiz_light_from_group

# PilotBuilder makes colors and settings
# Wizlight is how you make calls to a light
from pywizlight import PilotBuilder, wizlight

# You know this one
from time import sleep

# continually iterates through an array
from itertools import cycle, islice


assortment_of_color_rgbs = [
	(0,0,255),
	(0,255,0),
	(0,255,255),
	(255,0,0),
	(255,0,255),
	(255,255,0),
	(255,255,255),
]

metro_palette = [
	(0,174,219),
	(162,0,255),
	(244,120,53),
	(212,18,67),
	(142,193,39)
]

brighter_palette = [
	(212,18,67),
	(0,19,222),
	(5,213,250),
	(243,119,53),
	(50,205,50)
]

rgb_palette = [
	(0, 0, 255),
	(0, 255, 0),
	(255, 0, 0)
]

new_palette = [
	(88, 0, 255),
	(255, 100, 0),
	(25, 255, 0)
]

async def turn_all_off(bulbs: List[wizlight]):
	for bulb in bulbs:
		await bulb.turn_off()

async def turn_all_to_color(bulbs: List[wizlight], rgb_color_tuple: Tuple[int, int, int] ):
	# make the color type that wizlights use
	color = PilotBuilder(rgb=rgb_color_tuple)
	for bulb in bulbs:
		await bulb.turn_on(color)

#cycle through colors and change lights sequentially
async def color_sequence(bulbs: List[wizlight]):
	# make the color type that wizlights use
	for rgb_color_tuple in cycle(brighter_palette):
		for bulb in bulbs:
			color = PilotBuilder(rgb=rgb_color_tuple)
			await bulb.turn_on(color)
			sleep(0.5)

#cycle through colors and change all three lights at the same time
async def color_sequence_in_sync(bulbs: List[wizlight]):
	# make the color type that wizlights use
	for rgb_color_tuple in cycle(brighter_palette):
		color = PilotBuilder(rgb=rgb_color_tuple)
		await asyncio.gather(bulbs[0].turn_on(color), bulbs[1].turn_on(color), bulbs[2].turn_on(color))
		sleep(2)

#generic function to cycle light through colors at desired starting point in array
async def color_cycle(bulb: wizlight, i: int):
	# continually iterate through list and shift starting point according to i
	rgb_colors = cycle(new_palette)
	shifted_colors = islice(rgb_colors, i, None)
	for rgb_color_tuple in shifted_colors:
		color = PilotBuilder(rgb=rgb_color_tuple)
		await bulb.turn_on(color)
		await asyncio.sleep(3) #await coroutine

#goal is to change color of three lights in shifted sequence simultaneously
async def run_cycle_for_all_lights(bulbs: List[wizlight]):
	await asyncio.gather(color_cycle(bulbs[0], 0), color_cycle(bulbs[1], 1), color_cycle(bulbs[2], 2))
		
async def change_light_state(orbs: List[wizlight], num):
	for i, digit in enumerate(num):
		if digit == "1":
			await orbs[i].turn_on()
		elif digit == "0":
			await orbs[i].turn_off()
	
async def main_loop():
	# get wiz lights using the name of a file stored in
	# the bulb_groups directory
	orb_lights = await get_wiz_light_from_group('three_orbs')

	# all actions related to making calls to the light must be awaited
	# This is denoted by 'async' at the start of a method

	# Spicy 🌶️
	while True:
		#await color_sequence(orb_lights)
		#await color_sequence_in_sync(orb_lights)
		await run_cycle_for_all_lights(orb_lights)
		
if __name__ == "__main__":
	asyncio.run(main_loop())
	
	#keep below for future reference if above breaks sync
	#loop = asyncio.new_event_loop()
	#loop.run_until_complete(main_loop())




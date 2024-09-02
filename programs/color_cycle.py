
# library for waiting for network operations to finish
import asyncio 
from itertools import cycle
from typing import List, Optional, Tuple 
from time import sleep

from pywizlight import PilotBuilder, wizlight

from utils.bulb_groups import get_wiz_light_from_group


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
		await asyncio.sleep(2)

#generic function to cycle light through colors at desired starting point in array
async def color_cycle(bulb: wizlight, rgb_color_tuple):
	# continually iterate through list and shift starting point according to i
	color = PilotBuilder(rgb=rgb_color_tuple)
	await bulb.turn_on(color)

#goal is to change color of three lights in shifted sequence simultaneously
async def run_cycle_for_all_lights(bulbs: List[wizlight], palette):
	i = 0
	j = 1
	k = 2
	while True:
		await asyncio.gather(color_cycle(bulbs[0], palette[i]), color_cycle(bulbs[1], palette[j]), color_cycle(bulbs[2], palette[k]))
		await asyncio.sleep(2)
		i = i+1 if i<len(rgb_palette)-1 else 0
		j = j+1 if j<len(rgb_palette)-1 else 0
		k = k+1 if k<len(rgb_palette)-1 else 0
		
async def change_light_state(orbs: List[wizlight], num):
	for i, digit in enumerate(num):
		if digit == "1":
			await orbs[i].turn_on()
		elif digit == "0":
			await orbs[i].turn_off()
	
async def main_loop(orb_lights: Optional[List[wizlight]] = None):
	if not orb_lights:
		orb_lights = await get_wiz_light_from_group('three_orbs')	

	# all actions related to making calls to the light must be awaited
	# This is denoted by 'async' at the start of a method

	# Spicy 🌶️
	while True:
		#await color_sequence(orb_lights)
		#await color_sequence_in_sync(orb_lights)
		await run_cycle_for_all_lights(orb_lights, rgb_palette)
		
if __name__ == "__main__":
	asyncio.run(main_loop())
	

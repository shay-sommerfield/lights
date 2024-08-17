
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


assortment_of_color_rgbs = [
	(0,0,0),
	(0,0,255),
	(0,255,0),
	(0,255,255),
	(255,0,0),
	(255,0,255),
	(255,255,0),
	(255,255,255),
]

async def turn_all_off(bulbs: List[wizlight]):
	for bulb in bulbs:
		await bulb.turn_off()

async def turn_all_to_color(bulbs: List[wizlight], rgb_color_tuple: Tuple[int, int, int] ):
	# make the color type that wizlights use
	color = PilotBuilder(rgb=rgb_color_tuple)
	for bulb in bulbs:
		await bulb.turn_on(color)

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
	await turn_all_off(orb_lights)

	# # change from red to green to blue
	# # loop forever so this never stops
	while True:
		await turn_all_to_color(orb_lights, (255, 0, 0))
		sleep(1)
		await turn_all_to_color(orb_lights, (0, 255, 0))
		sleep(1)
		await turn_all_to_color(orb_lights, (0, 0, 255))
		sleep(1)


	# # Spicy 🌶️
	# i = 0
	# while True:
	# 	if i >= len(assortment_of_color_rgbs):
	# 		i = 0
	# 	color = assortment_of_color_rgbs[i]
	# 	await turn_all_to_color(orb_lights, color)
	# 	i += 1
	# 	sleep(1)
		
if __name__ == "__main__":
	# Not sure why these are needed exactly, but they is required
	# to run an asynchronous function to completion.

	# My guess is that it abstracts the checking that 
	# an aynchronous operation has has completed.
	loop = asyncio.new_event_loop()
	loop.run_until_complete(main_loop())




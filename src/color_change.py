import asyncio
from pywizlight import discovery, PilotBuilder, wizlight
from time import sleep
from typing import List

from src.bulb_groups import get_wiz_light_from_group


async def turn_all_off(bulbs: List[wizlight]):
	for bulb in bulbs:
		await bulb.turn_off()

async def change_light_state(orbs: Listx[wizlight], num):
	for i, digit in enumerate(num):
		if digit == "1":
			await orbs[i].turn_on()
		elif digit == "0":
			await orbs[i].turn_off()
		

	
async def main_loop():
	orb_lights = get_wiz_light_from_group('three_orbs')	

	turn_all_off(orb_lights)

if __name__ == "__main__":
	loop = asyncio.new_event_loop()
	loop.run_until_complete(main_loop())




import asyncio
import math
from pywizlight import discovery, PilotBuilder, wizlight
from pygame import mixer
from time import sleep
import time
import numpy as np
import simpleaudio as sa
from audio import sinf, sinf_norm, cosf, cosf_norm, norm_wave
import sys

desk_light_ips = ['192.168.68.57', '192.168.68.55']

MIN_FLOAT=sys.float_info.min

def now():
	return time.time()

async def detect_lights(bulbs):
	
	lights = []
	for number, bulb in enumerate(bulbs):
		print(f'{number}. {bulb.ip}')
		light = wizlight(bulb.ip)
		await light.turn_off()
		sleep(1)
		await light.turn_on()
		sleep(1)

async def main_loop():

	lights = [wizlight(ip) for ip in desk_light_ips]
	mixer.init()
	mixer.music.load('../deep_singing_monk.mp3')
	mixer.music.play()

	duration =  2*60 + 13 # seconds
	await asyncio.gather(*[light.turn_on(PilotBuilder(rgb=(255,0,0))) for light in lights])
	sleep(duration)
	mixer.music.stop()
	mixer.music.unload()

async def main():
	while True:
		await main_loop()

loop = asyncio.get_event_loop()
# loop.run_until_complete(main())
loop.run_until_complete(main())



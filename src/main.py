import asyncio
from pywizlight import discovery, PilotBuilder, wizlight
from pygame import mixer
from time import sleep
import time
import sys

# desk_light_ips = ['192.168.68.57', '192.168.68.55']

bathroom_ips = [
	'192.168.68.70',
	'192.168.68.69',
	'192.168.68.68',
	]

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
	switch_on = False
	lights = [wizlight(ip) for ip in bathroom_ips]
	mixer.init()
	mixer.music.load('../deep_singing_monk.mp3')

	while True:
		if not switch_on:
			try:
				await asyncio.gather(*[light.turn_on(PilotBuilder(warm_white=128)) for light in lights])
				switch_on = True
				sleep(1)
			except Exception as e: 
				print(e)

		if switch_on:
			mixer.music.play()
			sleep(1.8)

			duration =   13 # seconds 2*60 +
			start_time = now()
			while now() - start_time < duration:
				try:
					await asyncio.gather(*[light.turn_on(PilotBuilder(rgb=(255,0,0))) for light in lights])
					# sleep(1)
				except Exception as e:
					switch_on = False
					mixer.music.stop()
					print(e)
					break

			if switch_on():
				mixer.music.stop()

async def main():

	while True:
		await main_loop()

loop = asyncio.get_event_loop()
# loop.run_until_complete(main())
loop.run_until_complete(main())



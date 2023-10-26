import asyncio
import pygame
import math
from pywizlight import discovery, PilotBuilder, wizlight
from time import sleep
import time

desk_light_ips = ['192.168.68.57', '192.168.68.55']

async def detect_lights(bulbs):
	
	lights = []
	for number, bulb in enumerate(bulbs):
		print(f'{number}. {bulb.ip}')
		light = wizlight(bulb.ip)
		await light.turn_off()
		sleep(1)
		await light.turn_on()
		sleep(1)
		
async def ossciliate(lights, seconds_per_cycle, duration):
	start_time = time.time()
	hz = 1/seconds_per_cycle
	omega = hz*2*math.pi

	while((time.time() - start_time) < duration):
		dt = time.time() - start_time
		# sin wave between 0 and 255
		val = max(int(255*(math.sin(omega*dt)*1/2 + 1/2)), 1)
		print(val)
		await asyncio.gather(*[light.turn_on(PilotBuilder(warm_white=val)) for light in lights])
		# sleep(0.05)

async def linear_turn_on(lights,duration):
	
	await asyncio.gather(*[light.turn_off() for light in lights])
	sleep(0.5)

	start_time = time.time()
	val_per_sec = 255/duration
	first_val = True
	while((time.time() - start_time) < duration):
		dt = time.time() - start_time
		val = int(dt*val_per_sec)
		print(first_val)
		# sin wave between 0 and 1
		await asyncio.gather(*[light.turn_on(PilotBuilder(warm_white=val)) for light in lights])

async def toggle(lights,duration=1):
	for light in lights:
		print(light.ip)
		await asyncio.gather(*[light.turn_on() for light in lights])
		sleep(duration)
		await asyncio.gather(*[light.turn_on() for light in lights])
		sleep(duration)

async def main():
	# bulbs = await discovery.discover_lights(broadcast_space="192.168.71.255")

	pygame.mixer.init()
	pygame.mixer.music.load('/home/pi/ding.wav')
	pygame.mixer.music.play()
	# while pygame.mixer.music.get_busy() == True:
	# 	continue

	# lights 
	lights = [wizlight(ip) for ip in desk_light_ips]
	
	t = np.linspace()
	await ossciliate(lights, 10, float("inf"))


loop = asyncio.get_event_loop()
loop.run_until_complete(main())


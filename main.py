import asyncio
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
		
async def ossciliate(lights, seconds_per_cycle):
	start_time = time.time()
	num_sec = 10
	val_per_sec = 255/num_sec
	hz = 1/seconds_per_cycle
	omega = hz*2*math.pi

	while((time.time() - start_time) < num_sec):
		dt = time.time() - start_time
		# sin wave between 0 and 1
		val = int(255*(math.sin(omega*dt)*1/2 + 1/2))
		print(val)
		await asyncio.gather(*[light.turn_on(PilotBuilder(warm_white=val)) for light in lights])

async def linear_turn_on(lights, duration):
	
	await asyncio.gather(*[light.turn_off() for light in lights])
	sleep(0.5)

	start_time = time.time()
	val_per_sec = 255/duration
	first_val = True
	while((time.time() - start_time) < duration):
		dt = time.time() - start_time
		val = int(dt*val_per_sec)
		if first_val:
			first_val = val
			print(first_val)
		# sin wave between 0 and 1
		await asyncio.gather(*[light.turn_on(PilotBuilder(warm_white=val)) for light in lights])

async def toggle(lights):
	for light in lights:
		print(light.ip)
		await asyncio.gather(*[light.turn_on() for light in lights])
		sleep(1)
		await asyncio.gather(*[light.turn_on() for light in lights])
		sleep(1)

async def main():
	bulbs = await discovery.discover_lights(broadcast_space="192.168.71.255")

	lights = []
	for ip in desk_light_ips:
		light = wizlight(ip)
		lights.append(light)

	await ossciliate(lights, 3)

	# await asyncio.gather(*[light.turn_off() for light in lights])
	# await asyncio.gather(lights[0].turn_off(), lights[1].turn_off())


loop = asyncio.get_event_loop()
loop.run_until_complete(main())


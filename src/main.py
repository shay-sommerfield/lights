import asyncio
import math
from pywizlight import discovery, PilotBuilder, wizlight
from time import sleep
import time
import numpy as np
import simpleaudio as sa
from audio import sinf, sinf_norm, cosf, cosf_norm
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

def linterp(p0,p1,x):
	x0 = p0[0]
	x1 = p1[0]
	y0 = p0[1]
	y1 = p1[1]

	return y0 + (x-x0)*(y1-y0)/(x1-x0)

def corrected_sinf(omega,t,lastVal):
	upper_bound = 235
	lower_bound = 20

	nextVal = int(255*(math.sin(omega*t)*1/2 + 1/2))

	if nextVal > upper_bound or nextVal < lower_bound:
		is_increasing = nextVal > lastVal
		is_top_of_wave = nextVal > upper_bound

		if is_top_of_wave and is_increasing:
			p0 = (t, upper_bound)
			p1 = (t,1)
		elif is_top_of_wave and not is_increasing:
			p0 = (t, 1)
			p1 = (t,upper_bound)
		elif not is_top_of_wave and is_increasing:
			p0 = (t, 0)
			p1 = (t,lower_bound)
		elif not is_top_of_wave and not is_increasing:
			p0 = (t, lower_bound)
			p1 = (t,0)
		
		return linterp(p0,p1,t)



async def ossciliate(lights, seconds_per_cycle, frequency, duration):
	start_time = time.time()

	while((time.time() - start_time) < duration):
		dt = time.time() - start_time
		# sin wave between 3 and 255
		val = int(251*sinf_norm(frequency*dt) + 4)
		# print(val)
		await asyncio.gather(*[light.turn_on(PilotBuilder(warm_white=val)) for light in lights])
		# sleep(0.05)

async def linear_turn_on(lights,duration):
	
	await asyncio.gather(*[light.turn_off() for light in lights])

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

	# requency = 50  # magic low frequency
	f_volume = 1/4
	f_tone = 50 # 440
	fs = 44100  # 44100 samples per second
	duration = 10  # Note duration of 3 seconds

	# lights 
	lights = [wizlight(ip) for ip in desk_light_ips]

	# Generate array with seconds*sample_rate steps, ranging between 0 and seconds
	t = np.linspace(0, duration, duration * fs, False)

    # Play a bass tone with osscilating volume
    # that never quite gets silent
	note = -sinf_norm(f_volume*t) * sinf(f_tone * t) + 1/3*sinf(f_tone*t)

    # Ensure that highest value is in 16-bit range
	audio = note * (2**15 - 1) / np.max(np.abs(note))

    # Convert to 16-bit data
	audio = audio.astype(np.int16)

	await asyncio.gather(*[light.turn_off() for light in lights])
	sleep(3)

    # Start playback
	play_obj = sa.play_buffer(audio, 1, 2, fs)

	await ossciliate(lights,duration,f_volume, duration)

async def main_2():
	lights = [wizlight(ip) for ip in desk_light_ips]
	await asyncio.gather(*[light.turn_off() for light in lights])
	await asyncio.gather(*[light.turn_on(PilotBuilder(warm_white=4)) for light in lights])

loop = asyncio.get_event_loop()
# loop.run_until_complete(main())
loop.run_until_complete(main())



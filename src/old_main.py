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

def linterp(p0,p1,x):
	x0 = p0[0]
	x1 = p1[0]
	y0 = p0[1]
	y1 = p1[1]

	try:
		return y0 + (x-x0)*(y1-y0)/(x1-x0)
	except ZeroDivisionError: 
		return y1 #both y0 and y1 are the same in this case


# fixme
# note, will need to predict the 4 values of t, that the uppder/lower
# bounds occur at. Will be constant, but needs to be calcuated. 
# can then adjust input t to be below 2pi radians so that the constants can be used. 

def corrected_norm_wave(frequency,t,lastVal):
	upper_bound = 231
	lower_bound = 24

	nextVal =  int(251*norm_wave(frequency*t) + 4)

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
		
		return int(251*linterp(p0,p1,t) + 4)
	else:
		return nextVal



async def ossciliate(lights, frequency, duration, delay=0):
	start_time = time.time()
	sleep(delay)
	val = MIN_FLOAT
	dt = time.time() - start_time
	while(dt < duration):
		dt = time.time() - start_time
		val = corrected_norm_wave(frequency,dt,val)
		print(val)

		await asyncio.gather(*[light.turn_on(PilotBuilder(warm_white=val)) for light in lights])

async def linear_ramp(lights,duration, start_point, finish_point,red=False):	
	def builder(val):
		if red:
			return PilotBuilder(rgb=(val,0,0))
		else:
			return PilotBuilder(warm_white=val)

	start_time = now()
	val_per_sec = (finish_point - start_point)/duration
	while((now() - start_time) < duration):
		dt = now() - start_time
		val = int(dt*val_per_sec + start_point)
		await asyncio.gather(*[light.turn_on(builder(val)) for light in lights])


# async def linear_osscilate(lights,frequency, duration):
# 	wave_length = 1/frequency
# 	start_time = now()
# 	wave_time = 0.0 
# 	while now() - start_time < duration:
# 		passed_time = now() - start_time()
# 		if passed_time > wave_length:
# 			# reset wave time for easy calculation
# 			num_waves_passed =  math.floor(passed_time/wave_length)
# 			wave_time = passed_time - num_waves_passed * wave_length
# 		elif passed_time < wave_length/2:
# 			# ramp from 4 to 355
# 		elif passed_time >= wave_length/2:
# 			# ramp from 255 to 4


	
async def toggle(lights,duration=1):
	for light in lights:
		print(light.ip)
		await asyncio.gather(*[light.turn_on() for light in lights])
		sleep(duration)
		await asyncio.gather(*[light.turn_on() for light in lights])
		sleep(duration)

async def repeat_signal_for_duration(lights,builder,duration):
	start_time = now()
	while now() - start_time < duration:
		await asyncio.gather(*[light.turn_on(builder) for light in lights])

async def main():
	# bulbs = await discovery.discover_lights(broadcast_space="192.168.71.255")

	# requency = 50  # magic low frequency
	f_volume = 1/8
	f_tone = 50 # 440
	fs = 44100  # 44100 samples per second
	duration = 30  # Note duration of 3 seconds

	# lights 
	lights = [wizlight(ip) for ip in desk_light_ips]

	# Generate array with seconds*sample_rate steps, ranging between 0 and seconds
	t = np.linspace(0, duration, duration * fs, False)

    # Play a bass tone with osscilating volume
    # that never quite gets silent
	note = norm_wave(f_volume*t) * sinf(f_tone * t) + 1/3*sinf(f_tone*t)

    # Ensure that highest value is in 16-bit range
	audio = note * (2**15 - 1) / np.max(np.abs(note))

    # Convert to 16-bit data
	audio = audio.astype(np.int16)

    # Start playback
	# play_obj = sa.play_buffer(audio, 1, 2, fs)	
	mixer.init()
	mixer.music.load('../deep_singing_monk.mp3')
	mixer.music.play()
	mixer.music.set_pos(12.8)
	
	await linear_ramp(lights,12,255,4,True)

	sleep(2)
	

	ramp_duration = 1/f_volume/2
	start_time = now()
	while now() - start_time < duration:
		await linear_ramp(lights,ramp_duration,255,4,True)
		await linear_ramp(lights,ramp_duration,4,255,True)

async def main_2():
	lights = [wizlight(ip) for ip in desk_light_ips]
	await asyncio.gather(*[light.turn_off() for light in lights])
	await asyncio.gather(*[light.turn_on(PilotBuilder(warm_white=4)) for light in lights])

loop = asyncio.get_event_loop()
# loop.run_until_complete(main())
loop.run_until_complete(main())



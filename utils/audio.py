import numpy as np
import simpleaudio as sa

# requency = 50  # magic low frequency
f = 1/4
f2 = 50 # 440
fs = 44100  # 44100 samples per second
seconds = 10  # Note duration of 3 seconds

# sin of frequency (not radians)
def sinf(x):
    return np.sin(x* 2 * np.pi)

# sinf between 0 and 1
def sinf_norm(x):
    return 0.5*sinf(x) + 0.5

def cosf(x):
    return np.cos(x* 2 * np.pi)

# sinf between 0 and 1
def cosf_norm(x):
    return 0.5*cosf(x) + 0.5

# wave from 0 to 1, starting at 0 at t=0
def norm_wave(x):
    return -0.5*cosf(x) + 0.5

if __name__=="__main__":
    # Generate array with seconds*sample_rate steps, ranging between 0 and seconds
    t = np.linspace(0, seconds, seconds * fs, False)

    # Play a bass tone with osscilating volume
    # that never quite gets silent
    note = sinf_norm(f*t) * sinf(f2 * t) + 1/3*sinf(f2*t)

    # Ensure that highest value is in 16-bit range
    audio = note * (2**15 - 1) / np.max(np.abs(note))
    # Convert to 16-bit data
    audio = audio.astype(np.int16)

    # Start playback
    play_obj = sa.play_buffer(audio, 1, 2, fs)

    # Wait for playback to finish before exiting
    play_obj.wait_done()

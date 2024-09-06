import asyncio
from typing import Optional, Tuple

from fastapi import FastAPI, Body
from pydantic import BaseModel
from pywizlight import PilotBuilder
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from programs import color_cycle, binary_counter
from utils.bulb_groups import get_wiz_light_from_group

class LightSettings(BaseModel):
    rgb: Optional[Tuple[int, int, int]] = None


async def lifespan(_):
    global orb_lights
    orb_lights = await get_wiz_light_from_group('three_orbs')

    global running_task
    running_task = None

    yield
    print("shutdown")

app = FastAPI(lifespan=lifespan)

# Allow calls from local network browsers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this based on where your HTML page is served
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Mount the static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

async def start_program(program_name):
    global running_task
    if running_task:
        running_task.cancel()
        try:
            await running_task
        except asyncio.CancelledError:
            print(f"Previous program cancelled. Now running: {program_name}.")
    
    if program_name == "color_cycle":
        print("Starting color cycle!")
        running_task = asyncio.create_task(color_cycle.main_loop(orb_lights=orb_lights))
    elif program_name == "binary_counter":
        print("Starting binary counter!")
        running_task = asyncio.create_task(binary_counter.main_loop(orb_lights=orb_lights))
    else:
        print("Unknown program.")

async def stop_program():
    global running_task
    if running_task:
        running_task.cancel()
        try:
            await running_task
        except asyncio.CancelledError:
            print("Program stopped.")


@app.get("/run_color_cycle/")
async def run_color_cycle() -> str:
    """Echo parameters back in result."""
    await start_program("color_cycle")
    return "Color cycle program started."


@app.get("/run_binary_counter/")
async def run_binary_counter() -> str:
    """Start the on-off program."""
    await start_program("binary_counter")
    return "binary_counter_started"


@app.get("/turn_off_orbs/")
async def turn_off_():
    await stop_program()
    tasks = [bulb.turn_off() for bulb in orb_lights]
    await asyncio.gather(*tasks)


@app.get("/get_programs/")
async def get_programs():
    programs = [
            {"func": "run_color_cycle", 
             "name": "Color Sequence"},

            {"func": "run_binary_counter", 
             "name": "Binary Counter"},
             
            {"func": "turn_off_orbs", 
             "name": "Turn off orbs"}
            ]
    return programs
        

@app.post("/turn_on_orbs/")
async def turn_on_orbs(light_settings: LightSettings = Body(...)):
    await stop_program()
    if light_settings.rgb:
        rgb_pilot = PilotBuilder(rgb=light_settings.rgb)
        tasks = [bulb.turn_on(rgb_pilot) for bulb in orb_lights]
    else:
        tasks = [bulb.turn_on() for bulb in orb_lights]

    await asyncio.gather(*tasks)


@app.get("/greet/")
async def greet(name: Optional[str] = None, age: Optional[int] = None):
    if name:
        greeting = f"Hello, {name}!"
    else:
        greeting = "Hello, stranger!"
    if age:
        return f"{greeting} You are {age} years old."
    else:
        return greeting
    
# Define a route to serve the index.html page
@app.get("/")
async def get_index():
    return FileResponse("static/index.html")

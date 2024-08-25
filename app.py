import asyncio
from fastapi import FastAPI
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from typing import Optional

import color_in_sequence
import binary_counter


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost"],  # Adjust this based on where your HTML page is served
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Mount the static directory
app.mount("/static", StaticFiles(directory="static"), name="static")


global running_task
running_task = None

async def start_program(program_name):
    global running_task
    if running_task:
        running_task.cancel()
        try:
            await running_task
        except asyncio.CancelledError:
            print(f"Previous program {program_name} canceled.")
    
    if program_name == "color_cycle":
        print("Starting color cycle!")
        running_task = asyncio.create_task(color_in_sequence.main_loop())
    elif program_name == "binary_counter":
        running_task = asyncio.create_task(binary_counter.main_loop())
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


@app.get("/run_color_sequence/")
async def run_color_sequence() -> str:
    """Echo parameters back in result."""
    await start_program("color_cycle")
    return "Color cycle program started."


@app.get("/run_binary_counter/")
async def run_binary_counter() -> str:
    """Start the on-off program."""
    await start_program("binary_counter")
    return "On-off program started."

@app.get("/greet/")
async def greet(name: Optional[str] = None, age: Optional[int] = None):
    if name:
        greeting = f"Hello, {name}!"
    else:
        greeting = "Hello, stranger!"

    if age:
        return {"message": f"{greeting} You are {age} years old."}
    else:
        return {"message": greeting}
    
# Define a route to serve the index.html page
@app.get("/")
async def get_index():
    return FileResponse("static/index.html")

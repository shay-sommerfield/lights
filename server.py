from tabella import Tabella
import asyncio
import color_in_sequence
import binary_counter
app = Tabella()

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


@app.method()
async def run_color_sequence() -> tuple[str, float]:
    """Echo parameters back in result."""
    await start_program("color_cycle")
    return "Color cycle program started."


@app.method()
async def run_binary_counter() -> str:
    """Start the on-off program."""
    await start_program("binary_counter")
    return "On-off program started." 


if __name__ == "__main__":
    app.run()
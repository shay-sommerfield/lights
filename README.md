# Wiz lights!


## Pyenv virtualenvironment
```
brew update && brew install pyenv
```
Check the terminal output and update your `~/.zshrc` accordingly

```
brew install pyenv-virtualenv
source ~/.zshrc
pyenv install 3.12
pyenv virtualenv 3.12 lights
```

- In vscode, type `command + shift + p`
- Then type `>Python:select Interpreter`
- Then select your `lights` virtualenv

Restart your shell and you are good to go. 
Vscode will now always use that environment in this project. 

```
pip install --upgrade pip
pip install pywizlight
```

You're all set up baby!
```
python color_change.py
```

## Adding new bulbs
The `utils/discover.py` script will detect lights and group them. 
Turn off all lights except the lights you want to group. 

Run without arguments to ensure that only the lights you want are detected:
```bash
./utils/discover.py
```

Run with the save argument and a group name to add as a json in 
the bulb groups directory:
```bash
./utils/discover.py --save living_room
```

## Light Programs locally
A program dynamically updates the lights and generally continues running forever. 
These all live in the `programs` directory.

To run the main of a program without running the server, run the following from the root directory
 to trigger the `if __name__ == "__main__"` section of a program:
```bash
python -m programs.color_cycle
```

## Light Programs from the server
Run `./start_server.sh` to start a localhost server

### Testing the server is up
In another terminal, run the following to test the server:
```
curl http://localhost:8000/greet/
```
You should receive a nice message. 

### Raspberry pi vs localhost

The raspberry pi has a static ip address of `192.168.1.123`. 
So replace `localhost` in examples below to control the raspberry pi server instead. 

You can run a localhost server while the raspberry pi is up as long as the pi is not
running a program. So first turn off the orbs on the pi and then start your localhost server. 

```
curl http://192.168.1.123:8000/turn_off_orbs/
./start_server.sh
```
### GET methods

From a high level, a get request just allows us to call a function on a server
without any arguments. So the following is like calling `run_color_cycle()` in a python script:

```
curl http://localhost:8000/run_color_cycle/
```

The following are all supported:
- `run_color_cycle`
- `run_binary_counter`
- `turn_off_orbs`
- `get_programs`

### Post methods

From a high level, post requests are used to pass arguments to a server function. In this case, we pass the
arguments as a JSON object.

The following will turn all of the orb lights to red:
```bash
curl -X POST "http://127.0.0.1:8000/turn_on_orbs/" -H "Content-Type: application/json" -d '{"rgb": [255,0,0]}'
```

Because I made the `rgb` field optional, passing an empty object just turns all of the lights on to white:
```
curl -X POST "http://127.0.0.1:8000/turn_on_orbs/" -H "Content-Type: application/json" -d '{}'
```

### Frontend
A simple frontend is served from `http://localhost:8000/`
The file is located at `static/index.html`
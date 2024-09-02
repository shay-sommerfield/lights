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
curl http://127.0.0.1:8000/greet/
```
You should receive a nice message. 

### Other server methods

#### GET methods

From a high level, a get request just allows us to call a function on a server
without any arguments. So the following is like calling `run_color_cycle()` in a python script:

```
curl http://127.0.0.1:8000/run_color_cycle/
```

The following are also supported:
- `run_binary_counter`
- `turn_off_orbs`

#### Post methods

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
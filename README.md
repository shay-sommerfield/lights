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

## Run the server
Run `./start_server.sh` to start a localhost server

### Testing the server is up
In another terminal, run the following to test the server:
```
curl http://127.0.0.1:8000/greet/
```
You should receive a nice message. 

### Other server methods
This just sends a GET http request to the address specified.

From a high level, a get request just allows us to call a function on a server
without any arguments. So the following is like calling `run_color_sequence()` in a python script:

```
curl http://127.0.0.1:8000/run_color_sequence/
```

The other api method currently supported is:
```
curl http://127.0.0.1:8000/run_binary_counter/
```
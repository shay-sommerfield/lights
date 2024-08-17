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

- In vscode, type `command + p`
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
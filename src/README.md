# Typescript implementation for interacting with Wizlights

## Ultra Quick start
```bash
npm install
npm run build
npm run sandbox
```
- Installs packages
- Builds typescript files from `src` to javascript files in `build`
- Runs the JS file generated from sandbox.ts (Turns lights in dining room off, then on)


## Files

### Files that you can run directly
```
Run these files with `node ./build/<name>.js` or make a script in the package.json
```
| File name        | Functionality                                                                                                                                                   |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sandbox.ts       | A script that just outputs the current state of discovered bulbs. It's a good sandbox for testing out changes.                                                  |
| set-group.ts     | A script that allows you to save bulbs set to party mode into a group. This showcases the use of `discover` with a filter function.                            |

### Library files
| File name        | Functionality                                                                                                                                                   |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| index.ts         | Puts UDP commands into nice functions and defines wiz requests and responses.                                                                                   |
| discover.ts      | Express server. Currently just wraps the stereo outlet.                                                                                                         |
| configuration.ts | Handles saving and retrieving Light objects from json files located in the bulb groups directory. Bulbs are saved as just an array of Mac addresses.            |
| wizlights.ts     | The file that will contain all abstractions for lights. Adding light groups would be a good next step.                                                          |
| wiz-udp.ts       | Puts UDP commands into nice functions and defines wiz requests and responses.                                                                                   |


## Useful scripts and commands

In the `package.json`
`npm run <command_name>` translates to `npx <command>` under the hood.

For example:
`npm run build` is just `npx tsc` under the hood.

### start
Starts the express server after it has been compiled `npm run start`

### format
Uses the prettier package to format all `typescript`, `javascript`, `json`, and md `files`. 

```bash
npm run format
```
TODO: Use husky and lint-staged to enable hook to run this before commits and only on staged files. 
### build and build:clean

Compiles the typescript files in `src` to javascript files in `build`:

```bash
npm run build
```

Cleans the `build` dir first:

```bash
npm run clean-build
```

### Get status

Just returns the current state of all online lights

```bash
npm run get-status
```

### Set Group

Saves a set of bulbs into a json file.

1. Use the Wiz app to turn all desired bulbs into party mode
1. `npm run set-group` and answer the prompt to save bulbs into a group for later!
1. Commit your json file so it is saved.

```bash
npm run set-group
```

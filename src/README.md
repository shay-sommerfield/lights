# Typescript implimentation for interacting with Wizlights

## Files

| File name        | Functionality                                                                                                                                                   |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| wiz-udp.ts       | Puts UDP commands into nice functions and defines wiz requests and responses.                                                                                   |
| wizlights.ts     | The file that will contain all absctractions for lights. Adding light groups would be a good next step.                                                         |
| configuration.ts | Handles saving and retrieving Light objects from json files located in the bulb groups directory. Bulbs are saved as just an array of Mac addresses.            |
| discover.ts      | Finds all currently online bulbs and turns them into a Light object. You can optionally pass a filter function that will only return lights in a certain state. |
| set-group.ts     | A wrapper that scriptifies saving bulbs set to party mode into a group. This showcases the use of `discover` with a filter function.                            |
| get-status.ts    | A script that just outputs the current state of discovered bulbs. It's a good sandbox for testing out changes.                                                  |

## Useful scripts and commands

In the `package.json`
`npm run <command_name>` translates to `npx <commmand>` under the hood.

For example:
`npm run build` is just `npx tsc` under the hood.

### format
Uses the prettier package to format all `typescrpt`, `javascript`, `json`, and md `files`. 

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

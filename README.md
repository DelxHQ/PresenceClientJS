
# PresenceClientJS
Custom client for [SwitchPresence-Rewritten](https://github.com/HeadpatServices/SwitchPresence-Rewritten) which adds support for dynamically changing `BigImageKey` for the Rich Presence.

# Install
**Installing SwitchPresence requires a Switch running Atmosphere custom firmware.**

General homebrew installing information can be found [here](https://switch.homebrew.guide/)

1. Download the latest release of SwitchClient-Rewritten from [here](https://github.com/HeadpatServices/SwitchPresence-Rewritten/releases)
2. Drag the `atmosphere` folder onto the root of your SD Card, drag `SwitchPresence-Rewritten-Manager.nro` into the `switch` folder on your SD Card
3. Clone this repository, open a terminal inside it and run `yarn`. If you don't have yarn installed, run `npm i` instead.
4. Edit `config.json` with your favourite text editor and change `SWITCH_IP` to your Nintendo Switch's IP address.
5. Run `yarn start` or `npm run` if yarn isn't installed.
6. You're all set!

# Missing game icons
if you've found a game that does not have a icon on Discord, file a new [issue](https://github.com/DelxHQ/PresenceClientJS/issues/new). Make sure to mention the games `Program ID` and attach the game icon which can be dumped from the SwitchPresence-Manager from the homebrew menu.

# Credits 
- **SwitchPresence-Rewritten** ([HeadpatServices/SwitchPresence-Rewritten](https://github.com/HeadpatServices/SwitchPresence-Rewritten), [HeadpatServices/PresenceClient](https://github.com/HeadpatServices/PresenceClient))

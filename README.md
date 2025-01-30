# OSD-XMB
This is a User Interface for the PS2 resembling the PS3/PSP XMB Style,
made on [Athena Env'](https://github.com/DanielSant0s/AthenaEnv) by DanielSant0s, and inspired by the [XtremeEliteBoot+](http://www.hwc.nat.cu/ps2-vault/hwc-projects/xebplus/)
dashboard by Howling Wolf & Chelsea.

## Features

- Plugin System where you can make your own plugins to show items on the
	dashboard.
	Default Plugins are:
	- **User Category**:
		- Return to Browser: Goes to the OSDSYS Browser.
		- Refresh Interface: Resets the OSDXMB Interface to update settings
	- **Settings Category**.
		- Game Settings: Adjust several POPS and Neutrino Global settings.
		- System Settings: Set the Interface's language and confirm button.
		- Theme Settings: Customize the XMB Colors, Fonts and Icons.
		- Time Settings: Adjust the Clock display settings.
		- Display Settings: Set the video mode and aspect ratio.
		- Security Settings: Enable or Disable Parental Control.
	- **Game Category**:
		- File Explorer: Explore files on the USB Drive or the default
						 App folder. You can Execute ELF files from here.
		- Memory Card Utility: View your game save data on your memory cards.
		- OpenPS2Loader: An example plugin that launches a version of OPL.
		- Retroarch: An example plugin that launches retroarch.
		- Playstation 1: A POPS folder that lists all your games on your POPS
						 folder on the USB Drive.
		- Playstation 2: A Neutrino folder that lists all your games on your
						 DVD or CD folders on your USB Drive.

- **Launch PS2 games from USB Drive**:
    - The App will automatically list all ISO format games that are either
	on a DVD or CD folder in the root of your USB Drive on the
	"Playstation 2" folder. You can customize your preferred settings for
	your games if you open the "Option" menu while highlighting the game
	and select "Information". Remember to use the confirmation button to
	save changes.
	The "Show Logo" and "Show Debug Colors" can be set globally for all games
	on the "Game Settings" section.

- **Launch PS2 games from Discs**:
    - The App will automatically recognize if there is a PS2 DVD in the disctray
	and select it if you're idle on the Game category.
	You can add ".cfg" files on the "CFG" folder with the Item "Title=Game Name"
	to display Customized Game Titles on this Item.

- **Launch PS1 games from USB Drive**:
    - The app will automatically scan your POPS folder on the root of your USB Drive
	to list all the .VCD files on the "Playstation 1" folder.
	The name of the VCD will be the game's name.
	If no ELF for the VCD is found, it will be automatically created.
	You can set several POPS special settings the same way the PS2 per-game settings
	are set, by using the Options Menu for each game.
	More global options are set on the "Game Settings" section.

- **Execute ELFs**:
    - You can execute custom ELFs by the use of Plugins, or using the File Explorer.
	The File Explorer will launch any ELF without arguments, but you can make custom
	plugins to launch Elfs with custom arguments.

## Instructions

-	Place the "neutrino" folder on either Memory Card Slot 1 or 2 if you intend to use it
	to launch games from USB using Neutrino.
-	Place the OSDXMB folder at the root of your USB Drive or from whatever
	device you intend to run it, personally I recommend you to auto-boot to it.

## Credits and Special Thanks
Inspired by: XtremeEliteBoot by Howling Wolf & Chelsea.

Based on: AthenaEnv by DanielSant0s.

<ins>Localization contributors</ins>:
- nuno6573 (Portuguese)
- PannaSalmone and Okeanos (Italian).
- LOWbster (German).

<ins>Special thanks to</ins>:
- krHACKen for his [POPStarter](https://bitbucket.org/ShaolinAssassin/popstarter-documentation-stuff/wiki/Home) project.
- rickgaiser for his [neutrino](https://github.com/rickgaiser/neutrino) app.
- sync-on-luma for his original [Neutrino Plugin](https://github.com/sync-on-luma/xebplus-neutrino-loader-plugin) for XtremeEliteBoot and general feedback.
- xGamereqPL for testing and general feedback.
- BlackNinja for testing and general feedback.
- Pmp174 for the Boot sequence feedback.
- You! Thanks for using the app.

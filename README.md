![Logo](/Logo.png)

# OSD-XMB
This is a User Interface for the PS2 resembling the PS3/PSP XMB Style developed by HiroTex,
made on [Athena Env'](https://github.com/DanielSant0s/AthenaEnv) by DanielSant0s, and inspired
by the [XtremeEliteBoot+](http://www.hwc.nat.cu/ps2-vault/hwc-projects/xebplus/)
dashboard by Howling Wolf & Chelsea.

## Features

- Plugin System where you can make your own plugins to show items on the
	dashboard, either on JSON format or more customized with the XML format.

- **Launch PS2 games from USB Drive or MMCE**:
    - The App will automatically list all ISO format games that are on your
	"DVD/" or "CD/" folders at the root of your device (or inside a subfolder "PS2"),
 	on the "Playstation 2" Plugin folder on the "Game" Category. 
	- You can customize your preferred settings for your games if you open the
	"Option" menu while highlighting the game and select "Settings" (Remember to use
	the confirmation button to save changes).
	- The "Show Logo", "Show Debug Colors", and "GSM" settings can be set globally
	for all games on the "Game Settings" Plugin at the "Settings" Category.

- **Launch PS2 games in HDL Format**:
    - Games installed with HD Loader will be automatically listed on the
	"Playstation 2" folder. You can set their Game IDs manually on the "neutrino.cfg"
	file, or by following the naming pattern "PP.Game-ID..GameName".

- **Launch PS1 games from USB Drive or HDD**:
    - The app will automatically scan your POPS folder on the root of your USB Drive (and
	the "__.POPS" partition if present)	to list all the .VCD files on the "Playstation 1"
	Plugin folder in the "Game" Category.
	- The name of the VCD will be the game's name.
	- If no ELF for the VCD is found, it will be automatically created when launching the game.
	- You can set several POPS special settings the same way the PS2 per-game settings
	are set, by using the Options Menu for each game.
	- More global options (Cheats) are set on the "Game Settings" Plugin in the
	"Settings" Category.

- **Launch PS1 and PS2 games from Discs**:
    - The App will automatically recognize if there is a PS1 CD/CDDA or PS2 CD/CDDA/DVD
  	in the disctray	and highlight it automatically if you're idle on the "Game" category.
	- You can add "(Game-ID).cfg" files on the "CFG" folder with the Item "Title=Game Name"
	to display Customized Game Titles for this Item.

- **Execute ELFs**:
    - You can execute custom ELFs by the use of Plugins, or using the File Explorer.
	The File Explorer will launch any ELF without arguments, but you can make custom
	plugins to launch Elfs with custom arguments.

- **List SAS APPS**:
    - The App will automatically scan the Memory Cards for valid "SAS APPS" and list
      them on the "Apps" Plugin Folder on the "Game" Category.
      
- **File Explorer**:
  	- The "File Explorer" Plugin and "Memory Card Utility" Plugin let you Delete any
  	  files and/or folders from your devices.
  	  
- **Appearance Customization**:
  	- Besides the default PS3/PSP appearance and its related color settings, The Dashbaord
  	  is fully customizable by the use of "Themes" that can be completely user-made to
  	  change Icons and Background Images, as well as certain colors of some elements.
  	  There are 2 themes already included with OSD-XMB, the "Air Paint" theme resembling
  	  one of the PS3's default Themes, and the "PSX" Theme based on the appearance of the
  	  XMB Dashboard of the DESR PSX Console.
  	  
## Instructions

-	It is suggested, but not necessary, to place these files inside a folder on a Memory Card
    and launch it from there, since the App can be set to auto-boot using FMCB:
	-	OSDXMB.ELF
    - 	main.js
    - 	athena.ini
-	Then you can place the rest of the Assets (Folders CFG,ART,XMB,etc) on a directory called
    "OSDXMB" on your preferred device.
-	The following devices are currently supported and will be scanned to look for the App's assets:
  	- 	mass?:/OSDXMB/
   	- 	mmce?:/OSDXMB/
    - 	hdd:__common:/OSDXMB/
    - 	Path where OSDXMB.ELF was launched from.

## Credits and Special Thanks
Inspired by: XtremeEliteBoot by Howling Wolf & Chelsea.

Based on: AthenaEnv by DanielSant0s.

Code Contributors: [AKuHAK](https://github.com/AKuHAK)

<ins>Localization contributors</ins>:
- nuno6573 (Portuguese)
- PannaSalmone and Okeanos (Italian).
- LOWbster (German).

<ins>Special thanks to</ins>:
- krHACKen for his [POPStarter](https://bitbucket.org/ShaolinAssassin/popstarter-documentation-stuff/wiki/Home) project.
- rickgaiser for his [neutrino](https://github.com/rickgaiser/neutrino) app.
- sync-on-luma for his original [Neutrino Plugin](https://github.com/sync-on-luma/xebplus-neutrino-loader-plugin) for XtremeEliteBoot and general feedback.
- VizoR for testing and general feedback.
- Okeanos for testing and general feedback.
- xGamereqPL for testing and general feedback.
- BlackNinja for testing and general feedback.
- Pmp174 for the Boot sequence feedback.
- You! Thanks for using the app.

//////////////////////////////////////////////////////////////////////////
///*				   			   SYSTEM							  *///
/// 				   		  										   ///
///		This script initializes the main DATA object with the 		   ///
///		system information among useful generic functions to be used.  ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

// The 6 possible video modes that Athena can set.
// Used by the "Video Settings" plugin.

const vmodes = [];
vmodes.push({Name: "NTSC", Value: NTSC });
vmodes.push({Name: "PAL", Value: PAL });
vmodes.push({Name: "DTV 480p", Value: DTV_480p });
vmodes.push({Name: "DTV 576p", Value: DTV_576p });
vmodes.push({Name: "DTV 720p", Value: DTV_720p });
vmodes.push({Name: "DTV 1080i", Value: DTV_1080i });

// Set Screen Parameters.

Screen.setFrameCounter(true);
Screen.setVSync(true);

/*	Info:

	Main DATA object used for storing all the main
	data of the dashboard.

	Properties:
		- DISCITEM: Boolean. Indicates if a Disctray Item is present on the dashboard.
		- WIDESCREEN: Boolean. Indicates if the screen should be on a 16:9 aspect ratio.
		- CANVAS: Screen Mode Object.
		- EE_INFO: CPU Info Object.
		- SCREEN_PREVMODE: Backup of Screen Mode Object.
		- PARENTAL: Boolean. Indicates if Parental Control is activated.
		- PRNTCODE: 4 Length Array. The code to be set if Parental Control is enabled.
		- PRNTSUCC: Boolean. Indicates if Parental Code input was successful and item should be selected.
		- LANGUAGE: Integer. Indicates the current language of the UI.
		- BTNTYPE: Integer. 0 = X to select, 1 = O to Select.
		- DATE_FORMAT: Integer. Indicates the Date Format Type to be displayed.
		- HOUR_FORMAT: Integer. Indicates the Hour Format Type to either 12 or 24 hours.
		- ASSETS_PATH: String. Folder with Main Resources.
		- THEME_PATH: String. Path to Custom Resources.
		- BGBRIGHTNESS: Integer. Background brightness defined by daylight.
		- BGCUSTOMBRIGHT: Integer. Background custom brightness defined by the user.
		- BGSWITCH: Boolean. Indicates if there was a change made to the background options by the user.
		- BGFRAME: Float. Indicates the current animation frame for the background switch.
		- BGVAL: Integer. Indicates a user selected background color to use.
		- BGTMP: Integer. Indicates a temporary background color to use.
		- BGCOL: Integer. Indicates which Item of monthColor to use.
		- BGIMG: Image. Replaces Background with User selected Image.
		- BGWAVES: Boolean. Indicates if background waves should be displayed.
		- OVCOL: Color. Indicates the Screen Overlay color.
		- OVSTATE: String. Indicates the current Overlay State.
		- MESSAGE_INFO: Overlay Message Object.
		- MESSAGE_TIMER: Timer. Used for Overlay Message.
		- CURRENT_STATE: Integer. Main UI State.
		- FADE_FRAME: Integer. Frame for Animations.
		- BOOT_STATE: Integer. Boot animation state.
		- EXIT_STATE: Integer. Exit animation state.
		- DASH_STATE: String. Main Dashboard Navigation State.
		- DASH_CURCAT: Integer. Current Selected Category.
		- DASH_CUROPT: Integer. Current Selected Item on Category.
		- DASH_CURSUB: Integer. Current Sub Menu Object Level.
		- DASH_PRVSUB: Integer. Previous Sub Menu Object.
		- DASH_CURSUBOPT: Integer. Current Selected Sub Menu Option.
		- DASH_CURCTXLVL: Integer. Current Context Menu Level.
		- DASH_CURCTXITMLAST: Integer. Last item of current context menu.
		- DASH_CURCTXITMFIRST: Integer. First item of current context menu.
		- DASH_CTX_TIMER: Timer. To be used on Context Menu Preview Function.
		- DASH_TXT_TIMER: Timer. To be used while displaying large texts.
		- DASH_MOVE_FRAME: Integer. Main Dashboard Animation Frame.
		- DASH_PADMODE: Integer. Current Pad Event Mode.
		- CUSTOM_FUNCTION: Custom function to be executed at exit.
		- CONFIG: Configuration Object to manage cfg files.
		- CPYQUEUE: Queue. To store queued thread copy items.
		- GAMESETS: Main Neutrino Global Settings.
*/

const DATA =
{
	DISCITEM: false,
	WIDESCREEN: false,
	CANVAS: Screen.getMode(),
	EE_INFO: System.getCPUInfo(),
	SCREEN_PREVMODE: null,
	PARENTAL: false,
	PRNTCODE: [ 0, 0, 0, 0 ],
	PRNTSUCC: false,
	LANGUAGE: 0,
	BTNTYPE: 0,
	DATE_FORMAT: 0,
	HOUR_FORMAT: 1,
	ASSETS_PATH: "XMB/",
	THEME_PATH: "THM/Original/",
    CUSTOMBG_PATH: "",
    BGBRIGHTNESS: 0,
	BGCUSTOMBRIGHT: 0,
	BGSWITCH: false,
	BGFRAME: 0,
	BGVAL: 0,
	BGTMP: 0,
    BGCOL: 0,
    BGIMG: false,
    BGIMGA: 0,
    DISPLAYBG: false,
	BGWAVES: true,
	OVCOL: Color.new(0, 0, 0, 0),
	OVSTATE: "BOOT",
	MESSAGE_INFO: null,
	MESSAGE_TIMER: null,
	CURRENT_STATE: 0,
	FADE_FRAME: 0,
	BOOT_STATE: 0,
	EXIT_STATE: 0,
	DASH_STATE: "IDLE",
	DASH_CURCAT: 5,
	DASH_CUROPT: 0,
	DASH_CURSUB: -1,
	DASH_PRVSUB: -2,
	DASH_CURSUBOPT: 0,
	DASH_CURCTXLVL: -1,
	DASH_CURCTXITMLAST: 9,
	DASH_CURCTXITMFIRST: 0,
	DASH_CTX_TIMER: null,
	DASH_TXT_TIMER: null,
	DASH_MOVE_FRAME: 0,
	DASH_PADMODE: 0,
	CUSTOM_FUNCTION: () => { console.log("Default function"); },
	CONFIG: null,
	CPYQUEUE: [],
	GAMESETS: { LOGO: false, DBC: false},
};

//////////////////////////////////////////////////////////////////////////
///*				   			 FUNCTIONS							  *///
//////////////////////////////////////////////////////////////////////////

/* Write all text on 'txt' to 'path' file */

function ftxtWrite(path, txt)
{
	let errObj = {};
	const file = std.open(path, "w", errObj);
	if (file)
	{
		file.puts(txt);
		file.flush();
		file.close();
	}
	else
	{
		console.log(`IO ERROR: ${std.strerror(errObj.errno)}`);
	}
}

/* Write 'line' text to the 'log.txt' file */

function logl(line)
{
	const file = std.open(`${System.boot_path}/log.txt`, "a+");
	file.puts(`${line}\n`); // Write to file
	file.flush();
	file.close();
}

/* Decode a byte array into a UTF-8 string */

function utf8Decode(byteArray) {
    let result = '';
    let i = 0;

    while (i < byteArray.length) {
        const byte1 = byteArray[i++];

        if (byte1 <= 0x7F) {
            // 1-byte character (ASCII)
            if (byte1 === 0x0) { result += String.fromCharCode(0xA); }
            else { result += String.fromCharCode(byte1); }
        } else if (byte1 >= 0xC0 && byte1 <= 0xDF) {
            // 2-byte character
            const byte2 = byteArray[i++];
            const charCode = ((byte1 & 0x1F) << 6) | (byte2 & 0x3F);
            result += String.fromCharCode(charCode);
        } else if (byte1 >= 0xE0 && byte1 <= 0xEF) {
            // 3-byte character
            const byte2 = byteArray[i++];
            const byte3 = byteArray[i++];
            const charCode = ((byte1 & 0x0F) << 12) |
                             ((byte2 & 0x3F) << 6) |
                             (byte3 & 0x3F);
            result += String.fromCharCode(charCode);
        } else if (byte1 >= 0xF0 && byte1 <= 0xF7) {
            // 4-byte character (rare, for supplementary planes)
            const byte2 = byteArray[i++];
            const byte3 = byteArray[i++];
            const byte4 = byteArray[i++];
            const charCode = ((byte1 & 0x07) << 18) |
                             ((byte2 & 0x3F) << 12) |
                             ((byte3 & 0x3F) << 6) |
                             (byte4 & 0x3F);
            result += String.fromCodePoint(charCode);
        }
    }

    return result;
}

/* Read an Entire File and get all its contents as a utf-8 string */

function readFileAsUtf8(filepath)
{
	const file = os.open(filepath, os.O_RDONLY);

    if (file < 0)
    {
        return "Could not Open File: " + filepath;
    }

    const flen = os.seek(file, 0, std.SEEK_END);

    if (flen > 0)
    {
        const array = new Uint8Array(flen);
		os.seek(file, 0, std.SEEK_SET);
		os.read(file, array.buffer, 0, flen);
        os.close(file);

        return utf8Decode(array);
    }
    else
    {
        return `Invalid File Length for ${filepath} : ${flen.toString()}`;
    }
}

/* Get the root of a path */

function getRootName(path)
{
    const colonIndex = path.indexOf(":");
    if (colonIndex === -1) {
        throw new Error("Invalid path format. No ':' found.");
    }
    return path.slice(0, colonIndex);
}

/*	Get the full path without the root	*/

function getPathWithoutRoot(path)
{
    const colonIndex = path.indexOf(":");
    if (colonIndex === -1) {
        throw new Error("Invalid path format. No ':' found.");
    }
    return path.slice(colonIndex + 2); // Skip ":/" to get the remaining path
}

/*	Get the directory name of a path.						*/
/*	NOTE: Currently this works better than the one below	*/

function getFolderNameFromPath(path)
{
    if (typeof path !== 'string' || !path.endsWith('/')) {
        console.log("ERORR: Path must be a string and end with a slash (/).");
		return "";
    }

    // Remove the trailing slash and find the last part of the path
    const trimmedPath = path.slice(0, -1); // Remove the last "/"
    const lastSlashIndex = trimmedPath.lastIndexOf('/');

    // Extract and return the folder name
    return lastSlashIndex === -1 ? trimmedPath : trimmedPath.substring(lastSlashIndex + 1);
}

/*	Get the directory name of a path simplified			*/
/*	I keep this one just in case it might be useful		*/

function getDirectoryName(path)
{
	// Regular expression to match the directory part
	const match = path.match(/^(.*[\/:])/);
	return match ? match[1] : "./";
}

/*	Converts a given integer into a byte formatted string	*/

function formatFileSize(size)
{
  if (size < 0) return "Invalid size";

  const suffixes = ["b", "Kb", "Mb", "Gb", "Tb"];
  let index = 0;

  while (size >= 1024 && index < suffixes.length - 1) {
    size /= 1024;
    index++;
  }

  // Round to nearest whole number or one decimal place if needed
  const rounded = size < 10 && index > 0 ? size.toFixed(1) : Math.round(size);

  return `${rounded} ${suffixes[index]}`;
}

/*	Parses a Path to extract the Game Name in case of Old Format naming conventions	*/

function getGameName(path)
{
	// Regular expression to match the identifier and game name
	const match = path.match(/[A-Z]{4}[-_][0-9]{3}\.[0-9]{2}\.(.+)\.[^/]+$/);
	if (match && match[1]) {
		return match[1].trim(); // Return the "Game Name" part
	}

	// If no match, extract the file name without the extension
	const fileNameMatch = path.match(/([^/]+)\.[^/.]+$/); // Match the file name and remove extension
	if (fileNameMatch && fileNameMatch[1]) {
		return fileNameMatch[1].trim();
	}

	// Return the full path as a fallback
	return path.trim();
}

/*	Parses a Path to extract the Game Code in case of Old Format naming conventions	*/

function getGameCodeFromOldFormatName(path)
{
	// Regular expression to match the "code" part
	const match = path.match(/[A-Z]{4}[-_][0-9]{3}\.[0-9]{2}/);
	return match ? match[0] : "";
}

/*	Searchs for a matching ICO file in the ART folder for a specified string	*/
/*	Returns empty string if not found.											*/

function findICO(baseFilename)
{
	const dirPath = `${System.boot_path}/ART/`;
	const extensions = ["_ICO.png", "_ICO.jpg"];

	for (const ext of extensions) {
		const fileCandidates = [
		  `${dirPath}${baseFilename}${ext}`,
		  `${dirPath}${baseFilename}${ext}`.toLowerCase(),
		  `${dirPath}${baseFilename}${ext}`.toUpperCase()
		];

		for (const filePath of fileCandidates) {
		  if (std.exists(filePath)) { return filePath; }
		}
	}

	return ""; // Return empty string if no matching file is found
}

/*	Parses a filepath to get its extension if it has one	*/

function getFileExtension(filePath)
{
	if (typeof filePath !== 'string') return "";

	// Extract extension after the last dot, if any
	const lastDotIndex = filePath.lastIndexOf('.');
	if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) {
		return ""; // No extension found or dot is at the end
	}

	return filePath.substring(lastDotIndex + 1);
}

/*	Parses a filepath to search if it matches any extension from a list of extensions	*/

function isExtensionMatching(filePath, ...filterExtensions)
{
	if (!Array.isArray(filterExtensions) || filterExtensions.length === 0) {
		console.log("At least one filter extension must be provided.");
		return false;
	}

	const fileExtension = getFileExtension(filePath);

	// Compare the extracted extension with any of the filters (case-insensitive)
	return filterExtensions.some(filter =>
		typeof filter === 'string' &&
		fileExtension?.toLowerCase() === filter.toLowerCase()
	);
}

/*
	For moving element animations
	easeOutCubic will return an increasing value
	easeInCubic will return a decreasing value
*/

function easeOutCubic(t)
{
    return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t)
{
    return Math.pow(t, 3);
}

/*
	To interpolate an integer from 'startValue' to 'endValue'
	using a 'progress' float that goes from 0.0 to 1.0
*/

function interpolateValue(startValue, endValue, progress)
{
    if (progress < 0.0) progress = 0.0; // Clamp progress to 0.0
    if (progress > 1.0) progress = 1.0; // Clamp progress to 1.0
    return Math.round(startValue + (endValue - startValue) * progress);
}

/*
	To interpolate a color object into another one
	using a 'progress' float that goes from 0.0 to 1.0
*/

function interpolateColorObj(color1, color2, t)
{
    return {
        r: Math.round(color1.r + (color2.r - color1.r) * t),
        g: Math.round(color1.g + (color2.g - color1.g) * t),
        b: Math.round(color1.b + (color2.b - color1.b) * t),
        a: Math.round(color1.a + (color2.a - color1.a) * t),
    };
}

// Neutralizes the overlay tint color.
// Used in case a custom loaded image needs to display in full color.

function neutralizeOverlayWithAlpha() {
    const overlayEffect = Color.getA(DATA.OVCOL) / 128; // Scale the alpha to a range of 0 to 1

    const neutralizedColor = {
        r: 128 - overlayEffect * (Color.getR(DATA.OVCOL) - 128),
        g: 128 - overlayEffect * (Color.getG(DATA.OVCOL) - 128),
        b: 128 - overlayEffect * (Color.getB(DATA.OVCOL) - 128),
    };

    // Clamp the values to stay within the valid RGBA range (0-255)
    neutralizedColor.r = Math.max(0, Math.min(128, neutralizedColor.r));
    neutralizedColor.g = Math.max(0, Math.min(128, neutralizedColor.g));
    neutralizedColor.b = Math.max(0, Math.min(128, neutralizedColor.b));

    return neutralizedColor;
}

/*	Set a new Copy Item to the thread copy queue	*/

function threadCopyPush(_src, _dest)
{
	DATA.CPYQUEUE.push({ src: _src, dest: _dest });
}

/*	Processes the thread copy queue		*/

function processThreadCopy()
{
	const progress = System.getFileProgress();
	const ready = ((progress.current === undefined) || (progress.current == progress.final))

	if ((!ready) && (progress.current != progress.final))
	{
		console.log(`Copy Thread Progress: ${progress.current.toString()} / ${progress.final.toString()}`);
		return false;
	}
	else if ((ready) && (DATA.CPYQUEUE.length > 0))
	{
		const { src, dest } = DATA.CPYQUEUE.shift();
		console.log(`Copy File Src: ${src}`);
		console.log(`Copy File Dest: ${dest}`);
		System.threadCopyFile(src, dest);
	}

	return true;
}

//////////////////////////////////////////////////////////////////////////
///*				   			 ICON.SYS							  *///
//////////////////////////////////////////////////////////////////////////

// This will retrieve a UTF-8 string from the icon.sys S-JIS encoded Title

function IconSysDecodeTitle(strIn) {
    let strOut = '';

    for (let i = 0; i < 68; i += 2) {
        const t1 = strIn[i];   // each S-JIS character consists of two bytes
        const t2 = strIn[i + 1];

        if (t1 === 0x00) {
            if (t2 === 0x00) {
                break;
            } else {
                strOut += '?';
            }
        } else if (t1 === 0x81) {
            switch (t2) {
                case 0x40: strOut += ' '; break;
                case 0x46: strOut += ':'; break;
                case 0x5E: strOut += '/'; break;
                case 0x69: strOut += '('; break;
                case 0x6A: strOut += ')'; break;
                case 0x6D: strOut += '['; break;
                case 0x6E: strOut += ']'; break;
                case 0x6F: strOut += '{'; break;
                case 0x70: strOut += '}'; break;
				case 0x7C: strOut += '-'; break;
                default: strOut += '?'; break;
            }
        } else if (t1 === 0x82) {
            if (t2 >= 0x4F && t2 <= 0x7A) {
                // digits (0-9), capital letters (A-Z)
                strOut += String.fromCharCode(t2 - 31);
            } else if (t2 >= 0x81 && t2 <= 0x9B) {
                // lowercase letters (a-z)
                strOut += String.fromCharCode(t2 - 32);
            } else if (t2 === 0x3F) {
                strOut += ' ';
            } else {
                strOut += '?';
            }
        } else {
            strOut += '?';
        }
    }

    return strOut;
}

//////////////////////////////////////////////////////////////////////////
///*				   			   POPS								  *///
//////////////////////////////////////////////////////////////////////////

/*	Info:

	Function to get if cheats on the 'cheats' array
	are enabled in the CHEATS.TXT file.
	Will return a Bool Array corresponding to each cheat on the 'cheats' array.
	'game' variable can be specified to get a game's CHEATS.TXT.
	'game' must be the game's title followed by a '/'.

*/

function getPOPSCheat(cheats, game = "")
{
	// Create an array to store whether each cheat is enabled
	const enabledCheats = new Array(cheats.length).fill(false);

	const path = (System.boot_path.substring(0,4) === "host") ? `${System.boot_path}/POPS/${game}CHEATS.TXT` : `mass:/POPS/${game}CHEATS.TXT`;
	if (std.exists(path))
	{
		let errObj = {};
		const file = std.open(path, "r", errObj);
		if (file === null) { console.log(`getPOPSCheat(): I/O Error - ${std.strerror(errObj.errno)}`); return enabledCheats; }
		const content = file.readAsString();
		file.close();

		const lines = content.split(/\r?\n/);    // Split the content into lines
		// Iterate over the lines in the content
		for (const line of lines) {
			for (let i = 0; i < cheats.length; i++) {
				const cheatString = cheats[i];

				// Check if the line matches the enabled cheat format
				if (line === `$${cheatString}`) {
					enabledCheats[i] = true;
				}
			}
		}
	}

	return enabledCheats;
}

/*	Info:

	Function to set cheats on the 'cheats' array to a CHEATS.TXT file.
	'game' variable can be specified to set a game's CHEATS.TXT.
	'game' must be the game's title followed by a '/'.

*/

function setPOPSCheat(cheats, game = "")
{
	const path = (System.boot_path.substring(0,4) === "host") ? `${System.boot_path}/POPS/${game}CHEATS.TXT` : `mass:/POPS/${game}CHEATS.TXT`;
	if (std.exists(path))
	{
		let errObj = {};
		const file = std.open(path, "r", errObj);
		if (file === null) { console.log(`setPOPSCheat(): I/O ERROR - ${std.strerror(errObj.errno)}`); return; }
		const content = file.readAsString();
		file.close();

		const lines = content.split(/\r?\n/);    // Split the content into lines
		const resultLines = []; // To store the processed lines

		// Iterate over the lines in the content
		for (const line of lines) {
			let found = false;

			// Check if the line matches any cheat code
			for (let i = 0; i < cheats.length; i++) {
				const cheat = cheats[i];

				if (line === cheat.code || line === `$${cheat.code}`) {
					found = true;

					// If cheat is enabled, add it with `$`
					if (cheat.enabled) {
						resultLines.push(`$${cheat.code}`);
					}
					// Remove the cheat from the array
					cheats.splice(i, 1);
					break;
				}
			}

			// If the line wasn't related to a cheat, keep it unchanged
			if (!found) {
				resultLines.push(line);
			}
		}

		// Add remaining enabled cheats to the end
		for (const cheat of cheats) {
			if (cheat.enabled) {
				resultLines.push(`$${cheat.code}`);
			}
		}

		// Combine all lines into a single string
		ftxtWrite(path, resultLines.join('\n'));
	}
	else
	{
		let lines = [];

		for (let i = 0; i < cheats.length; i++)
		{
			if (cheats[i].enabled) { lines.push(`$${cheats[i].code}`); }
		}

		if (lines.length > 0) {	ftxtWrite(path, lines.join('\n')); }
	}
}

//////////////////////////////////////////////////////////////////////////
///*				   			 DASHBOARD							  *///
//////////////////////////////////////////////////////////////////////////

/* Info:

	Function to set a new Context (Option) Menu
	Object.

*/

function SetDashContext(CONTEXT, STATE)
{
	DATA.DASH_CURCTXITMFIRST = 0;
	DATA.DASH_CURCTXITMLAST = 8;
	DATA.DASH_CURCTXLVL++;
	DATA.DASH_STATE = STATE;
	DASH_CTX[DATA.DASH_CURCTXLVL] = CONTEXT;
	DASH_CTX[DATA.DASH_CURCTXLVL].Selected = CONTEXT.Default;

	if (DASH_CTX[DATA.DASH_CURCTXLVL].ItemCount < 8)
	{
		DATA.DASH_CURCTXITMLAST = DASH_CTX[DATA.DASH_CURCTXLVL].ItemCount;
	}

	if (DASH_CTX[DATA.DASH_CURCTXLVL].Selected > 7)
	{
		if ((DASH_CTX[DATA.DASH_CURCTXLVL].Selected + 7) > DASH_CTX[DATA.DASH_CURCTXLVL].ItemCount)
		{
			DATA.DASH_CURCTXITMLAST = DASH_CTX[DATA.DASH_CURCTXLVL].ItemCount;
			DATA.DASH_CURCTXITMFIRST = DATA.DASH_CURCTXITMLAST - 8;
		}
		else
		{
			DATA.DASH_CURCTXITMFIRST = DASH_CTX[DATA.DASH_CURCTXLVL].Selected;
			DATA.DASH_CURCTXITMLAST = DATA.DASH_CURCTXITMFIRST + 8;
		}
	}

	if (DATA.DASH_CTX_TIMER) { Timer.destroy(DATA.DASH_CTX_TIMER); }
	DATA.DASH_CTX_TIMER = Timer.new();
	DATA.DASH_MOVE_FRAME = 0;
	SetDashPadEvents(0);
}

/*	Main Handler to Select Items on the Dashboard.	*/

function SelectItem()
{
	if (DATA.DASH_CURSUB < 0)
	{
		switch(DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT].Type)
		{
			case "ELF": DATA.DASH_STATE = "FADE_OUT"; DASH_SEL = DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT]; break;
			case "CODE": DASH_SEL = DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT]; DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT].Value(DATA); break;
			case "SUBMENU":
				DATA.DASH_PRVSUB++;
				DATA.DASH_CURSUB++;
				DATA.DASH_STATE = "SUBMENU_IN";
				DASH_SUB[DATA.DASH_CURSUB] = DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT].Value;
				DASH_SUB[DATA.DASH_CURSUB].Selected = DATA.DASH_CURSUBOPT;
				DATA.DASH_CURSUBOPT = (DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT].Value.ItemCount < 1) ? -1 : DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT].Value.Default;
				break;
			case "CONTEXT":
				SetDashContext(DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT].Value, "MENU_CONTEXT_IN");
				break;
		}
	}
	else
	{
		switch(DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Type)
		{
			case "ELF": DATA.DASH_STATE = "FADE_OUT"; DASH_SEL = DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT]; break;
			case "CODE": DASH_SEL = DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT]; DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Value(DATA); break;
			case "SUBMENU":
				DATA.DASH_STATE = "NEW_SUBMENU_IN";
				DASH_SUB[DATA.DASH_CURSUB].Selected = DATA.DASH_CURSUBOPT;
				DASH_SUB[DATA.DASH_CURSUB + 1] = DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Value;
				DATA.DASH_CURSUBOPT = (DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Value.ItemCount < 1) ? -1 : 0;
				DATA.DASH_PRVSUB++;
				DATA.DASH_CURSUB++;
				break;
			case "CONTEXT":
				SetDashContext(DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Value, "SUBMENU_CONTEXT_IN");
				break;
		}
	}
}

//////////////////////////////////////////////////////////////////////////
///*				   			 	CODE							  *///
//////////////////////////////////////////////////////////////////////////

DATA.SCREEN_PREVMODE = DATA.CANVAS.mode; 		// Store current Canvas mode for backup.
ftxtWrite(`${System.boot_path}/log.txt`, ""); 	// Initializes the log.txt file.
console.log("INIT: SYSTEM INIT COMPLETE");

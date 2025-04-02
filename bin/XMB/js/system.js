//////////////////////////////////////////////////////////////////////////
///*				   			  SYSTEM							  *///
/// 				   		  										   ///
///		This script initializes the main DATA object with the 		   ///
///		system information among useful generic functions to be used.  ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const DBGMODE = false; // Set to true to enable debug logs.

// Main Debugging Log Function
function xmblog(txt) { if (DBGMODE) { console.log(txt); } }

/*	Info:

    Main DATA object used for storing all the main
    data of the dashboard.

    Properties:
        - NET: Boolean. Indicates if Network is enabled.
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
    NET: false,
    NETTRY: false,
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
    TIME_ZONE: 0,
    TIMEZONEVAL: 20,
    ASSETS_PATH: "XMB/",
    THEME_PATH: "THM/Original/",
    CUSTOMBG_PATH: "",
    BGBRIGHTNESS: 0,
    BGCUSTOMBRIGHT: 0,
    BGSWITCH: false,
    BGFRAME: 0.0f,
    BGVAL: 0,
    BGTMP: 0,
    BGCOL: 0,
    BGIMGTMP: false,
    BGIMGTMPSTATE: false,
    BGIMG: false,
    BGIMGA: 0,
    DISPLAYBG: false,
    BGWAVES: true,
    OVALPHA: 20,
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
    GAMESETS: { LOGO: false, DBC: false, GSM: false},
};

//////////////////////////////////////////////////////////////////////////
///*				   			 FUNCTIONS							  *///
//////////////////////////////////////////////////////////////////////////
function getDateInGMTOffset(gmtOffset)
{
    // Ensure the input is a Date object
    const date = new Date();

    // Subtract 15 hours from the input date
    const adjustedDate = new Date(date.getTime() - (12 * 60 * 60 * 1000));

    // Calculate the target time by adjusting for GMT offset
    const targetTime = new Date(adjustedDate.getTime());

    // Apply GMT offset
    targetTime.setTime(adjustedDate.getTime() + (gmtOffset * 60 * 60 * 1000));

    return targetTime;
}

function execScript(filepath)
{
    const code = std.loadFile(filepath);
    return std.evalScript(`(() => { ${code} })()`);
}

/**
 * Write all text on 'txt' to 'path' file
 * @param {String} path The path to write the text file.
 * @param {String} txt The text to write to the file.
 */
function ftxtWrite(path, txt, mode = "w+")
{
    let errObj = {};
    const file = std.open(path, mode, errObj);
    if (file)
    {
        file.puts(txt);
        file.flush();
        file.close();
    }
    else
    {
        xmblog(`IO ERROR: ${std.strerror(errObj.errno)}`);
    }
}

/**
 * Write 'line' text to the 'log.txt' file
 * @param {String} line The text to write to the log file.
 */
function logl(line)
{
    // Log Line to Virtual Console.
    console.log(line);

    // Write line to log file with timestamp.
    const now = getDateInGMTOffset(DATA.TIME_ZONE);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    ftxtWrite("./XMB/log.txt", `[ ${hours}:${minutes}:${seconds}:${milliseconds} ] ${line}\n`, "a+"); // Write to file
}

/**
 * If path is dynamic, resolve it to a valid path.
 * @param {String} path The path to the file.
 * @returns {String} First possible validated path.
*/
function resolveFilePath(filePath)
{
    if (!filePath.includes('?')) return filePath; // Literal path, return as is

    const prefixes = {
        'mass': Array.from({ length: 10 }, (_, i) => `mass${i}`),
        'mc': ['mc0', 'mc1'],
        'mmce': ['mmce0', 'mmce1']
    };

    const match = filePath.match(/^(mass|mc|mmce)\?:\/(.*)/);
    if (!match) return '';

    const [, root, subPath] = match;
    for (const variant of prefixes[root])
    {
        const fullPath = `${variant}:/${subPath}`;
        if (std.exists(fullPath))
        {
            return fullPath;
        }
    }

    return ''; // File not found in any of the checked paths
}

/**
 * Get the system.cnf key pairs parsed from the disc root.
 * @returns {Object} The system.cnf file contents.
 */
function getDiscSystemCNF()
{
    // Get current disc root files.
    const files = os.readdir("cdfs:/")[0];

    // Return empty if no files are found or there is an error reading the disc directory.
    if (files.length < 1) { return []; }

    // Find index of the system.cnf file to properly get the right file.
    const index = files.findIndex(file => file.toLowerCase() === 'system.cnf');
    const systemcnf = std.open(`cdfs:/${files[index]}`, "r");

    // Read CNF file and close.
    if (systemcnf)
    {
        let cnf = {};

        while (!systemcnf.eof())
        {
            let line = systemcnf.getline();

            // Ensure the line is not empty and contains an '='
            if (line && line.includes('='))
            {
                line = line.trim(); // Read and trim whitespace
                const [key, value] = line.split('='); // Split into key and value
                cnf[key.trim()] = value.trim(); // Trim and store in the config object
            }
        }

        systemcnf.close();

        return cnf;
    }

    // Return empty if failed to load file.
    return [];
}

/**
 * Mount a HDD0 partition into the virtual path `pfs1` and returns its partition path.
 * @param {String} partition The partition to mount.
 * @returns {String} The partition path mounted (`pfs1` or 'pfs0').
 */
function mountHDDPartition(partition)
{
    if (os.readdir("pfs1:/")[1] === 0) { System.fileXioUmount("pfs1:"); }

    try
    {
        System.fileXioMount("pfs1:", `hdd0:${partition}`);
    }
    catch (e)
    {
        xmblog(`Failed Mounting Partition: ${e}`);
        if (e != "InternalError: fileXioMount failed with error code -16")
        {
            xmblog("Error does not match, return pfs1");
            return "pfs1";
        }

        xmblog("Return pfs0");
        return "pfs0";
    }


    xmblog("Return pfs1");
    return "pfs1";
}

/* returns partition mounted on pfs0. */
function getCWDPartition(partition)
{
    // return empty if cwd is not a virtual hdd partition.

    if (os.getcwd()[0].substring(0, 3) !== "pfs") { return ""; }

    xmblog("Get CWD HDD Partition");
    const partitions = System.listDir("hdd0:").filter(item => item.name !== "." && item.name !== ".." && item.dir);
    for (let i = 0; i < partitions.length; i++)
    {
        const item = partitions[i];
        xmblog("Mounting Partition: " + item.name);
        const part = mountHDDPartition(item.name);
        if (part === "pfs0")
        {
            xmblog("Partition Found: " + item.name);
            return item.name;
        }
    }

    // partition not found?
    return "";
}

//////////////////////////////////////////////////////////////////////////
///*				   			  FILES  							  *///
//////////////////////////////////////////////////////////////////////////

/* Creates a File Element for the Dashboard */
function getFileAsItem(filepath, filesize = -1, fileoptions = "")
{
    let customIcon = false;
    let icon = "FILE"; // default icon for files
    let type = "";
    let value = {};

    switch (getFileExtension(filepath).toLowerCase())
    {
        case "vcd": customIcon = true; icon = 25; break;
        case "iso": customIcon = true; icon = 26; break;
        case "elf": icon = "TOOL"; type = "ELF"; value = { Path: filepath, Args: [], }; break;
        case "png":
        case "jpg":
        case "bmp": icon = "CAT_PICTURE"; break;
        case "mp3":
        case "wav":
        case "ogg": icon = "CAT_MUSIC"; break;
        case "mp4":
        case "mkv":
        case "avi": icon = "CAT_VIDEO"; break;
    }

    const item =
    {
        Name: getFileName(filepath),
        Description: formatFileSize(filesize),
        Icon: icon,
        Value: value,
        FullPath: filepath
    }

    if (type !== "") { item.Type = type; }
    if (fileoptions != "") { item.Option = fileoptions; }

    if (customIcon)
    {
        Object.defineProperty(item, 'CustomIcon', {
            get() { return dash_icons[icon]; }
        });
    }

    return item;
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
        os.close(file);
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

/*	Get the directory name of a path.   */
function getFolderNameFromPath(path)
{
    if (typeof path !== 'string' || !path.endsWith('/')) {
        xmblog("ERORR: Path must be a string and end with a slash (/).");
        return "";
    }

    // Remove the trailing slash and find the last part of the path
    const trimmedPath = path.slice(0, -1); // Remove the last "/"
    const lastSlashIndex = trimmedPath.lastIndexOf('/');

    // Extract and return the folder name
    return lastSlashIndex === -1 ? trimmedPath : trimmedPath.substring(lastSlashIndex + 1);
}

/*	Get Path until Directory Name.  */
function getDirectoryName(path)
{
    // Regular expression to match the directory part
    const match = path.match(/^(.*[\/:])/);
    return match ? match[1] : "./";
}

/*	Get Path until Directory Name.  */
function getFileName(path)
{
    const colonIndex = path.indexOf(":");
    if (colonIndex !== -1) { path = path.slice(colonIndex + 1); }
    const lastSlashIndex = path.lastIndexOf('/');
    return lastSlashIndex === -1 ? path : path.substring(lastSlashIndex + 1);
}

/*	Converts a given integer into a byte formatted string	*/
function formatFileSize(size)
{
  if (size < 0) return "";

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
    let match = path.match(/[A-Z]{4}[-_][0-9]{3}\.[0-9]{2}\.(.+)\.[^/]+$/);
    if (match && match[1])
    {
        return match[1].trim();
    }

    // Check for "PP.HDL." format
    let ppHdlMatch = path.match(/^PP\.HDL\.(.+)\.[^/.]+$/);
    if (ppHdlMatch && ppHdlMatch[1])
    {
        return ppHdlMatch[1].trim();
    }

    // Check for "PP.Game-ID.." format
    let ppGameIdMatch = path.match(/^PP\.[A-Z]{4}[-_][0-9]+\.\.(.+)\.[^/]+$/);
    if (ppGameIdMatch && ppGameIdMatch[1])
    {
        return ppGameIdMatch[1].trim();
    }

    // Extract file name without the extension
    let fileNameMatch = path.match(/([^/]+)\.[^/.]+$/);
    if (fileNameMatch && fileNameMatch[1])
    {
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

/*	Parses a filepath to get its extension if it has one	*/
function getFileExtension(filePath)
{
    if (typeof filePath !== 'string') return "";

    // Extract extension after the last dot, if any
    const lastDotIndex = filePath.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1)
    {
        return ""; // No extension found or dot is at the end
    }

    return filePath.substring(lastDotIndex + 1);
}

/*	Parses a filepath to search if it matches any extension from a list of extensions	*/
function isExtensionMatching(filePath, ...filterExtensions)
{
    if (!Array.isArray(filterExtensions) || filterExtensions.length === 0)
    {
        xmblog("At least one filter extension must be provided.");
        return false;
    }

    const fileExtension = getFileExtension(filePath);

    // Compare the extracted extension with any of the filters (case-insensitive)
    return filterExtensions.some(filter =>
        typeof filter === 'string' &&
        fileExtension?.toLowerCase() === filter.toLowerCase()
    );
}

/*	Scans a Directory Art Folder looking for a match	*/
function scanArtFolder(baseDir, baseFilename, suffix)
{
    const dirPath = `${baseDir}ART/`;
    const extensions = [`_${suffix.toUpperCase()}.png`, `_${suffix.toUpperCase()}.jpg`];
    const dirFiles = os.readdir(dirPath)[0];

    for (const ext of extensions)
    {
        const fileCandidates = [
            `${baseFilename}${ext}`,
            `${baseFilename}${ext}`.toLowerCase(),
            `${baseFilename}${ext}`.toUpperCase()
        ];

        for (const filePath of fileCandidates)
        {
            if (dirFiles.includes(filePath)) { return `${dirPath}${filePath}`; }
        }
    }

    return "";
}

/*	Searchs for an Image file either in PNG or JPG Format following a name pattern.	*/
function findArt(baseFilename, suffix)
{
    let baseDir = `${os.getcwd()[0]}/`;

    if (baseDir.endsWith("//")) { baseDir = baseDir.substring(0, baseDir.length - 1); }

    let art = scanArtFolder(baseDir, baseFilename, suffix);

    if (art === "")
    {
        // Scan all mass root devices
        for (let i = 0; i < 10; i++)
        {
            art = scanArtFolder(`mass${i.toString()}:/`, baseFilename, suffix);
            if (art !== "") { break; }
        }
    }

    return art; // Return empty string if no matching file is found
}

/*	Searchs for a matching ICO file in the ART folder for a specified string	*/
/*	Returns empty string if not found.											*/
function findICO(baseFilename) { return findArt(baseFilename, "ICO"); }

/*	Searchs for a matching BG file in the ART folder for a specified string	*/
/*	Returns empty string if not found.											*/
function findBG(baseFilename) { return findArt(baseFilename, "BG"); }

//////////////////////////////////////////////////////////////////////////
///*				   			 THREADED 							  *///
//////////////////////////////////////////////////////////////////////////

/*	Set a new Copy Item to the thread copy queue	*/
function threadCopyPush(_src, _dest) { DATA.CPYQUEUE.push({ src: _src, dest: _dest }); }

/*	Processes the thread copy queue     */
function processThreadCopy()
{
    const progress = System.getFileProgress();
    const ready = ((progress.current === undefined) || (progress.current == progress.final))

    if ((!ready) && (progress.current != progress.final))
    {
        xmblog(`Copy Thread Progress: ${progress.current.toString()} / ${progress.final.toString()}`);
        return false;
    }
    else if ((ready) && (DATA.CPYQUEUE.length > 0))
    {
        const { src, dest } = DATA.CPYQUEUE.shift();
        xmblog(`Copy File Src: ${src}`);
        xmblog(`Copy File Dest: ${dest}`);
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
///*				   			 HISTORY							  *///
//////////////////////////////////////////////////////////////////////////

// Functions to manage the history file on the memory card
function getSystemDataPath()
{
    const tmp = std.open("rom0:ROMVER", "r");
    const ROMVER = tmp.readAsString();
    tmp.close();

    switch (ROMVER[4])
    {
        case 'C': return "BCDATA-SYSTEM";
        case 'E': return "BEDATA-SYSTEM";
        case 'X':
        case 'H':
        case 'A': return "BADATA-SYSTEM";
        case 'T':
        case 'J': return "BIDATA-SYSTEM";
    }
}
function getCurrentDOSDate()
{
    const now = getDateInGMTOffset(DATA.TIME_ZONE);
    const year = now.getFullYear() - 1980; // DOS date starts at 1980
    const month = now.getMonth() + 1; // JS months are 0-based
    const day = now.getDate();
    return (year << 9) | (month << 5) | day;
}
function getMcHistory()
{
    const file = os.open(`mc0:/${getSystemDataPath()}/history`, os.O_RDONLY);
    if (file < 0)
    {
        xmblog(`ERROR: Could not open history file`);
        return [];
    }

    const objects = [];
    const entrySize = 0x16;
    const buffer = new Uint8Array(entrySize);

    while (os.read(file, buffer.buffer, 0, entrySize) === entrySize)
    {
        const name = String.fromCharCode(...buffer.subarray(0, 0x10)).replace(/\x00+$/, '');
        const playCount = buffer[0x10];
        const bitmask = buffer[0x11];
        const bitshift = buffer[0x12];
        const dosDate = (buffer[0x14] | (buffer[0x15] << 8)); // Little-endian

        objects.push({ name, playCount, bitmask, bitshift, dosDate });
    }

    os.close(file);
    return objects;
}
function setMcHistory(entries)
{
    const systemDataPath = getSystemDataPath();
    if (!os.readdir("mc0:/")[0].includes("systemDataPath")) { os.mkdir(`mc0:/${systemDataPath}`); }

    const file = os.open(`mc0:/${systemDataPath}/history`, os.O_WRONLY | os.O_CREAT);
    if (file < 0)
    {
        xmblog(`ERROR: Could not create history file on mc0:/${systemDataPath}`);
        return false;
    }

    const entrySize = 0x16;
    const buffer = new Uint8Array(entrySize);

    for (const obj of entries)
    {
        buffer.fill(0);
        for (let i = 0; i < obj.name.length; i++)
        {
            buffer[i] = obj.name.charCodeAt(i);
        }
        buffer[0x10] = obj.playCount;
        buffer[0x11] = obj.bitmask;
        buffer[0x12] = obj.bitshift;
        buffer[0x13] = 0x00; // Padding zero
        buffer[0x14] = obj.dosDate & 0xFF;
        buffer[0x15] = (obj.dosDate >> 8) & 0xFF;

        os.write(file, buffer.buffer, 0, entrySize);
    }

    os.close(file);
    return true;
}
function setHistoryEntry(name)
{
    const objects = getMcHistory();
    const currentDate = getCurrentDOSDate();
    let found = false;
    let emptySlot = false;

    for (const obj of objects)
    {
        if (obj.name === name)
        {
            // If name exists, update play count and date
            obj.playCount = Math.min(obj.playCount + 1, 0x3F);
            obj.dosDate = currentDate;
            found = true;
            break;
        } else if (!emptySlot && obj.name === "")
        {
            // Store the first empty slot found
            emptySlot = obj;
        }
    }

    if (!found)
    {
        if (emptySlot)
        {
            // Reuse an empty slot
            emptySlot.name = name;
            emptySlot.playCount = 0x01;
            emptySlot.bitmask = 0x01;
            emptySlot.bitshift = 0x00;
            emptySlot.dosDate = currentDate;
        }
        else if (objects.length < 21)
        {
            // Append a new entry if the list is not full
            objects.push({
                name: name,
                playCount: 0x01,
                bitmask: 0x01,
                bitshift: 0x00,
                dosDate: currentDate
            });
        }
        else
        {
            xmblog("ERROR: No space left to add a new entry.");
        }
    }

    return setMcHistory(objects);
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
function getPOPSCheat(cheats, game = "", device = "mass")
{
    // Create an array to store whether each cheat is enabled
    const enabledCheats = new Array(cheats.length).fill(false);
    let path = "";

    switch (device)
    {
        case "hdd":
            if (os.readdir("hdd0:")[0].length === 0) { return enabledCheats; }
            const part = mountHDDPartition("__common");
            if (!os.readdir(`${part}:/`)[0].includes("POPS")) { return enabledCheats; }
            path = `${part}:/POPS/${game}`;
            break;
        case "mass":
            path = `mass:/POPS/${game}`;
            break
        case "host":
            path = `${os.getcwd()[0]}/POPS/${game}`;
            break;
    }

    const dirFiles = os.readdir(path)[0];
    if (dirFiles.includes("CHEATS.TXT"))
    {
        let errObj = {};
        const file = std.open(`${path}CHEATS.TXT`, "r", errObj);
        if (file === null) { xmblog(`getPOPSCheat(): I/O Error - ${std.strerror(errObj.errno)}`); return enabledCheats; }
        const content = file.readAsString();
        file.close();

        const lines = content.split(/\r?\n/);    // Split the content into lines
        // Iterate over the lines in the content
        for (const line of lines)
        {
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
function setPOPSCheat(cheats, game = "", device = "mass")
{
    let path = "";

    switch (device)
    {
        case "hdd":
            if (os.readdir("hdd0:")[0].length === 0) { return; }
            const part = mountHDDPartition("__common");
            if (!os.readdir(`${part}:/`)[0].includes("POPS")) { return; }

            path = `${part}:/POPS/${game}`;
            break;
        case "mass":
            path = `mass:/POPS/${game}`;
            break;
        case "host":
            path = `${os.getcwd()[0]}/POPS/${game}`;
            break;
    }

    const dirFiles = os.readdir(path)[0];

    if (dirFiles.includes("CHEATS.TXT"))
    {
        let errObj = {};
        const file = std.open(`${path}CHEATS.TXT`, "r", errObj);
        if (file === null) { xmblog(`setPOPSCheat(): I/O ERROR - ${std.strerror(errObj.errno)}`); return; }
        const content = file.readAsString();
        file.close();

        const lines = content.split(/\r?\n/);    // Split the content into lines
        const resultLines = []; // To store the processed lines

        // Iterate over the lines in the content
        for (const line of lines)
        {
            let found = false;

            // Check if the line matches any cheat code
            for (let i = 0; i < cheats.length; i++)
            {
                const cheat = cheats[i];

                if (line === cheat.code || line === `$${cheat.code}`)
                {
                    found = true;

                    // If cheat is enabled, add it with `$`
                    if (cheat.enabled)
                    {
                        resultLines.push(`$${cheat.code}`);
                    }
                    // Remove the cheat from the array
                    cheats.splice(i, 1);
                    break;
                }
            }

            // If the line wasn't related to a cheat, keep it unchanged
            if (!found)
            {
                resultLines.push(line);
            }
        }

        // Add remaining enabled cheats to the end
        for (const cheat of cheats)
        {
            if (cheat.enabled) {
                resultLines.push(`$${cheat.code}`);
            }
        }

        // Combine all lines into a single string
        ftxtWrite(`${path}CHEATS.TXT`, resultLines.join('\n'));
    }
    else
    {
        let lines = [];

        lines.push("$SAFEMODE");

        for (let i = 0; i < cheats.length; i++)
        {
            if (cheats[i].enabled) { lines.push(`$${cheats[i].code}`); }
        }

        if (lines.length > 0) { ftxtWrite(`${path}CHEATS.TXT`, lines.join('\n')); }
    }
}

//////////////////////////////////////////////////////////////////////////
///*				   			DASHBOARD							  *///
//////////////////////////////////////////////////////////////////////////

function ValidateCodeObj(obj)
{
    DASH_SEL = obj;
    if (typeof obj.Value === "string") { execScript(obj.Value); }
    else { obj.Value(); }
}
function ValidateSubMenuObj(obj)
{
    if (typeof obj.Value === "string")
    {
        switch (getFileExtension(obj.Value))
        {
            case "xml":
                const data = std.loadFile(DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT].Value);
                if (data) { obj.Value = xmlParseSubMenu(xmlParseElement(data)); }
                else { obj.Value = { Options: {}, Default: 0 }; }
                break;
            case "js":
                const options = execScript(obj.Value);
                if (Array.isArray(options))
                {
                    obj.Value = {};
                    obj.Value.Options = options;
                    obj.Value.Default = 0;
                }
                else { obj.Value = { Options: {}, Default: 0 }; }
                break;
        }
    }
}
function ValidateContextMenu(obj)
{
    if (typeof obj === "string")
    {
        switch (getFileExtension(obj))
        {
            case "xml":
                const data = std.loadFile(obj);
                if (data) { return xmlParseContext(xmlParseElement(data)); }
                break;
            case "js":
                return execScript(obj);
        }
    }

    return obj;
}

function OpenDialogMessage(DialogData)
{
    DATA.OVSTATE = "MESSAGE_IN";
    DATA.DASH_STATE = ((DATA.DASH_CURSUB > -1) && (DATA.DASH_CURCTXLVL > -1)) ? "SUBMENU_CONTEXT_MESSAGE_FADE_OUT" : "IDLE_MESSAGE_FADE_IN";
    DATA.MESSAGE_INFO = DialogData;
    DATA.MESSAGE_INFO.Processed = false;
}

/* Function to set a new Context (Option) Menu Object. */

function SetDashContext(CONTEXT, STATE)
{
    CONTEXT = ValidateContextMenu(CONTEXT);
    DATA.DASH_CURCTXITMFIRST = 0;
    DATA.DASH_CURCTXITMLAST = 8;
    DATA.DASH_CURCTXLVL++;
    DATA.DASH_STATE = STATE;
    DASH_CTX[DATA.DASH_CURCTXLVL] = CONTEXT;
    DASH_CTX[DATA.DASH_CURCTXLVL].Selected = CONTEXT.Default;

    if (DASH_CTX[DATA.DASH_CURCTXLVL].Options.length < 8)
    {
        DATA.DASH_CURCTXITMLAST = DASH_CTX[DATA.DASH_CURCTXLVL].Options.length;
    }

    if (DASH_CTX[DATA.DASH_CURCTXLVL].Selected > 7)
    {
        if ((DASH_CTX[DATA.DASH_CURCTXLVL].Selected + 7) > DASH_CTX[DATA.DASH_CURCTXLVL].Options.length)
        {
            DATA.DASH_CURCTXITMLAST = DASH_CTX[DATA.DASH_CURCTXLVL].Options.length;
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

function CheckParental()
{
    if (DATA.PRNTSUCC)
    {
        DATA.PRNTSUCC = false;
        DATA.DASH_MOVE_FRAME = 0;
        SelectItem();
    }
}

/*	Main Handler to Select Items on the Dashboard.	*/

function SelectItem()
{
    if (DATA.DASH_CURSUB < 0)
    {
        switch(DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT].Type)
        {
            case "ELF": DATA.DASH_STATE = "FADE_OUT"; DASH_SEL = DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT]; break;
            case "CODE": ValidateCodeObj(DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT]); break;
            case "CONTEXT": SetDashContext(DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT].Value, "MENU_CONTEXT_IN"); break;
            case "SUBMENU":
                ValidateSubMenuObj(DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT]);

                optBoxA = 0;                    // Reset the Option Box visibility.
                DATA.BGTMPIMG = false;          // Reset the Temporary Background Image.
                DATA.BGIMGTMPSTATE = 0;         // Reset the Temporary Background Image State.
                DATA.DASH_PRVSUB++;
                DATA.DASH_CURSUB++;
                DATA.DASH_STATE = "SUBMENU_IN";
                DASH_SUB[DATA.DASH_CURSUB] = DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT].Value;
                DASH_SUB[DATA.DASH_CURSUB].Selected = DATA.DASH_CURSUBOPT;
                DATA.DASH_CURSUBOPT = (DASH_SUB[DATA.DASH_CURSUB].Options.length < 1) ? -1 : DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT].Value.Default;

                for (let i = 0; i < DASH_SUB[DATA.DASH_CURSUB].Options.length; i++)
                {
                    if (typeof DASH_SUB[DATA.DASH_CURSUB].Options[i] === "string")
                    {
                        DASH_SUB[DATA.DASH_CURSUB].Options[i] = execScript(DASH_SUB[DATA.DASH_CURSUB].Options[i]);
                    }
                }
                break;
        }
    }
    else
    {
        switch (DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Type)
        {
            case "ELF": DATA.DASH_STATE = "FADE_OUT"; DASH_SEL = DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT]; break;
            case "CODE": ValidateCodeObj(DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT]); break;
            case "CONTEXT": SetDashContext(DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Value, "SUBMENU_CONTEXT_IN"); break;
            case "SUBMENU":
                ValidateSubMenuObj(DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT]);
                optBoxA = 0;                    // Reset the Option Box visibility.
                DATA.BGTMPIMG = false;          // Reset the Temporary Background Image.
                DATA.BGIMGTMPSTATE = 0;         // Reset the Temporary Background Image State.
                DATA.DASH_STATE = "NEW_SUBMENU_IN";
                DASH_SUB[DATA.DASH_CURSUB].Selected = DATA.DASH_CURSUBOPT;
                DASH_SUB[DATA.DASH_CURSUB + 1] = DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Value;
                DATA.DASH_CURSUBOPT = (DASH_SUB[DATA.DASH_CURSUB + 1].Options.length < 1) ? -1 : 0;
                DATA.DASH_PRVSUB++;
                DATA.DASH_CURSUB++;

                for (let i = 0; i < DASH_SUB[DATA.DASH_CURSUB].Options.length; i++)
                {
                    if (typeof DASH_SUB[DATA.DASH_CURSUB].Options[i] === "string")
                    {
                        DASH_SUB[DATA.DASH_CURSUB].Options[i] = execScript(DASH_SUB[DATA.DASH_CURSUB].Options[i]);
                    }
                }
                break;
        }
    }
}

//////////////////////////////////////////////////////////////////////////
///*				   			 OTHER 							  *///
//////////////////////////////////////////////////////////////////////////

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
function neutralizeOverlayWithAlpha()
{
    if (DATA.OVALPHA === 0) { return { r: 128, g: 128, b: 128 }; }

    const ovA = 0.15625f;
    const OvR = Color.getR(DATA.OVCOL);
    const OvG = Color.getG(DATA.OVCOL);
    const OvB = Color.getB(DATA.OVCOL);

    const neutralizedColor = {
        r: Math.round(128 - (ovA * (OvR - 256))),
        g: Math.round(128 - (ovA * (OvG - 256))),
        b: Math.round(128 - (ovA * (OvB - 256))),
    };

    // Clamp the values to stay within the valid RGBA range (0-255)
    neutralizedColor.r = Math.max(0, Math.min(255, neutralizedColor.r));
    neutralizedColor.g = Math.max(0, Math.min(255, neutralizedColor.g));
    neutralizedColor.b = Math.max(0, Math.min(255, neutralizedColor.b));

    return neutralizedColor;
}

//////////////////////////////////////////////////////////////////////////
///*				   			 	CODE							  *///
//////////////////////////////////////////////////////////////////////////

ftxtWrite("./XMB/log.txt", ""); 	            // Initializes the log.txt file.
xmblog("INIT: SYSTEM INIT COMPLETE");

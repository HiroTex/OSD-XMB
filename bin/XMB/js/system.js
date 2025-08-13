//////////////////////////////////////////////////////////////////////////
///*				   			  System						  	  *///
/// 				   		  										   ///
///		 The module where all generic functions and variables are 	   ///
///			   			   generated and stored. 					   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
///*				   			 Explorer							  *///
//////////////////////////////////////////////////////////////////////////

function umountHDD() { if (os.readdir("pfs1:/")[1] === 0) { System.umount("pfs1:"); } }
function mountHDDPartition(partName) {
    if (!UserConfig.HDD) { return "?"; }

	umountHDD();
	const result = System.mount("pfs1:", `hdd0:${partName}`);
	xlog(`Partition "${partName}" Mount process finished with result: ${result}`);

	switch (result) {
        case 0: break; // This partition was mounted correctly.
        case -16: return "pfs0"; // The partition was already mounted on pfs0 probably.
	}

	return "pfs1";
}
function getDevicesAsItems(params = {}) {
	const Items = [];
	const devices = System.devices();
	const fileFilters = ('fileFilters' in params) ? params.fileFilters : false;
	const fileoptions = ('fileoptions' in params) ? params.fileoptions : false;

	Items.push({
		Name: XMBLANG.WORK_DIR_NAME,
		Description: "",
		Icon: 18,
		Type: "SUBMENU"
	});

	Object.defineProperty(Items[0], "Value", {
		get() {	return exploreDir({ dir:CWD, fileFilters: fileFilters, fileoptions: fileoptions }); },
		enumerable: true,
		configurable: true,
	});

	for (let i = 0; i < devices.length; i++) {
		let dev = devices[i];

		let count = 0;
		let basepath = "";
		let nameList = [];
		let descList = [];
        let iconList = [];

		switch(dev.name) {
			case "mc":
				count = 2;
				basepath = "mc";
				for (let j = 0; j < count; j++)	{
					nameList.push(`Memory Card ${(j + 1).toString()}`);
					iconList.push(16 + j);

					let mcInfo = System.getMCInfo(j);
					if (mcInfo) {
						let used = 8000 - mcInfo.freemem;
						descList.push(`${used} / 8000 Kb`);
					}
					else { descList.push(""); }
				}
				break;
			case "mass":
				count = 10;
				basepath = "mass";
                for (let j = 0; j < count; j++) {
                    const info = System.getBDMInfo(`mass${j.toString()}:`);
                    if (!info) { count = j; break; }
					nameList.push(XMBLANG.MASS_DIR_NAME);
                    iconList.push(21);
                    const bdmName = info.name;
                    switch (info.name) {
                        case "sdc": bdmName = "mx4sio"; break;
                        case "sd": bdmName = "ilink"; break;
                        case "udp": bdmName = "udpbd"; break;
                    }
                    descList.push(`${bdmName.toUpperCase()} ${(info.index + 1).toString()}`);
				}
				break;
			case "hdd":
				count = 1;
				basepath = "hdd";
				nameList.push(XMBLANG.HDD_DIR_NAME);
				descList.push("");
				iconList.push(29);
				break;
			case "mmce":
				count = 2;
				basepath = "mmce";
				for (let j = 0; j < count; j++)	{
					nameList.push("MMCE " + (j + 1).toString());
					descList.push(XMBLANG.MMCE_DESC);
					iconList.push(21);
				}
				break;
		}

		for (let j = 0; j < count; j++)	{
			const root = `${basepath}${j.toString()}:`;
			if (os.readdir(root)[0].length > 0) {
				Items.push({
					Name: nameList[j],
					Description: descList[j],
					Icon: iconList[j],
					Type: "SUBMENU"
				});

				Object.defineProperty(Items[Items.length - 1], "Value", {
					get() {	return exploreDir({ dir: root, fileFilters: fileFilters, fileoptions: fileoptions }); },
					enumerable: true,
					configurable: true,
				});
			}
		}
	}
	return Items;
}
function exploreDir(params) {
	const fileFilters = ('fileFilters' in params) ? params.fileFilters : false;
	const fileoptions = ('fileoptions' in params) ? params.fileoptions : false;
	const collection = [];
	const isHdd = (params.dir.substring(0,3) === "hdd");
	const isMc = (params.dir.substring(0,2) === "mc");
	const dirItems = System.listDir(params.dir);

    // Separate directories and files
    let directories = dirItems.filter(item => item.name !== "." && item.name !== ".." && item.dir); // All directories
    let files = dirItems.filter(item => !item.dir); // All files

    // Sort directories and files alphabetically by name
    files.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    });

	const defGetter = function() { return exploreDir({ dir: this.FullPath, fileFilters: fileFilters, fileoptions: fileoptions }); };
	const hddGetter = function() { const part = mountHDDPartition(this.Name); return exploreDir({ dir:`${part}:/`, fileFilters: fileFilters, fileoptions: fileoptions}); };
	const getter = (isHdd) ? hddGetter : defGetter;

	for (let i = 0; i < directories.length; i++) {
		let item = directories[i];

		collection.push({
            Name: item.name,
            Description: "",
            Icon: 18,
            Type: "SUBMENU",
            FullPath: `${params.dir}${item.name}/`
        });
        Object.defineProperty(collection[collection.length - 1], "Value", { get: getter });
	}

    collection.sort((a, b) => {
        const nameA = a.Name.toLowerCase();
        const nameB = b.Name.toLowerCase();
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    });

	for (let i = 0; i < files.length; i++) {
		let item = files[i];
		if (!fileFilters || extensionMatches(item.name, fileFilters)) {
			const itemParams = {
				path: `${params.dir}${item.name}`,
				size: item.size,
				fileoptions: fileoptions
			}

			collection.push(getFileAsItem(itemParams));
		}
	}

	return { Items: collection, Default: 0 };
}
function getFileAsItem(params) {
    const item = {
        Name: getFileName(params.path),
        Description: formatFileSize(params.size),
        Icon: "FILE",
        FullPath: params.path,
    }

    switch (getFileExtension(params.path).toLowerCase()) {
        case "vcd": item.Icon = "DISC_PS1"; break;
        case "iso": item.Icon = "DISC_PS2"; break;
        case "elf": item.Icon = "TOOL"; item.Type = "ELF"; item.Value = { Path: params.path, Args: [], }; break;
        case "png":
        case "jpg":
        case "bmp": item.Icon = "CAT_PICTURE"; break;
        case "mp3":
        case "wav":
        case "ogg": item.Icon = "CAT_MUSIC"; break;
        case "mp4":
        case "mkv":
        case "avi": item.Icon = "CAT_VIDEO"; break;
    }

    if (('fileoptions' in params) && params.fileoptions) { item.Option = params.fileoptions; }

    return item;
}

//////////////////////////////////////////////////////////////////////////
///*				   			   Paths							  *///
//////////////////////////////////////////////////////////////////////////

/* Get the root of a path */
function getRootName(path) {
    const colonIndex = path.indexOf(":");
    if (colonIndex === -1) {
        throw new Error("Invalid path format. No ':' found.");
    }
    return path.slice(0, colonIndex);
}

/*	Get the full path without the root	*/
function getPathWithoutRoot(path) {
    const colonIndex = path.indexOf(":");
    if (colonIndex === -1) {
        throw new Error("Invalid path format. No ':' found.");
    }
    return path.slice(colonIndex + 2); // Skip ":/" to get the remaining path
}

/*	Parses a filepath to get its filename	*/
function getFileName(path) {
    const colonIndex = path.indexOf(":");
    if (colonIndex !== -1) { path = path.slice(colonIndex + 1); }
    const lastSlashIndex = path.lastIndexOf('/');
    return lastSlashIndex === -1 ? path : path.substring(lastSlashIndex + 1);
}

/*	Parses a filepath to get its extension if it has one	*/
function getFileExtension(filePath) {
    if (typeof filePath !== 'string') return "";

    // Extract extension after the last dot, if any
    const lastDotIndex = filePath.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) {
        return ""; // No extension found or dot is at the end
    }

    return filePath.substring(lastDotIndex + 1);
}

/*	Parses a filepath to search if it matches any extension from a list of extensions	*/
function extensionMatches(filePath, filterExtensions) {
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

/*	Converts a given integer into a byte formatted string	*/
function formatFileSize(size) {
  if (size < 0) return "";

  const suffixes = ["b", "Kb", "Mb", "Gb", "Tb"];
  let index = 0;

  while (size >= 1024 && index < suffixes.length - 1) {
    size /= 1024;
    index++;
  }

  // Round to nearest whole number or one decimal place if needed
  const rounded = size < 10 && index > 0 ? size.toFixed(1) : Math.fround(size);

  return `${rounded} ${suffixes[index]}`;
}

function resolveFilePath(filePath) {
    filePath = filePath.replace("{cwd}", CWD);
    filePath = filePath.replace("{bootpath}", System.boot_path);
    filePath = filePath.replace("//", "/");
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
        if (std.exists(fullPath))  { return fullPath; }
    }

    return ''; // File not found in any of the checked paths
}

/**
 * Write all text on 'txt' to 'path' file
 * @param {String} path The path to write the text file.
 * @param {String} txt The text to write to the file.
 */
function ftxtWrite(path, txt, mode = "w+") {
    let errObj = {};
    const file = std.open(path, mode, errObj);
    if (file) {
        file.puts(txt);
        file.flush();
        file.close();
    } else {
		xlog(`IO ERROR: ${std.strerror(errObj.errno)}`);
    }
}

//////////////////////////////////////////////////////////////////////////
///*				   			    ISO								  *///
//////////////////////////////////////////////////////////////////////////

function getGameName(path) {

    const noExt = path.replace(/\.[^/.]+$/, "");
    const lastDot = noExt.lastIndexOf(".");
    if (lastDot === -1 || lastDot === noExt.length - 1) return noExt.trim();
    return noExt.slice(lastDot + 1);
}
function getGameCodeFromOldFormatName(path) {

    // Check for Pfs BatchKit Manager Pattern (PP.Game-ID..GameName.iso)
    let match = path.match(/[A-Z]{4}-\d{5}/);
    if (match) {
        const parts = match[0].split('-'); // ['SLPS', '12345']
        const gameCode = parts[0] + '_' + parts[1].slice(0, 3) + '.' + parts[1].slice(3);
        return gameCode;
    }

    // Check for old format pattern
    match = path.match(/[A-Z]{4}[-_]\d{3}\.\d{2}/);
    if (match) {
        return match[0].replace('-', '_');
    }

    return "";
}
function getISOgameID(isoPath, isoSize) {

	const RET = { success: false, code: "ERR" };
	const sectorSize = 2048; // Standard ISO sector size
	// Check if the Game ID is in the file name
	const nameID = getGameCodeFromOldFormatName(isoPath);
	if (nameID !== "") { RET.success = true; RET.code = nameID; return RET; }

	// Open the file in read mode
	let file = false;

	try {

		file = std.open(isoPath, "r");
		if (!file) { throw new Error(`Could not open file: ${isoPath}`); }

		// Seek to the Primary Volume Descriptor (sector 16 in ISO 9660)
		file.seek(16 * sectorSize, std.SEEK_SET);
		const pvd = file.readAsString(sectorSize);

		// Check for "CD001" magic string in PVD
		if (!pvd || pvd.substring(1, 6) !== "CD001") { throw new Error(`${getGameName(isoPath)} Primary Volume Descriptor (CD001) not found.`); }

		// Extract the root directory offset and size
		file.seek((16 * sectorSize) + 158, std.SEEK_SET);
		const rootDirOffset = sectorSize * (file.getByte() | (file.getByte() << 8) | (file.getByte() << 16) | (file.getByte() << 24));

		file.seek(4, std.SEEK_CUR);
		const rootDirSize = (file.getByte() | (file.getByte() << 8) | (file.getByte() << 16) | (file.getByte() << 24));

		// Read the root directory
		if ((rootDirOffset > isoSize) || (rootDirSize > sectorSize)) { throw new Error(`${getGameName(isoPath)} ISO Read Error: Invalid Root Data.`); }

		file.seek(rootDirOffset, std.SEEK_SET);
		const rootDir = file.readAsString(rootDirSize);

		if ((!rootDir) || (rootDir.length === 0)) { throw new Error(`${getGameName(isoPath)} Root directory not found or is empty`); }

		// Match file name pattern
		const match = rootDir.match(/[A-Z]{4}[-_][0-9]{3}\.[0-9]{2}/);
		if (match) {
			RET.success = true;
			RET.code = match[0];
		}
	} catch(e) {
        xlog(e);
	} finally {
        if (file) file.close();
	}

    return RET;
}
function getISOgameArgs(info) {
    let args = [];
    args.push(`-cwd=${PATHS.Neutrino}`);
    args.push(`-bsd=${info.dev}`);

    switch (info.dev) {
        case "ata":
            args.push(`-bsdfs=hdl`);
            args.push(`-dvd=hdl:${info.fname.slice(0, -4)}`); // Remove .iso extension
            break;
        default:
            let root = getRootName(info.path);
            let dir = getPathWithoutRoot(info.path);

            args.push(`-dvd=${root}:${dir}${info.fname}`);
            args.push(`-qb`);
            break;
    }

	// UPDATE: it's now a per game compatibility setting
    // Specify media type if available
    //if (info.mt !== "") { args.push(`-mt=${info.mt}`); }

	// Additional Main/Per-Game Settings.
	const ID = (info.id !== "") ? info.id : false;
    args = args.concat(GetNeutrinoArgs(ID));

    if (info.dev === "ata" && args.includes("-logo")) {
        // Remove -logo if using ata device
        args = args.filter(arg => arg !== "-logo");
    }

	return args;
}

//////////////////////////////////////////////////////////////////////////
///*				   			   POPS								  *///
//////////////////////////////////////////////////////////////////////////

function getVCDGameID(path, size) {
    const RET = { success: false, code: "ERR" };

    // Open the file in read mode
    let file = false;
	try {
		if (size <= 0x10d900) { throw new Error(`File is too small: ${path}`); }

		file = std.open(path, "r");
		if (!file) { throw new Error(`Failed to open file: ${path}`); }

		// Seek to the desired position
        file.seek(0x10c900, std.SEEK_SET);

        // Read 4096 bytes
        const buffer = file.readAsString(4096);
        // Match the pattern
        const match = buffer.match(/[A-Z]{4}[-_][0-9]{3}\.[0-9]{2}/);

        if (match) { RET.success = true; RET.code = match[0]; }

	} catch (e) {
		xlog(e);
	} finally {
		if (file) { file.close(); }
	}

	return RET;
}

/*	Info:

    Function to get if cheats on the 'cheats' array are enabled in the CHEATS.TXT file.
    Will return a Bool Array corresponding to each cheat on the 'cheats' array.
    'game' variable can be specified to get a game's CHEATS.TXT and must be the game's title.
	'device' variable can be specified to get a specific device CHEATS.TXT.

*/
function getPOPSCheat(params) {
	const cheats = params.cheats;
	const game = ('game' in params) ? `${params.game}/` : "";
	const device = ('device' in params) ? params.device : "mass";

    // Create an array to store whether each cheat is enabled
    const enabledCheats = new Array(cheats.length).fill(false);
    let path = "";

    switch (device) {
        case "hdd":
            if (os.readdir("hdd0:")[0].length === 0) { return enabledCheats; }
            const part = mountHDDPartition("__common");
            if (!os.readdir(`${part}:/`)[0].includes("POPS")) { return enabledCheats; }
            path = `${part}:/POPS/${game}`;
            break;
        case "mass": path = `mass:/POPS/${game}`; break;
        case "host": path = `${CWD}/POPS/${game}`; break;
    }

	const dirFiles = os.readdir(path)[0];
	if (!dirFiles.includes("CHEATS.TXT")) { return enabledCheats; }

	let errObj = {};
	let file = false;

	try {
		file = std.open(`${path}CHEATS.TXT`, "r", errObj);
		if (!file) { throw new Error(`getPOPSCheat(): I/O Error - ${std.strerror(errObj.errno)}`); }

		const content = file.readAsString();
		const lines = content.split(/\r?\n/);    // Split the content into lines

		// Iterate over the lines in the content
		for (const line of lines) {
			for (let i = 0; i < cheats.length; i++) {
				const cheatString = cheats[i];

				// Check if the line matches the enabled cheat format
				if (line === `$${cheatString}`) { enabledCheats[i] = true; }
			}
		}
	} catch (e) {
		xlog(e);
	} finally {
		if (file) { file.close(); }
	}

    return enabledCheats;
}

/*	Info:

    Function to set cheats on the 'cheats' array to a CHEATS.TXT file.
    'game' variable can be specified to set a game's CHEATS.TXT.
    'game' must be the game's title followed by a '/'.

*/
function setPOPSCheat(params) {
	let cheats = params.cheats;
	let game = ('game' in params) ? params.game : "";
	let device = ('device' in params) ? params.device : "mass";
    let path = "";

    switch (device) {
        case "hdd":
            if (os.readdir("hdd0:")[0].length === 0) { return; }
            const part = mountHDDPartition("__common");
            if (!os.readdir(`${part}:/`)[0].includes("POPS")) { return; }
            path = `${part}:/POPS/${game}`;
            break;
        case "mass": path = `mass:/POPS/${game}`; break;
        case "host": path = `${CWD}/POPS/${game}`; break;
    }

    const dirFiles = os.readdir(path)[0];

    if (dirFiles.includes("CHEATS.TXT")) {
        let errObj = {};
        const file = std.open(`${path}CHEATS.TXT`, "r", errObj);
        if (!file) { xlog(`setPOPSCheat(): I/O ERROR - ${std.strerror(errObj.errno)}`); return; }
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
                    if (cheat.enabled) { resultLines.push(`$${cheat.code}`); }
                    // Remove the cheat from the array
                    cheats.splice(i, 1);
                    break;
                }
            }

            // If the line wasn't related to a cheat, keep it unchanged
            if (!found) { resultLines.push(line); }
        }

        // Add remaining enabled cheats to the end
        for (const cheat of cheats) { if (cheat.enabled) { resultLines.push(`$${cheat.code}`); } }

        // Combine all lines into a single string
        ftxtWrite(`${path}CHEATS.TXT`, resultLines.join('\n'));
    }
    else {
        let lines = [];
        lines.push("$SAFEMODE");

        for (let i = 0; i < cheats.length; i++) {
            if (cheats[i].enabled) { lines.push(`$${cheats[i].code}`); }
        }

        if (lines.length > 0) { ftxtWrite(`${path}CHEATS.TXT`, lines.join('\n')); }
    }
}

function getPOPSElfPath(data) {
    const prefix = (data.dev === "mass") ? "XX." : "";
    let path = "mass:/POPS/";
    if (data.dev === "hdd") {
        const part = mountHDDPartition("__common");
        path = `${part}:/POPS/`;
    }

    const elfPath = `${path}${prefix}${data.fname.substring(0, data.fname.length - 3)}ELF`;

    if (!std.exists(elfPath)) { System.copyFile(`${path}POPSTARTER.ELF`, elfPath); }

    return elfPath;
}

//////////////////////////////////////////////////////////////////////////
///*				   			    ART								  *///
//////////////////////////////////////////////////////////////////////////

/* Get Available Art Paths */
function getArtPaths() {
    const IDs = System.listDir(PATHS.Art);
    if (IDs.length === 0) { return []; }
    return IDs.map(id => (id.dir && id.name !== "." && id.name !== "..") ? id.name : "").filter(name => name !== "");
}

function findArt(baseFilename, type) {
    if (!baseFilename || !gArt.includes(baseFilename)) { return ""; }
    const namePattern = type;
    const artPath = `${PATHS.Art}/${baseFilename}/`;
    const files = os.readdir(artPath)[0];

    // Search for the file in the ART Folder case-insensitively
    for (let i = 0; i < files.length; i++) {
        let item = files[i];
        if (item.length === namePattern.length && item.toLowerCase() === namePattern) {
            return `${artPath}${item}`;
        }
    }

    // No Art was found.
    return "";
}

/*	Searchs for a matching ICO file in the ART folder for a specified string	*/
/*	Returns empty string if not found.											*/
function findICO(baseFilename) { return findArt(baseFilename, "icon0.png"); }

/*	Searchs for a matching BG file in the ART folder for a specified string	*/
/*	Returns empty string if not found.											*/
function findBG(baseFilename) { return findArt(baseFilename, "pic1.png"); }

//////////////////////////////////////////////////////////////////////////
///*				   		   Plugin System						  *///
//////////////////////////////////////////////////////////////////////////

function validatePlugin(plg) {
  return (
    (("Name" in plg) && (typeof plg.Name === "string") || (Array.isArray(plg.Name))) &&
    (("Icon" in plg) && ((typeof plg.Icon === "number") || (typeof plg.Icon === "string"))) &&
    (("Category" in plg) && (typeof plg.Category === "number")) &&
    (("Type" in plg) && (["ELF", "CODE", "SUBMENU"].includes(plg.Type)))
  );
}
function AddNewPlugin(Plugin) {
    if (!validatePlugin(Plugin)) { return false; }

	if (("CustomIcon" in Plugin) && (typeof Plugin.CustomIcon === "string"))
    {
		Plugin.CustomIcon = resolveFilePath(Plugin.CustomIcon);
		if (!std.exists(Plugin.CustomIcon)) { delete Plugin.CustomIcon; }
    }

    const item = DashCatItems[Plugin.Category].Items.length;
    DashCatItems[Plugin.Category].Items[item] = Plugin;
}
function FindDashIcon(targetName) {
    for (let i = 0; i < DashIconsInfo.length; i++) {
        if (DashIconsInfo[i].name === targetName) { return i; }
    }

    return -1;
}
function ExecuteItem(Item) {
	if (!Item) { return; }
	if (DashUI.SubMenu.Level < 0) {
		const safe = ((UserConfig.ParentalSet === 0) || (('Safe' in Item) && (Item.Safe === "true")));
		if (!safe) { OpenDialogParentalCheck(Item); return; }
	}
	DashUIObjectHandler(Item);
}
function ExecuteSpecial() {
	switch(gExit.Type) {
		case 0: System.exitToBrowser(); break;
	}
}
function ExecuteELF() {
	if (!('Args' in gExit.Elf)) 		{ gExit.Elf.Args = [] }
	if (!('RebootIOP' in gExit.Elf)) 	{ gExit.Elf.RebootIOP = false }
	if ('Code' in gExit.Elf) { gExit.Elf.Code(); }
	if (gExit.Elf.Path.substring(0, 3) !== "pfs") { umountHDD(); }

	xlog( `Executing Elf: ${gExit.Elf.Path}\n With Args: [ ${gExit.Elf.Args} ]`);
	System.loadELF(gExit.Elf.Path, gExit.Elf.Args, gExit.Elf.RebootIOP);
}

//////////////////////////////////////////////////////////////////////////
///*				   			 ICON.SYS							  *///
//////////////////////////////////////////////////////////////////////////

function parseIconSysTitle(path, name) {
    let RET = name;
    const syspath = `${path}${name}`;
    const files = os.readdir(syspath)[0];
    let fileExist = files.includes("icon.sys");

    if (!fileExist) { return RET; }

    const file = os.open(`${syspath}/icon.sys`, os.O_RDONLY);

    if (file < 0) { return RET; }

    const code = "PS2D";
    const match = true;
    const magic = new Uint8Array(4);
    os.seek(file, 0, std.SEEK_SET);
    os.read(file, magic.buffer, 0, 4);

    if (magic.length === code.length) {
        for (let i = 0; i < code.length; i++) {
            if (magic[i] !== code.charCodeAt(i)) {
                match = false;
                break;
            }
        }
    }
    else { match = false; }

    if (match) {
        const linebreak = new Uint8Array(2);
        os.seek(file, 6, std.SEEK_SET);
        os.read(file, linebreak.buffer, 0, 2);
        const linepos = linebreak[0] >> 1;
        const title = new Uint8Array(68);
        os.seek(file, 192, std.SEEK_SET);
        os.read(file, title.buffer, 0, 68);
        RET = IconSysDecodeTitle(title);
        if (/^[\?]*$/.test(RET)) { RET = name; }
		else { RET = RET.slice(0, linepos) + " " + RET.slice(linepos); }
    }

    os.close(file);
    return RET;
}

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
function getSystemDataPath() {
    const tmp = std.open("rom0:ROMVER", "r");
    const ROMVER = tmp.readAsString();
    tmp.close();

    switch (ROMVER[4]) {
        case 'X':
        case 'H':
        case 'A': return "BADATA-SYSTEM";
        case 'C': return "BCDATA-SYSTEM";
        case 'E': return "BEDATA-SYSTEM";
        case 'T':
        case 'J': return "BIDATA-SYSTEM";
    }
}
function getCurrentDOSDate() {
    const year = gTime.year - 1980; // DOS date starts at 1980
    const month = gTime.month; // JS months are 0-based
    const day = gTime.day;
    return (year << 9) | (month << 5) | day;
}
function getMcHistoryFilePath() {
	const systemPath = getSystemDataPath();
	let path = `mc0:/${systemPath}/history`;
    if (!std.exists(path)) {
		// try memory card 2
		path = `mc1:/${systemPath}/history`;
		if (!std.exists(path)) { path = ""; }
    }
	return path;
}
function getMcHistory() {
	let file = false;
	let data = [];

	try {
		const historyPath = getMcHistoryFilePath();
		if (historyPath === "") { throw new Error(`ERROR: Could not find history file`); }

		file = os.open(`mc0:/${getSystemDataPath()}/history`, os.O_RDONLY);
		if (file < 0) { throw new Error(`ERROR: Could not open history file`); }

		const entrySize = 0x16;
		const buffer = new Uint8Array(entrySize);

		while (os.read(file, buffer.buffer, 0, entrySize) === entrySize)
		{
			const name = String.fromCharCode(...buffer.subarray(0, 0x10)).replace(/\x00+$/, '');
			const playCount = buffer[0x10];
			const bitmask = buffer[0x11];
			const bitshift = buffer[0x12];
			const dosDate = (buffer[0x14] | (buffer[0x15] << 8)); // Little-endian

			data.push({ name, playCount, bitmask, bitshift, dosDate });
		}

	} catch (e) {
		xlog(e);
	} finally {
		if (file) { os.close(file); }
	}

	return data;
}
function setMcHistory(entries) {
	let result = false;
	let file = false;
	try {
		const path = getSystemDataPath();
		let historyPath = getMcHistoryFilePath();
		let flags = os.O_RDWR;
		if (historyPath === "") { // file must be created
			// Make memory card path on slot 1
			os.mkdir(`mc0:/${path}`);
			historyPath = `mc0:/${path}/history`;
			flags = flags | os.O_CREAT;
		}

		file = os.open(historyPath, flags);
		if (file < 0) { throw new Error(`ERROR: Could not create history file on ${historyPath}`); }

		const entrySize = 0x16;
		const buffer = new Uint8Array(entrySize);

		for (const obj of entries) {
			buffer.fill(0);
			for (let i = 0; i < obj.name.length; i++) {
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
		result = true;
	} catch (e) {
		xlog(e);
	} finally {
		if (file) { os.close(file); }
	}

    return result;
}
function setHistoryEntry(name) {
    const objects 	  = getMcHistory();
    const currentDate = getCurrentDOSDate();
    let found = false;
    let emptySlot = false;

    for (const obj of objects) {
        if (obj.name === name) {
            // If name exists, update play count and date
            obj.playCount = Math.min(obj.playCount + 1, 0x3F);
            obj.dosDate = currentDate;
            found = true;
            break;
        } else if (!emptySlot && obj.name === "") {
            // Store the first empty slot found
            emptySlot = obj;
        }
    }

    if (!found) {
        if (emptySlot) {
            // Reuse an empty slot
            emptySlot.name = name;
            emptySlot.playCount = 0x01;
            emptySlot.bitmask = 0x01;
            emptySlot.bitshift = 0x00;
            emptySlot.dosDate = currentDate;
        }
        else if (objects.length < 21) {
            // Append a new entry if the list is not full
            objects.push({
                name: name,
                playCount: 0x01,
                bitmask: 0x01,
                bitshift: 0x00,
                dosDate: currentDate
            });
        }
        else {
            xlog("ERROR: No space left to add a new entry.");
			return;
        }
    }

    return setMcHistory(objects);
}

//////////////////////////////////////////////////////////////////////////
///*				   			 Helpers							  *///
//////////////////////////////////////////////////////////////////////////

function cubicEaseOut(t) { return 1 - Math.pow(1 - t, 3); }
function cubicEaseIn(t) { return Math.pow(1 - t, 3); }
function createFade() {	return { In: false,	Progress: 0.0f, Running: false }; }
function alphaCap(a) {	if (a < 0) { a = 0; } if (a > 128) { a = 128; }	return a; }
function getTimerSec(t) { return ~~(Timer.getTime(t) / 100000) }
function getLocalText(t) { return ((Array.isArray(t)) ? t[UserConfig.Language] : t); }
function getFadeProgress(fade) { return fade.Running ? (fade.In ? cubicEaseOut(fade.Progress) : cubicEaseIn(fade.Progress)) : 1; }
function interpolateColorObj(color1, color2, t) {
    return {
        R: Math.fround(color1.R + (color2.R - color1.R) * t),
        G: Math.fround(color1.G + (color2.G - color1.G) * t),
        B: Math.fround(color1.B + (color2.B - color1.B) * t),
    };
}

//////////////////////////////////////////////////////////////////////////
///*				   			   DEBUG							  *///
//////////////////////////////////////////////////////////////////////////

function PrintDebugInformation() {
	if (!gDebug) { return; }

    const DebugInfo = [];
    const mem = System.getMemoryStats();
	DebugInfo.push(`${Screen.getFPS(360)}  FPS`);
	DebugInfo.push(`RAM USAGE: ${Math.floor(mem.used / 1024)}KB / ${Math.floor(ee_info.RAMSize / 1024)}KB`);
	DebugInfo.push(`WIDTH: ${ScrCanvas.width} HEIGHT: ${ScrCanvas.height}`);
    DebugInfo.push(`DATE: ${gTime.day}/${gTime.month}/${gTime.year} ${gTime.hour}:${gTime.minute}:${gTime.second}`);

    TxtPrint({ Text: DebugInfo, Position: { X: 5, Y: ScrCanvas.height - ((DebugInfo.length + 1) * 16)}});
    xlogProcess();
}
function xlog(l) {

    // Write line to log file with timestamp.
    const hours = String(gTime.hour).padStart(2, '0');
    const minutes = String(gTime.minute).padStart(2, '0');
    const seconds = String(gTime.second).padStart(2, '0');
    const milliseconds = String(gTime.millisecond).padStart(3, '0');
    const line = `[ ${hours}:${minutes}:${seconds}:${milliseconds} ] ${l}`;
    console.log(line);

    if (!gDebug) { return; }

    gDbgTxt.push(line);
}
function xlogProcess() {
    // Extract lines of gDbgTxt Var
    if (gDbgTxt.length < 1) { return; }
    const lines = gDbgTxt.splice(0, gDbgTxt.length).join('\n'); // Get all lines and clear the array
    ftxtWrite(`${PATHS.XMB}log.txt`, lines, "a"); // Write to file
}

//////////////////////////////////////////////////////////////////////////
///*				   			 Init Work							  *///
//////////////////////////////////////////////////////////////////////////

let gExit 		= {};
let gThreads 	= false;
let gDebug      = false;
let gDbgTxt     = [];
let gArt     	= getArtPaths();
let ScrCanvas 	= Screen.getMode();
const ee_info   = System.getCPUInfo();

const vmodes    = [ Screen.NTSC, Screen.PAL, Screen.DTV_480p ];
ScrCanvas.width = (UserConfig.Aspect === 0) ? 640 : 704;
if ('Vmode' in UserConfig) {
    ScrCanvas.height    = (UserConfig.Vmode === 1) ? 512 : 480;
    ScrCanvas.interlace = (UserConfig.Vmode === 2) ? Screen.PROGRESSIVE : Screen.INTERLACED;
    ScrCanvas.field     = (UserConfig.Vmode === 2) ? Screen.FRAME : Screen.FIELD;
    ScrCanvas.mode      = vmodes[UserConfig.Vmode];
}
Screen.setMode(ScrCanvas);
let TmpCanvas = Screen.getMode();

ftxtWrite(`${PATHS.XMB}log.txt`, ""); // Init Log File.
console.log("INIT LIB: SYSTEM COMPLETE");

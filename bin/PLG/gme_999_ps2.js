//////////////////////////////////////////////////////////////////////////
///*				   		 ENCLOSE START							  *///
//////////////////////////////////////////////////////////////////////////

export const Plugin = (() => { 	// DO NOT REMOVE, Encloses plugin on a local scope //

//////////////////////////////////////////////////////////////////////////
///*				   		 CUSTOM STRINGS							  *///
//////////////////////////////////////////////////////////////////////////

const NeutrinoSettingNames =
[
    "Virtual Memory Card 1",
    "Virtual Memory Card 2",
    "IOP: Fast reads",
    "IOP: Sync reads",
    "IOP: Emulate DVD-DL",
    "IOP: Fix game buffer overrun",
    "EE : Unhook syscalls"
];

//////////////////////////////////////////////////////////////////////////
///*				   		CUSTOM FUNCTIONS						  *///
//////////////////////////////////////////////////////////////////////////

let cwd = "";
let gameList = [];

// For cases when the executable is placed directly at root.
let basepath = `${os.getcwd()[0]}/`; if (basepath.endsWith("//")) { basepath = basepath.slice(0, -1); }

const elfPath = `${basepath}APPS/neutrino/`;
const cfgPath = "neutrino.cfg";

function SaveLastPlayedAndGetExArgs()
{
    if (DATA.GAMESETS.LOGO) { DASH_SEL.Value.Args.push('-logo'); }
    if (DATA.GAMESETS.DBC) { DASH_SEL.Value.Args.push('-dbc'); }
    const config = DATA.CONFIG.Get(`${DASH_SEL.Description}.cfg`);

    if (("gc" in config) && (config["gc"] !== "")) { DASH_SEL.Value.Args.push(`-gc=${config["gc"]}`); }
    if (("VMC0" in config) && (config["VMC0"] === "true")) { DASH_SEL.Value.Args.push(`-mc0=${basepath}VMC/${DASH_SEL.Description}_0.vmc`); }
    if (("VMC1" in config) && (config["VMC1"] === "true")) { DASH_SEL.Value.Args.push(`-mc1=${basepath}VMC/${DASH_SEL.Description}_1.vmc`); }

    //if (DASH_SEL.Device !== "ATA") { DASH_SEL.Value.Args.push('-qb'); }

    // Save Last Played
    const cfg = DATA.CONFIG.Get(cfgPath);
    cfg["lastPlayed"] = DASH_SEL.Name;
    DATA.CONFIG.Set(cfgPath, cfg);
}

function getGameSettings(code)
{
    const config = DATA.CONFIG.Get(`${code}.cfg`);
    let settings = [ false, false, false, false, false, false, false ];
    if ("VMC0" in config) { settings[0] = (config["VMC0"] === "true"); }
    if ("VMC1" in config) { settings[1] = (config["VMC1"] === "true"); }
    if ("gc" in config)
    {
        const gc = config["gc"];
        settings[2] = /0/.test(gc);
        settings[3] = /2/.test(gc);
        settings[4] = /5/.test(gc);
        settings[5] = /7/.test(gc);
        settings[6] = /3/.test(gc);
    }

    return settings;
}

function getOptionContextInfo()
{
    let dir_options = [];
    dir_options.push({ Name: TXT_INFO, Icon: -1 });

    let _a = function(DATA, val)
    {
        const gameData = [];
        const currSett = getGameSettings(DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Description);

        gameData.push({
            Selectable: false,
            get Name() {
                return TXT_TITLE[DATA.LANGUAGE];
            },
            get Description() {
                return DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Name;
            }
        });

        gameData.push({
            Selectable: false,
            get Name()
            {
                return TXT_DEVICE[DATA.LANGUAGE];
            },
            get Description()
            {
                return DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Device;
            }
        });

        for (let i = 0; i < NeutrinoSettingNames.length; i++)
        {
            gameData.push({
                Selectable: true,
                Name: NeutrinoSettingNames[i],
                Selected: (currSett[i]) ? 1 : 0,
                Count: 2,
                get Description() {
                    return ((this.Selected === 0) ? TXT_NO[DATA.LANGUAGE] : TXT_YES[DATA.LANGUAGE]);
                }
            });
        }

        let saveGameSettings = function()
        {
            const code = DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Description;
            const config = DATA.CONFIG.Get(`${code}.cfg`);
            config["VMC0"] = (DATA.MESSAGE_INFO.Data[2].Selected === 1).toString();
            config["VMC1"] = (DATA.MESSAGE_INFO.Data[3].Selected === 1).toString();
            let gcModes = "";
            if (DATA.MESSAGE_INFO.Data[4].Selected === 1) { gcModes += "0"; }
            if (DATA.MESSAGE_INFO.Data[5].Selected === 1) { gcModes += "2"; }
            if (DATA.MESSAGE_INFO.Data[6].Selected === 1) { gcModes += "5"; }
            if (DATA.MESSAGE_INFO.Data[7].Selected === 1) { gcModes += "7"; }
            if (DATA.MESSAGE_INFO.Data[8].Selected === 1) { gcModes += "3"; }
            config["gc"] = gcModes;
            DATA.CONFIG.Push(`${DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Description}.cfg`, config);

            let setCopyMessage = false;
            const vmcfiles = os.readdir(`${basepath}VMC/`)[0];
            for (let i = 0; i < 2; i++)
            {
                if ((config[`VMC${i.toString()}`] === "true") && (!vmcfiles.includes(`${code}_${i}.vmc`)))
                {
                    threadCopyPush(`${basepath}VMC/blank.vmc`, `${basepath}VMC/${code}_${i}.vmc`);
                    setCopyMessage = true;
                }
            }

            if (setCopyMessage)
            {
                DATA.OVSTATE = "MESSAGE_IDLE";
                DATA.DASH_STATE = "SUBMENU_MESSAGE_IDLE";
                DATA.MESSAGE_INFO =
                {
                    Icon: -1,
                    Title: "",
                    BG: false,
                    Type: "INFO_TO_PROGRESS",
                    BACK_BTN: false,
                    ENTER_BTN: false,
                    Count: DATA.CPYQUEUE.length,
                    Done: 0,
                    get Progress()
                    {
                        this.Done = this.Count - DATA.CPYQUEUE.length;
                        const progress = System.getFileProgress();
                        return Math.round((progress.current / progress.final) * 100);
                    }
                };
            }
        };

        console.log("NEUTSETTS: Set Message Screen Parameters");
        DATA.DASH_STATE = "SUBMENU_CONTEXT_MESSAGE_FADE_OUT";
        DATA.OVSTATE = "MESSAGE_IN";
        DATA.MESSAGE_INFO =
        {
            Icon: -1,
            Title: "",
            BG: false,
            Type: "INFO",
            Data: gameData,
            BACK_BTN: true,
            ENTER_BTN: true,
            Confirm: saveGameSettings,
        };
    }

    return { Options: dir_options, Default: 0, ItemCount: dir_options.length, Confirm: _a, };
}

function getISOGameCode(isoPath, isoSize)
{
    const sectorSize = 2048; // Standard ISO sector size
    const RET = { success: false, code: "ERR" };

    // Open the file in read mode
    const file = std.open(isoPath, "r");
    if (!file)
    {
        console.log(`Could not open file: ${isoPath}`);
        return RET;
    }

    // Seek to the Primary Volume Descriptor (sector 16 in ISO 9660)
    file.seek(16 * sectorSize, std.SEEK_SET);
    const pvd = file.readAsString(sectorSize);

    // Check for "CD001" magic string in PVD
    if (!pvd || pvd.substring(1, 6) !== "CD001")
    {
        file.close();
        logl(`${getGameName(isoPath)} Primary Volume Descriptor (CD001) not found.`);
        console.log("Primary Volume Descriptor (CD001) not found");
        return RET;
    }

    // Extract the root directory offset and size
    file.seek((16 * sectorSize) + 158, std.SEEK_SET);
    const rootDirOffset = sectorSize * (file.getByte() | (file.getByte() << 8) | (file.getByte() << 16) | (file.getByte() << 24));

    file.seek(4, std.SEEK_CUR);
    const rootDirSize = (file.getByte() | (file.getByte() << 8) | (file.getByte() << 16) | (file.getByte() << 24));

    // Read the root directory
    if ((rootDirOffset > isoSize) || (rootDirSize > sectorSize))
    {
        file.close();
        logl(`${getGameName(isoPath)} ISO Read Error: Invalid Root Data.`);
        console.log("ISO Read Error: Invalid Root Data");
        return RET;
    }

    file.seek(rootDirOffset, std.SEEK_SET);
    const rootDir = file.readAsString(rootDirSize);
    file.close();

    if ((!rootDir) || (rootDir.length === 0))
    {
        logl(`${getGameName(isoPath)} Root directory not found or is empty`);
        console.log("Root directory not found or is empty");
        return RET;
    }

    // Match file name pattern
    const match = rootDir.match(/[A-Z]{4}[-_][0-9]{3}\.[0-9]{2}/);
    if (match) {
        RET.success = true;
        RET.code = match[0];
    }

    return RET;
}

// Get Game Launching Arguments to pass to neutrino

function getGameLaunchArgs(device, fs, mt, root, dir, filename)
{
    const args = [];

    if (fs === "hdl") { root = "hdl"; dir = ""; }

    // Set Current Working Directory if modules are in a separate dir.
    if (cwd !== "") { args.push(`-cwd=${cwd}`); }
    args.push(`-bsd=${device}`);
    args.push(`-bsdfs=${fs}`);
    args.push(`-dvd=${root}:${dir}${filename}`);

    // Specify media type if available
    if (mt !== "") { args.push(`-mt=${mt}`); }

    return args;
}

// Get Path media type (DVD or CD)

function getMediaType(path)
{
    const folderName = getFolderNameFromPath(path).toLowerCase();
    if ((folderName === "dvd") || (folderName === "cd")) { return folderName; }

    return "";
}

// Parse Directory to Scan for Games

function ParseDirectory(path, device, fs)
{
    // Get Directory Items, return if empty.
    let dir = System.listDir(path); if (dir.length < 1) { return; }

    // Filter out non-ISO files
    let files = dir.filter(item => item.name.toLowerCase().endsWith(".iso"));

    // Get current neutrino cfg config to get title Game ID faster.
    const cfg = DATA.CONFIG.Get(cfgPath);

    files.forEach((item) =>
    {
        // Get Game Item Info
        const title = getGameName(item.name);
        const args = getGameLaunchArgs(device, fs, getMediaType(path), getRootName(path), getPathWithoutRoot(path), item.name);
        const value = { Path: `${elfPath}neutrino.elf`, Args: args, Code: SaveLastPlayedAndGetExArgs };

        // Get Game Code
        let gameCode = "";

        if (title in cfg) { gameCode = cfg[title]; }
        else
        {
            gameCode = getGameCodeFromOldFormatName(item.name);
            if (gameCode === "")
            {
                let found = false;
                if (fs === "hdl")
                {
                    // Pending.
                }
                else
                {
                    let retval = getISOGameCode(`${path}${item.name}`, item.size);
                    found = retval.success
                    gameCode = (retval.success) ? retval.code : "";
                }

                if (found)
                {
                    cfg[title] = gameCode;
                    DATA.CONFIG.Push(cfgPath, cfg);
                }
            }
            else
            {
                cfg[title] = gameCode;
                DATA.CONFIG.Push(cfgPath, cfg);
            }
        }

        // Add ART
        let ico = (() => { return dash_icons[26]; });
        const icoFile = findICO(gameCode);
        if (icoFile !== "") { ico = new Image(icoFile, RAM, async_list); }

        gameList.push({
            Name: title,
            Description: gameCode,
            Device: device.toUpperCase(),
            Icon: -1,
            Type: "ELF",
            Value: value,
            Option: getOptionContextInfo(),
            Art: { ICO: ico },
            get CustomIcon()
            {
                if (typeof this.Art.ICO === "function") { return this.Art.ICO(); }
                return this.Art.ICO;
            }
        });

        const bgFile = findBG(gameCode);
        if (bgFile !== "") { gameList[gameList.length - 1].CustomBG = bgFile; }
    });
}

// Check if modules path exists on the neutrino directory, scan mc paths if not.

function updateCWD()
{
    // If modules are not present at Elf Path, scan Memory Cards for them
    if (!os.readdir(elfPath)[0].includes(`modules`))
    {
        cwd = "mc0:/neutrino";

        // Scan MC0 for neutrino folder
        if (!os.readdir("mc0:/")[0].includes("neutrino"))
        {
            // Scan MC1 for neutrino folder
            if (!os.readdir("mc1:/")[0].includes("neutrino")) { return false; }

            // Update assets folder
            cwd = "mc1:/neutrino";
        }
    }

    return true;
}

// Parse the neutrino.cfg file if it exists to get the last played game.

function getLastPlayed()
{
    const cfg = DATA.CONFIG.Get(cfgPath);

    if ("lastPlayed" in cfg)
    {
        const title = cfg["lastPlayed"];
        const index = gameList.findIndex(item => item.Name === title);
        if (index > -1) { return index; }
    }

    return 0;
}

// Scan a Directory's DVD and CD folders for games

function scanGameFolders(path, dev, fs)
{
    // Get Directory Files
    const dir = os.readdir(path)[0];

    // Scan DVD directory if it exists
    if (dir.includes("DVD")) { ParseDirectory(`${path}DVD/`, dev, fs); }

    // Scan CD directory if it exists
    if (dir.includes("CD")) { ParseDirectory(`${path}CD/`, dev, fs); }
}

// Main Function to Initialize the Game List

function getGames()
{
    // Update the Current Working Directory if necessary, return empty list if not possible.
    if (!updateCWD()) { return { Options: {}, Default: 0, ItemCount: 0 }; }

    const bootDev = (os.getcwd()[0].substring(0, 3) === "pfs") ? "ata" : "usb";
    const devices = [`${bootDev}`, "usb", "mx4sio", "ata", "udpbd", "mmce"];
    const roots = [`${os.getcwd()[0]}/`, "mass:/", "mx4sio:/", "hdd0:", "bdfs:/", "mmce:/"];
    const fsmodes = ["exfat", "exfat", "exfat", "hdl", "bd", "exfat"];
    const scannedPaths = [];

    for (let i = 0; i < devices.length; i++)
    {
        // If ends with double slashes, trim.
        if (roots[i].endsWith("//")) { roots[i] = roots[i].slice(0, -1); }

        // if Path was already scanned, skip it
        if ((scannedPaths.length > 0) && (scannedPaths.includes(roots[i]))) { continue; }

        // Get Directory Object, Skip if Directory could not be read.
        const dir = os.readdir(roots[i]);

        console.log(`PS2GAMES: Root = ${roots[i]}`);
        console.log(`PS2GAMES: Device = ${devices[i]}`);
        console.log(`PS2GAMES: FS = ${fsmodes[i]}`);

        if (fsmodes[i] === "hdl")
        {
            // Scan Root Directory
            ParseDirectory(`${roots[i]}`, devices[i], fsmodes[i]);
        }
        else if (devices[i] === "mmce")
        {
            // Scan all possible mmce devices
            scanGameFolders(`mmce0:/`, devices[i], fsmodes[i]);
            scanGameFolders(`mmce1:/`, devices[i], fsmodes[i]);
        }
        else if (roots[i] === "mass:/")
        {
            // Scan all possible mass devices
            for (let j = 0; j < 10; j++)
            {
                scanGameFolders(`mass${j.toString()}:/`, devices[i], fsmodes[i]);
            }
        }
        else
        {
            scanGameFolders(roots[i], devices[i], fsmodes[i]);
        }

        // Add path to scanned Paths
        scannedPaths.push(roots[i]);
    }

    // If more than 1 item in list, sort by alphabetical order.
    if (gameList.length > 1) { gameList.sort((a, b) => a.Name.localeCompare(b.Name)); }

    return { Options: gameList, Default: getLastPlayed(), ItemCount: gameList.length };
}

// Get Title Count Description

function getDesc()
{
    const titleString = gameList.length.toString();
    const DESC_MAIN =
    [
        `${titleString} ${TXT_TITLES[0]}`,
        `${titleString} ${TXT_TITLES[1]}`,
        `${titleString} ${TXT_TITLES[2]}`,
        `${titleString} ${TXT_TITLES[3]}`,
        `${titleString} ${TXT_TITLES[4]}`,
        `${titleString} ${TXT_TITLES[5]}`,
        `${titleString} ${TXT_TITLES[6]}`
    ];

    return DESC_MAIN;
}

//////////////////////////////////////////////////////////////////////////
///*				   		MAIN PLUGIN DATA						  *///
///																	   ///
/// 	Here is the main info that will be retrieved by the App.   	   ///
//////////////////////////////////////////////////////////////////////////

if (!os.readdir(elfPath)[0].includes("neutrino.elf")) { return {}; }

const Info = {
    Name: "Playstation 2",
    Icon: 18,
    Category: 5,
    Type: "SUBMENU",
    Value: getGames(),
    Description: getDesc(),
    Safe: true,
};

if (Info.Value.ItemCount < 1) { return {}; }

return Info;

//////////////////////////////////////////////////////////////////////////
///*				   		   ENCLOSE END							  *///
//////////////////////////////////////////////////////////////////////////

})(); // DO NOT REMOVE, Encloses plugin on a local scope //

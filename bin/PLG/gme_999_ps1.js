//////////////////////////////////////////////////////////////////////////
///*				   		 ENCLOSE START							  *///
//////////////////////////////////////////////////////////////////////////

export const Plugin = (() => { 	// DO NOT REMOVE, Encloses plugin on a local scope //

//////////////////////////////////////////////////////////////////////////
///*				   		 CUSTOM STRINGS							  *///
//////////////////////////////////////////////////////////////////////////

// POPS CHEATS.TXT Special Cheats Options.

const POPSCheatTitles =
[
    "Compatibility Mode",
    "Code Cache Addon",
    "Sub CD Status",
    "Fake Lybcript",
    "PAL Patcher",
    "Sound Mode",
    "DPAD to Left Stick",
    "Virtual Memory Cards",
];

const TXT_PALPATCHER = [ "Default", "Disabled", "Forced" ];
const TXT_SOUNDSETT = [ "Default", "Mute CDDA", "Unmute CDDA", "Mute VAB" ];
const TXT_DPADSTICK = [ "Default", "Force Digital Mode", "Force Analog Mode" ];
const TXT_VMCMODE = [ "Default", "Slot 2 Only", "Slot 1 Only" ];

//////////////////////////////////////////////////////////////////////////
///*				   		CUSTOM FUNCTIONS						  *///
//////////////////////////////////////////////////////////////////////////

let gameList = [];
let popsPaths = [];
let commpart = "pfs1";
let cwdpath = (os.getcwd()[0].endsWith('/')) ? `${os.getcwd()[0]}POPS/` : `${os.getcwd()[0]}/POPS/`;
popsPaths.push(`mass0:/POPS/`); // Default Mass Support
popsPaths.push(cwdpath);        // For host support
popsPaths.push(`hdd`);          // For HDD support

const cfgPath = "pops.cfg";
const cfg = DATA.CONFIG.Get(cfgPath);
const vmcgrps = DATA.CONFIG.Get("PS1VMCGRP.cfg");

function SaveLastPlayed()
{
    cfg["lastPlayed"] = DASH_SEL.Name;
    DATA.CONFIG.Set(cfgPath, cfg);
}

function getGameSettings(path, dev)
{
    const cheats = [
        "COMPATIBILITY_0x01",
        "COMPATIBILITY_0x02",
        "COMPATIBILITY_0x03",
        "COMPATIBILITY_0x04",
        "COMPATIBILITY_0x05",
        "COMPATIBILITY_0x06",
        "COMPATIBILITY_0x07",
        "CODECACHE_ADDON_0",
        "SUBCDSTATUS",
        "FAKELC",
        "NOPAL",
        "FORCEPAL",
        "MUTE_CDDA",
        "UNDO_MUTE_CDDA",
        "MUTE_VAB",
        "D2LS",
        "D2LS_ALT",
        "NOVMC0",
        "NOVMC1",
    ];

    let statuses = getPOPSCheat(cheats, path, dev);

    const settings = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
    settings[0] = (statuses[0]) ? 1 : 0;
    settings[0] = (statuses[1]) ? 2 : settings[0];
    settings[0] = (statuses[2]) ? 3 : settings[0];
    settings[0] = (statuses[3]) ? 4 : settings[0];
    settings[0] = (statuses[4]) ? 5 : settings[0];
    settings[0] = (statuses[5]) ? 6 : settings[0];
    settings[0] = (statuses[6]) ? 7 : settings[0];
    settings[1] = (statuses[7]) ? 1 : 0;
    settings[2] = (statuses[8]) ? 1 : 0;
    settings[3] = (statuses[9]) ? 1 : 0;
    settings[4] = (statuses[10]) ? 1 : 0;
    settings[4] = (statuses[11]) ? 2 : settings[4];
    settings[5] = (statuses[12]) ? 1 : 0;
    settings[5] = (statuses[13]) ? 2 : settings[5];
    settings[5] = (statuses[14]) ? 3 : settings[5];
    settings[6] = (statuses[15]) ? 1 : 0;
    settings[6] = (statuses[16]) ? 2 : settings[6];
    settings[7] = (statuses[17]) ? 1 : 0;
    settings[7] = (statuses[18]) ? 2 : settings[7];
    return settings;
}

function getOptionContextInfo()
{
    let dir_options = [];
    dir_options.push({ Name: XMBLANG.INFO, Icon: -1 });

    let _a = function (DATA, val)
    {
        const gameData = [];
        const currSett = getGameSettings(`${DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Name}/`, DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Device);

        gameData.push({
            Selectable: false,
            get Name() {
                return XMBLANG.TITLE[DATA.LANGUAGE];
            },
            get Description() {
                return DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Name;
            }
        });

        // Compatibility Modes
        gameData.push({
            Selectable: true,
            Name: POPSCheatTitles[0],
            Selected: currSett[0],
            Count: 8,
            get Description() {
                return (this.Selected === 0) ? XMBLANG.NO[DATA.LANGUAGE] : this.Selected.toString();
            }
        });

        // Code Cache Addon
        gameData.push({
            Selectable: true,
            Name: POPSCheatTitles[1],
            Selected: currSett[1],
            Count: 2,
            get Description() {
                return ((this.Selected === 0) ? XMBLANG.NO[DATA.LANGUAGE] : XMBLANG.YES[DATA.LANGUAGE]);
            }
        });

        // Sub CD Status
        gameData.push({
            Selectable: true,
            Name: POPSCheatTitles[2],
            Selected: currSett[2],
            Count: 2,
            get Description() {
                return ((this.Selected === 0) ? XMBLANG.NO[DATA.LANGUAGE] : XMBLANG.YES[DATA.LANGUAGE]);
            }
        });

        // Fake Libcrypt
        gameData.push({
            Selectable: true,
            Name: POPSCheatTitles[3],
            Selected: currSett[3],
            Count: 2,
            get Description() {
                return ((this.Selected === 0) ? XMBLANG.NO[DATA.LANGUAGE] : XMBLANG.YES[DATA.LANGUAGE]);
            }
        });

        // PAL Patcher
        gameData.push({
            Selectable: true,
            Name: POPSCheatTitles[4],
            Selected: currSett[4],
            Count: 3,
            get Description() {
                return TXT_PALPATCHER[this.Selected];
            }
        });

        // Sound modifiers
        gameData.push({
            Selectable: true,
            Name: POPSCheatTitles[5],
            Selected: currSett[5],
            Count: 4,
            get Description() {
                return TXT_SOUNDSETT[this.Selected];
            }
        });

        // Dpad to Left Stick
        gameData.push({
            Selectable: true,
            Name: POPSCheatTitles[6],
            Selected: currSett[6],
            Count: 3,
            get Description() {
                return TXT_DPADSTICK[this.Selected];
            }
        });

        // VMC Modes
        gameData.push({
            Selectable: true,
            Name: POPSCheatTitles[7],
            Selected: currSett[7],
            Count: 3,
            get Description() {
                return TXT_VMCMODE[this.Selected];
            }
        });

        let saveGameSettings = function()
        {
            let cheats = [];
            cheats.push({ code: "COMPATIBILITY_0x01", enabled: (DATA.MESSAGE_INFO.Data[1].Selected === 1)});
            cheats.push({ code: "COMPATIBILITY_0x02", enabled: (DATA.MESSAGE_INFO.Data[1].Selected === 2)});
            cheats.push({ code: "COMPATIBILITY_0x03", enabled: (DATA.MESSAGE_INFO.Data[1].Selected === 3)});
            cheats.push({ code: "COMPATIBILITY_0x04", enabled: (DATA.MESSAGE_INFO.Data[1].Selected === 4)});
            cheats.push({ code: "COMPATIBILITY_0x05", enabled: (DATA.MESSAGE_INFO.Data[1].Selected === 5)});
            cheats.push({ code: "COMPATIBILITY_0x06", enabled: (DATA.MESSAGE_INFO.Data[1].Selected === 6)});
            cheats.push({ code: "COMPATIBILITY_0x07", enabled: (DATA.MESSAGE_INFO.Data[1].Selected === 7)});
            cheats.push({ code: "CODECACHE_ADDON_0", enabled: (DATA.MESSAGE_INFO.Data[2].Selected === 1)});
            cheats.push({ code: "SUBCDSTATUS", enabled: (DATA.MESSAGE_INFO.Data[3].Selected === 1)});
            cheats.push({ code: "FAKELC", enabled: (DATA.MESSAGE_INFO.Data[4].Selected === 1)});
            cheats.push({ code: "NOPAL", enabled: (DATA.MESSAGE_INFO.Data[5].Selected === 1)});
            cheats.push({ code: "FORCEPAL", enabled: (DATA.MESSAGE_INFO.Data[5].Selected === 2)});
            cheats.push({ code: "MUTE_CDDA", enabled: (DATA.MESSAGE_INFO.Data[6].Selected === 1)});
            cheats.push({ code: "UNDO_MUTE_CDDA", enabled: (DATA.MESSAGE_INFO.Data[6].Selected === 2)});
            cheats.push({ code: "MUTE_VAB", enabled: (DATA.MESSAGE_INFO.Data[6].Selected === 3)});
            cheats.push({ code: "D2LS", enabled: (DATA.MESSAGE_INFO.Data[7].Selected === 1)});
            cheats.push({ code: "D2LS_ALT", enabled: (DATA.MESSAGE_INFO.Data[7].Selected === 2)});
            cheats.push({ code: "NOVMC0", enabled: (DATA.MESSAGE_INFO.Data[8].Selected === 1)});
            cheats.push({ code: "NOVMC1", enabled: (DATA.MESSAGE_INFO.Data[8].Selected === 2) });

            const titlepath = `${DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Name}/`;
            const device = DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Device;

            setPOPSCheat(cheats, titlepath, device);
        };

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

    return { Options: dir_options, Default: 0, Confirm: _a, };
}

function getVCDGameID(path)
{
    let RET = "ERR";

    // Open the file in read mode
    const file = std.open(path, "r");
    if (!file)
    {
        console.error(`Failed to open file: ${path}`);
        return RET;
    }

    // Check file size
    file.seek(0, std.SEEK_END);
    let fileSize = file.tell();

    if (fileSize > 0x10d900)
    {
        // Seek to the desired position
        file.seek(0x10c900, std.SEEK_SET);

        // Read 4096 bytes
        const buffer = file.readAsString(4096);
        // Match the pattern
        const match = buffer.match(/[A-Z]{4}[-_][0-9]{3}\.[0-9]{2}/);

        if (match) { RET = match[0]; }
    }

    // Close the file
    file.close();

    return RET;
}

function PopsParseDirectory(path)
{
    let dir = System.listDir(path);

    dir.forEach((item) =>
    {
        if (item.name.toLowerCase().endsWith(".vcd"))
        {
            // Get Game Item Info
            let title = getGameName(item.name);
            let icon = 25;
            let type = "ELF";

            // Set Launch Settings
            let device = (path.substring(0, 3) === "pfs") ? "hdd" : "mass";
            device = (path.substring(0, 4) === "host") ? "host" : device;

            let prefix = (device === "mass") ? "XX." : "";
            let basePath = (path.substring(0, 3) === "pfs") ? `${commpart}:/POPS/` : path;
            let elfPath = `${basePath}${prefix}${item.name.substring(0, item.name.length - 3)}ELF`;
            let value = { Partition: "__common", Path: elfPath, Args: [], Code: SaveLastPlayed };

            // Get Game Code
            let gameCode = "";
            if (title in cfg) { gameCode = cfg[title]; }
            else
            {
                gameCode = getGameCodeFromOldFormatName(item.name);
                if (gameCode === "") { gameCode = getVCDGameID(`${path}${item.name}`); }
                cfg[title] = gameCode;
                DATA.CONFIG.Push(cfgPath, cfg);
            }

            let ico = (() => { return dash_icons[25]; });
            const icoFile = findICO(gameCode);
            if (icoFile !== "") { ico = new Image(icoFile, RAM, async_list); }

            let gamedesc = (device === "mass") ? `USB - ${gameCode}` : `HDD - ${gameCode}`;
            gamedesc = (device === "host") ? `HOST - ${gameCode}` : gamedesc;

            gameList.push({
                Name: title,
                Description: gamedesc,
                GameID: gameCode,
                Icon: -1,
                Type: type,
                Value: value,
                Device: device,
                Option: getOptionContextInfo(),
                Art: { ICO: ico },
                get CustomIcon()
                {
                    if (typeof this.Art.ICO === "function") { return this.Art.ICO(); }
                    return this.Art.ICO;
                }
            });

            const gamepath = `${basePath}${item.name.substring(0, item.name.length - 4)}/`;
            title = getFolderNameFromPath(gamepath);
            if ((!os.readdir(path)[0].includes(title)) && (path.substring(0, 4) !== "pfs1"))
            {
                os.mkdir(path);
            }

            // Add ART
            const bgFile = findBG(gameCode);
            if (bgFile !== "") { gameList[gameList.length - 1].CustomBG = bgFile; }
        }
    });
}

function generateELFs()
{
    // Get all Game Paths
    const Paths = [];
    gameList.forEach((item) => { Paths.push(item.Value.Path); });

    // Filter out pfs1 paths
    const massPaths = Paths.filter((item) => item.substring(0, 3) !== "pfs");
    const hddPaths = Paths.filter((item) => item.substring(0, 3) === "pfs");

    // Use threadFileCopy for mass paths
    massPaths.forEach((item) =>
    {
        const basePath = getDirectoryName(item);
        const filename = item.substring(item.lastIndexOf("/") + 1);
        if (!os.readdir(basePath)[0].includes(filename))
        {
            threadCopyPush(`${getDirectoryName(item)}POPSTARTER.ELF`, item);
        }
    });

    // Mount the POPSTARTER.ELF partition to copy the ELFs if needed
    if (commpart !== "pfs0") { mountHDDPartition("__common"); }

    // Cannot use threadFileCopy with virtual mounted partitions, using copyFile instead.
    hddPaths.forEach((item) =>
    {
        const basePath = getDirectoryName(item);
        const filename = item.substring(item.lastIndexOf("/") + 1);

        if (!os.readdir(basePath)[0].includes(filename))
        {
            System.copyFile(`${getDirectoryName(item)}POPSTARTER.ELF`, item);
        }

        if ((!os.readdir(basePath)[0].includes(filename.substring(0, filename.length - 4))))
        {
            os.mkdir(`${basePath}${filename.substring(0, filename.length - 4)}`);
        }
    });
}

function generateVMCs()
{
    gameList.forEach((item) =>
    {
        const basePath = getDirectoryName(item.Value.Path);
        const vcdname = item.Name;

        if (item.GameID in vmcgrps)
        {
            if (!os.readdir(basePath)[0].includes(vmcgrps[item.GameID]))
            {
                os.mkdir(`${basePath}${vmcgrps[item.GameID]}`);
            }
            if (!os.readdir(`${basePath}${vcdname}/`)[0].includes("VMCDIR.TXT"))
            {
                ftxtWrite(`${basePath}${vcdname}/VMCDIR.TXT`, vmcgrps[item.GameID]);
            }
        }
    });
}

function getGames()
{
    let lastPlayed = 0;
    const scannedPaths = [];

    for (let i = 0; i < popsPaths.length; i++)
    {
        console.log("PS1GAMES: Scanning " + popsPaths[i]);
        // Skip already scanned paths.
        if ((scannedPaths.length > 0) && (scannedPaths.includes(popsPaths[i]))) { continue; }

        // Add path to already processed paths.
        scannedPaths.push(popsPaths[i]);

        // Check if POPS files are present.

        if (popsPaths[i].substring(0, 3) === "hdd")
        {
            // Check if __.POPS partition exists
            if (!os.readdir("hdd0:")[0].includes("__.POPS")) { continue; }

            // Mount __common partition and get its content
            commpart = mountHDDPartition("__common");
            const dirFiles = os.readdir(`${commpart}:/POPS/`)[0];

            // Check if required files are present
            if (!dirFiles.includes("POPS.ELF")) { logl("POPSHDD: Missing POPS.ELF file."); continue; }
            if (!dirFiles.includes("IOPRP252.IMG")) { logl("POPSHDD: Missing IOPRP252.IMG file."); continue; }
            if (!dirFiles.includes("POPSTARTER.ELF")) { logl("POPSHDD: Missing POPSTARTER.ELF file."); continue; }

            popsPaths[i] = `${mountHDDPartition("__.POPS") }:/`;
        }
        else
        {
            const dirFiles = os.readdir(popsPaths[i])[0];

            if (!dirFiles.includes("POPS_IOX.PAK")) { continue; }
            if (!dirFiles.includes("POPSTARTER.ELF")) { continue; }
        }

        PopsParseDirectory(popsPaths[i]);
    }

    if (gameList.length > 1) { gameList.sort((a, b) => a.Name.localeCompare(b.Name)); }

    if ("lastPlayed" in cfg)
    {
        const title = cfg["lastPlayed"];
        const index = gameList.findIndex(item => item.Name === title);
        if (index > -1) { lastPlayed = index; }
    }

    generateELFs();
    generateVMCs();

    return { Options: gameList, Default: lastPlayed };
}

function getDesc()
{
    const titleString = gameList.length.toString();
    const DESC_MAIN = new Array
    (
        `${titleString} ${XMBLANG.TITLES[0]}`,
        `${titleString} ${XMBLANG.TITLES[1]}`,
        `${titleString} ${XMBLANG.TITLES[2]}`,
        `${titleString} ${XMBLANG.TITLES[3]}`,
        `${titleString} ${XMBLANG.TITLES[4]}`,
        `${titleString} ${XMBLANG.TITLES[5]}`,
        `${titleString} ${XMBLANG.TITLES[6]}`,
    );

    return DESC_MAIN;
}

//////////////////////////////////////////////////////////////////////////
///*				   		MAIN PLUGIN DATA						  *///
///																	   ///
/// 	Here is the main info that will be retrieved by the App.   	   ///
//////////////////////////////////////////////////////////////////////////

const Info = {
    Name: "Playstation",
    Icon: 18,
    Category: 5,
    Type: "SUBMENU",
    Value: getGames(),
    Description: getDesc(),
    Safe: true // It can be accesed without asking for parental control code.
};

if (Info.Value.Options.length < 1) { return {}; }

return Info;

//////////////////////////////////////////////////////////////////////////
///*				   		   ENCLOSE END							  *///
//////////////////////////////////////////////////////////////////////////

})(); // DO NOT REMOVE, Encloses plugin on a local scope //

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
popsPaths.push(`mass:/`);
popsPaths.push(`${System.boot_path}/`);

const cfgPath = "pops.cfg";
const cfg = DATA.CONFIG.Get(cfgPath);

function getGameSettings(path)
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
	const statuses = getPOPSCheat(cheats, path);
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
	settings[4] = (statuses[11]) ? 1 : settings[4];
	settings[5] = (statuses[12]) ? 1 : 0;
	settings[5] = (statuses[13]) ? 1 : settings[5];
	settings[5] = (statuses[14]) ? 1 : settings[5];
	settings[6] = (statuses[15]) ? 1 : 0;
	settings[6] = (statuses[16]) ? 1 : settings[6];
	settings[7] = (statuses[17]) ? 1 : 0;
	settings[7] = (statuses[18]) ? 1 : settings[7];
	return settings;
}

function getOptionContextInfo(path)
{
	os.mkdir(path);
	let dir_options = [];
	dir_options.push({ Name: TXT_INFO, Icon: -1, Title: getFolderNameFromPath(path) });

	let _a = function(DATA, val)
	{
		console.log("POPS: Get Current Game Settings");
		const gameData = [];
		const currSett = getGameSettings(`${DASH_CTX[DATA.DASH_CURCTXLVL].Options[DASH_CTX[DATA.DASH_CURCTXLVL].Selected].Title}/`);

		console.log("POPS: Set Game Title");
		gameData.push({
			Selectable: false,
			get Name() {
				return TXT_TITLE[DATA.LANGUAGE];
			},
			get Description() {
				return DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Name;
			}
		});

		console.log("POPS: Set Pops Setting Options");

		// Compatibility Modes
		gameData.push({
			Selectable: true,
			Name: POPSCheatTitles[0],
			Selected: currSett[0],
			Count: 8,
			get Description() {
				return (this.Selected === 0) ? TXT_NO[DATA.LANGUAGE] : this.Selected.toString();
			}
		});

		// Code Cache Addon
		gameData.push({
			Selectable: true,
			Name: POPSCheatTitles[1],
			Selected: currSett[1],
			Count: 2,
			get Description() {
				return ((this.Selected === 0) ? TXT_NO[DATA.LANGUAGE] : TXT_YES[DATA.LANGUAGE]);
			}
		});

		// Sub CD Status
		gameData.push({
			Selectable: true,
			Name: POPSCheatTitles[2],
			Selected: currSett[2],
			Count: 2,
			get Description() {
				return ((this.Selected === 0) ? TXT_NO[DATA.LANGUAGE] : TXT_YES[DATA.LANGUAGE]);
			}
		});

		// Fake Libcrypt
		gameData.push({
			Selectable: true,
			Name: POPSCheatTitles[3],
			Selected: currSett[3],
			Count: 2,
			get Description() {
				return ((this.Selected === 0) ? TXT_NO[DATA.LANGUAGE] : TXT_YES[DATA.LANGUAGE]);
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

		console.log("POPS: Set Confirm Function");
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
			cheats.push({ code: "NOVMC1", enabled: (DATA.MESSAGE_INFO.Data[8].Selected === 2)});
			setPOPSCheat(cheats, `${DASH_CTX[DATA.DASH_CURCTXLVL].Options[DASH_CTX[DATA.DASH_CURCTXLVL].Selected].Title}/`);
		};

		console.log("POPSETTS: Set Message Screen Parameters");
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

function PopsParseDirectory(path)
{
	if (!std.exists(`${path}POPS_IOX.PAK`)) { return; }
	if (!std.exists(`${path}POPSTARTER.ELF`)) { return; }

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
			let prefix = (path.substring(0, 4) == "mass") ? "XX." : "";
			let elfPath = `${path}${prefix}${item.name.substring(0, item.name.length - 3)}ELF`;
			let value = { Path: elfPath, Args: [], Code: SaveLastPlayed };

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

			gameList.push({
				Name: title,
				Description: gameCode,
				Icon: icon,
				Type: type,
				Value: value,
				Option: getOptionContextInfo(`${path}${item.name.substring(0, item.name.length - 4)}/`),
			});

			if (!std.exists(elfPath)) { threadCopyPush(`${getDirectoryName(elfPath)}POPSTARTER.ELF`, elfPath); }

			// Add ART
			const icoFile = findICO(gameCode);
			if (icoFile !== "") { gameList[gameList.length - 1].CustomIcon = new Image(icoFile, RAM, async_list); }
		}
	});
}

function SaveLastPlayed()
{
	cfg["lastPlayed"] = DASH_SEL.Name;
	DATA.CONFIG.Set(cfgPath, cfg);
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

function findICO(baseFilename)
{
	const dirPath = "./ART/";
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

function getGames()
{
	let lastPlayed = 0;
    const scannedPaths = [];

	for (let i = 0; i < popsPaths.length; i++)
	{
		if (popsPaths[i].endsWith("//"))
		{
		    popsPaths[i] = popsPaths[i].slice(0, -1);
		}

		if ((scannedPaths.length > 0) && (scannedPaths.includes(popsPaths[i])))
		{
			continue;
		}

		PopsParseDirectory(`${popsPaths[i]}POPS/`);

        scannedPaths.push(popsPaths[i]);
	}

	if (gameList.length > 1) { gameList.sort((a, b) => a.Name.localeCompare(b.Name)); }

	if ("lastPlayed" in cfg)
	{
		const title = cfg["lastPlayed"];
		const index = gameList.findIndex(item => item.Name === title);
		if (index > -1) { lastPlayed = index; }
	}

	return { Options: gameList, Default: lastPlayed, ItemCount: gameList.length };
}

function getDesc()
{
	const titleString = gameList.length.toString();
	const DESC_MAIN = new Array
	(
		`${titleString} ${TXT_TITLES[0]}`,
		`${titleString} ${TXT_TITLES[1]}`,
		`${titleString} ${TXT_TITLES[2]}`,
		`${titleString} ${TXT_TITLES[3]}`,
		`${titleString} ${TXT_TITLES[4]}`,
		`${titleString} ${TXT_TITLES[5]}`,
		`${titleString} ${TXT_TITLES[6]}`,
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

if (Info.Value.ItemCount < 1) { return {}; }

return Info;

//////////////////////////////////////////////////////////////////////////
///*				   		   ENCLOSE END							  *///
//////////////////////////////////////////////////////////////////////////

})(); // DO NOT REMOVE, Encloses plugin on a local scope //

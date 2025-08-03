//////////////////////////////////////////////////////////////////////////
///*				   		Initialize Modules						  *///
//////////////////////////////////////////////////////////////////////////

function InitCWD() {
	// Try OS Current Working Directory.
	if (os.readdir(os.getcwd()[0])[0].includes("XMB")) {
		return ((os.getcwd()[0].endsWith('/')) ? os.getcwd()[0] : (os.getcwd()[0] + "/"));
	}

	// Try MMCE directories
	for (let i = 0; i < 2; i++) {
		let tmp = `mmce${i.toString()}:/`;
		if (os.readdir(tmp)[0].includes("XMB")) { return; }
		else if (os.readdir(tmp).includes("OSDXMB")) { return tmp + "OSDXMB/"; }
	}

	// Try Mass Directories
	for (let i = 0; i < 10; i++) {
		let tmp = `mass${i.toString()}:/`;
		if (os.readdir(tmp)[0].includes("XMB")) { return; }
		else if (os.readdir(tmp).includes("OSDXMB")) { return tmp + "OSDXMB/"; }
	}

	// Try ATA HDD "hdd0:/__common/OSDXMB/" directory
	if (os.readdir("hdd0")[0].includes("__common"))	{
        System.mount("pfs0:", "hdd0:__common");
		if (os.readdir("pfs0:/").includes("OSDXMB")) { return "pfs0:/OSDXMB/"; }
		System.umount("pfs0:");
	}

	// Lastly, try MC directories.
	if (os.readdir("mc0:/")[0].includes("OSDXMB")) { return "mc0:/OSDXMB/"; }
	else if (os.readdir("mc1:/")[0].includes("OSDXMB")) { return "mc1:/OSDXMB/"; }

	throw new Error("System Assets not Found.");
	return "./";
}

globalThis.CWD = InitCWD();
globalThis.PATHS = {
	XMB: `${CWD}XMB/`,
	Plugins: `${CWD}PLG/`,
	Theme: `${CWD}THM/`,
	Config: `${CWD}CFG/`,
	VMC: `${CWD}VMC/`,
	Neutrino: `${CWD}APPS/neutrino/`
};

const jsList = [
	`sce`,		// Kernel Functions.
	`cdvd`,		// CDVD Functions.
	`xml`,		// XML Parser.
	`cfg`,		// Custom User Configurations.
    `system`,	// Main Constants and Generic Utilities.
    `date`,     // Date and Time Utilities.
	`audio`,	// Sound Handler.
	`pads`,		// Pad Action Manager.
	`bg`,		// Background Graphics.
	`wave`,		// Background Wave Object.
	`font`, 	// FONT Rendering System.
	`lang`,		// Language and Localization Strings.
	`ui`		// Main XMB User Interface Module.
];

jsList.forEach((js) => { std.loadScript(`${PATHS.XMB}js/${js}.js`); });

//////////////////////////////////////////////////////////////////////////
///*				   			Execute App							  *///
//////////////////////////////////////////////////////////////////////////

function main() {
    // Update Global Variables.
    getLocalTime();

	// Execute Handlers
	BgHandler();
	UIHandler();
	PadsHandler();

	// Threaded Operations
    ImageCache.Process();

	// Show Debug Information at bottom.
    PrintDebugInformation();
}

Screen.setParam(Screen.DEPTH_TEST_ENABLE, false);
if (gDebug) Screen.setFrameCounter(true);
Screen.setVSync(true);
Screen.display(main);

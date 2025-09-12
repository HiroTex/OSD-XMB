//////////////////////////////////////////////////////////////////////////
///*				   		Initialize Modules						  *///
//////////////////////////////////////////////////////////////////////////

os.sleep(2000); // Wait for modules to load.

function InitCWD() {

    // Try OS Current Working Directory.
    const oscwd = os.getcwd()[0];
    if (os.readdir(oscwd)[0].includes("XMB")) {
        return ((oscwd.endsWith('/')) ? oscwd : (oscwd + "/"));
    }

    const devices = System.devices();

    for (let i = 0; i < devices.length; i++) {
        const device = devices[i];
        switch (device.name) {
            case "mass":
                for (let j = 0; j < 10; j++) {
                    const root = `mass${j.toString()}:`;
                    const bdm = System.getBDMInfo(root);
                    if (!bdm) { break; }
                    const dir = os.readdir(root)[0];
                    if (dir.includes("XMB")) {
                        return root;
                    } else if (dir.includes("OSDXMB")) {
                        if (os.readdir(`${root}OSDXMB/`)[0].includes("XMB")) {
                            return `${root}OSDXMB/`;
                        }
                    }
                }
                break;
            case "mmce":
                for (let j = 0; j < 2; j++) {
                    const root = `mmce${j.toString()}:/`;
                    const dir = os.readdir(root)[0];
                    if (dir.includes("XMB")) {
                        return root;
                    } else if (dir.includes("OSDXMB")) {
                        if (os.readdir(`${root}OSDXMB/`)[0].includes("XMB")) {
                            return `${root}OSDXMB/`;
                        }
                    }
                }
                break;
            case "hdd":
                System.mount("pfs0:", "hdd0:__common");
                if (os.readdir("pfs0:/").includes("OSDXMB")) { return "pfs0:/OSDXMB/"; }
                System.umount("pfs0:");
                break;
        }
    }

	// Lastly, try MC directories as last resource.
    if (os.readdir("mc0:/")[0].includes("OSDXMB")) {
        if (os.readdir("mc0:/OSDXMB/")[0].includes("XMB")) {
            return "mc0:/OSDXMB/";
        }
    }
    else if (os.readdir("mc1:/")[0].includes("OSDXMB")) {
        if (os.readdir("mc1:/OSDXMB/")[0].includes("XMB")) {
            return "mc1:/OSDXMB/";
        }
    }

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
    Art: `${CWD}ART/`,
	Neutrino: `${CWD}APPS/neutrino/`
};

const jsList = [
	`sce`,		// Kernel Functions.
    `cdvd`,		// CDVD Functions.
    `lang`,		// Language and Localization Strings.
	`xml`,		// XML Parser.
	`cfg`,		// Custom User Configurations.
    `system`,	// Main Constants and Generic Utilities.
    `thread`,   // Threads Handler.
    `net`,      // Network Handler.
    `date`,     // Date and Time Utilities.
	`audio`,	// Sound Handler.
	`pads`,		// Pad Action Manager.
	`bg`,		// Background Graphics.
	`wave`,		// Background Wave Object.
	`font`, 	// FONT Rendering System.
	`ui`		// Main XMB User Interface Module.
];

jsList.forEach((js) => { std.loadScript(`${PATHS.XMB}js/${js}.js`); });

//////////////////////////////////////////////////////////////////////////
///*				   			Execute App							  *///
//////////////////////////////////////////////////////////////////////////

function main() {

    // Update Global Variables.
    getLocalTime();

    MainMutex.lock();

	// Display UI
	BgHandler();
    UIHandler();
    DbgHandler();

    // IOP Work
    PadsHandler();
    SoundHandler();

    MainMutex.unlock();

	// Threaded Operations
    ImageCache.Process();
    Tasks.Process();

    if (gExit.To) {
        NetDeinit();
        Screen.clear();
        Screen.flip();
        std.reload(gExit.To);
    }
}

Screen.setParam(Screen.DEPTH_TEST_ENABLE, false);
if (gDebug) Screen.setFrameCounter(true);
Screen.setVSync(true);
Screen.display(main);

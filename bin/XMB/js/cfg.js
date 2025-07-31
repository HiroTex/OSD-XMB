//////////////////////////////////////////////////////////////////////////
///*				   			  CONFIG							  *///
/// 				   		  										   ///
///			This will handle configurations to '.cfg' files to 		   ///
///			    customize settings and user preferences.			   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

/* Handles main User Settings */

const UserConfig = {
    HDD: System.devices().some(dev => dev.name === "hdd"),
	Theme: "Original",
	Language: GetOsdConfig("Language") - 1,
	ConfirmBtn: 0,
	Aspect: 0,
	BgColor: 0,
	DisplayBg: false,
	CustomBgImg: false,
	Waves: true,
	DateFormat: 0,
	HourFormat: 0,
	Timezone: 0,
	ParentalSet: 0,
	ParentalCode: [0, 0, 0, 0]
};

const NeutrinoConfig = {
	DBC: false,
	PS2LOGO: true,
	GSM: false
};

function GetNeutrinoArgs(GAMEID = false) {
	const Args = [];

	if (NeutrinoConfig.DBC) 	{ Args.push("-dbc"); }
	if (NeutrinoConfig.PS2LOGO) { Args.push("-logo"); }
	if (NeutrinoConfig.GSM) 	{ Args.push("-gsm=fp"); }

	if (!GAMEID) { return Args; }

	const GameCFG = CfgMan.Get(`${GAMEID}.cfg`);

	if ('gc' 	in GameCFG) { Args.push(`-gc=${GameCFG["gc"]}`); }
	if ('VMC0' 	in GameCFG) { Args.push(`-mc0=${PATHS.VMC}${GameCFG["VMC0"]}_0.vmc`); }
	if ('VMC1' 	in GameCFG) { Args.push(`-mc1=${PATHS.VMC}${GameCFG["VMC0"]}_1.vmc`); }

	return Args;
}

function GetCfgUserSetting(setting) {
	const config = CfgMan.Get("main.cfg");
	if (setting in config) { return config[setting]; }
	return false;
}

function ReadUserSettings() {

    const neut = CfgMan.Get("neutrino.cfg");
    if ('logo' in neut) { NeutrinoConfig.PS2LOGO = (neut["logo"] === "true"); }
    if ('dbc' in neut) { NeutrinoConfig.DBC = (neut["dbc"] === "true"); }
    if ('gsm' in neut) { NeutrinoConfig.GSM = (neut["gsm"] === "true"); }

	const config = CfgMan.Get("main.cfg");
	if (config.length < 1) { return; }

	if ('lang'		 in config) { UserConfig.Language 	  = parseInt(config["lang"]); 		}
	if ('btnType'	 in config) { UserConfig.ConfirmBtn   = parseInt(config["btnType"]); 	}
	if ('dateFormat' in config) { UserConfig.DateFormat   = parseInt(config["dateFormat"]); }
	if ('hourFormat' in config) { UserConfig.HourFormat   = parseInt(config["hourFormat"]); }
	if ('timezone'	 in config) { UserConfig.Timezone	  = parseInt(config["timezone"]); 	}
	if ('parental'	 in config) { UserConfig.ParentalSet  = parseInt(config["parental"]); 	}
	if ('prntcode'	 in config) { UserConfig.ParentalCode = JSON.parse(config["prntcode"]); }
	if ('BgColor'	 in config) { UserConfig.BgColor	  = parseInt(config["BgColor"]); 	}
	if ('waves'		 in config) { UserConfig.Waves		  = (config["waves"] === "true"); 	}
	if ('Theme'		 in config) { UserConfig.Theme		  = config["Theme"];				}

	if (!os.readdir(PATHS.Theme)[0].includes(UserConfig.Theme)) { UserConfig.Theme = "Original"; }

}

function ReadCFG(fullPath) {
	// Read each line for config.
	let config = {};
	let errObj = {};
	let file = false;

	try {
		file = std.open(fullPath, "r", errObj);
		if (!file) { throw new Error(`IO ERROR: ${std.strerror(errObj.errno)}`); }
		while (!file.eof()) {
			let line = file.getline();
			if (line && line.includes('=')) { // Ensure the line is not empty and contains an '='
				line = line.trim(); // Read and trim whitespace
				const [key, value] = line.split('='); // Split into key and value
				config[key.trim()] = value.trim(); // Trim and store in the config object
			}
		}
	} catch (e) {
		xlog(e);
	} finally {
		if (file) { file.close(); }
	}

	return config;
}

//////////////////////////////////////////////////////////////////////////
///*				   			  CfgMan							  *///
//////////////////////////////////////////////////////////////////////////

/*	Info:

    This is the main Configuration Object to
    handle get/set/push/processing configurations.

    Get:		Get a Configuration Item from a file path or memory
                if it has been already pushed.

    Set:		Write a Configuration Item directly to a file.
                This should not be used directly and it is better to
                let the Process function do it when exiting the app.

    Push:		Push a Configuration Item to a queue that will be
                executed when the app is exiting.

    Process:	Processes all queued configuration items before
                exiting the app.

*/

const CfgMan = {

    configPath: `${CWD}CFG/`,
    queue: [],

    Get: function(path) {
        // Check if an item with the same path already exists in the queue list
        const existingItem = this.queue.find(item => item.path === path);

        if (existingItem) { return existingItem.config; }

        const fullPath = `${this.configPath}${path}`;

        const hasfile = std.exists(fullPath);
        if (!hasfile) { return {}; } // Return Empty Table if not found
		return ReadCFG(fullPath);
    },

    Set: function(path, config) {
        path = `${this.configPath}${path}`;
        const lines = []; // Create an array to store each line

        // Iterate through the table and write each key-value pair
        for (const key in config) {
            const line = `${key.toString()}=${config[key].toString()}`; // Format as KEY=VALUE
            lines.push(line);
        }

        ftxtWrite(path, lines.join('\n')); // Write the lines to the file
    },

    Push: function (path, newConfig) {
        // Check if an item with the same path already exists
        const existingItem = this.queue.find(item => item.path === path);

        // Update the config of the existing item by merging
        if (existingItem) {
            // Merge existing config with the newConfig
            existingItem.config = {
                ...existingItem.config, // Retain existing keys and values
                ...newConfig // Overwrite or add new keys from newConfig
            };
        }
        else {
            // Add a new item to the queue
            this.queue.push({ path, config: newConfig });
        }
    },

    Process: function() {
        while (this.queue.length > 0) {
            const { path, config } = this.queue.shift(); // Remove and get the first item in the queue
            this.Set(path, config); // Call the Set function for processing
        }
    },
};

//////////////////////////////////////////////////////////////////////////
///*				   			 Init Work							  *///
//////////////////////////////////////////////////////////////////////////

ReadUserSettings();
if ((UserConfig.Language < 0) || (UserConfig.Language > 6)) { UserConfig.Language = 0; }
console.log("INIT LIB: CFG COMPLETE");

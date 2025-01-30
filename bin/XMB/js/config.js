//////////////////////////////////////////////////////////////////////////
///*				   			  CONFIG							  *///
/// 				   		  										   ///
///			This will handle configurations to '.cfg' files to 		   ///
///			    customize settings and user preferences.			   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

/*	Info:

	This is the main Configuration Object to
	handle getting, setting, pushing or Processing
	configurations.

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

DATA.CONFIG = {

	configPath: `${System.boot_path}/CFG/`,
	queue: [],

	Get: function(path)
	{
		// Check if an item with the same path already exists in the queue list
		const existingItem = this.queue.find(item => item.path === path);

		if (existingItem) { return existingItem.config; }

		path = `${this.configPath}${path}`;

		const hasfile = std.exists(path);
		if (!hasfile) { return {}; } // Return Empty Table if not found

		// Read each line for config.
		let config = {};

		const file = std.open(path, "r");

		while (!file.eof()) {
			let line = file.getline();
			if (line && line.includes('=')) { // Ensure the line is not empty and contains an '='
				line = line.trim(); // Read and trim whitespace
				const [key, value] = line.split('='); // Split into key and value
				config[key.trim()] = value.trim(); // Trim and store in the config object
			}
		}

		file.close();

		return config;
	},

	Set: function(path, config)
	{
		path = `${this.configPath}${path}`;
		const file = std.open(path, "w");

        if (file)
        {
		    // Iterate through the table and write each key-value pair
		    for (const key in config) {
			    const line = `${key.toString()}=${config[key].toString()}\n`; // Format as KEY=VALUE
			    file.puts(line); // Write to file
		    }
		    file.flush();
		    file.close();
        }
	},

	Push: function (path, newConfig)
	{
		// Check if an item with the same path already exists
		const existingItem = this.queue.find(item => item.path === path);

		// Update the config of the existing item by merging
		if (existingItem)
		{
			// Merge existing config with the newConfig
			existingItem.config =
			{
				...existingItem.config, // Retain existing keys and values
				...newConfig // Overwrite or add new keys from newConfig
			};
		}
		else
		{
			// Add a new item to the queue
			this.queue.push({ path, config: newConfig });
		}
	},

	Process: function()
	{
		while (this.queue.length > 0)
		{
			console.log(`Processing Queue Item: ${this.queue.length}`);
			const { path, config } = this.queue.shift(); // Remove and get the first item in the queue
			this.Set(path, config); // Call the Set function for processing
		}
	},

    SetConfigPath: function(path)
    {
        this.configPath = path;
    },
};

if (`${System.boot_path}/`.endsWith("//"))
{
	DATA.CONFIG.SetConfigPath(`${System.boot_path}CFG/`);
}

// Get the main Configuration File of the App and Parse its configuration if it has them.

function ParseMainCFG()
{
    const mainCFG = DATA.CONFIG.Get("main.cfg");

    // Get the user's preferred Video Mode.
    if ("vmode" in mainCFG)
    {
	    if (DATA.CANVAS.mode != vmodes[Number(mainCFG["vmode"])].Value)
	    {
		    DATA.CANVAS.mode = vmodes[Number(mainCFG["vmode"])].Value;
		    Screen.setMode(DATA.CANVAS);
		    DATA.SCREEN_PREVMODE = DATA.CANVAS.mode;
	    }
    }

    // Get the user's preferred Aspect Ratio.
    if ("aspect" in mainCFG)
    {
	    DATA.WIDESCREEN = (mainCFG["aspect"].toLowerCase() === "true");

	    if (DATA.WIDESCREEN)
	    {
		    DATA.CANVAS.width = 736;
		    Screen.setMode(DATA.CANVAS);
	    }
    }

    // Get the user's preferred Parental Settings.
    if ("parental" in mainCFG) { DATA.PARENTAL = (mainCFG["parental"].toLowerCase() === "true"); }
    if ("prntcode" in mainCFG) { DATA.PRNTCODE = JSON.parse(mainCFG["prntcode"]); }

    // Get the user's preferred System Settings.
    if ("lang" in mainCFG) { DATA.LANGUAGE = Number(mainCFG["lang"]); BOOT_WARNING_TEXT = TextRender.ProcessText(BOOT_WARNING_ARRAY[DATA.LANGUAGE]); }
    if ("btnType" in mainCFG) { DATA.BTNTYPE = Number(mainCFG["btnType"]); }

    // Get the user's preferred Date and Hour Formats.
    if ("dateFormat" in mainCFG) { DATA.DATE_FORMAT = Number(mainCFG["dateFormat"]); }
    if ("hourFormat" in mainCFG) { DATA.HOUR_FORMAT = Number(mainCFG["hourFormat"]); }

    // Get the user's preferred Theme.
    if ("Theme" in mainCFG) { DATA.THEME_PATH = `THM/${mainCFG["Theme"]}/`; }

    // Parse the user preferred background color.

    if ("BgColor" in mainCFG)
    {
	    // If set to 0, use dynamic month based background color.
	    // Else, use the custom background color.

	    DATA.BGVAL = Number(mainCFG["BgColor"]);
	    DATA.BGTMP = DATA.BGVAL;
	    DATA.BGCOL = (DATA.BGVAL == 0) ? DATA.BGCOL : DATA.BGVAL;
        DATA.BGSWITCH = true;
    }

    // Parse the main Configuration file to set the display of background waves.

    if ("waves" in mainCFG) { DATA.BGWAVES = (mainCFG["waves"].toLowerCase() === "true"); }

    // Set the Background Image if any

    if ("customBg" in mainCFG) {
        DATA.CUSTOMBG_PATH = mainCFG["customBg"];
        DATA.BGIMG = new Image(DATA.CUSTOMBG_PATH);
    }

    if ("displayBg" in mainCFG) {
        DATA.DISPLAYBG = (mainCFG["displayBg"] === "true");
    }
}

console.log("INIT: CONFIG INIT COMPLETE");

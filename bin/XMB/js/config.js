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

    configPath: `${os.getcwd()[0]}/CFG/`,
    queue: [],

    Get: function(path)
    {
        // Check if an item with the same path already exists in the queue list
        const existingItem = this.queue.find(item => item.path === path);

        if (existingItem) { return existingItem.config; }

        const fullPath = `${this.configPath}${path}`;
        const pathParts = fullPath.split('/');
        const filename = pathParts.pop();
        const directory = pathParts.join('/');

        const hasfile = os.readdir(directory)[0].includes(filename);
        if (!hasfile) { return {}; } // Return Empty Table if not found

        // Read each line for config.
        let config = {};
        let errObj = {};
        const file = std.open(fullPath, "r", errObj);

        if (file)
        {
            while (!file.eof())
            {
                let line = file.getline();
                if (line && line.includes('='))
                { // Ensure the line is not empty and contains an '='
                    line = line.trim(); // Read and trim whitespace
                    const [key, value] = line.split('='); // Split into key and value
                    config[key.trim()] = value.trim(); // Trim and store in the config object
                }
            }

            file.close();
        }
        else
        {
            console.log(`IO ERROR: ${std.strerror(errObj.errno)}`);
        }

        return config;
    },

    Set: function(path, config)
    {
        console.log("Saving File: " + path);
        path = `${this.configPath}${path}`;
        const lines = []; // Create an array to store each line

        // Iterate through the table and write each key-value pair
        for (const key in config)
        {
            const line = `${key.toString()}=${config[key].toString()}`; // Format as KEY=VALUE
            lines.push(line);
        }

        ftxtWrite(path, lines.join('\n')); // Write the lines to the file
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
            const { path, config } = this.queue.shift(); // Remove and get the first item in the queue
            this.Set(path, config); // Call the Set function for processing
        }
    },

    SetConfigPath: function(path)
    {
        this.configPath = path;
    },
};

if (`${os.getcwd()[0]}/`.endsWith("//"))
{
    DATA.CONFIG.SetConfigPath(`${os.getcwd()[0]}CFG/`);
}

// Get the main Configuration File of the App and Parse its configuration if it has them.

function ParseMainCFG()
{
    const mainCFG = DATA.CONFIG.Get("main.cfg");

    // If the main Configuration file does not exist, return.

    if (mainCFG.length < 1) { return; }

    // Get the user's preferred Video Mode.
    if ("vmode" in mainCFG)
    {
        if (DATA.CANVAS.mode != vmodes[Number(mainCFG["vmode"])].Value)
        {
            DATA.CANVAS.mode = vmodes[Number(mainCFG["vmode"])].Value;
            setScreenHeight();
            setScreenWidth();
            setScreeniMode();
            Screen.setMode(DATA.CANVAS);
            TextRender.SetScreenDimensions();
        }
    }

    // Get the user's preferred Aspect Ratio.
    if ("aspect" in mainCFG)
    {
        DATA.WIDESCREEN = (mainCFG["aspect"].toLowerCase() === "true");
        setScreenWidth();
        Screen.setMode(DATA.CANVAS);
        TextRender.SetScreenDimensions();
    }

    // Get the user's preferred Parental Settings.
    if ("parental" in mainCFG) { DATA.PARENTAL = (mainCFG["parental"].toLowerCase() === "true"); }
    if ("prntcode" in mainCFG) { DATA.PRNTCODE = JSON.parse(mainCFG["prntcode"]); }

    // Get the user's preferred System Settings.
    if ("lang" in mainCFG) { DATA.LANGUAGE = Number(mainCFG["lang"]); }
    if ("btnType" in mainCFG) { DATA.BTNTYPE = Number(mainCFG["btnType"]); }

    // Get the user's preferred Date and Hour Formats.
    if ("dateFormat" in mainCFG) { DATA.DATE_FORMAT = Number(mainCFG["dateFormat"]); }
    if ("hourFormat" in mainCFG) { DATA.HOUR_FORMAT = Number(mainCFG["hourFormat"]); }
    if ("timezone" in mainCFG) { DATA.TIME_ZONE = Number(mainCFG["timezone"]); }
    if ("timezoneVal" in mainCFG) { DATA.TIMEZONEVAL = Number(mainCFG["timezoneVal"]); }

    // Set the user preferred Background Color.

    if ("BgColor" in mainCFG)
    {
        // If set to 0, use dynamic month based background color.
        // Else, use the custom background color.

        DATA.BGVAL = Number(mainCFG["BgColor"]);
        DATA.BGTMP = DATA.BGVAL;
        DATA.BGCOL = (DATA.BGVAL == 0) ? DATA.BGCOL : DATA.BGVAL;
        currentBgColor = monthColors[DATA.BGCOL];
        Waves.setThemeColor(currentBgColor);
        themeColor = Color.new(currentBgColor.r, currentBgColor.g, currentBgColor.b, currentBgColor.a);
    }

    // Set Background Waves

    if ("waves" in mainCFG) { DATA.BGWAVES = (mainCFG["waves"].toLowerCase() === "true"); }

    // Set Background Image settings.

    if ("customBg" in mainCFG) {
        DATA.CUSTOMBG_PATH = mainCFG["customBg"];
        if (std.exists(DATA.CUSTOMBG_PATH)) {
            DATA.BGIMG = new Image(DATA.CUSTOMBG_PATH);
            DATA.BGIMG.optimize();
            DATA.BGIMG.filter = LINEAR;
        }
    }

    if ("displayBg" in mainCFG) { DATA.DISPLAYBG = (mainCFG["displayBg"] === "true"); }

    // Init Network

    if (("net" in mainCFG) && (mainCFG["net"].toLowerCase() === "true")) { NetInit(); }

    // Get the user's preferred Theme and execute the Theme's code if any.
    if ("Theme" in mainCFG)
    {
        DATA.THEME_PATH = `THM/${mainCFG["Theme"]}/`;
        if (os.readdir(DATA.THEME_PATH)[0].includes("thm.js"))
        {
            std.loadScript(`${DATA.THEME_PATH}thm.js`);
        }

        if (mainCFG["Theme"] !== "Original") { DATA.OVALPHA = 0; }
    }

    const neutconfig = DATA.CONFIG.Get("neutrino.cfg");

    if ("logo" in neutconfig) { DATA.GAMESETS.LOGO = (neutconfig["logo"] === "true"); }
    if ("dbc" in neutconfig) { DATA.GAMESETS.DBC = (neutconfig["dbc"] === "true"); }
    if ("gsm" in neutconfig) { DATA.GAMESETS.GSM = (neutconfig["gsm"] === "true"); }
}

console.log("INIT: CONFIG INIT COMPLETE");

//////////////////////////////////////////////////////////////////////////
///*				   			   INIT    							  *///
/// 				   		  										   ///
///		This is the bootable script, which will initialize all the	   ///
///		necessary sub systems and later launch the User Interface.	   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

std.loadScript("./XMB/js/system.js"); 		// Main DATA Object and Generic Functions.
std.loadScript("./XMB/js/config.js");		// Manage configuration files (.cfg).
std.loadScript("./XMB/js/sound.js");		// Manage Audio playing.
std.loadScript("./XMB/js/pads.js");			// Manage Events executed using Joystick's buttons.
std.loadScript("./XMB/js/text.js");			// Manage all kind of Text related stuff.
std.loadScript("./XMB/js/net.js"); 		    // Manage network system.
std.loadScript("./XMB/js/bg.js");			// Manage Background and Overlay Screens.
std.loadScript("./XMB/js/dashboard.js");	// Manages the Dashboard Graphic logic.
std.loadScript("./XMB/js/handlers.js");		// Main Handler functions.

ParseMainCFG();

console.log("INIT: ALL FINISHED");

//////////////////////////////////////////////////////////////////////////
///*				   		  PLUGIN SYSTEM							  *///
/// 				   		  										   ///
///		The plugin system loads external js scripts to add them to	   ///
///		the main dashboard as Items. This has to be on the main 	   ///
///		bootable script because of the "import(path)" instruction. 	   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

let plgCount = 0; // Processed Plugins.
const pluginFiles = System.listDir("/PLG/")
    .map(file => file.name)
    .filter(str => str.endsWith(".js") || str.endsWith(".json") || str.endsWith(".xml"))
    .sort((a, b) => a.localeCompare(b));

/*  Info:

    Check if Plugin has valid data to parse
    plg has to be an object that has the following properties:
        - Name: string or string array. Displays the Name of the Item.
        - Description: string or string array. Displays the Description of the Item.
        - Icon: number. Displays a pre-loaded generic Icon image for the Item.
        - Category: number. Sets in which category the Item will be placed.
        - Type: string. Purpose of the plugin.

    Types of Items are:
        - ELF: Will launch an ELF file on the "Value.Path" Object with arguments on "Value.Args".
        - CODE: Will execute whatever code is on "Value()" as a function;
        - SUBMENU: Will launch a Sub Menu with Items on "Value" object.
*/

function validatePlugin(plg)
{
  return (
    (("Name" in plg) && (typeof plg.Name === "string") || (Array.isArray(plg.Name))) &&
    (("Description" in plg) && (typeof plg.Description === "string") || (Array.isArray(plg.Description))) &&
    (("Icon" in plg) && (typeof plg.Icon === "number")) &&
    (("Category" in plg) && (typeof plg.Category === "number")) &&
    (("Type" in plg) && (["ELF", "CODE", "SUBMENU"].includes(plg.Type)))
  );
}

function AddNewPlugin(Plugin)
{
    if (!validatePlugin(Plugin)) { console.log("Invalid Plugin"); return false; }

    // Resolve {cwd} placeholder dynamically
    if (Plugin.Type === "ELF") { Plugin.Value.Path = Plugin.Value.Path.replace("{cwd}", os.getcwd()[0]); }

    if ("CustomIcon" in Plugin)
    {
        Plugin.CustomIcon = new Image(Plugin.CustomIcon.replace("{cwd}", os.getcwd()[0]), RAM, async_list);
    }

    const item = DASH_CAT[Plugin.Category].ItemCount;
    DASH_CAT[Plugin.Category].Options[item] = Plugin;
    DASH_CAT[Plugin.Category].ItemCount++;
    return true;
}

function loadXmlPlugin(pluginFile)
{
    const plg = std.loadFile(`./PLG/${pluginFile}`);
    if (plg)
    {
        const Plugin = parseXmlPlugin(plg);
        if (AddNewPlugin(Plugin)) { logl(`Loaded Plugin: ${pluginFile}`); }
    }
}

function loadJsonPlugin(pluginFile)
{
    const plg = std.loadFile(`./PLG/${pluginFile}`);

    if (plg)
    {
        const Plugin = JSON.parse(plg);
        if (AddNewPlugin(Plugin)) { logl(`Loaded Plugin: ${pluginFile}`); }
    }
}

function loadJsPlugin(pluginFile)
{
    import(`./PLG/${pluginFile}`).then((plg) =>
    {
        if (plg)
        {
            const { Plugin } = plg;
            if (AddNewPlugin(Plugin)) { logl(`Loaded Plugin: ${pluginFile}`); }
        }
    }).catch((error) =>
    {
        console.log(`Failed to load module: ${pluginFile}, error = ${error}`);
    });
}

/*	Info:

    Main Plugin Initialization Logic.
    Besides the previous properties necessary for a Plugin, it can have
    the following optional properties:
        - Option: A Context Menu Object that can be opened using the "Options" button prompt (Triangle).
        - CustomIcon: A Custom Image loaded to display instead of the Generic Icon.
        - Safe: boolean to indicate if a plugin should not ask for Parental Control Code. Default is False if ommited.

    After Initializing all plugins, it will start to load all threaded images on queue.
*/

function InitializePluginTable()
{
    if (plgCount < pluginFiles.length)
    {
        const pluginFile = pluginFiles[plgCount];
        logl(`Parsing Plugin: ${pluginFile}`);

        switch (getFileExtension(pluginFile))
        {
            case "xml": loadXmlPlugin(pluginFile); break;
            case "json": loadJsonPlugin(pluginFile); break;
            case "js": loadJsPlugin(pluginFile); break;
        }

        plgCount++;
    }
    else
    {
        // After processing all Plugins, load all queued images.
        if (!processingAsyncList)
        {
            async_list.process();
            processingAsyncList = true;
        }

        return;
    }
}

//////////////////////////////////////////////////////////////////////////
///*				   		  	   BOOT								  *///
/// 				   		  										   ///
///		The Main Boot Animation, where it will initialize the main	   ///
///			Dashboard Items, and load all plugins and icons.		   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

/*  Info:

    This function will set the LINEAR
    filter for all the loaded dashboard images
    and optimize them.

*/

function InitializeIconTable()
{
    if ((loaded_icons < dash_icons.length) && (dash_icons[loaded_icons].ready()))
    {
        dash_icons[loaded_icons].optimize();
        dash_icons[loaded_icons].filter = LINEAR;
        loaded_icons++;
    }
}

/*  Info:

    Initializes the Main Dashboard and
    queues all the dashboard icons and
    color icons.

*/

function InitDashboard()
{
    for (let i = 0; i < 7; i++)
    {
        const ITEM = i;
        DASH_CAT[ITEM] = {
            Icon: i,
            Name: CAT_NAMES[i],
            Options: {}, // Create a nested table for options
            ItemCount: 0, // Total Options in Table
            Default: 0 // Selected Item Memory
        };
    }

    let baseDir = `${os.getcwd()[0]}/`;
    if (baseDir.endsWith("//")) { baseDir = baseDir.substring(0, baseDir.length - 1); }
    const dirFiles = os.readdir(`${baseDir}${DATA.THEME_PATH}icons/`)[0];

    for (let i = 0; i < dash_icons_names.length; i++)
    {
        const imgPath = (dirFiles.includes(dash_icons_names[i])) ? `${DATA.THEME_PATH}icons/${ dash_icons_names[i]}` : `./THM/Original/icons/${dash_icons_names[i]}`;
        const tmpImage = new Image(imgPath, RAM, async_list);
        dash_icons.push(tmpImage);
    }

    for (let i = 1; i < 14; i++)
    {
        const colr_icon = new Image(`./XMB/color/ico${i.toString()}.png`, RAM, async_list);
        colr_icons.push(colr_icon);
    }

    LoadFONT();
}

/*	Info:

    Boot Animation.

    This will handle the initial boot animation and assets loading.
*/

function boot()
{
    InitializeIconTable();		// Set Image Filters and optimizations to Dashboard images once loaded.
    InitializePluginTable();	// Initialize Plugins.

    switch(DATA.BOOT_STATE)
    {
        case 0: // BLACK SCREEN
            DATA.OVCOL = Color.new(0, 0, 0, 128);
            DATA.FADE_FRAME = 0;
            DATA.BOOT_STATE++;
            break;
        case 1: // FADE IN BACKGROUND
            DATA.OVCOL = Color.new(0, 0, 0,  128 - DATA.FADE_FRAME);
            DATA.BOOT_STATE = (DATA.FADE_FRAME > 63) ? (DATA.BOOT_STATE + 1) : DATA.BOOT_STATE;
            if (DATA.FADE_FRAME === 12)
            {
                Sound.play(AudioPlaying, 0);
                Sound.repeat(false, 0);
                Sound.setVolume(100);
            }
            break;
        case 2: // FADE IN BG + LOGO
            DATA.OVCOL = Color.new(0, 0, 0,  128 - DATA.FADE_FRAME);
            DATA.BOOT_STATE = (DATA.FADE_FRAME > 127) ? (DATA.BOOT_STATE + 1) : DATA.BOOT_STATE;
            drawBootLogo((DATA.FADE_FRAME - 64));
            break;
        case 3: // FADE IN LOGO
            drawBootLogo(64 + (DATA.FADE_FRAME - 128));
            if (DATA.FADE_FRAME > 191) { DATA.FADE_FRAME = 0;  DATA.BOOT_STATE++; }
            break;
        case 4: // FADE OUT LOGO
            let logo_a = (DATA.FADE_FRAME > 195) ? (128 - (DATA.FADE_FRAME - 196)) : 128;
            logo_a = (logo_a < 0) ? 0 : logo_a;
            drawBootLogo(logo_a);
            if (DATA.FADE_FRAME > 380) { DATA.FADE_FRAME = 0;  DATA.BOOT_STATE++; }
            break;
        case 5: // FADE IN WARNING TEXT
            let fadeInAlphaA = (DATA.FADE_FRAME > 63) ? 64 : DATA.FADE_FRAME;
            let fadeInColorA = Color.new(0, 0, 0, fadeInAlphaA);
            Draw.rect(0, 0, DATA.CANVAS.width, DATA.CANVAS.height, fadeInColorA);
            DisplayBootWarningText(DATA.FADE_FRAME);
            DATA.BOOT_STATE = (DATA.FADE_FRAME > 127) ? (DATA.BOOT_STATE + 1) : DATA.BOOT_STATE;
            break;
        case 6: // DISPLAY WARNING TEXT
            Draw.rect(0, 0, DATA.CANVAS.width, DATA.CANVAS.height, Color.new(0, 0, 0, 64));
            DisplayBootWarningText(128);
            if ((DATA.FADE_FRAME > 256))
            { DATA.FADE_FRAME = 0; DATA.BOOT_STATE++; }
            break;
        case 7: // FADE OUT WARNING TEXT
            let fadeInAlphaB = (DATA.FADE_FRAME > 63) ? 64 : DATA.FADE_FRAME;
            let fadeInColorC = Color.new(0, 0, 0, 64 - fadeInAlphaB);
            Draw.rect(0, 0, DATA.CANVAS.width, DATA.CANVAS.height, fadeInColorC);
            DisplayBootWarningText(128 - (DATA.FADE_FRAME * 2));
            if (DATA.FADE_FRAME > 63) { DATA.FADE_FRAME = 0;  DATA.BOOT_STATE++; DATA.DASH_MOVE_FRAME = 0; }
            break;
        case 8: // FADE IN INTERFACE
            const OV_A = (DATA.OVALPHA > 0) ? DATA.DASH_MOVE_FRAME : 0;
            DATA.OVCOL = Color.new(Color.getR(themeColor), Color.getG(themeColor), Color.getB(themeColor), OV_A);
            drawDate(-128 + (DATA.FADE_FRAME * 4), -146 + (DATA.FADE_FRAME * 4), -146 + (DATA.FADE_FRAME * 4));

            if (DATA.DASH_MOVE_FRAME < 21)
            {
                DrawInterfaceFade(DATA.DASH_MOVE_FRAME);
                DATA.DASH_MOVE_FRAME++;
            }
            else
            {
                DrawSelectedCat(DATA.DASH_CURCAT);
                DrawUnselectedCats();
                DrawSelectedItem(DATA.DASH_CURCAT, DATA.DASH_CUROPT);
                DrawUnselectedItems(DATA.DASH_CURCAT, DATA.DASH_CUROPT);
            }

            if (DATA.FADE_FRAME > 36) { DATA.FADE_FRAME = 0;  DATA.BOOT_STATE++; }
            break;
        case 9: // BOOT FINISHED
            drawDate();
            DrawSelectedItem(DATA.DASH_CURCAT, DATA.DASH_CUROPT);
            DrawUnselectedItems(DATA.DASH_CURCAT, DATA.DASH_CUROPT);
            DrawSelectedCat(DATA.DASH_CURCAT);
            DrawUnselectedCats();
            Sound.setVolume(100);
            DATA.CURRENT_STATE = 1;
            DATA.OVSTATE = "IDLE";
            break;
    }

    DATA.FADE_FRAME += 2;
}

/* Main Loop Code */

function main()
{
    padHandler();   // Updates Pads and triggers events.
    drawBg();       // Handles all Background elements.

    // Handle the current state of the app.
    // State numbers are completely arbitrary and do not mean anything.

    switch(DATA.CURRENT_STATE)
    {
        case 0: // Boot
            boot();
            break;
        case 1: // Main Dashboard Navigation
            ProcessDiscTray();
            dashboard();
            break;
        case 8: // Fade Out and Exit to Elf or Code
            exit();
            break;
        case 9: // Launch ELF
            launch();
        case 99: // execute custom code
            custom();
            break;
    }

    PrintDebugInfo(); 		// Prints FPS and current RAM usage at the bottom of the screen.
    SoundStopProcess(); 	// If not present, after sound finishes playing the app freezes.
    processThreadCopy();	// This will process a thread Copy operation if it has been queued.

    drawOv(); 				// Handles all Overlay elements like Message Screens.
}

InitDashboard();
Screen.display(main);

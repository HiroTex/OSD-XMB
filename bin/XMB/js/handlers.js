//////////////////////////////////////////////////////////////////////////
///*				   		INTERFACE HANDLERS						  *///
/// 				   		  										   ///
///		  Here are the main loop handlers for the different states	   ///
///							of the interface.						   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

/*
    This is the main loop function that will
    draw everything on screen
*/

function dashboard()
{
    switch(DATA.DASH_STATE)
    {
        case "IDLE":
            if (DATA.DASH_PADMODE != 1) { SetDashPadEvents(1); }
            DrawSelectedItem();
            DrawUnselectedItems();
            DrawSelectedCat();
            DrawUnselectedCats();
            DrawOptionBox();
            CheckParental();
            break;
        case "MOVE_BACK":
            DrawMovingCats(1);
            DrawMovingOptsLR(1);
            DASH_UPDATE_FRAME("IDLE");
            break;
        case "MOVE_FORWARD":
            DrawMovingCats(-1);
            DrawMovingOptsLR(-1);
            DASH_UPDATE_FRAME("IDLE");
            break;
        case "MOVE_DOWN":
            DrawMovingOptsUD(-1)
            DrawSelectedCat();
            DrawUnselectedCats();
            DASH_UPDATE_FRAME("IDLE");
            break;
        case "MOVE_UP":
            DrawMovingOptsUD(1)
            DrawSelectedCat();
            DrawUnselectedCats();
            DASH_UPDATE_FRAME("IDLE");
            break;
        case "FADE_OUT":
            if (DATA.DASH_CURSUB > -1)
            {
                DrawSubMenuContentFade(2);
            }
            else
            {
                DrawInterfaceFade(DATA.DASH_MOVE_FRAME, -1);
            }

            DASH_UPDATE_FRAME("NULL");

            if (DATA.DASH_MOVE_FRAME == 20)
            {
                DATA.EXIT_STATE = 0;
                DATA.CURRENT_STATE = 8;
                DATA.FADE_FRAME = 0;
            }

            break;
        case "FADE_IN":
            let NEXT_STATE_IN = "IDLE";
            if (DATA.DASH_CURSUB > -1)
            {
                NEXT_STATE_IN = (DATA.DASH_CURSUB > 0) ? "NEW_SUBMENU_IDLE" : "SUBMENU_IDLE";
                DrawSubMenuContentFade(1);
            }
            else
            {
                DrawInterfaceFade(DATA.DASH_MOVE_FRAME);
            }

            DASH_UPDATE_FRAME(NEXT_STATE_IN);
            break;
        case "IDLE_MESSAGE_FADE_IN":
            if (DATA.DASH_PADMODE != 0) { SetDashPadEvents(0); }
            let NEXT_IDLE_MESSAGE_STATE = "IDLE_MESSAGE";
            if (DATA.DASH_CURSUB > -1)
            {
                NEXT_IDLE_MESSAGE_STATE = "SUBMENU_MESSAGE_IDLE";
                DrawSubMenuContent(false, !DATA.MESSAGE_INFO.BG);
                DrawSubMenuOptions(false, !DATA.MESSAGE_INFO.BG);
            }
            else if (!DATA.MESSAGE_INFO.BG)
            {
                if (!("SKIP_INTRO" in DATA.MESSAGE_INFO) || (!DATA.MESSAGE_INFO.SKIP_INTRO))
                {
                    DrawInterfaceFade(DATA.DASH_MOVE_FRAME, -1);
                }
            }
            else
            {
                DrawSelectedItem();
                DrawUnselectedItems();
                DrawSelectedCat();
                DrawUnselectedCats();
            }

            DASH_UPDATE_FRAME(NEXT_IDLE_MESSAGE_STATE);
            break;
        case "IDLE_MESSAGE":
            if (DATA.DASH_MOVE_FRAME == 20)
            {
                DATA.DASH_MOVE_FRAME = 0;
            }

            if (DATA.MESSAGE_INFO.BG)
            {
                DrawSelectedItem();
                DrawUnselectedItems();
                DrawSelectedCat();
                DrawUnselectedCats();
            }

            if (DATA.DASH_PADMODE != 4) { SetDashPadEvents(4); }
            if (DATA.OVSTATE != "MESSAGE_IDLE") { DATA.OVSTATE = "MESSAGE_IDLE"; }
            break;
        case "IDLE_MESSAGE_FADE_OUT":
            if (DATA.DASH_PADMODE != 0) { SetDashPadEvents(0); }
            let NEXT_IDLE_MESSAGE_STATE_OUT = "IDLE";

            if (DATA.DASH_CURSUB > -1)
            {
                NEXT_IDLE_MESSAGE_STATE = "SUBMENU_IDLE";
                DrawSubMenuContent(!DATA.MESSAGE_INFO.BG, false);
                DrawSubMenuOptions(!DATA.MESSAGE_INFO.BG, false);
            }
            else if (!DATA.MESSAGE_INFO.BG)
            {
                DrawInterfaceFade(DATA.DASH_MOVE_FRAME, 1);
            }
            else
            {
                DrawSelectedItem();
                DrawUnselectedItems();
                DrawSelectedCat();
                DrawUnselectedCats();
            }

            DASH_UPDATE_FRAME(NEXT_IDLE_MESSAGE_STATE_OUT);
            break;
        case "MENU_CONTEXT_IN":
            DrawContextMenuAnimation(1);
            DASH_UPDATE_FRAME("MENU_CONTEXT");
            break;
        case "MENU_CONTEXT":
            if (DATA.DASH_PADMODE != 3) { SetDashPadEvents(3); }
            DATA.DASH_MOVE_FRAME = 0;
            DrawSelectedItem(DATA.DASH_CURCAT, DATA.DASH_CUROPT, 20, -10, -10, 0, -105, 20, 0, -105);
            DrawUnselectedItemsInsideSub(0, 0, -8, 8, -60, -128);
            DrawSelectedCat(DATA.DASH_CURCAT, 0, 0, 0, 0, -128);
            DrawUnselectedCats(-60, -8, 4);
            DrawContextMenu();
            DrawContextOptions();
            ExecutePreviewFunc();
            break;
        case "MENU_CONTEXT_OUT":
            DrawContextMenuAnimation(-1);
            DASH_UPDATE_FRAME("IDLE");
            if (DATA.DASH_MOVE_FRAME > 19)
            {
                delete DASH_CTX[DATA.DASH_CURCTXLVL];
                DATA.DASH_CURCTXLVL--;
                Timer.destroy(DATA.DASH_CTX_TIMER);
                DATA.DASH_CTX_TIMER = false;
            };
            break;
        case "SUBMENU_IN":
            if (DATA.DASH_PADMODE != 0) { SetDashPadEvents(0); }
            DrawInitialSubMenuFade(1);
            DASH_UPDATE_FRAME("SUBMENU_IDLE");
            break;
        case "SUBMENU_IDLE":
            if (DATA.DASH_PADMODE != 2) { SetDashPadEvents(2); }
            DrawSubMenuContent();
            DrawSubMenuOptions();
            DrawOptionBox();
            CheckParental();
            break;
        case "SUBMENU_MOVE_UP":
            DrawSubMenuContent();
            DrawSubMenuMovingOptionsUD(1);
            let NEXT_STATE_UP = (DATA.DASH_CURSUB > 0) ? "NEW_SUBMENU_IDLE" : "SUBMENU_IDLE";
            DASH_UPDATE_FRAME(NEXT_STATE_UP);
            break;
        case "SUBMENU_MOVE_DOWN":
            DrawSubMenuContent();
            DrawSubMenuMovingOptionsUD(-1);
            let NEXT_STATE_DOWN = (DATA.DASH_CURSUB > 0) ? "NEW_SUBMENU_IDLE" : "SUBMENU_IDLE";
            DASH_UPDATE_FRAME(NEXT_STATE_DOWN);
            break;
        case "SUBMENU_OUT":
            if (DATA.DASH_PADMODE != 0) { SetDashPadEvents(0); }
            DrawInitialSubMenuFade(-1);
            DASH_UPDATE_FRAME("IDLE");
            if (DATA.DASH_MOVE_FRAME > 19)
            {
                delete DASH_SUB[DATA.DASH_CURSUB];
                DATA.DASH_PRVSUB--;
                DATA.DASH_CURSUB--;
            };
            break;
        case "NEW_SUBMENU_IN":
            if (DATA.DASH_PADMODE != 0) { SetDashPadEvents(0); }
            DrawNewSubMenuFade(1);
            DASH_UPDATE_FRAME("NEW_SUBMENU_IDLE");
            break;
        case "NEW_SUBMENU_IDLE":
            if (DATA.DASH_PADMODE != 2) { SetDashPadEvents(2); }
            DrawSubMenuContent();
            DrawSubMenuOptions();
            DrawOptionBox();
            break;
        case "NEW_SUBMENU_OUT":
            if (DATA.DASH_PADMODE != 0) { SetDashPadEvents(0); }
            DrawNewSubMenuFade(-1);
            let NEXT_STATE_OUT = (DATA.DASH_CURSUB > 1) ? "NEW_SUBMENU_IDLE" : "SUBMENU_IDLE";
            DASH_UPDATE_FRAME(NEXT_STATE_OUT);
            if (DATA.DASH_MOVE_FRAME > 19)
            {
                delete DASH_SUB[DATA.DASH_CURSUB];
                DATA.DASH_CURSUBOPT = DASH_SUB[DATA.DASH_PRVSUB].Selected;
                DATA.DASH_PRVSUB--;
                DATA.DASH_CURSUB--;
            };
            break;
        case "SUBMENU_CONTEXT_IN":
            if (DATA.DASH_PADMODE != 0) { SetDashPadEvents(0); }
            DrawContextSubMenuAnimation(1);
            DASH_UPDATE_FRAME("SUBMENU_CONTEXT");
            break;
        case "SUBMENU_CONTEXT":
            if (DATA.DASH_PADMODE != 3) { SetDashPadEvents(3); }
            DATA.DASH_MOVE_FRAME = 0;
            DrawContextSubMenuContent();
            DrawContextMenu();
            DrawContextOptions();
            ExecutePreviewFunc();
            break;
        case "SUBMENU_CONTEXT_OUT":
            if (DATA.DASH_PADMODE != 0) { SetDashPadEvents(0); }
            DrawContextSubMenuAnimation(-1);
            let NEXT_STATE_CONTEXT_OUT = (DATA.DASH_CURSUB > 1) ? "NEW_SUBMENU_IDLE" : "SUBMENU_IDLE";
            DASH_UPDATE_FRAME(NEXT_STATE_CONTEXT_OUT);
            if (DATA.DASH_MOVE_FRAME > 19)
            {
                delete DASH_CTX[DATA.DASH_CURCTXLVL];
                DATA.DASH_CURCTXLVL--;
                Timer.destroy(DATA.DASH_CTX_TIMER);
                DATA.DASH_CTX_TIMER = false;
            };
            break;
        case "SUBMENU_CONTEXT_MESSAGE_FADE_OUT":
            if (DATA.DASH_PADMODE != 0) { SetDashPadEvents(0); }
            DrawContextSubMenuAnimation(-1, !DATA.MESSAGE_INFO.BG);
            DASH_UPDATE_FRAME("SUBMENU_MESSAGE_IDLE");
            if (DATA.DASH_MOVE_FRAME > 19)
            {
                delete DASH_CTX[DATA.DASH_CURCTXLVL];
                DATA.DASH_CURCTXLVL--;
                Timer.destroy(DATA.DASH_CTX_TIMER);
                DATA.DASH_CTX_TIMER = false;
            };
            break;
        case "SUBMENU_MESSAGE_IDLE":
            if (DATA.DASH_MOVE_FRAME == 20)
            {
                DATA.DASH_MOVE_FRAME = 0;
            }

            if (DATA.MESSAGE_INFO.BG)
            {
                DrawSubMenuContent();
                DrawSubMenuOptions();
            }

            if (DATA.DASH_PADMODE != 4) { SetDashPadEvents(4); }
            if (DATA.OVSTATE != "MESSAGE_IDLE") { DATA.OVSTATE = "MESSAGE_IDLE"; }
            break;
        case "SUBMENU_MESSAGE_FADE_IN":
            DrawSubMenuContent(!DATA.MESSAGE_INFO.BG);
            DrawSubMenuOptions(!DATA.MESSAGE_INFO.BG);
            if (DATA.DASH_PADMODE != 0) { SetDashPadEvents(0); }
            let NEXT_STATE_MESSAGE_IN = (DATA.DASH_CURSUB > 1) ? "NEW_SUBMENU_IDLE" : "SUBMENU_IDLE";
            DASH_UPDATE_FRAME(NEXT_STATE_MESSAGE_IN);
            break;
    }
}

/*
    This is the exit handler function which will
    handle the exit events (launch an Elf or execute code)
*/

function exit()
{
    switch (DATA.EXIT_STATE)
    {
        case 0:	// Validate if App or functions can be executed, if not, show error screen message
            if (DASH_SEL.Type == "CODE")
            {
                if (DASH_SEL.Value)
                {
                    DATA.EXIT_STATE = 1
                    DATA.OVSTATE = "EXIT";
                }
                else
                {
                    // Show Error Message
                    DATA.DASH_MOVE_FRAME = 0;
                    DATA.DASH_STATE = "IDLE_MESSAGE_FADE_IN";
                    DATA.OVSTATE = "MESSAGE_IN";
                    DATA.MESSAGE_INFO =
                    {
                        Icon: -1,
                        Title: "",
                        BG: false,
                        SKIP_INTRO: true,
                        Type: "TEXT",
                        Text: "Option Function Code is empty.",
                        BACK_BTN: true,
                        ENTER_BTN: false,
                    };
                    xmblog("exit: Option Function Code is empty.");
                    DATA.CURRENT_STATE = 1;
                }
            }
            else if (DASH_SEL.Type == "ELF")
            {
                // Resolve Path if dynamic.
                DASH_SEL.Value.Path = resolveFilePath(DASH_SEL.Value.Path);

                if (DASH_SEL.Value.Path.substring(0, 4) == "pfs1")
                {
                    if ("Partition" in DASH_SEL.Value) { mountHDDPartition(DASH_SEL.Value.Partition); }
                    else
                    {
                        // Show Error Message
                        OpenErrorMessage("Partition not defined for ELF.");
                        xmblog("exit: Partition not defined for ELF.");
                        DATA.CURRENT_STATE = 1;
                    }
                }
                // Check if File Exists.
                const elfExists = std.exists(DASH_SEL.Value.Path);
                if (elfExists) { DATA.EXIT_STATE = 1 }
                else
                {
                    // Show Error Message
                    OpenErrorMessage("ELF file not found.");
                    xmblog("exit: ELF File not found.");
                    DATA.CURRENT_STATE = 1;
                }
            }
            else
            {
                // Show Error Message
                OpenErrorMessage("Unknown Object Type.");
                xmblog("exit: Unknown Object Type.");
                DATA.CURRENT_STATE = 1;
            }
            break;
        case 1: // Screen Fade Out to Black
            if (DATA.FADE_FRAME > 41)
            {
                DATA.OVCOL = Color.new(0, 0, 0, (DATA.FADE_FRAME - 42) * 3);
                DATA.EXIT_STATE = (DATA.FADE_FRAME > 83) ? DATA.EXIT_STATE + 1 : DATA.EXIT_STATE;
            }
            break;
        case 2: // Set Next State to Custom Function or Launch Elf depending on Variable Set
            DATA.OVCOL = Color.new(0, 0, 0, 128);
            DATA.CONFIG.Process(); // Save Configuration Files
            DATA.CURRENT_STATE = (DASH_SEL.Type == "ELF") ? 9 : 99;
            break;
    }

    DATA.FADE_FRAME += 2;
}

/*
    This will be executed after the exit function
    has finished and launch an ELF file
*/

function launch()
{
    if ("Code" in DASH_SEL.Value) { DASH_SEL.Value.Code(); }

    if ("Partition" in DASH_SEL.Value) { DASH_SEL.Value.Path = `hdd0:${DASH_SEL.Value.Partition}:${DASH_SEL.Value.Path}`; }
    else if (DASH_SEL.Value.Path.substring(0, 4) === "pfs:")
    {
        const cwdpart = getCWDPartition();
        if (cwdpart != "") { DASH_SEL.Value.Path = `hdd0:${cwdpart}:${DASH_SEL.Value.Path}`; }
    }

    logl(`Launching ELF: ${DASH_SEL.Value.Path}`);
    logl(`    With Args: ${DASH_SEL.Value.Args}`);

    System.loadELF(DASH_SEL.Value.Path, DASH_SEL.Value.Args);
}

/*
    You can reassign the function called here with
    a plugin to execute custom code after exiting the app.
*/

function custom()
{
    DATA.CUSTOM_FUNCTION(); // Reassignable function
}

/*
    Info:

    Selects new Disc Dash Item on Game Category Automatically
*/

function SelectDiscDashItem()
{
    // Go to Item automatically if idle on Game Category.
    if ((DATA.DASH_CURCAT == 5) && (DATA.DASH_CURSUB == -1) && (DATA.DASH_CURCTXLVL == -1))
    {
        DATA.DASH_MOVE_FRAME = 0;
        DATA.DASH_STATE = "MOVE_DOWN";
        DATA.DASH_CUROPT = DASH_CAT[5].Options.length - 1;
    }
}

/*  Info:

    This function will initialize a new
    disctray item on the Game category
    if the conditions are met for a PS2 game.

*/

function InitPS2DiscDashItem(discType)
{
    // Get executable
    let name = (discType === 9) ? "Playstation 2 CD" : "Playstation 2 DVD";
    let ico = (() => { return dash_icons[26]; });
    const systemcnf = getDiscSystemCNF();

    // Do not add item if System.CNF data was not found.
    if ((systemcnf.length < 1) || !("BOOT2" in systemcnf)) { return; }

    const bootparam = systemcnf["BOOT2"];

    const match = bootparam.match(/cdrom0:\\([^;]+)/);
    const ELFName = (match) ? match[1] : "";

    // Do not add item if executable not found.
    if (ELFName === "") { return; }

    let ELFPath = `cdfs:/${ELFName}`;
    let ELFArgs = [];

    // Get Game Title if available
    const gmecfg = DATA.CONFIG.Get(`${ELFName.toUpperCase()}.cfg`);
    if ("Title" in gmecfg) { name = gmecfg["Title"]; }

    let basePath = `${os.getcwd()[0]}/`;

    if (basePath.endsWith("//")) { basePath = basePath.substring(0, basePath.length - 1); }

    const neutDir = `${basePath}APPS/neutrino/`;
    const dirFiles = os.readdir(neutDir)[0];

    if (dirFiles.includes(`neutrino.elf`))
    {
        let modFound = true;
        let cwd = "";
        if (!dirFiles.includes(`modules`))
        {
            let files = os.readdir("mc0:/")[0];
            let fileExist = files.includes("neutrino");
            if (fileExist) { cwd = "mc0:/neutrino"; }
            else
            {
                files = os.readdir("mc1:/")[0];
                fileExist = files.includes("neutrino");
                if (fileExist) { cwd = "mc1:/neutrino"; }
                else { modFound = false; }
            }
        }

        if (modFound)
        {
            ELFPath = `${basePath}APPS/neutrino/neutrino.elf`;

            if (cwd !== "") { ELFArgs = [`-cwd=${cwd}`]; }
        }
    }

    // Set new Item in Dashboard
    DASH_CAT[5].Options[DASH_CAT[5].Options.length] =
    {
        Disctray: true,
        Name: name,
        Description: ELFName.toUpperCase(),
        Icon: -1,
        Type: "ELF",
        Value: { Path: ELFPath, Args: ELFArgs },
        Art: { ICO: ico },
        get CustomIcon()
        {
            if (typeof this.Art.ICO === "function") { return this.Art.ICO(); }
            return this.Art.ICO;
        }
    };

    SelectDiscDashItem();
}

/*  Info:

    This function will initialize a new
    disctray item on the Game category
    if the conditions are met for a PS1 game.

*/

function InitPS1DiscDashItem(discType)
{
    let name = (discType === 7) ? "Playstation 1 CD" : "Playstation 1 CDDA";
    let ico = (() => { return dash_icons[25]; });
    const systemcnf = getDiscSystemCNF();
    let bootpath = "???";
    let ver = "???";

    if (systemcnf.length < 1)
    {
        // Identify Special PS1 cases.

        const GameDict = DATA.CONFIG.Get("PS1DRV.cfg");

        Object.entries(GameDict).forEach(([key, value]) =>
        {
            const _f = std.open(value, "r");
            if (_f)
            {
                _f.close();
                bootpath = key;
                return;
            }
        });
    }
    else
    {
        if ("BOOT" in systemcnf)
        {
            const match = systemcnf["BOOT"].match(/cdrom:\\([^;]+)/);
            bootpath = (match) ? match[1] : bootpath;
        }
        if ("VER" in systemcnf)
        {
            ver = systemcnf["VER"];
        }
    }

    // If everything failed, check if the disc has PSX.EXE, do not add an item if not.
    if (bootpath === "???")
    {
        const files = os.readdir("cdfs:/")[0];
        const index = files.findIndex(file => file.toLowerCase() === 'PSX.EXE');
        if (index === -1) { return; }
    }

    // Get Game Title if available
    const gmecfg = DATA.CONFIG.Get(`${bootpath.toUpperCase()}.cfg`);
    if ("Title" in gmecfg) { name = gmecfg["Title"]; }

    // Set new Item in Dashboard
    DASH_CAT[5].Options[DASH_CAT[5].Options.length] =
    {
        Disctray: true,
        Name: name,
        Description: "",
        Icon: -1,
        Type: "ELF",
        Value: { Path: "rom0:PS1DRV", Args: [bootpath, ver] },
        Art: { ICO: ico },
        get CustomIcon()
        {
            if (typeof this.Art.ICO === "function") { return this.Art.ICO(); }
            return this.Art.ICO;
        }
    };

    SelectDiscDashItem();
}

/*  Info:

    This function processes the Disc Tray on each frame
    to add or delete the Disctray item of the dashboard
    in case the disctray was opened or closed.

*/

function ProcessDiscTray()
{
    const stat = System.checkDiscTray();
    if ((stat != 0) && (DATA.DISCITEM))
    {
        DATA.DISCITEM = false;
        for (let key in DASH_CAT[5].Options)
        {
            if (DASH_CAT[5].Options[key].hasOwnProperty("Disctray"))
            {
                if ((DATA.DASH_CURCAT == 5) && (DATA.DASH_CUROPT === (DASH_CAT[5].Options.length - 1)))
                {
                    DATA.DASH_MOVE_FRAME = 0;
                    DATA.DASH_STATE = "MOVE_UP";
                    DATA.DASH_CUROPT--;
                }
                DASH_CAT[5].Options.splice(key, 1); // Remove the item from the table
                break; // Stop after removing the first match
            }
        }
        return;
    }

    // I mapped the disc types in case someone wants to do something with them later.

    const discType = System.getDiscType();
    switch (discType)
    {
        case 1: // No Disc
        case 2: // ??
        case 3: // CD ?
        case 4: // DVD-SL ?
        case 5: // DVD-DL ?
        case 6: // Unknown
        case 16: // Unsupported
            // Clearly do nothing.
            break;
        case 7: // PS1 CD
        case 8: // PS1 CDDA
            if (!DATA.DISCITEM) { InitPS1DiscDashItem(discType); DATA.DISCITEM = true; }
            break;
        case 10: // PS2 CDDA
        case 12: // ESR DVD (off)
        case 13: // ESR DVD (on)
        case 14: // Audio CD
        case 15: // Video DVD
            // Maybe do something?.
            break;
        case 9: // PS2 CD
        case 11: // PS2 DVD
            if (!DATA.DISCITEM) { InitPS2DiscDashItem(discType); DATA.DISCITEM = true; }
            break;
    }
}

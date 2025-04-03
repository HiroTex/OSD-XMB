const NAME_SET1 =
[
    "Theme",
    "Thème",
    "Tema",
    "Thema",
    "Tema",
    "Thema",
    "Tema",
];

const DESC_SET1 =
[
    "Sets the interface style.",
    "Définir le style de l'interface.",
    "Establecer el estilo de la interfaz.",
    "Den Schnittstellenstil festlegen.",
    "Seleziona lo stile dell'interfaccia.",
    "Stel de interface-stijl in.",
    "Definir o estilo da interface.",
];

function GetThemeContextInfo()
{
    const CURTHEME = getFolderNameFromPath(DATA.THEME_PATH);
    const listDir = System.listDir("/THM/");

    let defItem = 0;
    let dir_options = [];

    dir_options.push({Name: "Original", Icon: -1});

    const sortedDirectories = listDir
        .filter((item) => item.name !== "." && item.name !== ".." && item.name !== "Original" && item.dir) // Exclude "." and ".." and keep only directories
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

    // Loop through sortedDirectories and collect directories into the desired structure
    sortedDirectories.forEach((item) =>
    {
        const dirFiles = os.readdir(`./THM/${item.name}/`)[0];
        const ico = (dirFiles.includes("thmico.png")) ? imgLoader.loadConstant(`./THM/${item.name}/thmico.png`) : -1;
        dir_options.push
            ({
                Name: item.name,
                Icon: ico,
            });

        if (dirFiles.includes("thmprw.png")) { dir_options[dir_options.length - 1].PreviewImage = `./THM/${item.name}/thmprw.png`; }

        if (item.name == CURTHEME) { defItem = dir_options.length - 1; }
    });

    let _a = function (DATA, val)
    {
        if (DATA.THEME_PATH === `THM/${DASH_CTX[DATA.DASH_CURCTXLVL].Options[DASH_CTX[DATA.DASH_CURCTXLVL].Selected].Name}/`) { return; }

        DATA.DASH_STATE = "SUBMENU_CONTEXT_MESSAGE_FADE_OUT";
        DATA.OVSTATE = "MESSAGE_IN";
        DATA.MESSAGE_INFO =
        {
            Icon: 9,
            Title: DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Name,
            BG: false,
            Type: "TEXT",
            Text: XMBLANG.WAIT,
            BACK_BTN: false,
            ENTER_BTN: false,
            BgFunction: () =>
            {
                let config = DATA.CONFIG.Get("main.cfg");
                if (DATA.THEME_PATH !== `THM/${config["Theme"]}/`)
                {
                    let bgComplete = false;
                    let imgsLoaded = false;
                    let fntLoaded = false;
                    let sndLoaded = false;

                    loaded_icons = 0;

                    DATA.DASH_FOCUS = false;
                    ICOSELCOL = { r: 128, g: 128, b: 128 };
                    TXTSELCOL = { r: 255, g: 255, b: 255 };
                    CTXTINT = { r: 128, g: 128, b: 128 };
                    DATA.DISPLAYBG = false;
                    DATA.BGIMG = false;
                    DATA.BGIMGA = 0;
                    DATA.OVALPHA = 20;

                    DATA.THEME_PATH = `THM/${config["Theme"]}/`;

                    if (os.readdir(DATA.THEME_PATH)[0].includes("thm.js"))
                    {
                        std.loadScript(`${DATA.THEME_PATH}thm.js`);
                    }

                    let intervalID = os.setInterval(() =>
                    {
                        let finished = false;

                        if (DATA.DISPLAYBG) { DATA.BGIMGA += 12; if (DATA.BGIMGA >= 128) { DATA.BGIMGA = 128; bgComplete = true; } }
                        else { bgComplete = true; }

                        if (imgsLoaded === false)
                        {
                            if ((os.readdir(`${DATA.THEME_PATH}`)[0].includes("icons")))
                            {
                                if (loaded_icons < dash_icons_info.children.length)
                                {
                                    const imgPath = (os.readdir(`${DATA.THEME_PATH}icons/`)[0].includes(`${dash_icons_info.children[loaded_icons].attributes.path}`)) ? `${DATA.THEME_PATH}icons/${dash_icons_info.children[loaded_icons].attributes.path}` : `./THM/Original/icons/${dash_icons_info.children[loaded_icons].attributes.path}`;
                                    let icon = new Image(imgPath);
                                    icon.optimize();
                                    icon.filter = LINEAR;
                                    dash_icons[loaded_icons] = icon;
                                    loaded_icons++;
                                }
                                else
                                {
                                    imgsLoaded = true;
                                }
                            }
                            else
                            {
                                loaded_icons = dash_icons_info.children.length;
                                imgsLoaded = true;
                            }
                        }

                        // Reload Font
                        if (fntLoaded === false) { LoadFONT(); fntLoaded = true; }

                        if (sndLoaded === false)
                        {
                            // Pending

                            sndLoaded = true;
                        }

                        if ((bgComplete) && (imgsLoaded) && (fntLoaded) && (sndLoaded)) { finished = true; }

                        if (finished)
                        {
                            DATA.OVSTATE = "MESSAGE_OUT";
                            DATA.DASH_STATE = "SUBMENU_MESSAGE_FADE_IN";
                            DATA.DASH_MOVE_FRAME = 0;
                            SetDashPadEvents(0);
                            os.clearInterval(intervalID);
                        }
                    }, 0,);
                }
            },
        };

        let config = DATA.CONFIG.Get("main.cfg");
        config["Theme"] = DASH_CTX[DATA.DASH_CURCTXLVL].Options[DASH_CTX[DATA.DASH_CURCTXLVL].Selected].Name;
        DATA.CONFIG.Push("main.cfg", config);
    };

    return { Options: dir_options, Default: defItem, Confirm: _a };
}

return {
    Name: NAME_SET1,
    Description: DESC_SET1,
    Icon: 15,
    Type: "CONTEXT",
    Value: GetThemeContextInfo(),
}

const TXT_SETASBG =
    [
        "Set as Wallpaper",
        "Définir comme fond d'écran",
        "Establecer como fondo",
        "Als Hintergrundbild festlegen",
        "Imposta come sfondo",
        "Instellen als achtergrond",
        "Definir como papel de parede",
    ];

function getOptionContextInfo(fullpath)
{
    let dir_options = [];
    dir_options.push({ Name: TXT_SETASBG, Icon: -1 });

    let _a = function (DATA, val)
    {
        DATA.CUSTOMBG_PATH = DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Option.FullPath;
        DATA.BGIMG = new Image(DATA.CUSTOMBG_PATH);
        DATA.BGIMG.optimize();
        DATA.BGIMG.filter = LINEAR;
        DATA.DISPLAYBG = true;
        let config = DATA.CONFIG.Get("main.cfg");
        config["customBg"] = DATA.CUSTOMBG_PATH;
        config["displayBg"] = DATA.DISPLAYBG.toString();
        DATA.CONFIG.Push("main.cfg", config);
    };

    return { Options: dir_options, Default: 0, ItemCount: dir_options.length, Confirm: _a, FullPath: fullpath };
}

function ParseDirectory(path)
{
    const dir = System.listDir(path);
    let dir_options = [];

    // Separate directories and files
    const directories = dir.filter(item => item.name !== "." && item.name !== ".." && item.dir); // All directories
    const files = dir.filter(item => !item.dir); // All files

    // Sort directories and files alphabetically by name
    directories.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));

    directories.forEach((item) =>
    {
        dir_options.push({
            Path: path,
            Name: item.name,
            Description: "",
            Icon: 18,
            Type: "SUBMENU",
            get Value() { return ParseDirectory(`${this.Path}${this.Name}/`); }
        });
    });

    files.forEach((item) =>
    {

        if (isExtensionMatching(item.name, "png", "jpg", "bmp"))
        {
            let icon = 2; // default icon for pictures
            let type = "";
            let value = {};

            dir_options.push({
                Name: item.name,
                Description: formatFileSize(item.size),
                Icon: icon,
                Type: type,
                Value: value,
                Option: getOptionContextInfo(`${path}${item.name}`),
            });
        }
    });

    return { Options: dir_options, Default: 0, ItemCount: dir_options.length, };
}

function getHDDPartitions()
{
    let dir_options = [];
    let partitions = System.listDir("hdd0:");
    let directories = partitions.filter(item => item.name !== "." && item.name !== ".." && item.dir); // All directories
    let files = partitions.filter(item => !item.dir); // All files

    // Sort directories and files alphabetically by name
    directories.sort((a, b) => a.name.localeCompare(b.name));

    directories.forEach((item) =>
    {
        dir_options.push({
            Name: item.name,
            Description: "",
            Icon: 18,
            Type: "SUBMENU",
            get Value() { const part = mountHDDPartition(this.Name); return ParseDirectory(`${part}:/`); }
        });
    });

    return { Options: dir_options, Default: 0, ItemCount: dir_options.length, };
}

let options = [];

options.push({
    Name: XMBLANG.WORK_DIR_NAME,
    Description: "",
    Icon: 18,
    Type: "SUBMENU",
    get Value() { return ParseDirectory(`${os.getcwd()[0]}/`); }
});

if (os.readdir("hdd0:")[0].length > 0)
{
    options.push({
        Name: XMBLANG.HDD_DIR_NAME,
        Description: "",
        Icon: 29,
        Type: "SUBMENU",
        get Value() { return getHDDPartitions(); }
    });
}

for (let i = 0; i < 10; i++)
{
    const dirContent = os.readdir(`mass${i.toString()}:/`);
    const hasContent = dirContent.length > 0 && dirContent[0].length > 0;
    if (!hasContent) break;
    let desc = System.getbdminfo(`mass${i.toString()}:/`);
    desc = (desc) ? `${desc.driverName.toUpperCase()} ${desc.deviceNumber}` : "";

    options.push({
        get Name() { return `${XMBLANG.MASS_DIR_NAME[DATA.LANGUAGE]} ${(i + 1).toString()}`; },
        Description: desc,
        Icon: 21,
        Type: "SUBMENU",
        get Value()
        {
            return ParseDirectory(`mass${i.toString()}:/`);
        }
    });
}

for (let i = 0; i < 2; i++)
{
    const hasContent = os.readdir(`mmce${i.toString()}:/`)[0].length > 0;
    if (!hasContent) continue;

    options.push({
        Name: `MMCE ${i.toString()}`,
        Description: "",
        Icon: 21,
        Type: "SUBMENU",
        get Value()
        {
            return ParseDirectory(`mmce${i.toString()}:/`);
        }
    });
}

return options;

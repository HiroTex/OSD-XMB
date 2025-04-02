const CtxtMenu = xmlParseContext(xmlParseElement(std.loadFile("./PLG/xExplorer/options.xml")));

function ParseDirectory(path)
{
    const dir_options = [];
    const isHdd = (path === "hdd0:");
    const dir = System.listDir(path);

    // Separate directories and files
    let directories = dir.filter(item => item.name !== "." && item.name !== ".." && item.dir); // All directories
    let files = dir.filter(item => !item.dir); // All files

    // Sort directories and files alphabetically by name
    directories.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));

    const valueFun = (isHdd) ? function () { const part = mountHDDPartition(this.Name); return ParseDirectory(`${part}:/`); } : function () { return ParseDirectory(this.FullPath); }

    directories.forEach((item) =>
    {
        dir_options.push({
            Name: item.name,
            Description: "",
            Icon: 18,
            Type: "SUBMENU",
            FullPath: `${path}${item.name}/`,
            Option: CtxtMenu,
        });

        Object.defineProperty(dir_options[dir_options.length - 1], "Value", { get: valueFun });
    });

    files.forEach((item) =>
    {
        dir_options.push(getFileAsItem(`${path}${item.name}`, item.size, CtxtMenu));
    });

    return { Options: dir_options, Default: 0 };
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
        get Value() { return ParseDirectory("hdd0:"); }
    });
}

for (let i = 0; i < 2; i++)
{
    const hasContent = os.readdir(`mc${i.toString()}:/`)[0].length > 0;
    if (!hasContent) continue;

    options.push({
        Name: `Memory Card ${(i + 1).toString()}`,
        Description: "",
        Icon: 16 + i,
        Type: "SUBMENU",
        get Value()
        {
            return ParseDirectory(`mc${i.toString()}:/`);
        }
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
        Name: `MMCE ${(i + 1).toString()}`,
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

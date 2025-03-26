function ParseDirectory(path)
{
    const dir = System.listDir(path);
    let dir_options = [];

    // Separate directories and files
    let directories = dir.filter(item => item.name !== "." && item.name !== ".." && item.dir); // All directories
    let files = dir.filter(item => !item.dir); // All files

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
        let customIcon = false;
        let icon = 24; // default icon for files
        let type = "";
        let value = {};

        switch (getFileExtension(item.name).toLowerCase())
        {
            case "vcd": customIcon = true; icon = 25; break;
            case "iso": customIcon = true; icon = 26; break;
            case "elf": icon = 27; type = "ELF"; value = { Path: (`${path}${item.name}`), Args: [], }; break;
            case "png":
            case "jpg":
            case "bmp": icon = 2; break;
            case "mp3":
            case "wav":
            case "ogg": icon = 3; break;
            case "mp4":
            case "mkv":
            case "avi": icon = 4; break;
        }

        dir_options.push({
            Name: item.name,
            Description: formatFileSize(item.size),
            Icon: icon,
            Type: type,
            Value: value
        });

        if (customIcon)
        {
            Object.defineProperty(dir_options[dir_options.length - 1], 'CustomIcon', {
                get()
                {
                    return dash_icons[icon];
                }
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
    files.sort((a, b) => a.name.localeCompare(b.name));

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

    files.forEach((item) =>
    {

        let customIcon = false;
        let icon = 24; // default icon for files

        switch (getFileExtension(item.name).toLowerCase())
        {
            case "vcd": customIcon = true; icon = 25; break;
            case "iso": customIcon = true; icon = 26; break;
            case "elf": icon = 27; break;
            case "png":
            case "jpg":
            case "bmp": icon = 2; break;
            case "mp3":
            case "wav":
            case "ogg": icon = 3; break;
            case "mp4":
            case "mkv":
            case "avi": icon = 4; break;
        }

        dir_options.push({
            Name: item.name,
            Description: formatFileSize(item.size),
            Icon: icon,
        });

        if (customIcon)
        {
            Object.defineProperty(dir_options[dir_options.length - 1], 'CustomIcon', {
                get()
                {
                    return dash_icons[icon];
                }
            });
        }
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

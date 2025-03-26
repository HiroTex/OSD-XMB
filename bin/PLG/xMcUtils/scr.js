function parseIconSysTitle(path, name)
{
    let RET = name;
    const syspath = `${path}${name}`;
    const files = os.readdir(syspath)[0];
    let fileExist = files.includes("icon.sys");

    if (!fileExist) { return RET; }

    const file = os.open(`${syspath}/icon.sys`, os.O_RDONLY);

    if (file < 0) { console.log(`MCUTILS: Could not open icon sys from ${name}`); return RET; }

    const code = "PS2D";
    const match = true;
    const magic = new Uint8Array(4);
    os.seek(file, 0, std.SEEK_SET);
    os.read(file, magic.buffer, 0, 4);

    if (magic.length === code.length)
    {
        for (let i = 0; i < code.length; i++)
        {
            if (magic[i] !== code.charCodeAt(i))
            {
                match = false;
                break;
            }
        }
    }
    else
    {
        match = false;
    }

    if (match)
    {
        //const linebreak = new Uint8Array(2);
        //os.seek(file, 6, std.SEEK_SET);
        //os.read(file, linebreak.buffer, 0, 2);
        //const linepos = linebreak[0] >> 1;
        const title = new Uint8Array(68);
        os.seek(file, 192, std.SEEK_SET);
        os.read(file, title.buffer, 0, 68);
        RET = IconSysDecodeTitle(title);
        if (/^[\?]*$/.test(RET)) { RET = name; }
    }

    os.close(file);
    return RET;
}

function ReadMCDir(slot)
{
    const dir = System.listDir(`mc${slot.toString()}:/`).sort((a, b) => a.name.localeCompare(b.name));

    // Initialize an empty array to hold the directories
    const directories = [];

    // Loop through dir and collect directories into the desired structure
    dir.forEach((item) =>
    {
        if ((item.dir) && (item.name !== ".") && (item.name !== ".."))
        {
            directories.push({
                Name: parseIconSysTitle(`mc${slot.toString()}:/`, item.name),
                Description: "",
                Icon: 14,
            });
        }
    });

    directories.sort((a, b) => a.Name.localeCompare(b.Name));

    return { Options: directories, Default: 0, ItemCount: directories.length };
}

function TryAddMC(slot)
{
    if (os.readdir(`mc${slot.toString()}:/`)[0].length > 0)
    {
        //const info = System.getMCInfo(slot);

        return {
            Name: `Memory Card ${(slot + 1).toString()}`,
            Description: "8 Mb", // getMCInfo() doesn't work... using a temp description instead
            Icon: 16 + slot,
            Type: "SUBMENU",
            get Value()
            {
                return ReadMCDir(this.Icon - 16);
            }
        };
    }

    return {};
}

let options = [];

const obj0 = TryAddMC(0);
const obj1 = TryAddMC(1);

if ("Name" in obj0) { options.push(obj0); }
if ("Name" in obj1) { options.push(obj1); }

return options;

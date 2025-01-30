//////////////////////////////////////////////////////////////////////////
///*				   		 ENCLOSE START							  *///
//////////////////////////////////////////////////////////////////////////

export const Plugin = (() => { 	// DO NOT REMOVE, Encloses plugin on a local scope //

//////////////////////////////////////////////////////////////////////////
///*				   		 CUSTOM STRINGS							  *///
//////////////////////////////////////////////////////////////////////////

const NAME_MAIN = 		// Displayed name on the Main Interface
[
	"Memory Card Utility",
	"Utilitaire de Memory Card",
	"Herramienta de Memory Card",
	"Memory Card-Dienstprogramm",
	"Utilità della Memory Card",
	"Diensten voor Memory Card",
	"Utilitário do Memory Card",
];

//////////////////////////////////////////////////////////////////////////
///*				   		CUSTOM FUNCTIONS						  *///
//////////////////////////////////////////////////////////////////////////

let iCount = 0;
let options = [];

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
			if (magic[i] !== code.charCodeAt(i)) {
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

function TryAddMC(path, slot, name)
{
	const dir = System.listDir(path).sort((a, b) => a.name.localeCompare(b.name));
	//const info = System.getMCInfo(slot);

	// Initialize an empty array to hold the directories
	const directories = [];

	// Loop through dir and collect directories into the desired structure
	dir.forEach((item) =>
	{
		if ((item.dir) && (item.name !== ".") && (item.name !== ".."))
		{
			directories.push({
				Name: parseIconSysTitle(path, item.name),
				Description: "",
				Icon: 14,
			});
		}
	});

	directories.sort((a, b) => a.Name.localeCompare(b.Name));

	if (directories.length > 0)
	{
		const MC0INFO =
		{
			Name: name,
			Description: "8 Mb", // getMCInfo() doesn't work... using a temp description instead
			Icon: 16 + slot,
			Type: "SUBMENU",
			Value:
			{
				Options: directories,
				Default: 0,
				ItemCount: directories.length,
			},
		}

		options.push(MC0INFO);
		iCount++;
	}
}

function GetMcOptions()
{
	TryAddMC("mc0:/", 0, "Memory Card 1");
	TryAddMC("mc1:/", 1, "Memory Card 2");

	return { Options: options, Default: 0, ItemCount: iCount, };
}

//////////////////////////////////////////////////////////////////////////
///*				   		MAIN PLUGIN DATA						  *///
///																	   ///
/// 	Here is the main info that will be retrieved by the App.   	   ///
//////////////////////////////////////////////////////////////////////////

const Info = {
	Name: NAME_MAIN,
	Description: "",
	Icon: 13,
	Category: 5,
	Type: "SUBMENU",
	Value: GetMcOptions(),
};

return Info;

//////////////////////////////////////////////////////////////////////////
///*				   		   ENCLOSE END							  *///
//////////////////////////////////////////////////////////////////////////

})(); // DO NOT REMOVE, Encloses plugin on a local scope //

//////////////////////////////////////////////////////////////////////////
///*				   			  CDVD								  *///
/// 				   		  										   ///
///		 			  This handles the PS2 disctray.	  			   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const DiscTray = (() => {
	let stat = 1;
	let disc = 0;
	let oldDisc = 0;
	let item = false;
    let processed = false;
    let frame = 0;

	// Disc Types Table
	const Type = [];
	Type.push({ Name: "" });
	Type.push({ Name: "No Disc" });
	Type.push({ Name: "??" });
	Type.push({ Name: "CD ?" });
	Type.push({ Name: "DVD-SL ?" });
	Type.push({ Name: "DVD-DL ?" });
	Type.push({ Name: "Unknown" });
	Type.push({ Name: "PS1 CD", Function: PS1Disc });
	Type.push({ Name: "PS1 CDDA", Function: PS1Disc });
	Type.push({ Name: "PS2 CD", Function: PS2Disc });
	Type.push({ Name: "PS2 CDDA", Function: PS2Disc });
	Type.push({ Name: "PS2 DVD", Function: PS2Disc });
	Type.push({ Name: "ESR DVD (off)" });
	Type.push({ Name: "ESR DVD (on)" });
	Type.push({ Name: "Audio CD" });
	Type.push({ Name: "Video DVD" });
	Type.push({ Name: "Unsupported" });

	function PS1Disc() {
		const systemcnf = GetSystemCNF();
		let ps1drv_boot = "???";
		let ps1drv_ver = "???";

		if (systemcnf.length < 1) {
			// Identify Special PS1 cases.

			const GameDict = CfgMan.Get("PS1DRV.cfg");

			Object.entries(GameDict).forEach(([key, value]) => {
				const _f = std.open(value, "r");
				if (_f) {
					_f.close();
					ps1drv_boot = key;
					return;
				}
			});
		}
		else {
			if ("BOOT" in systemcnf) {
				const match = systemcnf["BOOT"].match(/cdrom:\\([^;]+)/);
				ps1drv_boot = (match) ? match[1] : ps1drv_boot;
			}
			if ("VER" in systemcnf) {
                ps1drv_ver = systemcnf["VER"];
			}
		}

		// If everything failed, check if the disc has PSX.EXE, do not add an item if not.
		if (ps1drv_boot === "???") {
			const files = os.readdir("cdfs:/")[0];
			const index = files.findIndex(file => file.toUpperCase() === 'PSX.EXE');
			if (index === -1) { return false; }
		}

		// Get Game Title if available
		let name = (disc === 7) ? "Playstation 1 CD" : "Playstation 1 CDDA";
		const gmecfg = CfgMan.Get(`${ps1drv_boot.toUpperCase()}.cfg`);
		if ("Title" in gmecfg) { name = gmecfg["Title"]; }

		// Set new Item in Dashboard
		AddItem({
			Disctray: true,
			Name: name,
			Description: "",
			Icon: 25,
			Type: "ELF",
			Value: { Path: "rom0:PS1DRV", Args: [ps1drv_boot, ps1drv_ver] }
		});

		return true;
	}
    function PS2Disc() {
		const systemcnf = GetSystemCNF();

		// Do not add item if System.CNF data was not found.
		if ((systemcnf.length < 1) || !("BOOT2" in systemcnf)) { return false; }

		const bootparam = systemcnf["BOOT2"];
		const match 	= bootparam.match(/cdrom0:\\([^;]+)/);
		const ELFName 	= (match) ? match[1] : "";

		// Do not add item if executable not found.
		if (ELFName === "") { return false; }

		// Set ELF Info
		let ELFPath = "rom0:PS2LOGO";
        let ELFArgs = [ ELFName ];

		// Get Game Title if available
		let name = (disc === 11) ? "Playstation 2 DVD" : "Playstation 2 CD";
		const gmecfg = CfgMan.Get(`${ELFName.toUpperCase()}.cfg`);
		if ("Title" in gmecfg) { name = gmecfg["Title"]; }

		// Use neutrino if available
		if ((std.exists(`${PATHS.Neutrino}neutrino.elf`)) && (os.readdir(PATHS.Neutrino)[0].includes("modules"))) {
			ELFPath = `${PATHS.Neutrino}neutrino.elf`;
			ELFArgs = GetNeutrinoArgs(ELFName.toUpperCase);
        }

		AddItem({
			Disctray: true,
			Name: name,
			Description: ELFName.toUpperCase(),
			Icon: 26,
			Type: "ELF",
			Value: { Path: ELFPath, Args: ELFArgs }
		});

		return true;
	}
    function GetSystemCNF() {
		const files 	= os.readdir("cdfs:/")[0]; if (files.length < 1) { return false; }
		const index 	= files.findIndex(file => file.toLowerCase() === 'system.cnf');
		return ReadCFG(`cdfs:/${files[index]}`);
	}
    function GoToNewItem() {
		if ((DashUI.AnimationQueue.length < 1) && (DashUI.State.Current === 1) && (DashUI.Category.Current === 5)) {
			DashUI.Items.Current = DashCatItems[5].Items.length - 2;
			DashUI.Items.Next = DashCatItems[5].Items.length - 2;
			UIAnimationCategoryItemsMove_Start(1);
		}
	}
    function AddItem(item) {
		// Set new Item in Dashboard
		DashCatItems[5].Items.push(item);
		GoToNewItem();
	}
    function RemoveItem() {
        if (!item) { return; }

		for (let i = 0; i < DashCatItems[5].Items.length; i++)
        {
			if (!DashCatItems[5].Items[i].hasOwnProperty("Disctray")) { continue; }
			DashCatItems[5].Items.splice(i, 1);
			if (DashUI.Items.Current === DashCatItems[5].Items.length) {
				UIAnimationCategoryItemsMove_Start(-1);
			}
			else if (DashCatItems[5].Default === DashCatItems[5].Items.length) {
				DashCatItems[5].Default--;
			}
			break;
        }
		item = false;
	}
    function ProcessItem() {
		const oldDisc = disc;
		disc = System.getDiscType();
		if (disc !== oldDisc) { processed = false; }
		if (('Function' in Type[disc]) && !processed) {
			processed = true;
            Tasks.Push(() => { item = Type[disc].Function(); });
        }
	}

    return {
        Process: function () {
            if (!UserConfig.Disctray) { return; }
            if (frame !== 4) { frame++; return; }       // Avoid calling Check Disc Tray every frame.
			stat = System.checkDiscTray();

			if (stat !== 0 && item)  { RemoveItem(); 	} // Disctray has been opened
			if (stat === 0 && !item) { ProcessItem(); 	} // Disctray is closed and needs processing
            frame = 0;
		},
    };
})();

console.log("INIT LIB: CDVD COMPLETE");

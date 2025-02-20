//////////////////////////////////////////////////////////////////////////
///*				   		        IOP 							  *///
/// 				   		  										   ///
///		  This will load additional IOP Modules, or reset and   	   ///
///		      reload IOP modules to support new devices.          	   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const extDevMods =
[
    "ata_bd.irx",
    "mx4sio_bd_mini.irx",
    "mmceman.irx",
    "mmcefhi.irx"
];

function locateIOPModulePath()
{
    let basePath = "mc0:/neutrino";

    // Scan MC0 for neutrino folder
    if (!os.readdir("mc0:/")[0].includes("neutrino"))
    {
        // Scan MC1 for neutrino folder
        if (!os.readdir("mc1:/")[0].includes("neutrino")) { return ""; }

        // Update assets folder
        basePath = "mc1:/neutrino";
    }

    if (!os.readdir(basePath)[0].includes("modules")) { return ""; }

    return `${basePath}/modules/`;
}

function IOPModulesExist(basePath)
{
    extDevMods.forEach((mod) =>
    {
        if (!os.readdir(basePath)[0].includes(mod)) { return false; }
    });

    return true;
}

function FixCwd()
{
    // Fix CWD if boot path is mass storage device
    if (os.getcwd()[0].substring(0, 4) === "mass")
    {
        // Get boot directory without root
        const bootDir = os.getcwd()[0].substring(4);

        // Scan mass0 to mass9 for OSDXMB.ELF
        for (let i = 0; i < 10; i++)
        {
            // Concatenate new root to booth path. If path is a root, remove the extra slash.
            let dir = `mass${i.toString()}${bootDir}/`;
            if (dir.endsWith("//")) { dir = dir.substring(0, dir.length - 1); }

            // Change current working directory if OSDXMB.ELF is found
            if (os.readdir(dir)[0].includes("OSDXMB.ELF")) { os.chdir(dir); break; }
        }
    }

    console.log("CWD = " + os.getcwd()[0]);
}

function ResetIOP(modPath = "")
{
    // Do not reset IOP if boot path is Virtual HDD
    if (System.boot_path.substring(0, 3) === "pfs") { return; }

    // Check if module path exists and modules are present
    let loadAdditional = (modPath !== "");
    if (modPath === "")
    {
        const modPath = locateIOPModulePath();
        if ((modPath !== "") && (IOPModulesExist(modPath)))
        {
            loadAdditional = true;
        }
    }

    // Reset IOP and load default modules.

    console.log("IOP: RESET START");

    IOP.reset();
    IOP.loadDefaultModule(IOP.hdd);
    IOP.loadDefaultModule(IOP.cdfs);
    IOP.loadDefaultModule(IOP.memcard);

    console.log("IOP: LOADED FIRST DEFAULT MODULES");

    // Load all neutrino device modules.

    if (loadAdditional) { extDevMods.forEach((mod) => { IOP.loadModule(`${modPath}${mod}`); }); }

    console.log("IOP: LOADED NEUTRINO MODULES");

    // Load remaining default modules.

    IOP.loadDefaultModule(IOP.usb_mass);

    IOP.loadDefaultModule(IOP.audio);
    IOP.loadDefaultModule(IOP.pads);

    FixCwd();

    console.log("IOP: LOADED REMAINING DEFAULT MODULES");
}

function IOPBoot()
{
    try
    {
        // Old IOP Initial Reset to load extended device modules.

        //const modPath = locateIOPModulePath();
        //if ((modPath !== "") && (IOPModulesExist(modPath))) { ResetIOP(modPath); }

        // Load Extra Modules

        IOP.loadDefaultModule(IOP.network);
    }
    catch (e)
    {
        console.error("IOP: ERROR LOADING IOP MODULES");
        console.error(e);
    }
}

IOPBoot();
console.log("INIT: IOP INIT COMPLETE");

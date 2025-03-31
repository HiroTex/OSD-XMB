//////////////////////////////////////////////////////////////////////////
///*				   		     NETWORK							  *///
/// 				   		  										   ///
///		  This will initilize all network-related configurations	   ///
///		                      and settings.	                    	   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

// Network System Initilization

function NetInit()
{
    // Check if Network is already initialized
    if (DATA.NET) { return; }
    else
    {
        const config = Network.getConfig();
        if ((config) && (config.ip.toString() !== "0.0.0.0")) { DATA.NET = true; return; }
        else if (DATA.NETTRY) { return; }
    }

    try
    {
        xmblog("NETWORK: Initializing Network");
        IOP.loadDefaultModule(IOP.network);
        Network.init();

        // Check if Valid IP found
        if (Network.getConfig().ip.toString() !== "0.0.0.0") { DATA.NET = true; }
    }
    catch (err)
    {
        xmblog("NETWORK: Error Initializing Network " + err);
    }

    DATA.NETTRY = true;
}

// Network System Exit
function NetExit()
{
    // Check if Network is already deinitialized
    if (!DATA.NET) { return; }

    try
    {
        Network.deinit();
        DATA.NET = false;
    }
    catch (err)
    {
        xmblog("NETWORK: Error Deinitializing Network " + err);
    }
}

function NetCfgSave()
{
    let config = DATA.CONFIG.Get("main.cfg");
    config["net"] = DATA.NET.toString();
    DATA.CONFIG.Push("main.cfg", config);
}

xmblog("INIT: NETWORK INIT COMPLETE");

//////////////////////////////////////////////////////////////////////////
///*				   			    NET								  *///
/// 				   		  										   ///
///		   This will handle all network-related work operations.	   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const NetInfo = {
    Initialized: false,
    IP: "-",
    NETMASK: "-",
    GATEWAY: "-",
    DNS: "-"
};

let gNetArt = [];

function NetInit() {
    try {
        IOP.loadModule("SMAP");

        const netCfg = CfgMan.Get("network.cfg");
        const ip = netCfg["IP"];
        const mask = netCfg["NETMASK"];
        const gw = netCfg["GATEWAY"];
        const dns = netCfg["DNS"];

        if (!ip || !mask || !gw || !dns) { Network.init(); } // Use DHCP if config is incomplete.
        else { Network.init(ip, mask, gw, dns); }
        NetInfo.Initialized = true;

        const conf = Network.getConfig();
        if (!conf) { throw new Error("Couldn't get Network Configuration."); }

        NetInfo.IP = conf.ip;
        NetInfo.NETMASK = conf.netmask;
        NetInfo.GATEWAY = conf.gateway;
        NetInfo.DNS = conf.dns;

        NetArtInit();
    } catch (e) {
        console.log(e);
        return false;
    }

    return true;
}
function NetDeinit() {
    NetInfo.IP = "-";
    NetInfo.NETMASK = "-";
    NetInfo.GATEWAY = "-";
    NetInfo.DNS = "-";
}
function NetArtInit() {
    let tmpath = `${PATHS.XMB}/temp`;
    let src = "https://raw.githubusercontent.com/HiroTex/OSD-XMB-ARTDB/main/manifest.txt";
    let r = new Request();
    try {
        r.download(src, tmpath);
        gNetArt = std.loadFile(tmpath).split('\n').filter(line => line !== "");
    } catch (e) {
        console.log(e);
    } finally {
        if (r) r = null;
        if (std.exists(tmpath)) os.remove(tmpath);
    }
}

if (UserConfig.Network === 1) { Tasks.Push(() => UserConfig.Network = Number(NetInit())); }

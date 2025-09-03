//////////////////////////////////////////////////////////////////////////
///*				   			    NET								  *///
/// 				   		  										   ///
///		   This will handle all network-related work operations.	   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const NetInfo = {
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

        const conf = Network.getConfig();
        if (!conf) { console.log("Failed to initialize Network."); return false; }

        NetInfo.IP = conf.ip;
        NetInfo.NETMASK = conf.netmask;
        NetInfo.GATEWAY = conf.gateway;
        NetInfo.DNS = conf.dns;

        Tasks.Push(NetArtInit);
    } catch (e) {
        console.log(e.message);
        return false;
    }

    return true;
}
function NetDeinit() {
    if (NetInfo.IP !== "-") { Network.deinit(); }
    NetInfo.IP = "-";
    NetInfo.NETMASK = "-";
    NetInfo.GATEWAY = "-";
    NetInfo.DNS = "-";
}
function NetArtInit() {
    let tmpath = `${PATHS.XMB}/temp`;
    try {
        let r = new Request();
        r.download("https://raw.githubusercontent.com/HiroTex/OSD-XMB-ARTDB/main/manifest.txt", tmpath);
        gNetArt = std.loadFile(tmpath).split('\n').filter(line => line !== "");
        os.remove(tmpath);
    } catch (e) {
        console.log(e);
    }
}

if (UserConfig.Network !== 0) { UserConfig.Network = Number(NetInit()); }

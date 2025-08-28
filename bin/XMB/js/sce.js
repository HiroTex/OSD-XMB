//////////////////////////////////////////////////////////////////////////
///*				   			   SCE								  *///
/// 				   		  										   ///
///		  This handles all internal hardware related functions.		   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

let OsdParams = 0;
const SCEConfigParamTable = {
    SPDIF_MODE: 		{ Mask: 0x00000001, Shift: 0x00 },
    SCREEN_TYPE: 		{ Mask: 0x00000006, Shift: 0x01 },
    VIDEO_OUTPUT: 		{ Mask: 0x00000008, Shift: 0x03 },
    JAP_LANGUAGE: 		{ Mask: 0x00000010, Shift: 0x04 },
    PS1DRV_CONFIG: 		{ Mask: 0x00000FE0, Shift: 0x05 },
    VERSION: 			{ Mask: 0x00007000, Shift: 0x0D },
    LANGUAGE: 			{ Mask: 0x001F0000, Shift: 0x10 },
    TIMEZONE_OFFSET: 	{ Mask: 0xFFE00000, Shift: 0x15 }
};
const SCERomVerInfo = {};

/* Decode a byte array into a UTF-8 string */
function utf8Decode(byteArray) {
    let result = '';
    let i = 0;

    while (i < byteArray.length) {
        const byte1 = byteArray[i++];

        if (byte1 <= 0x7F) {
            // 1-byte character (ASCII)
            if (byte1 === 0x0) { result += String.fromCharCode(0xA); }
            else { result += String.fromCharCode(byte1); }
        } else if (byte1 >= 0xC0 && byte1 <= 0xDF) {
            // 2-byte character
            const byte2 = byteArray[i++];
            const charCode = ((byte1 & 0x1F) << 6) | (byte2 & 0x3F);
            result += String.fromCharCode(charCode);
        } else if (byte1 >= 0xE0 && byte1 <= 0xEF) {
            // 3-byte character
            const byte2 = byteArray[i++];
            const byte3 = byteArray[i++];
            const charCode = ((byte1 & 0x0F) << 12) |
                             ((byte2 & 0x3F) << 6) |
                             (byte3 & 0x3F);
            result += String.fromCharCode(charCode);
        } else if (byte1 >= 0xF0 && byte1 <= 0xF7) {
            // 4-byte character (rare, for supplementary planes)
            const byte2 = byteArray[i++];
            const byte3 = byteArray[i++];
            const byte4 = byteArray[i++];
            const charCode = ((byte1 & 0x07) << 18) |
                             ((byte2 & 0x3F) << 12) |
                             ((byte3 & 0x3F) << 6) |
                             (byte4 & 0x3F);
            result += String.fromCodePoint(charCode);
        }
    }

    return result;
}

/* Read an Entire File and get all its contents as a utf-8 string */
function readFileAsUtf8(filepath) {
	let file = false;
	let result = "";

	try {
		file = os.open(filepath, os.O_RDONLY);
		if (!file) { throw new Error(`Could not open file: ${filepath}`); }
		const flen = os.seek(file, 0, std.SEEK_END);
		if (flen < 1) { throw new Error(`Invalid File Length for ${filepath} : ${flen.toString()}`); }
		const array = new Uint8Array(flen);
        os.seek(file, 0, std.SEEK_SET);
        os.read(file, array.buffer, 0, flen);
        result = utf8Decode(array);
	} catch (e) {
		console.log(e);
	} finally {
		if (file) { os.close(file); }
	}

	return result;
}

//////////////////////////////////////////////////////////////////////////
///*				   			  ROMVER							  *///
//////////////////////////////////////////////////////////////////////////
function getConsoleVersion(rawVersion) {
    // Split the version into major and minor parts
    const majorVersion = rawVersion.slice(0, 2).replace(/^0/, ''); // Remove leading zero from the major version
    const minorVersion = rawVersion.slice(2); // Take the last two characters as is

    // Combine the major and minor versions into the desired format
    return `${majorVersion}.${minorVersion}`;
}
function getConsoleType(regCode, rawVersion) {
    let consoleType = "Retail";

    switch (regCode) {
        case "C": consoleType = "Retail"; break;
        case "D": consoleType = "DevKit"; break;
        case "Z": consoleType = "Arcade"; break;
    }

    if (std.exists("rom0:PSXVER")) { consoleType = "PSX-DVR"; }
    if (rawVersion === "0250") { consoleType = "PS2 TV"; }

    return consoleType;
}
function getConsoleRegion(regCode) {
    let ConsoleRegion = "";

    switch (regCode) {
        case 'X': ConsoleRegion = "Test"; break;
        case 'C': ConsoleRegion = "China"; break;
        case 'E': ConsoleRegion = "Europe"; break;
        case 'H': ConsoleRegion = "Asia"; break;
        case 'A': ConsoleRegion = "America"; break;
        case 'T':
        case 'J': ConsoleRegion = "Japan"; break;
    }

    return ConsoleRegion;
}
function getConsoleDate(ROMVER) {
    // Extract the date portion starting from character 6
    const year = ROMVER.substring(6, 10);   // Characters 6-9 are the year
    const month = ROMVER.substring(10, 12); // Characters 10-11 are the month
    const day = ROMVER.substring(12, 14);   // Characters 12-13 are the day

    // Format the date as YYYY/MM/DD
    let formattedDate = `${day}/${month}/${year}`;

    // Get Extended Info if available.
    const file = std.open("rom0:EXTINFO", "r");

    if (file) {
        file.seek(0x10, std.SEEK_SET);
        const extDate = file.readAsString(0x0F);
        file.close();

        const extYear = extDate.substring(0, 4);
        const extMonth = extDate.substring(4, 6);
        const extDay = extDate.substring(6, 8);
        const extHour = extDate.substring(9, 11);
        const extMin = extDate.substring(11, 13);
        const extSec = extDate.substring(13, 15);

        formattedDate = `${extDay}/${extMonth}/${extYear} ${extHour}:${extMin}:${extSec}`;
    }

    return formattedDate;
}
function getModelName(rawVersion) {
    let modelName = "";

    if ((rawVersion[0] === '0') && (rawVersion[1] === '1') && (rawVersion[2] === '0')) {
        if (rawVersion[3] === '0') { modelName = "SCPH-10000"; }
        else {
            const osdsys = std.open("rom0:OSDSYS", "r");

            if (osdsys) {
                osdsys.seek(0x8C808, std.SEEK_SET);
                modelName = osdsys.readAsString(17);
                osdsys.close();
            }
        }
    }

    return modelName;
}
function getPS1Ver(ConsoleRegion) {
    let temp = (ConsoleRegion === "Japan") ? "1.01" : "1.10";
    let ps1ver = readFileAsUtf8("rom0:PS1VERA");
    if (ps1ver !== "") { return ps1ver; }
    ps1ver = readFileAsUtf8("rom0:PS1VER");
    if (ps1ver === "") { return temp; }
    return ps1ver;
}
function getOsdVer() {
    let osdver = "";
    const file = std.open("rom0:PS1ID", "r");

    if (file) {
        osdver = file.readAsString();
        file.close();
    }

    return osdver;
}
function getCdVer() {
    let cdver = "";
    const file = std.open("rom0:OSDVER", "r");

    if (file) {
        cdver = file.readAsString(4);
        file.close();

        // Split the version into major and minor parts
        const major = cdver.slice(0, 2).replace(/^0/, ''); // Remove leading zero from the major version
        const minor = cdver.slice(2); // Take the last two characters as is

        // Combine the major and minor versions into the desired format
        cdver = `${major}.${minor}`;
    }

    return cdver;
}
function getDvdVer() {

    let id = "";
    const dvdId = std.open("rom1:DVDID", "r");
    if (dvdId) {
        id = dvdId.readAsString();
        dvdId.close();
        switch (id[4]) {
            case 'O': SCERomVerInfo.Region = "Oceania"; break;
            case 'R': SCERomVerInfo.Region = "Russia"; break;
            case 'M': SCERomVerInfo.Region = "Mexico"; break;
        }
    }

    if (id !== "") { return id; }

    // If DVDID is not found, check for DVDVER

    let dvdVer = std.open("rom1:DVDVER", "r");
    if (dvdVer) {
        id = dvdVer.readAsString();
        dvdVer.close();
    }
    return id;
}
function CollectRomVerInfo() {
	const tmp = std.open("rom0:ROMVER", "r");
	if (!tmp) { return; }
	const ROMVER = tmp.readAsString();
	tmp.close();

    SCERomVerInfo.VersionRaw = ROMVER.substring(0, 4);
    SCERomVerInfo.VersionFormatted = getConsoleVersion(SCERomVerInfo.VersionRaw);
    SCERomVerInfo.Date     = getConsoleDate(ROMVER);
    SCERomVerInfo.Region   = getConsoleRegion(ROMVER[4]);
    SCERomVerInfo.Hardware = getConsoleType(ROMVER[5], SCERomVerInfo.VersionRaw);
    SCERomVerInfo.Model    = getModelName(SCERomVerInfo.VersionRaw);
    SCERomVerInfo.PS1VER   = getPS1Ver(SCERomVerInfo.Region);
    SCERomVerInfo.DVDVER   = getDvdVer();
    SCERomVerInfo.CDVER    = getCdVer();
    SCERomVerInfo.OSDVER   = getOsdVer();
    if (SCERomVerInfo.OSDVER === "") { SCERomVerInfo.OSDVER = SCERomVerInfo.CDVER; }
}

//////////////////////////////////////////////////////////////////////////
///*				   			OSD Config							  *///
//////////////////////////////////////////////////////////////////////////
function CollectOsdParams() {
	const OsdParamsPtr = new ArrayBuffer(4); // Our pointer to store data
	const GetOsdConfigParamPtr = System.findRelocObject("GetOsdConfigParam");
	System.nativeCall(GetOsdConfigParamPtr, [{type: System.JS_BUFFER, value: OsdParamsPtr}]);
    OsdParams = new Uint32Array(OsdParamsPtr)[0];
}
function GetOsdConfig(param) {
	let Config = false;

	switch(param) {
		case "SPDIF": Config = SCEConfigParamTable.SPDIF_MODE; break;
		case "Aspect": Config = SCEConfigParamTable.SCREEN_TYPE; break;
		case "Video": Config = SCEConfigParamTable.VIDEO_OUTPUT; break;
		case "Japanese": Config = SCEConfigParamTable.JAP_LANGUAGE; break;
		case "PS1DRV": Config = SCEConfigParamTable.PS1DRV_CONFIG; break;
		case "Version": Config = SCEConfigParamTable.VERSION; break;
		case "Language": Config = SCEConfigParamTable.LANGUAGE; break;
		case "Timezone": Config = SCEConfigParamTable.TIMEZONE_OFFSET; break;
	}

	if (Config) { return (OsdParams & Config.Mask) >>> Config.Shift; }
	else return 0;
}

//////////////////////////////////////////////////////////////////////////
///*				   			 Init Work							  *///
//////////////////////////////////////////////////////////////////////////

CollectRomVerInfo();
CollectOsdParams();
console.log("INIT LIB: SCE COMPLETE");

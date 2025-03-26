// STRINGS //

const SYSINFO_MODELNAME =
[
    "Console",
    "Console",
    "Consola",
    "Console",
    "Console",
    "Console",
    "Console",
];
const SYSINFO_BDATE =
[
    "Build Date",
    "Build Date",
    "Fecha",
    "Build Date",
    "Build Date",
    "Build Date",
    "Build Date",
];
const SYSINFO_TYPE =
[
    "Console Type",
    "Console Type",
    "Tipo de Consola",
    "Console Type",
    "Console Type",
    "Console Type",
    "Console Type",
];
const SYSINFO_BRWVER =
[
    "Browser",
    "Browser",
    "Navegador",
    "Browser",
    "Browser",
    "Browser",
    "Browser",
];
const SYSINFO_CDVER =
[
    "CD Player",
    "CD Player",
    "Reproductor de CD",
    "CD Player",
    "CD Player",
    "CD Player",
    "CD Player",
];

// FUNCTIONS //

function getConsoleVersion(rawVersion)
{
    // Split the version into major and minor parts
    const majorVersion = rawVersion.slice(0, 2).replace(/^0/, ''); // Remove leading zero from the major version
    const minorVersion = rawVersion.slice(2); // Take the last two characters as is

    // Combine the major and minor versions into the desired format
    return `${majorVersion}.${minorVersion}`;
}
function getConsoleType(regCode, rawVersion)
{
    let consoleType = "Retail";

    switch (regCode)
    {
        case "C": consoleType = "Retail"; break;
        case "D": consoleType = "DevKit"; break;
        case "Z": consoleType = "Arcade"; break;
    }

    if (std.exists("rom0:PSXVER")) { consoleType = "PSX-DVR"; }
    if (rawVersion === "0250") { consoleType = "PS2 TV"; }

    return consoleType;
}
function getConsoleRegion(regCode)
{
    let ConsoleRegion = "";

    switch (regCode)
    {
        case 'X': ConsoleRegion = "Test"; break;
        case 'C': ConsoleRegion = "China"; break;
        case 'E': ConsoleRegion = "Europe"; break;
        case 'H': ConsoleRegion = "Asia"; break;
        case 'A': ConsoleRegion = "America"; break;
        case 'T':
        case 'J': ConsoleRegion = "Japan"; break;
    }

    // rom1:DVDID (example 3.10M)
    const dvdId = std.open("rom1:DVDID", "r");
    if (dvdId)
    {
        const id = dvdId.readAsString();
        dvdId.close();
        switch (id[4])
        {
            case 'O': ConsoleRegion = "Oceania"; break;
            case 'R': ConsoleRegion = "Russia"; break;
            case 'M': ConsoleRegion = "Mexico"; break;
        }
    }

    return ConsoleRegion;
}
function getConsoleDate(ROMVER)
{
    // Extract the date portion starting from character 6
    const year = ROMVER.substring(6, 10);   // Characters 6-9 are the year
    const month = ROMVER.substring(10, 12); // Characters 10-11 are the month
    const day = ROMVER.substring(12, 14);   // Characters 12-13 are the day

    // Format the date as YYYY/MM/DD
    let formattedDate = `${day}/${month}/${year}`;

    // Get Extended Info if available.
    const file = std.open("rom0:EXTINFO", "r");

    if (file)
    {
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
function getPS1Ver(ConsoleRegion)
{
    let ps1ver = (ConsoleRegion === "Japan") ? "1.01" : "1.10";

    const ps1vera = std.open("rom0:PS1VERA", "r");

    if (ps1vera)
    {
        ps1vera.close();
        ps1ver = readFileAsUtf8("rom0:PS1VERA");
    }
    else
    {
        const ps1verb = std.open("rom0:PS1VER", "r");

        if (ps1verb)
        {
            ps1verb.close();
            ps1ver = readFileAsUtf8("rom0:PS1VER");
        }
    }

    return ps1ver;
}
function getModelName(rawVersion)
{
    let modelName = "";

    if ((rawVersion[0] === '0') && (rawVersion[1] === '1') && (rawVersion[2] === '0'))
    {
        if (rawVersion[3] === '0') { modelName = "SCPH-10000"; }
        else
        {
            const osdsys = std.open("rom0:OSDSYS", "r");

            if (osdsys)
            {
                osdsys.seek(0x8C808, std.SEEK_SET);
                modelName = osdsys.readAsString(17);
                osdsys.close();
            }
        }
    }

    return modelName;
}
function getOsdVer()
{
    let osdver = "";
    const file = std.open("rom0:PS1ID", "r");

    if (file)
    {
        osdver = file.readAsString();
        file.close();
    }

    return osdver;
}
function getCdVer()
{
    let cdver = "";
    const file = std.open("rom0:OSDVER", "r");

    if (file)
    {
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
function newObj(list, name, value)
{
    if (value !== "")
    {
        list.push({
            Selectable: false,
            get Name() { return name; },
            get Description() { return value; }
        });
    }

    return list;
}

// CODE //

const tmp = std.open("rom0:ROMVER", "r");
if (tmp)
{
    const ROMVER = tmp.readAsString();
    tmp.close();

    // Extract the first four characters for the version
    const rawVersion = ROMVER.substring(0, 4);

    const formattedVersion = getConsoleVersion(rawVersion);
    const formattedDate = getConsoleDate(ROMVER);
    const ConsoleRegion = getConsoleRegion(ROMVER[4]);
    const consoleType = getConsoleType(ROMVER[5], rawVersion);
    const ps1ver = getPS1Ver(ConsoleRegion);
    const modelName = getModelName(rawVersion);
    const osdver = getOsdVer();
    const cdver = getCdVer();

    // Place all the Data extracted into the object
    let sysInfo = [];
    sysInfo = newObj(sysInfo, SYSINFO_MODELNAME[DATA.LANGUAGE], modelName);
    sysInfo = newObj(sysInfo, "ROMVER", formattedVersion);
    sysInfo = newObj(sysInfo, SYSINFO_BRWVER[DATA.LANGUAGE], osdver);
    sysInfo = newObj(sysInfo, SYSINFO_CDVER[DATA.LANGUAGE], cdver);
    sysInfo = newObj(sysInfo, "Playstation Driver", ps1ver);
    sysInfo = newObj(sysInfo, "Region", ConsoleRegion);
    sysInfo = newObj(sysInfo, SYSINFO_TYPE[DATA.LANGUAGE], consoleType);
    sysInfo = newObj(sysInfo, SYSINFO_BDATE[DATA.LANGUAGE], formattedDate);

    DATA.DASH_STATE = "IDLE_MESSAGE_FADE_IN";
    DATA.OVSTATE = "MESSAGE_IN";
    DATA.MESSAGE_INFO =
    {
        Icon: 8,
        Title: DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Name,
        BG: false,
        Type: "INFO",
        Data: sysInfo,
        BACK_BTN: true,
        ENTER_BTN: false,
    };
}

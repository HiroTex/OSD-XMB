//////////////////////////////////////////////////////////////////////////
///*				   		 ENCLOSE START							  *///
//////////////////////////////////////////////////////////////////////////

export const Plugin = (() => { 	// DO NOT REMOVE, Encloses plugin on a local scope //

//////////////////////////////////////////////////////////////////////////
///*				   		 CUSTOM STRINGS							  *///
//////////////////////////////////////////////////////////////////////////

const NAME_MAIN =
[
	"Game Settings",
	"Paramètres de jeu",
	"Ajustes de Juego",
	"Spiel-Einstellungen",
	"Impostazioni del gioco",
	"Game-instellingen",
	"Definições de jogo",
];

const DESC_MAIN =
[
	"Adjusts settings for games.",
	"Réglez les paramètres des jeux.",
	"Ajusta la configuración de los juegos.",
	"Einstellungen für Spiele anpassen.",
	"Regola le impostazioni dei giochi.",
	"Pas de instellingen voor games aan.",
	"Ajuste as configurações dos jogos.",
];

const NAME_SETA =
[
	"PS - Upscaler",
	"PS - Rehaussement",
	"PS - Mejorar resolución",
	"PS - Hochskalierer",
	"PS - Potenziatore risoluzione",
	"PS - Upscalen",
	"PS - Melhorar resolução",
];

const NAME_SETB =
[
	"PS - Smoothing",
	"PS - Lissage",
	"PS - Suavizado",
	"PS - Glättung",
	"PS - Smussatura",
	"PS - Smoothing",
	"PS - Suavização",
];

const NAME_SETC =
[
	"PS - In-Game Reset Mode",
	"PS - In-Game Reset Mode",
	"PS - Modo de Reinicio",
	"PS - In-Game Reset Mode",
	"PS - In-Game Reset Mode",
	"PS - In-Game Reset Mode",
	"PS - In-Game Reset Mode",
];

const NAME_SETD =
[
	"PS - HD TV Fix",
	"PS - HD TV Fix",
	"PS - HD TV Fix",
	"PS - HD TV Fix",
	"PS - HD TV Fix",
	"PS - HD TV Fix",
	"PS - HD TV Fix",
];

const NAME_SETE =
[
	"PS - Widescreen Mode",
	"PS - Widescreen Mode",
	"PS - Modo de Pantalla ancha",
	"PS - Widescreen Mode",
	"PS - Widescreen Mode",
	"PS - Widescreen Mode",
	"PS - Widescreen Mode",
];

const NAME_SETF =
[
	"PS - Scanlines",
	"PS - Scanlines",
	"PS - Scanlines",
	"PS - Scanlines",
	"PS - Scanlines",
	"PS - Scanlines",
	"PS - Scanlines",
];

const NAME_SET1 =
[
	"PS2 Logo (Digital)",
	"PS2 Logo (Digital)",
	"Logo de PS2 (Digital)",
	"PS2 Logo (Digital)",
	"Logo PS2 (Digitali)",
	"PS2 Logo (Digital)",
	"PS2 Logo (Digital)",
];

const DESC_SET1 =
[
	"Show the PS2 logo on digital games.",
	"Show the PS2 logo on digital games",
	"Muestra el logo de Playstation 2 en juegos digitales.",
	"Zeige das PS2 Logo bei digitale Spiele.",
	"Mostra il logo PS2 nei giochi digitali.",
	"Show the PS2 logo on digital games",
	"Show the PS2 logo on digital games",
];

const NAME_SET2 =
[
	"Debug Colors",
	"Debug Colors",
	"Colores de Depuración",
	"Debug-Farben",
	"Colori di debug",
	"Debug Colors",
	"Debug Colors",
];

const DESC_SET2 =
[
	"Show the debug colors on digital games.",
	"Show the debug colors on digital games",
	"Muestra los colores de depuración en juegos digitales.",
	"Debug-Farben bei digitalen Spielen anzeigen.",
	"Mostra i colori di debug nei giochi digitali.",
	"Show the debug colors on digital games",
	"Show the debug colors on digital games",
];

//////////////////////////////////////////////////////////////////////////
///*				   		CUSTOM FUNCTIONS						  *///
//////////////////////////////////////////////////////////////////////////

function getBoolCheatContextInfo(cheat)
{
	let ctx_options = [];
	ctx_options.push({ Name: TXT_NO, Icon: -1 });
	ctx_options.push({ Name: TXT_YES, Icon: -1 });

	const cheats = [ cheat ];
	const defval = getPOPSCheat(cheats);

	// Accept Changes Function
	let _a = function(DATA, val)
	{
		let cheats = [];
		cheats.push({ code: cheat, enabled: (val === 1)});
		setPOPSCheat(cheats);
	}

	return { Options: ctx_options, Default: ((defval[0]) ? 1 : 0), ItemCount: ctx_options.length, Confirm: _a};
}

function getWSContextInfo()
{
	const cheats = [ "WIDESCREEN", "ULTRA_WIDESCREEN", "EYEFINITY"];
	let statuses = getPOPSCheat(cheats);
	let defval = (statuses[0]) ? 1 : 0;
	defval = (statuses[1]) ? 2 : defval;
	defval = (statuses[2]) ? 3 : defval;

	let ctx_options = [];
	ctx_options.push({ Name: TXT_NO, Icon: -1 });
	ctx_options.push({ Name: "16:9", Icon: -1 });
	ctx_options.push({ Name: "Ultra", Icon: -1 });
	ctx_options.push({ Name: "x3", Icon: -1 });

	// Accept Changes Function
	let _a = function(DATA, val)
	{
		const cheats = [];
		cheats.push({ code: "WIDESCREEN", enabled: (val === 1)});
		cheats.push({ code: "ULTRA_WIDESCREEN", enabled: (val === 2)});
		cheats.push({ code: "EYEFINITY", enabled: (val === 3)});
		setPOPSCheat(cheats);
	}

	return { Options: ctx_options, Default: defval, ItemCount: ctx_options.length, Confirm: _a};
}

function getIGRContextInfo()
{
	const cheats = [ "NOIGR", "IGR0", "IGR1", "IGR2", "IGR3", "IGR4", "IGR5" ]
	let statuses = getPOPSCheat(cheats);
	let defval = (statuses[0]) ? 7 : 0;
	defval = (statuses[1]) ? 1 : defval;
	defval = (statuses[2]) ? 2 : defval;
	defval = (statuses[3]) ? 3 : defval;
	defval = (statuses[4]) ? 4 : defval;
	defval = (statuses[5]) ? 5 : defval;
	defval = (statuses[6]) ? 6 : defval;

	let ctx_options = [];
	ctx_options.push({ Name: "Default", Icon: -1 });
	for (let i = 0; i < 6; i++)
	{
		ctx_options.push({ Name: i.toString(), Icon: -1 });
	}
	ctx_options.push({ Name: TXT_NO, Icon: -1 });

	// Accept Changes Function
	let _a = function(DATA, val)
	{
		const cheats = [];
		cheats.push({ code: "IGR0", enabled: (val === 1)});
		cheats.push({ code: "IGR1", enabled: (val === 2)});
		cheats.push({ code: "IGR2", enabled: (val === 3)});
		cheats.push({ code: "IGR3", enabled: (val === 4)});
		cheats.push({ code: "IGR4", enabled: (val === 5)});
		cheats.push({ code: "IGR5", enabled: (val === 6)});
		cheats.push({ code: "NOIGR", enabled: (val === 7)});
		setPOPSCheat(cheats);
	}

	return { Options: ctx_options, Default: defval, ItemCount: ctx_options.length, Confirm: _a};
}

function getLogoContextInfo()
{
	let ctx_options = [];
	ctx_options.push({ Name: TXT_NO, Icon: -1 });
	ctx_options.push({ Name: TXT_YES, Icon: -1 });

	// Accept Changes Function
	let _a = function(DATA, val)
	{
		DATA.GAMESETS.LOGO = (val == 1);
		let config = DATA.CONFIG.Get("neutrino.cfg");
		config["logo"] = DATA.GAMESETS.LOGO.toString();
		DATA.CONFIG.Push("neutrino.cfg", config);
	}

	return { Options: ctx_options, Default: ((DATA.GAMESETS.LOGO) ? 1 : 0), ItemCount: ctx_options.length, Confirm: _a};
}

function getDbcContextInfo()
{
	let ctx_options = [];
	ctx_options.push({ Name: TXT_NO, Icon: -1 });
	ctx_options.push({ Name: TXT_YES, Icon: -1 });

	// Accept Changes Function
	let _a = function(DATA, val)
	{
		DATA.GAMESETS.DBC = (val == 1);
		let config = DATA.CONFIG.Get("neutrino.cfg");
		config["dbc"] = DATA.GAMESETS.DBC.toString();
		DATA.CONFIG.Push("neutrino.cfg", config);
	}

	return { Options: ctx_options, Default: ((DATA.GAMESETS.DBC) ? 1 : 0), ItemCount: ctx_options.length, Confirm: _a};
}

function addOption(options, name, desc, val)
{
	options.push({
		Name: name,
		Description: desc,
		Icon: 15,
		Type: "CONTEXT",
		Value: val,
	});

	return options;
}

function getOptions()
{
	let options = [];

	let config = DATA.CONFIG.Get("neutrino.cfg");

	if ("logo" in config) { DATA.GAMESETS.LOGO = (config["logo"] === "true"); }
	if ("dbc" in config) { DATA.GAMESETS.DBC = (config["dbc"] === "true"); }

	options = addOption(options, NAME_SET1, DESC_SET1, getLogoContextInfo());
	options = addOption(options, NAME_SET2, DESC_SET2, getDbcContextInfo());
	options = addOption(options, NAME_SETA, "", getBoolCheatContextInfo("480p"));
	options = addOption(options, NAME_SETB, "", getBoolCheatContextInfo("SMOOTH"));
	options = addOption(options, NAME_SETC, "", getIGRContextInfo());
	options = addOption(options, NAME_SETD, "", getBoolCheatContextInfo("HDTVFIX"));
	options = addOption(options, NAME_SETE, "", getWSContextInfo());
	options = addOption(options, NAME_SETF, "", getBoolCheatContextInfo("SCANLINES"));

	return { Options: options, Default: 0, ItemCount: options.length };
}

//////////////////////////////////////////////////////////////////////////
///*				   		MAIN PLUGIN DATA						  *///
///																	   ///
/// 	Here is the main info that will be retrieved by the App.   	   ///
//////////////////////////////////////////////////////////////////////////

const Info = {
	Name: NAME_MAIN,
	Description: DESC_MAIN,
	Icon: 7,
	Category: 1,
	Type: "SUBMENU",
	Value: getOptions(),
};

return Info;

//////////////////////////////////////////////////////////////////////////
///*				   		   ENCLOSE END							  *///
//////////////////////////////////////////////////////////////////////////

})(); // DO NOT REMOVE, Encloses plugin on a local scope //

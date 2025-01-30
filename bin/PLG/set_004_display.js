//////////////////////////////////////////////////////////////////////////
///*				   		 ENCLOSE START							  *///
//////////////////////////////////////////////////////////////////////////

export const Plugin = (() => { 	// DO NOT REMOVE, Encloses plugin on a local scope //

//////////////////////////////////////////////////////////////////////////
///*				   		 CUSTOM STRINGS							  *///
//////////////////////////////////////////////////////////////////////////

const NAME_MAIN =
[
	"Display Settings",
	"Paramètres affichage",
	"Ajustes de Pantalla",
	"Anzeige-Einstellungen",
	"Impostazioni di visualizzazione",
	"Beeldscherminstellingen",
	"Definições de Apresentação",
];

const DESC_MAIN =
[
	"Adjusts settings for video output.",
	"Réglez les paramètres de sortie vidéo.",
	"Ajusta la configuración de salida de vídeo.",
	"Einstellungen für die Videoausgabe anpassen.",
	"Regola le impostazioni dell'uscita video.",
	"Pas de instellingen voor video-uitvoer aan.",
	"Ajuste as configurações de saída de vídeo.",
];

const NAME_SET1 =
[
	"Video Output Mode",
	"Paramètres de sortie vidéo",
	"Modo de Salida de Video",
	"Anzeigemodus",
	"Impostazioni video",
	"Instellingen video-uitvoer",
	"Definições de Saída de Vídeo",
];

const DESC_SET1 =
[
	"Set the video output display mode.",
	"Définir le mode d'affichage de sortie vidéo.",
	"Ajusta el modo de salida de video.",
	"Setze den Anzeigemodus",
	"Seleziona la modalità dell'uscita video.",
	"Stel de video-uitvoermodus in.",
	"Definir o modo de exibição de saída de vídeo.",
];

const NAME_SET2 =
[
	"TV Type",
	"Type de TV",
	"Tipo de TV",
	"Typ des TV",
	"Tipo di TV",
	"TV-type",
	"Tipo de TV",
];

const DESC_SET2 =
[
	"Select the type of TV in use.",
	"Sélectionnez le type de TV utilisé.",
	"Selecciona el tipo de TV en uso.",
	"Wähle den Typ des genutzten TV.",
	"Seleziona il tipo di TV utilizzata.",
	"Selecteer het type TV dat wordt gebruikt.",
	"Seleccione o tipo de TV utilizada.",
];

//////////////////////////////////////////////////////////////////////////
///*				   		CUSTOM FUNCTIONS						  *///
//////////////////////////////////////////////////////////////////////////

function getVmodeContextInfo()
{
	let def_val = 0;
	let dir_options = [];

	for (let i = 0; i < 6; i++)
	{
		dir_options.push({ Name: vmodes[i].Name, Icon: -1 });
	}

	switch(DATA.CANVAS.mode)
	{
		case NTSC: def_val = 0; break;
		case PAL: def_val = 1; break;
		case DTV_480p: def_val = 2; break;
		case DTV_576p: def_val = 3; break;
		case DTV_720p: def_val = 4; break;
		case DTV_1080i: def_val = 5; break;
	}

	let _a = function(DATA, val)
	{
		if (DATA.CANVAS.mode != vmodes[val].Value)
		{
			DATA.CANVAS.mode = vmodes[val].Value;
			Screen.setMode(DATA.CANVAS);
			DATA.DASH_STATE = "SUBMENU_CONTEXT_MESSAGE_FADE_OUT";
			DATA.OVSTATE = "MESSAGE_IN";
			DATA.MESSAGE_INFO =
			{
				Icon: 11,
				Title: NAME_SET1,
				BG: false,
				Type: "VMODE",
				BACK_BTN: false,
				ENTER_BTN: true,
			};
		}
	}

	return { Options: dir_options, Default: def_val, ItemCount: dir_options.length, Confirm: _a, };
}

function getTvTypeContextInfo()
{
	let dir_options = [];
	dir_options.push({ Name: "4:3", Icon: -1 });
	dir_options.push({ Name: "16:9", Icon: -1 });

	let _a = function(DATA, val)
	{
		DATA.WIDESCREEN = (val == 1);
		DATA.CANVAS.width = (DATA.WIDESCREEN) ? 736 : 640;
		Screen.setMode(DATA.CANVAS);

		let config = DATA.CONFIG.Get("main.cfg");
		config["aspect"] = DATA.WIDESCREEN.toString();
		DATA.CONFIG.Push("main.cfg", config);
	}

	return { Options: dir_options, Default: Number(DATA.WIDESCREEN), ItemCount: dir_options.length, Confirm: _a, };
}

function getOptions()
{
	let opts = [];

	opts.push({
		Name: NAME_SET1,
		Description: DESC_SET1,
		Icon: 15,
		Type: "CONTEXT",
		Value: getVmodeContextInfo(),
	});
	opts.push({
		Name: NAME_SET2,
		Description: DESC_SET2,
		Icon: 15,
		Type: "CONTEXT",
		Value: getTvTypeContextInfo(),
	});

	return { Options: opts, Default: 0, ItemCount: opts.length };
}

//////////////////////////////////////////////////////////////////////////
///*				   		MAIN PLUGIN DATA						  *///
///																	   ///
/// 	Here is the main info that will be retrieved by the App.   	   ///
//////////////////////////////////////////////////////////////////////////

const Info = {
	Name: NAME_MAIN,
	Description: DESC_MAIN,
	Icon: 11,
	Category: 1,
	Type: "SUBMENU",
	Value: getOptions(),
};

return Info;

//////////////////////////////////////////////////////////////////////////
///*				   		   ENCLOSE END							  *///
//////////////////////////////////////////////////////////////////////////

})(); // DO NOT REMOVE, Encloses plugin on a local scope //

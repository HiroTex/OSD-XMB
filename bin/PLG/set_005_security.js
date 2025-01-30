//////////////////////////////////////////////////////////////////////////
///*				   		 ENCLOSE START							  *///
//////////////////////////////////////////////////////////////////////////

export const Plugin = (() => { 	// DO NOT REMOVE, Encloses plugin on a local scope //

//////////////////////////////////////////////////////////////////////////
///*				   		 CUSTOM STRINGS							  *///
//////////////////////////////////////////////////////////////////////////

const NAME_MAIN =
[
	"Security Settings",
	"Paramètres sécurité",
	"Ajustes de Seguridad",
	"Sicherheits-Einstellungen",
	"Impostazioni di sicurezza",
	"Beveiligingsinstellingen",
	"Definições de Segurança"
];

const DESC_MAIN =
[
	"Adjusts parental control settings.",
	"Réglez les paramètres de contrôle parental.",
	"Ajusta la configuración de control parental.",
	"Einstellungen für die Kindersicherung anpassen.",
	"Regola le impostazioni di controllo parentale.",
	"Pas de instellingen voor ouderlijk toezicht aan.",
	"Ajuste as configurações de controle parental.",
];

const NAME_SET1 =
[
	"Change Password",
	"Changer le mot de passe",
	"Cambiar contraseña",
	"Passwort ändern",
	"Modifica la password",
	"Wachtwoord wijzigen",
	"Mudar a palavra-passe",
];

const NAME_SET2 =
[
	"Parental Control",
	"Contrôle parental",
	"Control paterno",
	"Kindersicherung",
	"Filtro contenuti",
	"Ouderlijk toezicht",
	"Controlo parental",
];

//////////////////////////////////////////////////////////////////////////
///*				   		CUSTOM FUNCTIONS						  *///
//////////////////////////////////////////////////////////////////////////

function SetParentalControlCode()
{
	DATA.DASH_STATE = "IDLE_MESSAGE_FADE_IN";
	DATA.OVSTATE = "MESSAGE_IN";
	DATA.MESSAGE_INFO =
	{
		Icon: 12,
		Title: NAME_SET1,
		BG: false,
		Type: "PARENTAL_SET",
		BACK_BTN: true,
		ENTER_BTN: true,
	};
}

function getParentalControlContextInfo()
{
	let dir_options = [];
	dir_options.push({ Name: TXT_NO, Icon: -1 });
	dir_options.push({ Name: TXT_YES, Icon: -1 });

	let _a = function(DATA, val)
	{
		DATA.PARENTAL = (val == 1);
		let config = DATA.CONFIG.Get("main.cfg");
		config["parental"] = DATA.PARENTAL.toString();
		DATA.CONFIG.Push("main.cfg", config);
	}

	return { Options: dir_options, Default: Number(DATA.PARENTAL), ItemCount: dir_options.length, Confirm: _a, };
}

function getOptions()
{
	const opts = [];

	opts.push({
		Name: NAME_SET1,
		Description: "",
		Icon: 15,
		Type: "CODE",
		Value: SetParentalControlCode,
	});

	opts.push({
		Name: NAME_SET2,
		Description: "",
		Icon: 15,
		Type: "CONTEXT",
		Value: getParentalControlContextInfo(),
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
	Icon: 12,
	Category: 1,
	Type: "SUBMENU",
	Value: getOptions(),
};

return Info;

//////////////////////////////////////////////////////////////////////////
///*				   		   ENCLOSE END							  *///
//////////////////////////////////////////////////////////////////////////

})(); // DO NOT REMOVE, Encloses plugin on a local scope //

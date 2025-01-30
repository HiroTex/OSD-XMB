//////////////////////////////////////////////////////////////////////////
///*				   		 ENCLOSE START							  *///
//////////////////////////////////////////////////////////////////////////

export const Plugin = (() => { 	// DO NOT REMOVE, Encloses plugin on a local scope //

//////////////////////////////////////////////////////////////////////////
///*				   		 CUSTOM STRINGS							  *///
//////////////////////////////////////////////////////////////////////////

const NAME_MAIN =
[
	"Date and Time Settings",
	"Paramètres date et heure",
	"Ajustes de Fecha y Hora",
	"Datums- und Zeit-Einstellungen",
	"Impostazioni di data e ora",
	"Datum- en tijdinstellingen",
	"Definições de Data e Hora",
];

const DESC_MAIN =
[
	"Adjust date and time settings.",
	"Réglez les paramètres de date et d'heure.",
	"Ajusta la configuración de fecha y hora.",
	"Datum- und Uhrzeiteinstellungen anpassen.",
	"Regola le impostazioni di data e ora.",
	"Pas de instellingen voor datum en tijd aan.",
	"Ajuste as configurações de data e hora.",
];

const NAME_SET1 =
[
	"Date Format",
	"Affichage de la date",
	"Formato de la fecha",
	"Datumsdarstellung",
	"Formato della data",
	"Datumweergave",
	"Formato da Data",
];

const DESC_SET1 =
[
	"Set the order of display.",
	"Pour définir l'ordre d'affichage.",
	"Permite ajustar el orden de visualización.",
	"Stellen Sie die Reihenfolge der Anzeige.",
	"Seleziona l'ordine di visualizzazione.",
	"Set the order of display.",
	"Define a ordem de apresentação.",
];

const NAME_SET2 =
[
	"Time Format",
	"Affichage de l'heure",
	"Formato de Hora",
	"Zeitdarstellung",
	"Formato dell'ora",
	"Tijdweergave",
	"Formato da Hora",
];

const DESC_SET2 =
[
	"Set the time display format.",
	"Pour choisir d'afficher l'heure sur une horloge de 12 ou de 24 heures.",
	"Establece el tipo de reloj de 12 horas o 24 horas.",
	"Setze das Zeitfomat.",
	"Seleziona il formato dell'ora.",
	"De tijdweergave op een 12- of 24-uursklok instellen.",
	"Define a apresentação da hora em relógio de 12 ou de 24 horas.",
];

//////////////////////////////////////////////////////////////////////////
///*				   		CUSTOM FUNCTIONS						  *///
//////////////////////////////////////////////////////////////////////////

function GetDateFormatContextInfo()
{
	let ctx_options = [];
	ctx_options.push({ Name: "DD-MM-YYYY", Icon: -1 });
	ctx_options.push({ Name: "MM-DD-YYYY", Icon: -1 });

	// Accept Changes Function
	let _a = function(DATA, val)
	{
		DATA.DATE_FORMAT = val;
		let config = DATA.CONFIG.Get("main.cfg");
		config["dateFormat"] = val.toString();
		DATA.CONFIG.Push("main.cfg", config);
	}

	return { Options: ctx_options, Default: DATA.DATE_FORMAT, ItemCount: ctx_options.length, Confirm: _a};
}

function GetHourFormatContextInfo()
{
	let ctx_options = [];
	ctx_options.push({ Name: "12-Hour", Icon: -1 });
	ctx_options.push({ Name: "24-Hour", Icon: -1 });

	// Accept Changes Function
	let _a = function(DATA, val)
	{
		DATA.HOUR_FORMAT = val;
		let config = DATA.CONFIG.Get("main.cfg");
		config["hourFormat"] = val.toString();
		DATA.CONFIG.Push("main.cfg", config);
	}

	return { Options: ctx_options, Default: DATA.HOUR_FORMAT, ItemCount: ctx_options.length, Confirm: _a};
}

function getOptions()
{
	let options = [];

	options.push({
		Name: NAME_SET1,
		Description: DESC_SET1,
		Icon: 15,
		Type: "CONTEXT",
		Value: GetDateFormatContextInfo(),
	});

	options.push({
		Name: NAME_SET2,
		Description: DESC_SET2,
		Icon: 15,
		Type: "CONTEXT",
		Value: GetHourFormatContextInfo(),
	});

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
	Icon: 10,
	Category: 1,
	Type: "SUBMENU",
	Value: getOptions(),
};

return Info;

//////////////////////////////////////////////////////////////////////////
///*				   		   ENCLOSE END							  *///
//////////////////////////////////////////////////////////////////////////

})(); // DO NOT REMOVE, Encloses plugin on a local scope //

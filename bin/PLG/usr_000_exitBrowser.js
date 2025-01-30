//////////////////////////////////////////////////////////////////////////
///*				   		 ENCLOSE START							  *///
//////////////////////////////////////////////////////////////////////////

export const Plugin = (() => { 	// DO NOT REMOVE, Encloses plugin on a local scope //

//////////////////////////////////////////////////////////////////////////
///*				   		 CUSTOM STRINGS							  *///
//////////////////////////////////////////////////////////////////////////

const NAME_MAIN =
[
	"Exit to Browser",
	"Quitter vers le navigateur",
	"Salir al navegador",
	"Zum Browser zurückkehren",
	"Esci al Browser",
	"Verlaten naar de browser",
	"Sair para o Navegador",
];

//////////////////////////////////////////////////////////////////////////
///*				   		MAIN PLUGIN DATA						  *///
///																	   ///
/// 	Here is the main info that will be retrieved by the App.   	   ///
//////////////////////////////////////////////////////////////////////////

const Info = {
	Name: NAME_MAIN,
	Description: "",
	Icon: 19,
	Category: 0,
	Type: "CODE",
	Value: (DATA) => // This will be executed as soon as the item is selected.
	{
		// Set the current Dashboard state to fade out, in order to go to
		// the 'exit()' function.

		DATA.DASH_STATE = "FADE_OUT";

		// Set the Custom Function to be executed once the 'exit()' function finishes.

		DATA.CUSTOM_FUNCTION = function()
		{
			Draw.rect(0, 0, DATA.CANVAS.width, DATA.CANVAS.height, Color.new(0, 0, 0, 128));
			System.exitToBrowser();
		}
	},
};

return Info;

//////////////////////////////////////////////////////////////////////////
///*				   		   ENCLOSE END							  *///
//////////////////////////////////////////////////////////////////////////

})(); // DO NOT REMOVE, Encloses plugin on a local scope //

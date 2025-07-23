//////////////////////////////////////////////////////////////////////////
///*				   			   PADS								  *///
/// 				   		  										   ///
///		This handles all the events that occur when a button is		   ///
///							pressed or hold.						   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

let PADEVENTS = {};		// Object with Pad Events for each button.
const PadSettings = {};
PadSettings.Mode = 0;
PadSettings.Port = 0;

const pad = Pads.get(PadSettings.Port);

function PadsHandler() {
	PadSettings.ConfirmButton = (UserConfig.ConfirmBtn === 0) ? Pads.CROSS : Pads.CIRCLE;
	PadSettings.CancelButton = (UserConfig.ConfirmBtn === 0) ? Pads.CIRCLE : Pads.CROSS;

	const checkStates = (BUTTON) => {
		return (pad.justPressed(BUTTON) || pad.pressed(BUTTON));
	};

	pad.update();

		 if ((PADEVENTS.ACCEPT) 	&& (pad.justPressed(PadSettings.ConfirmButton))) 	{ PADEVENTS.ACCEPT(); }
    else if ((PADEVENTS.CANCEL) 	&& (pad.justPressed(PadSettings.CancelButton))) 	{ PADEVENTS.CANCEL(); }
	else if ((PADEVENTS.SQUARE)		&& (pad.justPressed(Pads.SQUARE)))					{ PADEVENTS.SQUARE(); }
    else if ((PADEVENTS.TRIANGLE) 	&& (pad.justPressed(Pads.TRIANGLE))) 				{ PADEVENTS.TRIANGLE(); }
    else if ((PADEVENTS.LEFT) 		&& (checkStates(Pads.LEFT))) 						{ PADEVENTS.LEFT(); }
    else if ((PADEVENTS.RIGHT) 		&& (checkStates(Pads.RIGHT))) 						{ PADEVENTS.RIGHT(); }
    else if ((PADEVENTS.UP) 		&& (checkStates(Pads.UP))) 							{ PADEVENTS.UP(); }
    else if ((PADEVENTS.DOWN) 		&& (checkStates(Pads.DOWN))) 						{ PADEVENTS.DOWN(); }

		 if ((pad.lx < -64) && (PADEVENTS.LEFT)) 	{ PADEVENTS.LEFT(); }
	else if ((pad.lx >  64) && (PADEVENTS.RIGHT)) 	{ PADEVENTS.RIGHT(); }
	else if ((pad.ly < -64) && (PADEVENTS.UP)) 		{ PADEVENTS.UP(); }
	else if ((pad.ly >  64) && (PADEVENTS.DOWN)) 	{ PADEVENTS.DOWN(); }
}
function ClearPadEvents() {
    // Reset the Object.

    PADEVENTS = {
        ACCEPT: false,
        CANCEL: false,
		SQUARE: false,
        TRIANGLE: false,
        LEFT: false,
        RIGHT: false,
        UP: false,
        DOWN: false,
        L1: false,
        R1: false,
        L2: false,
        R2: false,
        START: false,
    }
}
function SetDashPadEvents(MODE) {
	PadSettings.Mode = MODE;
	ClearPadEvents(); // Any time a Mode changes, clean the existing events.
    switch(MODE) {
        case 1:	SetPadEvents_Main(); break;			// Mode 1: Pad Events for main dashboard.
        case 2: SetPadEvents_Sub();	break;			// Mode 2: Pad Events for Sub Menus.
        case 3: SetPadEvents_Context(); break;		// Mode 3: Pad Events for Context Menus.
        case 4: SetPadEvents_Message(); break;		// Mode 4: Pad Events for Overlay Messages.
    }
}
function SetPadEvents_Main() {
	PADEVENTS.ACCEPT 	= () => {
		if (DashUI.Items.Current >= DashUI.ItemCollection.length) { return; }
		ExecuteItem(DashUI.ItemCollection.Current[DashUI.Items.Current]);
	};

	PADEVENTS.TRIANGLE  = () => { OpenOptionBox(DashUI.ItemCollection.Current[DashUI.Items.Current]) };

	PADEVENTS.LEFT  	= () => UIAnimationCategoryMove_Start(-1);
	PADEVENTS.RIGHT 	= () => UIAnimationCategoryMove_Start(1);
	PADEVENTS.UP 		= () => UIAnimationCategoryItemsMove_Start(-1);
	PADEVENTS.DOWN 		= () => UIAnimationCategoryItemsMove_Start(1);
}
function SetPadEvents_Sub() {
	PADEVENTS.ACCEPT 	= () => {
		const Items = DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level].Items;
		if (DashUI.SubMenu.Items.Current >= Items.length) { return; }
		ExecuteItem(Items[DashUI.SubMenu.Items.Current]);
	};

	PADEVENTS.TRIANGLE  = () => { OpenOptionBox(DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level].Items[DashUI.SubMenu.Items.Current]) };

	PADEVENTS.CANCEL 	= () => DashUIBackFromSubMenu();
	PADEVENTS.LEFT  	= () => DashUIBackFromSubMenu();
	PADEVENTS.UP 		= () => UIAnimationSubMenuItemsMove_Start(-1);
	PADEVENTS.DOWN 		= () => UIAnimationSubMenuItemsMove_Start(1);
}
function SetPadEvents_Context() {
	PADEVENTS.ACCEPT	= () => DashUISelectContextItem();
	PADEVENTS.CANCEL 	= () => DashUIBackFromContextMenu();
	PADEVENTS.UP 		= () => UIAnimationContextMenuItemsMove_Start(-1);
	PADEVENTS.DOWN 		= () => UIAnimationContextMenuItemsMove_Start(1);
}
function SetPadEvents_Message() {
	if (DashUI.Dialog.Data[DashUI.Dialog.Level].ENTER_BTN) { PADEVENTS.ACCEPT 	= () => { if ('Confirm' in DashUI.Dialog.Data[DashUI.Dialog.Level]) { DashUI.Dialog.Data[DashUI.Dialog.Level].Confirm(); } }; }
	if (DashUI.Dialog.Data[DashUI.Dialog.Level].BACK_BTN)  { PADEVENTS.CANCEL 	= () => UIAnimationDialogFade_Start(false); }
}
function SetPadEvents_Parental() {
    PADEVENTS.LEFT 		= () => UIAnimationDialogMove_Start(-1, 4);
    PADEVENTS.RIGHT 	= () => UIAnimationDialogMove_Start(1, 4);
    PADEVENTS.UP 		= () => UIAnimationParentalDialogChange_Start(1);
    PADEVENTS.DOWN 		= () => UIAnimationParentalDialogChange_Start(-1);
}
function SetPadEvents_Confirmation() {
    PADEVENTS.LEFT 		= () => UIAnimationDialogMove_Start(-1, 2);
    PADEVENTS.RIGHT 	= () => UIAnimationDialogMove_Start(1, 2);
}
function SetPadEvents_Information() {
    PADEVENTS.LEFT 		= () => UIAnimationDialogInfoMove_Start(-1);
    PADEVENTS.RIGHT 	= () => UIAnimationDialogInfoMove_Start(1);
    PADEVENTS.UP 		= () => {
		const data = DashUI.Dialog.Data[DashUI.Dialog.Level];
		let next = 0;
		for (let i = data.Selected - 1; i > -1; i--) {
			if (data.Info[i].Selectable) { next = i; break; }
		}
		if (next !== 0) { UIAnimationDialogMove_Start(next - data.Selected, data.Info.length); }
	}
    PADEVENTS.DOWN 		= () => {
		const data = DashUI.Dialog.Data[DashUI.Dialog.Level];
		let next = 0;
		for (let i = data.Selected + 1; i < data.Info.length; i++) {
			if (data.Info[i].Selectable) { next = i; break; }
		}
		if (next !== 0) { UIAnimationDialogMove_Start(next - data.Selected, data.Info.length); }
	}
}

//////////////////////////////////////////////////////////////////////////
///*				   			 Init Work							  *///
//////////////////////////////////////////////////////////////////////////

SetDashPadEvents(0);
console.log("INIT LIB: PADS COMPLETE");

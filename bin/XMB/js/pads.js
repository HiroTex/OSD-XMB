//////////////////////////////////////////////////////////////////////////
///*				   			   PADS								  *///
/// 				   		  										   ///
///		This handles all the events that occur when a button is		   ///
///							pressed or hold.						   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

let PADEVENTS = {};		// Object with Pad Events for each button.
const pad = Pads.get(0);

function padHandler()
{
    pad.update();
    let accbtn = (DATA.BTNTYPE) ? Pads.CIRCLE : Pads.CROSS;
    let cnlbtn = (DATA.BTNTYPE) ? Pads.CROSS : Pads.CIRCLE;

    if ((PADEVENTS.ACCEPT) && (pad.justPressed(accbtn)))
    {
        PADEVENTS.ACCEPT();
    }
    else if ((PADEVENTS.CANCEL) && (pad.justPressed(cnlbtn)))
    {
        PADEVENTS.CANCEL();
    }
    else if ((PADEVENTS.TRIANGLE) && (pad.justPressed(Pads.TRIANGLE)))
    {
        PADEVENTS.TRIANGLE();
    }
    else if ((PADEVENTS.LEFT) && (pad.justPressed(Pads.LEFT)))
    {
        PADEVENTS.LEFT();
    }
    else if ((PADEVENTS.LEFT) && (pad.pressed(Pads.LEFT)) && (DATA.DASH_MOVE_FRAME > 8))
    {
        PADEVENTS.LEFT();
    }
    else if ((PADEVENTS.RIGHT) && (pad.justPressed(Pads.RIGHT)))
    {
        PADEVENTS.RIGHT();
    }
    else if ((PADEVENTS.RIGHT) && (pad.pressed(Pads.RIGHT)) && (DATA.DASH_MOVE_FRAME > 8))
    {
        PADEVENTS.RIGHT();
    }
    else if ((PADEVENTS.UP) && (pad.justPressed(Pads.UP)))
    {
        PADEVENTS.UP();
    }
    else if ((PADEVENTS.UP) && (pad.pressed(Pads.UP)) && (DATA.DASH_MOVE_FRAME > 8))
    {
        PADEVENTS.UP();
    }
    else if ((PADEVENTS.DOWN) && (pad.justPressed(Pads.DOWN)))
    {
        PADEVENTS.DOWN();
    }
    else if ((PADEVENTS.DOWN) && (pad.pressed(Pads.DOWN)) && (DATA.DASH_MOVE_FRAME > 8))
    {
        PADEVENTS.DOWN();
    }
}

// This will reset all pad events to avoid the user from doing an input when shouldn't.

function ClearPadEvents()
{
    // Clear all existing events if any

    /* This should be used if PadEvents is active.

    if (PADEVENTS.ACCEPT) { Pads.deleteEvent(PADEVENTS.ACCEPT); }
    if (PADEVENTS.CANCEL) { Pads.deleteEvent(PADEVENTS.CANCEL); }
    if (PADEVENTS.TRIANGLE) { Pads.deleteEvent(PADEVENTS.TRIANGLE); }
    if (PADEVENTS.LEFT) { Pads.deleteEvent(PADEVENTS.LEFT); }
    if (PADEVENTS.RIGHT) { Pads.deleteEvent(PADEVENTS.RIGHT); }
    if (PADEVENTS.UP) { Pads.deleteEvent(PADEVENTS.UP); }
    if (PADEVENTS.DOWN) { Pads.deleteEvent(PADEVENTS.DOWN); }
    if (PADEVENTS.L1) { Pads.deleteEvent(PADEVENTS.L1); }
    if (PADEVENTS.R1) { Pads.deleteEvent(PADEVENTS.R1); }
    if (PADEVENTS.L2) { Pads.deleteEvent(PADEVENTS.L2); }
    if (PADEVENTS.R2) { Pads.deleteEvent(PADEVENTS.R2); }

    */

    // Reset the Object.

    PADEVENTS =
    {
        ACCEPT: false,
        CANCEL: false,
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

// Main Handler to set Pad Events on a certain state.

function SetDashPadEvents(MODE)
{
    DATA.DASH_PADMODE = MODE; // Update the current Pad Event Mode.
    switch(DATA.DASH_PADMODE)
    {
        case 0: ClearPadEvents(); break;			// Mode 0: No Pad Events.
        case 1:	SetPadEvents_Main(); break;			// Mode 1: Pad Events for main dashboard.
        case 2: SetPadEvents_Sub();	break;			// Mode 2: Pad Events for Sub Menus.
        case 3: SetPadEvents_Context(); break;		// Mode 3: Pad Events for Context Menus.
        case 4: SetPadEvents_Message(); break;		// Mode 4: Pad Events for Overlay Messages.
    }
}

// Generic Function to open a Sub Menu if Triangle was Pressed.

function OpenSubMenu(obj, state)
{
    // Only Enter if there is a valid "Option" Object on the Current Item Selected.
    if ((obj) && ("Option" in obj))
    {
        // Set Dash Context Menu Object Information and change State.
        SetDashContext(obj.Option, state);
        optBoxA = 419; // Set Max visibility to start dissapearing.
    }
}

// Sets the Pad Events for the Main Dashboard.

function SetPadEvents_Main()
{
    // Function to Move Left or Right and change Category.

    const DashMovementLR = function(direction)
    {
        playCursorSFX();
        DATA.DASH_CURCAT = DATA.DASH_CURCAT + direction; // Update selected category.

        // Set the new selected item to the new Category's default, or -1 if no items are found there.
        if (DASH_CAT[DATA.DASH_CURCAT].Options.length < 1) { DATA.DASH_CUROPT = -1; }
        else { DATA.DASH_CUROPT = DASH_CAT[DATA.DASH_CURCAT].Default; }

        // Set the new State and reset the Animation Frame.
        DATA.DASH_STATE = (direction < 0) ? "MOVE_BACK" : "MOVE_FORWARD";
        DATA.DASH_MOVE_FRAME = 0;
        optBoxA = 0;                    // Reset the Option Box visibility.
        DATA.BGTMPIMG = false;          // Reset the Temporary Background Image.
        DATA.BGIMGTMPSTATE = 0;         // Reset the Temporary Background Image State.
    };

    // Function to Move Up or Down and change Item.

    const DashMovementUD = function(direction)
    {
        playCursorSFX();
        DATA.DASH_CUROPT = DATA.DASH_CUROPT + direction; // Update the current selected item.
        DASH_CAT[DATA.DASH_CURCAT].Default = DATA.DASH_CUROPT; // Update the default item of the current category.

        // Set the new State and reset the Animation Frame.
        DATA.DASH_STATE = (direction < 0) ? "MOVE_UP" : "MOVE_DOWN";
        DATA.DASH_MOVE_FRAME = 0;
        optBoxA = 0;                    // Reset the Option Box visibility.
        DATA.BGTMPIMG = false;          // Reset the Temporary Background Image.
        DATA.BGIMGTMPSTATE = 0;         // Reset the Temporary Background Image State.
    };

    // Enter Item Selected
    let AcceptBtn = (DATA.BTNTYPE) ? Pads.CIRCLE : Pads.CROSS;
    PADEVENTS.ACCEPT = () =>
    {
        // Only execute if on a Idle state and there is a valid selected option.
        if (((DATA.DASH_STATE == "IDLE") || DATA.DASH_MOVE_FRAME > 12) && (DATA.DASH_CUROPT > -1))
        {
            DATA.DASH_MOVE_FRAME = 0; // Reset the Animation Frame
            playCursorSFX();

            // Enter to Selected Item if Parental Control is disabled or the option is Safe
            // If not, ask for Parental Code.

            const SAFE = ((!DATA.PARENTAL) || (("Safe" in DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT]) && (DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT].Safe)))
            if (SAFE) { SelectItem(); }
            else
            {
                DATA.DASH_STATE = "IDLE_MESSAGE_FADE_IN";
                DATA.OVSTATE = "MESSAGE_IN";
                DATA.MESSAGE_INFO =
                {
                    Icon: -1,
                    Title: "",
                    BG: true,
                    Type: "PARENTAL_CHECK",
                    BACK_BTN: true,
                    ENTER_BTN: true,
                };
            }
        }
    };

    // Move Back
    PADEVENTS.LEFT = () =>
    {
        // Check if previous Category is valid ID and current State is IDLE, or Moving back or forward.
        if ((DATA.DASH_CURCAT - 1) > -1 && (DATA.DASH_STATE == "IDLE" || (DATA.DASH_STATE == "MOVE_BACK" || DATA.DASH_STATE == "MOVE_FORWARD")))
        {
            DashMovementLR(-1);
        }
    };

    // Move Forward
    PADEVENTS.RIGHT = () =>
    {
        if ((DATA.DASH_CURCAT + 1) < 7 && (DATA.DASH_STATE == "IDLE" || (DATA.DASH_STATE == "MOVE_BACK" || DATA.DASH_STATE == "MOVE_FORWARD")))
        {
            DashMovementLR(1);
        }
    };

    // Move Up
    PADEVENTS.UP = () =>
    {
        if (((DATA.DASH_CUROPT - 1) > -1) && (DATA.DASH_STATE == "IDLE" || (DATA.DASH_STATE != "MOVE_BACK" && DATA.DASH_STATE != "MOVE_FORWARD")))
        {
            DashMovementUD(-1);
        }
    };

    // Move Down
    PADEVENTS.DOWN = () =>
    {
        if (((DATA.DASH_CUROPT + 1) < DASH_CAT[DATA.DASH_CURCAT].Options.length) && (DATA.DASH_STATE == "IDLE" || (DATA.DASH_STATE != "MOVE_BACK" && DATA.DASH_STATE != "MOVE_FORWARD")))
        {
            DashMovementUD(1);
        }
    };

    // Open Option Context Menu
    PADEVENTS.TRIANGLE = () =>
    {
        OpenSubMenu(DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT], "MENU_CONTEXT_IN");
    };

}

// Sets the Pad Events for Sub Menus.

function SetPadEvents_Sub()
{
    // Function to go back to either previous sub menu or to main dashboard.

    const DashSubMoveBack = function()
    {
        // Only go back if on an IDLE state.
        if ((DATA.DASH_STATE == "SUBMENU_IDLE") || (DATA.DASH_STATE == "NEW_SUBMENU_IDLE") || (DATA.DASH_MOVE_FRAME > 12))
        {
            playCancelSFX();

            // Update the current State to exit and reset the animation frame.
            DATA.DASH_STATE = (DATA.DASH_CURSUB > 0) ? "NEW_SUBMENU_OUT" : "SUBMENU_OUT";
            DATA.DASH_MOVE_FRAME = 0;
            optBoxA = 0;                    // Reset the Option Box visibility.
            DATA.BGTMPIMG = false;          // Reset the Temporary Background Image.
            DATA.BGIMGTMPSTATE = 0;         // Reset the Temporary Background Image State.
            SetDashPadEvents(0); // Disable all inputs until IDLE state again to avoid issues.
        }
    };

    // Function to go up and down and select items.

    const DashSubMoveUD = function(direction)
    {
        playCursorSFX();
        DATA.DASH_CURSUBOPT = DATA.DASH_CURSUBOPT + direction; // Update current selected sub item.
        DASH_SUB[DATA.DASH_CURSUB].Default = DATA.DASH_CURSUBOPT; // Update default sub item of this sub menu. This only works for the first level of a Sub Menu.
        DATA.DASH_STATE = (direction < 0) ? "SUBMENU_MOVE_UP" : "SUBMENU_MOVE_DOWN"; // Update the current State.
        DATA.DASH_MOVE_FRAME = 0; // Reset the Animation Frame.
        optBoxA = 0;                    // Reset the Option Box visibility.
        DATA.BGTMPIMG = false;          // Reset the Temporary Background Image.
        DATA.BGIMGTMPSTATE = 0;         // Reset the Temporary Background Image State.
    };

    // Enter Selected Item.
    let AcceptBtn = (DATA.BTNTYPE) ? Pads.CIRCLE : Pads.CROSS;
    PADEVENTS.ACCEPT = () =>
    {
        // Only enter if State is IDLE and there is a valid Item Selected.
        if (((DATA.DASH_STATE == "SUBMENU_IDLE") || (DATA.DASH_STATE == "NEW_SUBMENU_IDLE") || (DATA.DASH_MOVE_FRAME > 12)) && (DATA.DASH_CURSUBOPT > -1))
        {
            DATA.DASH_MOVE_FRAME = 0; // Reset the Animation Frame.
            playCursorSFX();

            // I could copy the Parental control behaviour here,
            // but I think having it on the main dashboard is enough.

            SelectItem();
        }
    };

    // Set the Go Back Event to both Cancel button and Left Pad.
    let CancelBtn = (DATA.BTNTYPE) ? Pads.CROSS : Pads.CIRCLE;
    PADEVENTS.CANCEL = DashSubMoveBack;
    PADEVENTS.LEFT = DashSubMoveBack;

    // Move Up and Down
    PADEVENTS.UP = () => { if (((DATA.DASH_CURSUBOPT - 1) > -1)) { DashSubMoveUD(-1); } };
    PADEVENTS.DOWN = () => { if (((DATA.DASH_CURSUBOPT + 1) < DASH_SUB[DATA.DASH_CURSUB].Options.length)) { DashSubMoveUD(1); } };

    // Open Option Context Menu
    PADEVENTS.TRIANGLE = () =>
    {
        OpenSubMenu(DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT], "SUBMENU_CONTEXT_IN");
    };
}

// Sets the Pad Events for Context (Option) Menus.

function SetPadEvents_Context()
{
    // Go Back
    let CancelBtn = (DATA.BTNTYPE) ? Pads.CROSS : Pads.CIRCLE;
    PADEVENTS.CANCEL = () =>
    {
        if ((DATA.DASH_STATE == "SUBMENU_CONTEXT") || (DATA.DASH_STATE == "MENU_CONTEXT"))
        {
            playCancelSFX();

            if ("Cancel" in DASH_CTX[DATA.DASH_CURCTXLVL])
            {
                let _f = DASH_CTX[DATA.DASH_CURCTXLVL].Cancel;
                _f(DATA, DASH_CTX[DATA.DASH_CURCTXLVL].Selected);
            }

            DATA.DASH_STATE = (DATA.DASH_STATE == "MENU_CONTEXT") ? "MENU_CONTEXT_OUT" : "SUBMENU_CONTEXT_OUT";
            DATA.DASH_MOVE_FRAME = 0;
            SetDashPadEvents(0);
        }
    };

    // Select Option
    let AcceptBtn = (DATA.BTNTYPE) ? Pads.CIRCLE : Pads.CROSS;
    PADEVENTS.ACCEPT = () =>
    {
        if ((DATA.DASH_STATE == "SUBMENU_CONTEXT") || (DATA.DASH_STATE == "MENU_CONTEXT"))
        {
            playCursorSFX();
            DATA.DASH_STATE = (DATA.DASH_STATE == "MENU_CONTEXT") ? "MENU_CONTEXT_OUT" : "SUBMENU_CONTEXT_OUT";
            DATA.DASH_MOVE_FRAME = 0;
            SetDashPadEvents(0);

            if ("Confirm" in DASH_CTX[DATA.DASH_CURCTXLVL])
            {
                const result = DASH_CTX[DATA.DASH_CURCTXLVL].Confirm(DATA, DASH_CTX[DATA.DASH_CURCTXLVL].Selected);
                if ((result !== undefined) && (result === false)) { return;	}
            }

            DASH_CTX[DATA.DASH_CURCTXLVL].Default = DASH_CTX[DATA.DASH_CURCTXLVL].Selected;
        }
    };

    // Move Up
    PADEVENTS.UP = () =>
    {
        if ((DASH_CTX[DATA.DASH_CURCTXLVL].Selected - 1) > -1)
        {
            DASH_CTX_PRWIMG = false;
            Timer.reset(DATA.DASH_CTX_TIMER);
            Timer.resume(DATA.DASH_CTX_TIMER);
            scrollIndex = 0;
            playCursorSFX();
            DASH_CTX[DATA.DASH_CURCTXLVL].Selected--;
            if (DASH_CTX[DATA.DASH_CURCTXLVL].Selected < DATA.DASH_CURCTXITMFIRST)
            {
                DATA.DASH_CURCTXITMFIRST--;
                DATA.DASH_CURCTXITMLAST--;
            }
        }
    };

    // Move Down
    PADEVENTS.DOWN = () =>
    {
        if ((DASH_CTX[DATA.DASH_CURCTXLVL].Selected + 1) < DASH_CTX[DATA.DASH_CURCTXLVL].Options.length)
        {
            DASH_CTX_PRWIMG = false;
            Timer.reset(DATA.DASH_CTX_TIMER);
            Timer.resume(DATA.DASH_CTX_TIMER);
            scrollIndex = 0;
            playCursorSFX();
            DASH_CTX[DATA.DASH_CURCTXLVL].Selected++;
            if (DASH_CTX[DATA.DASH_CURCTXLVL].Selected >= DATA.DASH_CURCTXITMLAST)
            {
                DATA.DASH_CURCTXITMFIRST++;
                DATA.DASH_CURCTXITMLAST++;
            }
        }
    };
}

// Set the Pad Events for Generic Overlay Messages.

function SetPadEvents_Message()
{
    // Only add the options to go back or enter if the Message Info has them set to true.

    if (("BACK_BTN" in DATA.MESSAGE_INFO) && (DATA.MESSAGE_INFO.BACK_BTN))
    {
        // Go Back
        let CancelBtn = (DATA.BTNTYPE) ? Pads.CROSS : Pads.CIRCLE;
        PADEVENTS.CANCEL = () =>
        {
            if (DATA.OVSTATE == "MESSAGE_IDLE")
            {
                DATA.OVSTATE = "MESSAGE_OUT";
                DATA.DASH_STATE = (DATA.DASH_STATE == "SUBMENU_MESSAGE_IDLE") ? "SUBMENU_MESSAGE_FADE_IN" : "IDLE_MESSAGE_FADE_OUT";
                DATA.DASH_MOVE_FRAME = 0;
                SetDashPadEvents(0);
                if (("Cancel" in DATA.MESSAGE_INFO) && (typeof DATA.MESSAGE_INFO.Cancel === "function"))
                {
                    DATA.MESSAGE_INFO.Cancel();
                }
            }
        };
    }

    if (("ENTER_BTN" in DATA.MESSAGE_INFO) && (DATA.MESSAGE_INFO.ENTER_BTN))
    {
        // Select Option
        let AcceptBtn = (DATA.BTNTYPE) ? Pads.CIRCLE : Pads.CROSS;
        PADEVENTS.ACCEPT = () =>
        {
            if (DATA.OVSTATE == "MESSAGE_IDLE")
            {
                console.log(`PADEVENT: Starting Message Confirm Function.`);
                DATA.OVSTATE = "MESSAGE_OUT";
                DATA.DASH_STATE = (DATA.DASH_STATE == "SUBMENU_MESSAGE_IDLE") ? "SUBMENU_MESSAGE_FADE_IN" : "IDLE_MESSAGE_FADE_OUT";
                DATA.DASH_MOVE_FRAME = 0;
                SetDashPadEvents(0);
                if (("Confirm" in DATA.MESSAGE_INFO) && (typeof DATA.MESSAGE_INFO.Confirm === "function"))
                {
                    DATA.MESSAGE_INFO.Confirm();
                }
                console.log(`PADEVENT: Completed Message Confirm Function.`);
            }
        };
    }
}

// Set the Special Pad Events for the Video Mode Message Screen.

function SetPadEvents_Vmode()
{
    // Move Back
    PADEVENTS.LEFT = () =>
    {
        if (DATA.OVSTATE == "MESSAGE_IDLE")
        {
            DATA.MESSAGE_INFO.Selected--;
            DATA.MESSAGE_INFO.Selected = (DATA.MESSAGE_INFO.Selected < 0) ? 0 : DATA.MESSAGE_INFO.Selected;
        }
    };

    // Move Forward
    PADEVENTS.RIGHT = () =>
    {
        if (DATA.OVSTATE == "MESSAGE_IDLE")
        {
            DATA.MESSAGE_INFO.Selected++;
            DATA.MESSAGE_INFO.Selected = (DATA.MESSAGE_INFO.Selected > 1) ? 1 : DATA.MESSAGE_INFO.Selected;
        }
    };
}

// Set Special Pad Events for Parental Control Code Screen

function SetPadEvents_Parental()
{
    // Move Back
    PADEVENTS.LEFT = () =>
    {
        if (DATA.OVSTATE == "MESSAGE_IDLE")
        {
            DATA.MESSAGE_INFO.Selected--;
            DATA.MESSAGE_INFO.Selected = (DATA.MESSAGE_INFO.Selected < 0) ? 0 : DATA.MESSAGE_INFO.Selected;
        }
    };

    // Move Forward
    PADEVENTS.RIGHT = () =>
    {
        if (DATA.OVSTATE == "MESSAGE_IDLE")
        {
            DATA.MESSAGE_INFO.Selected++;
            DATA.MESSAGE_INFO.Selected = (DATA.MESSAGE_INFO.Selected > 3) ? 3 : DATA.MESSAGE_INFO.Selected;
        }
    };

    // Move Down
    PADEVENTS.DOWN = () =>
    {
        if (DATA.OVSTATE == "MESSAGE_IDLE")
        {
            DATA.MESSAGE_INFO.TMPCODE[DATA.MESSAGE_INFO.Selected]--;
            DATA.MESSAGE_INFO.TMPCODE[DATA.MESSAGE_INFO.Selected] = (DATA.MESSAGE_INFO.TMPCODE[DATA.MESSAGE_INFO.Selected] < 0) ? 9 : DATA.MESSAGE_INFO.TMPCODE[DATA.MESSAGE_INFO.Selected];
        }
    };

    // Move Up
    PADEVENTS.UP = () =>
    {
        if (DATA.OVSTATE == "MESSAGE_IDLE")
        {
            DATA.MESSAGE_INFO.TMPCODE[DATA.MESSAGE_INFO.Selected]++;
            DATA.MESSAGE_INFO.TMPCODE[DATA.MESSAGE_INFO.Selected] = (DATA.MESSAGE_INFO.TMPCODE[DATA.MESSAGE_INFO.Selected] > 9) ? 0 : DATA.MESSAGE_INFO.TMPCODE[DATA.MESSAGE_INFO.Selected];
        }
    };
}

// Set Special Pad Events for a Generic Information Message Screen

function SetPadEvents_Information()
{
    // Move Back
    PADEVENTS.LEFT = () =>
    {
        if ((DATA.OVSTATE !== "MESSAGE_IDLE") || (DATA.MESSAGE_INFO.Selected < 0)) { return; }

        let obj = DATA.MESSAGE_INFO.Data[DATA.MESSAGE_INFO.Selected]
        if (obj.Selectable)
        {
            DATA.MESSAGE_INFO.Data[DATA.MESSAGE_INFO.Selected].Selected--;
            DATA.MESSAGE_INFO.Data[DATA.MESSAGE_INFO.Selected].Selected = (DATA.MESSAGE_INFO.Data[DATA.MESSAGE_INFO.Selected].Selected < 0) ? 0 : DATA.MESSAGE_INFO.Data[DATA.MESSAGE_INFO.Selected].Selected;
        }
    };

    // Move Forward
    PADEVENTS.RIGHT = () =>
    {
        if ((DATA.OVSTATE !== "MESSAGE_IDLE") || (DATA.MESSAGE_INFO.Selected < 0)) { return; }

        let obj = DATA.MESSAGE_INFO.Data[DATA.MESSAGE_INFO.Selected]
        if (obj.Selectable)
        {
            DATA.MESSAGE_INFO.Data[DATA.MESSAGE_INFO.Selected].Selected++;
            DATA.MESSAGE_INFO.Data[DATA.MESSAGE_INFO.Selected].Selected = (DATA.MESSAGE_INFO.Data[DATA.MESSAGE_INFO.Selected].Selected >= obj.Count) ? (obj.Count - 1) : DATA.MESSAGE_INFO.Data[DATA.MESSAGE_INFO.Selected].Selected;
        }
    };

    // Move Down
    PADEVENTS.DOWN = () =>
    {
        if (DATA.OVSTATE !== "MESSAGE_IDLE") { return; }

        for (let i = DATA.MESSAGE_INFO.Selected + 1; i < DATA.MESSAGE_INFO.Data.length; i++)
        {
            if (DATA.MESSAGE_INFO.Data[i].Selectable)
            {
                DATA.MESSAGE_INFO.Selected = i;
                break;
            }
        }
    };

    // Move Up
    PADEVENTS.UP = () =>
    {
        if (DATA.OVSTATE !== "MESSAGE_IDLE") { return; }

        for (let i = DATA.MESSAGE_INFO.Selected - 1; i > -1; i--)
        {
            if (DATA.MESSAGE_INFO.Data[i].Selectable)
            {
                DATA.MESSAGE_INFO.Selected = i;
                break;
            }
        }
    };
}

console.log("INIT: PADS INIT COMPLETE");

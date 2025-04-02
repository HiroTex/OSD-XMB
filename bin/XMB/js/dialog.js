//////////////////////////////////////////////////////////////////////////
///*				   		  MESSAGE DIALOG						  *///
/// 				   		  										   ///
///		    This handles all function related to message screens.	   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

function OpenDialogMessage(DialogData)
{
    DATA.OVSTATE = "MESSAGE_IN";
    DATA.DASH_STATE = ((DATA.DASH_CURSUB > -1) && (DATA.DASH_CURCTXLVL > -1)) ? "SUBMENU_CONTEXT_MESSAGE_FADE_OUT" : "IDLE_MESSAGE_FADE_IN";
    DATA.MESSAGE_INFO = DialogData;
    DATA.MESSAGE_INFO.Processed = false;
}
function OpenDialogErrorMsg(Message)
{
    DATA.DASH_MOVE_FRAME = 0;
    DATA.OVSTATE = "MESSAGE_IN";
    DATA.DASH_STATE = "IDLE_MESSAGE_FADE_IN";
    DATA.MESSAGE_INFO =
    {
        Icon: -1,
        Title: "",
        BG: false,
        SKIP_INTRO: true,
        Type: "TEXT",
        Text: Message,
        BACK_BTN: true,
        ENTER_BTN: false,
    };
}
function OpenDialogParentalCheck()
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

// This draws the two horizontal lines for the Message Screen.
function DrawMessageLines(a)
{
    Draw.line(0, 80, DATA.CANVAS.width, 80, Color.new(196, 196, 196, a));
    Draw.line(0, (DATA.CANVAS.height - 73), DATA.CANVAS.width, (DATA.CANVAS.height - 73), Color.new(196, 196, 196, a));
}

// This draws the Icon and Title for the Message Screen if there are any.
function DrawMessageTop(alpha)
{
    if (("Icon" in DATA.MESSAGE_INFO) && (DATA.MESSAGE_INFO.Icon != -1))
    {
        dash_icons[DATA.MESSAGE_INFO.Icon].width = 24;
        dash_icons[DATA.MESSAGE_INFO.Icon].height = 24;
        dash_icons[DATA.MESSAGE_INFO.Icon].color = Color.new(255, 255, 255, alpha);
        dash_icons[DATA.MESSAGE_INFO.Icon].draw(40, 55);
    }

    if (("Title" in DATA.MESSAGE_INFO) && (DATA.MESSAGE_INFO.Title != ""))
    {
        let txt = (Array.isArray(DATA.MESSAGE_INFO.Title)) ? DATA.MESSAGE_INFO.Title[DATA.LANGUAGE] : DATA.MESSAGE_INFO.Title;
        TxtPrint(txt, { r: textColor.r, g: textColor.g, b: textColor.b, a: alpha }, { x: 72, y: 48 });
    }
}

// This draws the X and O button texts at the bottom of the Message Screen if needed.
function DrawMessageBottom(alpha)
{
    if (("BACK_BTN" in DATA.MESSAGE_INFO) && (DATA.MESSAGE_INFO.BACK_BTN))
    {
        let backBtnString = (DATA.BTNTYPE) ? `X  ${XMBLANG.BACK[DATA.LANGUAGE]}` : `O  ${XMBLANG.BACK[DATA.LANGUAGE]}`;
        TxtPrint(backBtnString, { r: textColor.r, g: textColor.g, b: textColor.b, a: alpha }, { x: 80 + (DATA.WIDESCREEN * 32), y: (DATA.CANVAS.height - 297) }, "CENTER");
    }

    if (("ENTER_BTN" in DATA.MESSAGE_INFO) && (DATA.MESSAGE_INFO.ENTER_BTN))
    {
        let BtnString = (DATA.BTNTYPE) ? `O  ${XMBLANG.ENTER[DATA.LANGUAGE]}` : `X  ${XMBLANG.ENTER[DATA.LANGUAGE]}`;
        TxtPrint(BtnString, { r: textColor.r, g: textColor.g, b: textColor.b, a: alpha }, { x: -70 + (DATA.WIDESCREEN * 32), y: (DATA.CANVAS.height - 297) }, "CENTER");
    }
}

// Initializes the special 'Video Mode' Screen Message Object.
function InitVModeMessageSettings()
{
    DATA.MESSAGE_INFO.Processed = TextRender.ProcessText(XMBLANG.VMODE_MSG[DATA.LANGUAGE]);
    DATA.MESSAGE_INFO.Selected = 1;
    DATA.MESSAGE_INFO.Confirm = function ()
    {
        switch (DATA.MESSAGE_INFO.Selected)
        {
            case 0:
                let config = DATA.CONFIG.Get("main.cfg");
                switch (DATA.CANVAS.mode)
                {
                    case NTSC: config["vmode"] = "0"; break;
                    case PAL: config["vmode"] = "1"; break;
                    case DTV_480p: config["vmode"] = "2"; break;
                }
                DATA.CONFIG.Push("main.cfg", config);
                DATA.SCREEN_PREVMODE = DATA.CANVAS.mode;
                break;
            case 1:
                let def_val = 0;
                switch (DATA.SCREEN_PREVMODE)
                {
                    case NTSC: def_val = 0; break;
                    case PAL: def_val = 1; break;
                    case DTV_480p: def_val = 2; break;
                }
                DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Value.Default = def_val;
                DATA.CANVAS.mode = DATA.SCREEN_PREVMODE;

                setScreenHeight();
                setScreenWidth();
                setScreeniMode();
                Screen.setMode(DATA.CANVAS);
                TextRender.SetScreenDimensions();
                break;
        }
    };

    SetPadEvents_Vmode();
}

// Initializes the special 'Set Parental Code' Screen Message Object.
function InitParentalSetMessageSettings()
{
    DATA.MESSAGE_INFO.Processed = XMBLANG.PASS_NEW_MSG[DATA.LANGUAGE];
    DATA.MESSAGE_INFO.Selected = 0;
    DATA.MESSAGE_INFO.TMPCODE = [0, 0, 0, 0];
    SetPadEvents_Parental();

    DATA.MESSAGE_INFO.Confirm = function ()
    {
        DATA.PRNTCODE = DATA.MESSAGE_INFO.TMPCODE;
        let config = DATA.CONFIG.Get("main.cfg");
        config["prntcode"] = `[ ${DATA.PRNTCODE[0].toString()}, ${DATA.PRNTCODE[1].toString()}, ${DATA.PRNTCODE[2].toString()}, ${DATA.PRNTCODE[3].toString()} ]`;
        DATA.CONFIG.Push("main.cfg", config);
    };
}

// Initializes the special 'Get Parental Code' Screen Message Object.
function InitParentalCheckMessageSettings()
{
    DATA.MESSAGE_INFO.Processed = XMBLANG.PASS_CUR_MSG[DATA.LANGUAGE];
    DATA.MESSAGE_INFO.Selected = 0;
    DATA.MESSAGE_INFO.TMPCODE = [0, 0, 0, 0];
    SetPadEvents_Parental();

    DATA.MESSAGE_INFO.Confirm = function ()
    {
        if ((DATA.MESSAGE_INFO.TMPCODE[0] === DATA.PRNTCODE[0]) && (DATA.MESSAGE_INFO.TMPCODE[1] === DATA.PRNTCODE[1]) && (DATA.MESSAGE_INFO.TMPCODE[2] === DATA.PRNTCODE[2]) && (DATA.MESSAGE_INFO.TMPCODE[3] === DATA.PRNTCODE[3]))
        {
            xmblog("Parental Control Code Succeded");
            DATA.PRNTSUCC = true;
        }
    };
}

// Draws the elements for the Parental Code Message Screen.
function DrawParentalCodeMessage(txtColor, arrAlpha)
{
    let baseX = Math.round(DATA.CANVAS.width / 2) - 50 - (DATA.WIDESCREEN * 32);
    let baseY = Math.round(DATA.CANVAS.height / 2) + 20;

    for (let i = 0; i < 4; i++)
    {
        let Chr = (i == DATA.MESSAGE_INFO.Selected) ? DATA.MESSAGE_INFO.TMPCODE[i].toString() : "*";
        let ymod = (i == DATA.MESSAGE_INFO.Selected) ? 0 : 3;
        let xmod = (i == DATA.MESSAGE_INFO.Selected) ? 2 : 0;
        TxtPrint(Chr, txtColor, { x: baseX + (i * 30) + (DATA.WIDESCREEN * 32) - xmod, y: baseY + ymod }, "LEFT", undefined, (i == DATA.MESSAGE_INFO.Selected));
    }

    dash_arrow.width = 16;
    dash_arrow.height = 16;
    dash_arrow.color = Color.new(255, 255, 255, arrAlpha);

    dash_arrow.angle = -0.5f;
    dash_arrow.draw(baseX + (DATA.MESSAGE_INFO.Selected * 30) + 2 + (DATA.WIDESCREEN * 32), baseY + 5);
    dash_arrow.angle = 0.5f;
    dash_arrow.draw(baseX + (DATA.MESSAGE_INFO.Selected * 30) + 2 + (DATA.WIDESCREEN * 32), baseY + 31);
    dash_arrow.angle = 0.0f;

    TxtPrint(DATA.MESSAGE_INFO.Processed, txtColor, { x: (DATA.WIDESCREEN * 32) + 12, y: -20 }, "CENTER");
}

// Initializes a Generic 'Information' Screen Message Object.
function InitMessageInfoScreenSettings()
{
    DATA.MESSAGE_INFO.Processed = true;
    DATA.MESSAGE_INFO.Selected = -1;
    SetPadEvents_Information();

    for (let i = 0; i < DATA.MESSAGE_INFO.Data.length; i++)
    {
        if (DATA.MESSAGE_INFO.Data[i].Selectable)
        {
            DATA.MESSAGE_INFO.Selected = i;
            break;
        }
    }
}

// Draws the elements for the 'Information' Screen.
function DrawMessageInfoScreen(txtColor, arrAlpha)
{
    const nameX = -(Math.round(DATA.CANVAS.width / 2) + 16 - (DATA.WIDESCREEN * 64));
    const descX = (Math.round(DATA.CANVAS.width / 2) - 24);
    const baseY = Math.round(DATA.CANVAS.height / 2) - (DATA.MESSAGE_INFO.Data.length * 8);
    for (let i = 0; i < DATA.MESSAGE_INFO.Data.length; i++)
    {
        let glowEnabled = false;
        if ((txtColor.a == 128) && (DATA.MESSAGE_INFO.Data[i].Selectable) && (DATA.MESSAGE_INFO.Selected === i))
        {
            glowEnabled = true;
        }

        TxtPrint(`${DATA.MESSAGE_INFO.Data[i].Name}:`, txtColor, { x: nameX, y: baseY + (20 * i) }, "RIGHT", undefined);
        TxtPrint(`${DATA.MESSAGE_INFO.Data[i].Description}`, txtColor, { x: descX + 25, y: baseY + (20 * i) }, "LEFT", undefined, glowEnabled);
    }

    if (DATA.MESSAGE_INFO.Selected > -1)
    {
        const selectedTextWidth = DATA.MESSAGE_INFO.Data[DATA.MESSAGE_INFO.Selected].Description.length * 8; //font_s.getTextSize(DATA.MESSAGE_INFO.Data[DATA.MESSAGE_INFO.Selected].Description).width;
        const arrY = DATA.MESSAGE_INFO.Selected * 20;
        dash_arrow.width = 16;
        dash_arrow.height = 16;
        dash_arrow.color = Color.new(255, 255, 255, arrAlpha);

        dash_arrow.angle = 0.0f;
        dash_arrow.draw(descX + 8, baseY + arrY + 12);
        dash_arrow.angle = 1.0f;
        dash_arrow.draw(descX + selectedTextWidth + 34, baseY + arrY + 19);
        dash_arrow.angle = 0.0f;
    }
}

// Draws the elements for the 'Progress' Fade In Screen.
function DrawProgressFadeInText()
{
    const txtFadeColor = { r: textColor.r, g: textColor.g, b: textColor.b, a: 128 - (DATA.DASH_MOVE_FRAME * -6) };
    TxtPrint(XMBLANG.WAIT[DATA.LANGUAGE], txtFadeColor, { x: (DATA.WIDESCREEN * 32), y: -10 }, "CENTER");
    TxtPrint(`1/${DATA.MESSAGE_INFO.Count}`, txtFadeColor, { x: (DATA.WIDESCREEN * 32), y: 10 }, "CENTER");
    TxtPrint("0%", txtFadeColor, { x: (DATA.WIDESCREEN * 32), y: 30 }, "CENTER");
}

function UpdateOvColor(dir)
{
    let colA = { r: currentBgColor.r, g: currentBgColor.g, b: currentBgColor.b, a: DATA.OVALPHA };
    let colB = { r: 0, g: 0, b: 0, a: ((DATA.MESSAGE_INFO.BG) ? 112 : 48) };
    if (dir > 0) { let tmp = colA; colA = colB; colB = tmp; }
    let NewOvCol = interpolateColorObj(colA, colB, Math.fround(DATA.DASH_MOVE_FRAME / 20));
    DATA.OVCOL = Color.new(NewOvCol.r, NewOvCol.g, NewOvCol.b, NewOvCol.a);
}

// Message Screen Fade In Animation.
function DrawMessageFadeIn()
{
    if (DATA.MESSAGE_TIMER != false) { Timer.destroy(DATA.MESSAGE_TIMER); DATA.MESSAGE_TIMER = false; }
    let txtFadeColor = { r: textColor.r, g: textColor.g, b: textColor.b, a: DATA.DASH_MOVE_FRAME * 6 };
    UpdateOvColor(0);
    DrawMessageLines(DATA.DASH_MOVE_FRAME * 6);
    DrawMessageTop(DATA.DASH_MOVE_FRAME * 6);
    DrawMessageBottom(DATA.DASH_MOVE_FRAME * 6);

    switch (DATA.MESSAGE_INFO.Type)
    {
        case "TEXT":
            if (!DATA.MESSAGE_INFO.Processed)
            {
                let txt = (Array.isArray(DATA.MESSAGE_INFO.Text)) ? DATA.MESSAGE_INFO.Text[DATA.LANGUAGE] : DATA.MESSAGE_INFO.Text;
                DATA.MESSAGE_INFO.Processed = TextRender.ProcessText(txt);
            }

            TxtPrint(DATA.MESSAGE_INFO.Processed, txtFadeColor, { x: (DATA.WIDESCREEN * 32), y: -10 }, "CENTER");
            break;
        case "VMODE":
            if (!DATA.MESSAGE_INFO.Processed) { InitVModeMessageSettings(); }
            TxtPrint(DATA.MESSAGE_INFO.Processed, txtFadeColor, { x: (DATA.WIDESCREEN * 32), y: -40 }, "CENTER");
            TxtPrint(`${XMBLANG.REMTIME[DATA.LANGUAGE]}`, txtFadeColor, { x: (DATA.WIDESCREEN * 32), y: 20 }, "CENTER");
            TxtPrint(`25 ${XMBLANG.SECONDS[DATA.LANGUAGE]}`, txtFadeColor, { x: -5 + (DATA.WIDESCREEN * 32), y: 40 }, "CENTER");
            TxtPrint(`${XMBLANG.YES[DATA.LANGUAGE]}`, txtFadeColor, { x: -40 + (DATA.WIDESCREEN * 32), y: 70 }, "CENTER");
            TxtPrint(`${XMBLANG.NO[DATA.LANGUAGE]}`, txtFadeColor, { x: 30 + (DATA.WIDESCREEN * 32), y: 70 }, "CENTER");
            break;
        case "PARENTAL_SET":
            if (!DATA.MESSAGE_INFO.Processed) { InitParentalSetMessageSettings(); }
            DrawParentalCodeMessage(txtFadeColor, DATA.DASH_MOVE_FRAME * 5);
            break;
        case "PARENTAL_CHECK":
            if (!DATA.MESSAGE_INFO.Processed) { InitParentalCheckMessageSettings(); }
            DrawParentalCodeMessage(txtFadeColor, DATA.DASH_MOVE_FRAME * 5);
            break;
        case "INFO":
            if (!DATA.MESSAGE_INFO.Processed) { InitMessageInfoScreenSettings(); }
            DrawMessageInfoScreen(txtFadeColor, DATA.DASH_MOVE_FRAME * 5);
            break;
    }
}

// Message Screen Main Handler.
function DrawMessageIdle()
{
    DrawMessageLines(128);
    DrawMessageTop(128);
    DrawMessageBottom(128);

    switch (DATA.MESSAGE_INFO.Type)
    {
        case "TEXT":
            TxtPrint(DATA.MESSAGE_INFO.Processed, textColor, { x: (DATA.WIDESCREEN * 32), y: -10 }, "CENTER");
            if (DATA.MESSAGE_INFO.BgFunction) { DATA.MESSAGE_INFO.Type = "TEXT_BGFUN"; }
            break;
        case "TEXT_BGFUN":
            TxtPrint(DATA.MESSAGE_INFO.Processed, textColor, { x: (DATA.WIDESCREEN * 32), y: -10 }, "CENTER");
            DATA.MESSAGE_INFO.BgFunction();
            break;
        case "TEXT_TO_TEXT":
            if (!DATA.MESSAGE_INFO.Processed)
            {
                let txt = (Array.isArray(DATA.MESSAGE_INFO.Text)) ? DATA.MESSAGE_INFO.Text[DATA.LANGUAGE] : DATA.MESSAGE_INFO.Text;
                DATA.MESSAGE_INFO.Processed = TextRender.ProcessText(txt);
            }

            TxtPrint(DATA.MESSAGE_INFO.Processed, { r: textColor.r, g: textColor.g, b: textColor.b, a: 128 - (DATA.DASH_MOVE_FRAME * -6) }, { x: (DATA.WIDESCREEN * 32), y: -10 }, "CENTER");
            DATA.DASH_MOVE_FRAME++; if (DATA.DASH_MOVE_FRAME > 19) { DATA.MESSAGE_INFO.Type = "TEXT"; }
            break;
        case "VMODE":
            if (DATA.MESSAGE_TIMER == false) { DATA.MESSAGE_TIMER = Timer.new(); }

            let time = Math.round(Timer.getTime(DATA.MESSAGE_TIMER) / 1000000);

            if (time > 25)
            {
                let def_val = 0;
                switch (DATA.SCREEN_PREVMODE)
                {
                    case NTSC: def_val = 0; break;
                    case PAL: def_val = 1; break;
                    case DTV_480p: def_val = 2; break;
                }
                DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT].Value.Default = def_val;
                DATA.CANVAS.mode = DATA.SCREEN_PREVMODE;

                setScreenHeight();
                setScreenWidth();
                setScreeniMode();
                Screen.setMode(DATA.CANVAS);
                TextRender.SetScreenDimensions();

                DATA.OVSTATE = "MESSAGE_OUT";
                DATA.DASH_STATE = (DATA.DASH_STATE == "SUBMENU_MESSAGE_IDLE") ? "SUBMENU_MESSAGE_FADE_IN" : "IDLE";
                DATA.DASH_MOVE_FRAME = 0;
                SetDashPadEvents(0);
                break;
            }

            TxtPrint(DATA.MESSAGE_INFO.Processed, textColor, { x: (DATA.WIDESCREEN * 32), y: -40 }, "CENTER");
            TxtPrint(`${XMBLANG.REMTIME[DATA.LANGUAGE]}`, textColor, { x: (DATA.WIDESCREEN * 32), y: 20 }, "CENTER");
            TxtPrint(`${(25 - time).toString()} ${XMBLANG.SECONDS[DATA.LANGUAGE]}`, textColor, { x: -5 + (DATA.WIDESCREEN * 32), y: 40 }, "CENTER");
            TxtPrint(XMBLANG.YES[DATA.LANGUAGE], textColor, { x: -40 + (DATA.WIDESCREEN * 32), y: 70 }, "CENTER", undefined, (DATA.MESSAGE_INFO.Selected == 0));
            TxtPrint(XMBLANG.NO[DATA.LANGUAGE], textColor, { x: 30 + (DATA.WIDESCREEN * 32), y: 70 }, "CENTER", undefined, (DATA.MESSAGE_INFO.Selected == 1));

            break;
        case "PARENTAL_SET":
            DrawParentalCodeMessage(textColor, 100);
            break;
        case "PARENTAL_CHECK":
            DrawParentalCodeMessage(textColor, 100);
            break;
        case "INFO":
            DrawMessageInfoScreen(textColor, 100);
            break;
        case "INFO_TO_PROGRESS":
            DrawProgressFadeInText();
            DATA.DASH_MOVE_FRAME++; if (DATA.DASH_MOVE_FRAME > 19) { DATA.MESSAGE_INFO.Type = "PROGRESS"; }
            break;
        case "PROGRESS":
            const progress = DATA.MESSAGE_INFO.Progress;
            TxtPrint(XMBLANG.WAIT[DATA.LANGUAGE], textColor, { x: (DATA.WIDESCREEN * 32), y: -10 }, "CENTER");
            TxtPrint(`${DATA.MESSAGE_INFO.Done.toString()}/${DATA.MESSAGE_INFO.Count.toString()}`, textColor, { x: (DATA.WIDESCREEN * 32), y: 10 }, "CENTER");
            TxtPrint(`${progress.toString()}%`, textColor, { x: (DATA.WIDESCREEN * 32), y: 30 }, "CENTER");
            if ((DATA.MESSAGE_INFO.Done == DATA.MESSAGE_INFO.Count) && (progress === 100))
            {
                DATA.OVSTATE = "MESSAGE_OUT";
                DATA.DASH_STATE = (DATA.DASH_STATE == "SUBMENU_MESSAGE_IDLE") ? "SUBMENU_MESSAGE_FADE_IN" : "IDLE_MESSAGE_FADE_OUT";
                DATA.DASH_MOVE_FRAME = 0;
                SetDashPadEvents(0);
            }
            break;
    }
}

// Message Screen Fade Out Animation.
function DrawMessageFadeOut()
{
    let txtFadeOutColor = { r: textColor.r, g: textColor.g, b: textColor.b, a: 128 - (DATA.DASH_MOVE_FRAME * 6) };
    UpdateOvColor(1);
    DrawMessageLines(128 - (DATA.DASH_MOVE_FRAME * 6));

    switch (DATA.MESSAGE_INFO.Type)
    {
        case "TEXT":
            TxtPrint(DATA.MESSAGE_INFO.Processed, txtFadeOutColor, { x: (DATA.WIDESCREEN * 32), y: -10 }, "CENTER");
            break;
        case "VMODE":
            if (DATA.MESSAGE_TIMER != false) { Timer.destroy(DATA.MESSAGE_TIMER); DATA.MESSAGE_TIMER = false; }
            break;
    }

    if (DATA.DASH_MOVE_FRAME > 19) { DATA.OVSTATE = "IDLE"; }
}

//////////////////////////////////////////////////////////////////////////
///*				   		    BACKGROUND							  *///
/// 				   		  										   ///
///		This handles all background graphical elements. This will	   ///
///		also handle overlayed stuff, like Fade In/Out or Messages.	   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

// Background Texture to overlap the main Color.
const bg = new Image(`./XMB/dash/dash_bg.png`);
bg.optimize();
bg.filter = LINEAR;
bg.startx = 2;
bg.starty = 2;
bg.endx = bg.width - 2;
bg.endy = bg.width - 3;
bg.width = DATA.CANVAS.width;
bg.height = DATA.CANVAS.height;

// This will set the brightness and obscure the background by
// either user defined brightness or automatically set by daylight.

const bg_daily = new Image(`./XMB/dash/dash_bg_overlay.png`);
bg_daily.optimize();
bg_daily.filter = LINEAR;
bg_daily.startx = 2;
bg_daily.starty = 2;
bg_daily.endx = bg.width - 2;
bg_daily.endy = bg.width - 3;
bg_daily.width = DATA.CANVAS.width;
bg_daily.height = DATA.CANVAS.height;

// Background Colors based on each month (from PS3's XMB).
const monthColors = {
    1: { r: 0xCB, g: 0xCB, b: 0xCB, a: 0x80 },
    2: { r: 0xD8, g: 0xBF, b: 0x1A, a: 0x80 },
    3: { r: 0x6D, g: 0xB2, b: 0x17, a: 0x80 },
    4: { r: 0xE1, g: 0x7E, b: 0x9A, a: 0x80 },
    5: { r: 0x17, g: 0x88, b: 0x16, a: 0x80 },
    6: { r: 0x9A, g: 0x61, b: 0xC8, a: 0x80 },
    7: { r: 0x02, g: 0xCD, b: 0xC7, a: 0x80 },
    8: { r: 0x0C, g: 0x76, b: 0xC0, a: 0x80 },
    9: { r: 0xB4, g: 0x44, b: 0xC0, a: 0x80 },
    10: { r: 0xE5, g: 0xA7, b: 0x08, a: 0x80 },
    11: { r: 0x87, g: 0x5B, b: 0x1E, a: 0x80 },
    12: { r: 0xE3, g: 0x41, b: 0x2A, a: 0x80 },
    13: { r: 0x12, g: 0x12, b: 0x18, a: 0x80 }
};

// By Default, assign the User Interface color
// to the current month.
// Date's Month paramenter is zero based.

let OSDATE = getDateInGMTOffset(DATA.TIME_ZONE);
DATA.BGCOL = OSDATE.getMonth() + 1;

// Variables to hold temporary values to be
// used when the background color changes.

let currentBgColor = monthColors[DATA.BGCOL];
let prevBrightness = DATA.BGBRIGHTNESS;
let brightnessFrame = 0.0f;
let themeColor = Color.new(currentBgColor.r, currentBgColor.g, currentBgColor.b, currentBgColor.a);
let prevColor = { r: currentBgColor.r, g: currentBgColor.g, b: currentBgColor.b, a: currentBgColor.a };

//////////////////////////////////////////////////////////////////////////
///*				   		       WAVES    						  *///
//////////////////////////////////////////////////////////////////////////

// Main Wave Object, which will handle the
// two moving backgound waves.

const Waves = (() => {
    // Wave constants
    let screenWidth = DATA.CANVAS.width;
    let time = 0;
    const step = 6;

    // Wave constants
    const wave1ColorBottom = Color.new(0, 0, 0, 36);
    const wave1Amplitude = 30.0f;
    const wave1Speed = 0.019f;
    const wave2Amplitude = 32.0f;
    const waveLength = 0.005f;
    const wave2Speed = 0.021f;

    // Precompute x-wave values
    const precomputedXWave = [];

    function precomputeValues() {
        for (let x = 0; x <= screenWidth; x += step) {
            precomputedXWave[x] = x * waveLength;
        }
    }

    precomputeValues();

    let wave2ColorTop, wave2ColorBottom;

    function setThemeColor(themeColor)
    {
        const r = Math.min(themeColor.r + 65, 255);
        const g = Math.min(themeColor.g + 65, 255);
        const b = Math.min(themeColor.b + 90, 255);

        wave2ColorTop = Color.new(r, g, b, 127);
        wave2ColorBottom = Color.new(r, g, b, 96);
    }

    function renderWaves()
    {
        const width = DATA.CANVAS.width;
        const height = DATA.CANVAS.height;
        const baseYStart = Math.round(height / 2) + 96;

        if (width !== screenWidth) { screenWidth = width; precomputeValues(); }

        const timeWave1 = time * wave1Speed;
        const timeWave2 = time * wave2Speed;

        for (let x = 0; x < screenWidth; x += step)
        {
            const y1 = Math.sinf(precomputedXWave[x] + timeWave1) * wave1Amplitude;
            const currentY1 = baseYStart + (y1 + 1);

            const y2 = Math.sinf(precomputedXWave[x] + timeWave2) * wave2Amplitude;
            const currentY2 = baseYStart + (y2 + 1);

            // Draw wave 1 bottom

            const endX = (x + step > screenWidth) ? (screenWidth - x) : step;

            Draw.rect(x, currentY1, endX, height, wave1ColorBottom);
            Draw.rect(x, currentY2 - 1, endX, 2, wave2ColorTop);
            Draw.rect(x, currentY2, endX, height, wave2ColorBottom);
        }

        time++;
        if (time < 0) { time = 0; }
    }

    return {
        renderWaves, setThemeColor,
    };
})();

// Set the Waves' color.
Waves.setThemeColor(currentBgColor);

//////////////////////////////////////////////////////////////////////////
///*				   		 MESSAGE FUNCTIONS						  *///
//////////////////////////////////////////////////////////////////////////

// This draws the two horizontal lines for the Message Screen.

function DrawMessageLines(a)
{
    Draw.line(0, 80, DATA.CANVAS.width, 80, Color.new(196,196,196, a));
    Draw.line(0, (DATA.CANVAS.height - 73), DATA.CANVAS.width, (DATA.CANVAS.height - 73), Color.new(196,196,196, a));
}

// This draws the Icon and Title for the Message Screen if there are any.

function DrawMessageTop(alpha)
{
    if (("Icon" in DATA.MESSAGE_INFO) && (DATA.MESSAGE_INFO.Icon != -1))
    {
        dash_icons[DATA.MESSAGE_INFO.Icon].width = 24
        dash_icons[DATA.MESSAGE_INFO.Icon].height = 24;
        dash_icons[DATA.MESSAGE_INFO.Icon].color = Color.new(255,255,255, alpha);
        dash_icons[DATA.MESSAGE_INFO.Icon].draw(40, 55);
    }

    if (("Title" in DATA.MESSAGE_INFO) && (DATA.MESSAGE_INFO.Title != ""))
    {
        let txt = (Array.isArray(DATA.MESSAGE_INFO.Title)) ? DATA.MESSAGE_INFO.Title[DATA.LANGUAGE] : DATA.MESSAGE_INFO.Title;
        TxtPrint(txt, {r: textColor.r, g: textColor.g, b: textColor.b, a: alpha }, {x: 72, y:48 });
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
    DATA.MESSAGE_INFO.Confirm = function()
    {
        switch(DATA.MESSAGE_INFO.Selected)
        {
            case 0:
                let config = DATA.CONFIG.Get("main.cfg");
                switch(DATA.CANVAS.mode)
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
                switch(DATA.SCREEN_PREVMODE)
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
    }

    SetPadEvents_Vmode();
}

// Initializes the special 'Set Parental Code' Screen Message Object.

function InitParentalSetMessageSettings()
{
    DATA.MESSAGE_INFO.Processed = XMBLANG.PASS_NEW_MSG[DATA.LANGUAGE];
    DATA.MESSAGE_INFO.Selected = 0;
    DATA.MESSAGE_INFO.TMPCODE = [ 0, 0, 0, 0 ];
    SetPadEvents_Parental();

    DATA.MESSAGE_INFO.Confirm = function()
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
    DATA.MESSAGE_INFO.TMPCODE = [ 0, 0, 0, 0 ];
    SetPadEvents_Parental();

    DATA.MESSAGE_INFO.Confirm = function()
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
        TxtPrint(Chr, txtColor, { x: baseX + (i * 30) + (DATA.WIDESCREEN * 32) - xmod, y: baseY + ymod}, "LEFT", undefined, (i == DATA.MESSAGE_INFO.Selected));
    }

    dash_arrow.width = 16;
    dash_arrow.height = 16;
    dash_arrow.color = Color.new(255,255,255,arrAlpha);

    dash_arrow.angle = -0.5f;
    dash_arrow.draw(baseX + (DATA.MESSAGE_INFO.Selected * 30) + 2 + (DATA.WIDESCREEN * 32), baseY + 5);
    dash_arrow.angle = 0.5f;
    dash_arrow.draw(baseX + (DATA.MESSAGE_INFO.Selected * 30) + 2 + (DATA.WIDESCREEN * 32), baseY + 31);
    dash_arrow.angle = 0.0f;

    TxtPrint(DATA.MESSAGE_INFO.Processed, txtColor, { x: (DATA.WIDESCREEN * 32) + 12, y: -20}, "CENTER");
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
    const baseY = Math.round(DATA.CANVAS.height / 2) - (DATA.MESSAGE_INFO.Data.length * 8)
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
        dash_arrow.color = Color.new(255,255,255,arrAlpha);

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

    switch(DATA.MESSAGE_INFO.Type)
    {
        case "TEXT":
            if (!DATA.MESSAGE_INFO.Processed)
            {
                let txt = (Array.isArray(DATA.MESSAGE_INFO.Text)) ? DATA.MESSAGE_INFO.Text[DATA.LANGUAGE] : DATA.MESSAGE_INFO.Text;
                DATA.MESSAGE_INFO.Processed = TextRender.ProcessText(txt);
            }

            TxtPrint(DATA.MESSAGE_INFO.Processed, txtFadeColor, { x: (DATA.WIDESCREEN * 32), y: -10}, "CENTER");
            break;
        case "VMODE":
            if (!DATA.MESSAGE_INFO.Processed) { InitVModeMessageSettings();	}
            TxtPrint(DATA.MESSAGE_INFO.Processed, txtFadeColor, { x: (DATA.WIDESCREEN * 32), y: -40}, "CENTER");
            TxtPrint(`${XMBLANG.REMTIME[DATA.LANGUAGE]}`, txtFadeColor, { x: (DATA.WIDESCREEN * 32), y: 20}, "CENTER");
            TxtPrint(`25 ${XMBLANG.SECONDS[DATA.LANGUAGE]}`, txtFadeColor, { x: -5 + (DATA.WIDESCREEN * 32), y: 40}, "CENTER");
            TxtPrint(`${XMBLANG.YES[DATA.LANGUAGE]}`, txtFadeColor, { x: -40 + (DATA.WIDESCREEN * 32), y: 70}, "CENTER");
            TxtPrint(`${XMBLANG.NO[DATA.LANGUAGE]}`, txtFadeColor, { x: 30 + (DATA.WIDESCREEN * 32), y: 70}, "CENTER");
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

    switch(DATA.MESSAGE_INFO.Type)
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

            TxtPrint(DATA.MESSAGE_INFO.Processed, textColor, { x: (DATA.WIDESCREEN * 32), y: -40}, "CENTER");
            TxtPrint(`${XMBLANG.REMTIME[DATA.LANGUAGE]}`, textColor, { x: (DATA.WIDESCREEN * 32), y: 20}, "CENTER");
            TxtPrint(`${(25 - time).toString()} ${XMBLANG.SECONDS[DATA.LANGUAGE]}`, textColor, { x: -5 + (DATA.WIDESCREEN * 32), y: 40}, "CENTER");
            TxtPrint(XMBLANG.YES[DATA.LANGUAGE], textColor, {x: -40 + (DATA.WIDESCREEN * 32), y: 70 }, "CENTER", undefined, (DATA.MESSAGE_INFO.Selected == 0));
            TxtPrint(XMBLANG.NO[DATA.LANGUAGE], textColor, {x: 30 + (DATA.WIDESCREEN * 32), y: 70 }, "CENTER", undefined, (DATA.MESSAGE_INFO.Selected == 1));

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
            TxtPrint(XMBLANG.WAIT[DATA.LANGUAGE], textColor, { x: (DATA.WIDESCREEN * 32), y: -10}, "CENTER");
            TxtPrint(`${DATA.MESSAGE_INFO.Done.toString()}/${DATA.MESSAGE_INFO.Count.toString()}`, textColor, { x: (DATA.WIDESCREEN * 32), y: 10}, "CENTER");
            TxtPrint(`${progress.toString()}%`, textColor, { x: (DATA.WIDESCREEN * 32), y: 30}, "CENTER");
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

    switch(DATA.MESSAGE_INFO.Type)
    {
        case "TEXT":
            TxtPrint(DATA.MESSAGE_INFO.Processed, txtFadeOutColor, { x: (DATA.WIDESCREEN * 32), y: -10}, "CENTER");
            break;
        case "VMODE":
            if (DATA.MESSAGE_TIMER != false) { Timer.destroy(DATA.MESSAGE_TIMER); DATA.MESSAGE_TIMER = false; }
            break;
    }

    if (DATA.DASH_MOVE_FRAME > 19) { DATA.OVSTATE = "IDLE" }
}

//////////////////////////////////////////////////////////////////////////
///*				   		  MAIN FUNCTIONS						  *///
//////////////////////////////////////////////////////////////////////////

// This will parse the current time to get the automatic background brightness.

function getDailyBrightness()
{
    const now = getDateInGMTOffset(DATA.TIME_ZONE);
    const hour = now.getHours();
    const minutes = now.getMinutes();
    let brightness = 0;

    if (hour >= 12 && hour < 18) {
        // Interpolate from 0 to 128 between 12:00 and 18:00
        const totalMinutes = (hour - 12) * 60 + minutes;
        brightness = Math.round((totalMinutes / (6 * 60)) * 128);
    } else if (hour >= 18 || hour < 6) {
        // Brightness stays at 128 between 18:00 and 06:00
        brightness = 128;
    } else if (hour >= 6 && hour < 12) {
        // Interpolate from 128 to 0 between 06:00 and 12:00
        const totalMinutes = (hour - 6) * 60 + minutes;
        brightness = Math.round(128 - (totalMinutes / (6 * 60)) * 128);
    }

    return brightness;
}

// This will update the background brightness on each frame
// to reflect changes based on daylight or user selected brightness.

function updateBGBrightness()
{
    if (DATA.BGSWITCH)
    {
        let tmpBrightness = (DATA.BGTMP == 0) ? getDailyBrightness() : DATA.BGCUSTOMBRIGHT;
        tmpBrightness = interpolateValue(prevBrightness, tmpBrightness, brightnessFrame);
        brightnessFrame += 0.05f;
        if (brightnessFrame > 0.95)
        {
            brightnessFrame = 0.95f;
            prevBrightness = tmpBrightness;
        }
        return tmpBrightness;
    }
    else
    {
        // Interpolate values based on time of day if using Original Background color
        prevBrightness = DATA.BGBRIGHTNESS;
        return (DATA.BGTMP == 0) ? getDailyBrightness() : DATA.BGCUSTOMBRIGHT;
    }
}

// This is the main Background Function.
// It will handle all the background elements,
// and changes made by the user or time of day.

function drawBg()
{
    if ((!DATA.BGIMG) || (DATA.BGIMGA < 128))
    {
        // Update the automatic or user defined brightness.
        DATA.BGBRIGHTNESS = updateBGBrightness();

        // If there was a change on the background color, interpolate it with the current one.
        if (DATA.BGSWITCH)
        {
            DATA.BGFRAME += 0.02f;

            let tempColor = interpolateColorObj(prevColor, monthColors[DATA.BGCOL], DATA.BGFRAME);
            themeColor = Color.new(tempColor.r, tempColor.g, tempColor.b, tempColor.a);
            DATA.OVCOL = Color.new(tempColor.r, tempColor.g, tempColor.b, DATA.OVALPHA);
            Waves.setThemeColor(tempColor);

            // If interpolation ended, update current parameters with new ones.
            if (DATA.BGFRAME > 0.99f)
            {
                currentBgColor = monthColors[DATA.BGCOL];
                prevColor = { r: monthColors[DATA.BGCOL].r, g: monthColors[DATA.BGCOL].g, b: monthColors[DATA.BGCOL].b, a: monthColors[DATA.BGCOL].a };
                brightnessFrame = 0.0f;
                DATA.BGFRAME = 0.0f;
                DATA.BGSWITCH = false;
            }
        }

        // Main Background color element. A single rectangle with the theme color.
        Draw.rect(0, 0, DATA.CANVAS.width, DATA.CANVAS.height, themeColor);

        // Above the color draw the Waves.
        if (DATA.BGWAVES) { Waves.renderWaves(); }

        // Then overlay the background Texture.
        bg.width = DATA.CANVAS.width;
        bg.height = DATA.CANVAS.height;
        bg.draw(0, 0);

        // Finally, set the background brightness with the gradient texture.
        bg_daily.height = DATA.CANVAS.height;
        bg_daily.width = DATA.CANVAS.width;
        bg_daily.color = Color.new(190, 190, 190, DATA.BGBRIGHTNESS);
        bg_daily.draw(0, 0);
    }

    const col = neutralizeOverlayWithAlpha();

    if ((DATA.BGIMGA > 0) && (DATA.BGIMG) && (DATA.BOOT_STATE > 7))
    {
        DATA.BGIMG.width = DATA.CANVAS.width;
        DATA.BGIMG.height = DATA.CANVAS.height;
        DATA.BGIMG.color = Color.new(col.r, col.g, col.b, DATA.BGIMGA);
        DATA.BGIMG.draw(0, 0);
    }

    if ((DATA.BGIMGTMP) && (DATA.BGIMGTMPSTATE > 15))
    {
        DATA.BGIMGTMPSTATE = (DATA.BGIMGTMPSTATE > 143) ? 143 : DATA.BGIMGTMPSTATE;
        DATA.BGIMGTMP.color = Color.new(col.r, col.g, col.b, DATA.BGIMGTMPSTATE - 15);
        DATA.BGIMGTMPSTATE += 6;
        DATA.BGIMGTMP.draw(0, 0);
    }
}

// This is the main Overlay function.
// It will handle all the elements that should
// be drawn above the main interface, like
// fade in/out screen, the Clock, and Message Screens.

function drawOv()
{
    // Draw Date and Time

    if (DATA.CURRENT_STATE == 1)
    {
        switch(DATA.DASH_STATE)
        {
            case "FADE_OUT": drawDate(DATA.DASH_MOVE_FRAME * -12, DATA.DASH_MOVE_FRAME * -12, DATA.DASH_MOVE_FRAME * -12); break;
            default: drawDate(); break;
        }
    }

    // Draw a partially visible theme color overlay to tint the whole interface.
    // Fade In/Out screens also use this with a Full Black color.
    Draw.rect(0,0,DATA.CANVAS.width, DATA.CANVAS.height, DATA.OVCOL);

    // If a message screen should be displayed, this takes care of it.

    switch(DATA.OVSTATE)
    {
        case "MESSAGE_IN": DrawMessageFadeIn();	break;
        case "MESSAGE_IDLE": DrawMessageIdle(); break;
        case "MESSAGE_OUT": DrawMessageFadeOut(); break;
    }
}

function drawBootLogo(a)
{
    boot_logo.color = Color.new(255, 255, 255, a);
    boot_logo.draw(DATA.CANVAS.width - 492, 160);
}

// Draws the Clock elements.

function drawDate(icoAlphaMod = 0, boxAlphaMod = 0, textAlphaMod = 0)
{
    // Helper function to pad single-digit numbers with leading zeros
    const padnum = (num) => num.toString().padStart(2, '0');

    if ((ICOFULLA + boxAlphaMod) > ICOFULLA) { boxAlphaMod = 0; }
    if ((ICOFULLA + boxAlphaMod) < 0) { boxAlphaMod = -ICOFULLA; }
    if ((ICOFULLA + icoAlphaMod) > ICOFULLA) { icoAlphaMod = 0; }
    if ((ICOFULLA + icoAlphaMod) < 0) { icoAlphaMod = -ICOFULLA; }

    // Draw Start of Clock Outline
    dash_clock_outline.width = 32;
    dash_clock_outline.startx = 2;
    dash_clock_outline.color = Color.new(255,255,255,ICOFULLA + boxAlphaMod);
    dash_clock_outline.draw(DATA.CANVAS.width - 164, 35);

    // Draw End of Clock Outline
    dash_clock_outline.width = 180;
    dash_clock_outline.startx = 32;
    dash_clock_outline.color = Color.new(255,255,255,ICOFULLA + boxAlphaMod);
    dash_clock_outline.draw(DATA.CANVAS.width - 134, 35);

    dash_clock.color = Color.new(255,255,255,ICOFULLA + icoAlphaMod);
    dash_clock.draw(DATA.CANVAS.width - 25, 42);

    // Get current date and time
    const currentDate = getDateInGMTOffset(DATA.TIME_ZONE);

    // Extract date components
    //const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString(); // Months are zero-based
    const day = currentDate.getDate().toString();

    // Extract time components
    const hours24 = currentDate.getHours();
    const minutes = currentDate.getMinutes().toString();
    //const seconds = currentDate.getSeconds();

    // Convert to 12-hour format
    const hours12 = (hours24 % 12 || 12).toString(); // Adjust for midnight (0 => 12)
    const amPm = hours24 >= 12 ? 'PM' : 'AM';
    const modColor = { r:textColor.r, g:textColor.g, b:textColor.b, a:textColor.a }
    if ((modColor.a + textAlphaMod) > modColor.a) { textAlphaMod = 0; }
    if ((modColor.a + textAlphaMod) < 0) { textAlphaMod = -modColor.a; }
    modColor.a = modColor.a + textAlphaMod;

    let dateText = `${padnum(day)}/${padnum(month)}`;
    let hourText = (DATA.HOUR_FORMAT) ? `${padnum(hours24)}:${padnum(minutes)}` : `${padnum(hours12)}:${padnum(minutes)} ${amPm}`;

    switch(DATA.DATE_FORMAT)
    {
        case 1: dateText = `${padnum(month)}/${padnum(day)}`; break;
    }

    TxtPrint(`${dateText}  ${hourText}`, modColor, { x: DATA.CANVAS.width - 152, y:32 })
}

xmblog("INIT: BACKGROUND GRAPHICS INIT COMPLETE");

//////////////////////////////////////////////////////////////////////////
///*				   		    BACKGROUND							  *///
/// 				   		  										   ///
///		       This handles all background graphical elements.   	   ///
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

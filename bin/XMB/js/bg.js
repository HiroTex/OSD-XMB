//////////////////////////////////////////////////////////////////////////
///*				   			Background							  *///
/// 				   		  										   ///
///		The Main Background Graphics Module, with all the objects	   ///
///			   and functions to handle background elements.	 		   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const monthColors 	= [];
const BgElements = {};

//////////////////////////////////////////////////////////////////////////
///*				   		    Handlers							  *///
//////////////////////////////////////////////////////////////////////////

function BgHandler() {
    BgColorHandler();

    // Execute Background Graphic logic if:
    // There is no Tmp Image to draw
    // There is a Tmp Image to draw but it still has not appeared completely
    // and
    // There is no Custom Background Image to draw
    // There is a Custom Background Image to draw but it still has not appeared completely.

    const tmpBgImg = (BgElements.BgImage.TmpImage && BgElements.BgImage.TmpAlpha === 128);
    const customBgImg = (UserConfig.DisplayBg && BgElements.BgImage.Alpha === 128);
    const uiBgImg = (('Image' in DashUI.ItemBG) && DashUI.ItemBG.A === 128);

    if (!tmpBgImg && !customBgImg && !uiBgImg) {
        if ((Waves) && (UserConfig.Waves)) { Waves.Render(); }
        DrawTexture();
        DrawDailyOverlay();
    }

    BgImageHandler();
}
function BgColorHandler() {
    if (BgElements.BgColor.Next === BgElements.BgColor.Current) { return; }

    BgElements.BgColor.Progress += 0.03f;

    if (BgElements.BgColor.Progress > 0.9f) {
        BgElements.BgColor.Progress = 0.0f;
        BgElements.BgColor.Color = getBgColor(BgElements.BgColor.Next);
        BgElements.BgColor.Current = BgElements.BgColor.Next;
    }
	else {
        BgElements.BgColor.Color = interpolateColorObj(getBgColor(BgElements.BgColor.Current), getBgColor(BgElements.BgColor.Next), BgElements.BgColor.Progress);
    }

    const color = BgElements.BgColor.Color;
    const bgcol = Color.new(color.R, color.G, color.B, 128);
    Screen.clearColor(bgcol);
    Waves.SetColor(color);
}
function BgImageHandler() {
    const tmpImage = BgElements.BgImage.TmpImage;
    const tmpAlpha = BgElements.BgImage.TmpAlpha;
    const usrImage = BgElements.BgImage.Image;
    const usrAlpha = BgElements.BgImage.Alpha;

    if ((!UserConfig.DisplayBg || !UserConfig.CustomBgImg) && !tmpImage) { return; }

    if ((UserConfig.DisplayBg && UserConfig.CustomBgImg) && usrImage && usrImage.ready()) {
        usrImage.color = Color.setA(usrImage.color, usrAlpha);
        usrImage.draw(0, 0);
    }
    if (tmpImage && tmpImage.ready()) {
        tmpImage.color = Color.setA(tmpImage.color, tmpAlpha);
        tmpImage.draw(0, 0);
    }
}

//////////////////////////////////////////////////////////////////////////
///*				   		 Initialization							  *///
//////////////////////////////////////////////////////////////////////////
function MonthColorsInit() {
	// Background Colors based on each month (from PS3's XMB).
	monthColors.push({ R: 0xCB, G: 0xCB, B: 0xCB });
	monthColors.push({ R: 0xD8, G: 0xBF, B: 0x1A });
	monthColors.push({ R: 0x6D, G: 0xB2, B: 0x17 });
	monthColors.push({ R: 0xE1, G: 0x7E, B: 0x9A });
	monthColors.push({ R: 0x17, G: 0x88, B: 0x16 });
	monthColors.push({ R: 0x9A, G: 0x61, B: 0xC8 });
	monthColors.push({ R: 0x02, G: 0xCD, B: 0xC7 });
	monthColors.push({ R: 0x0C, G: 0x76, B: 0xC0 });
	monthColors.push({ R: 0xB4, G: 0x44, B: 0xC0 });
	monthColors.push({ R: 0xE5, G: 0xA7, B: 0x08 });
	monthColors.push({ R: 0x87, G: 0x5B, B: 0x1E });
	monthColors.push({ R: 0xE3, G: 0x41, B: 0x2A });
	monthColors.push({ R: 0x12, G: 0x12, B: 0x18 });
	monthColors.push({ R: 0x00, G: 0x00, B: 0x00 });
}
function BgElementsInit() {
	BgElements.BgTex = new Image(`${PATHS.XMB}dash/dash_bg.png`);
	BgElements.BgTex.optimize();
	BgElements.BgTex.filter = LINEAR;
	BgElements.BgTex.startx = 2;
	BgElements.BgTex.starty = 2;
	BgElements.BgTex.endx = BgElements.BgTex.width - 2;
	BgElements.BgTex.endy = BgElements.BgTex.height - 2;

	BgElements.BgDailyOv = new Image(`${PATHS.XMB}dash/dash_bg_overlay.png`);
	BgElements.BgDailyOv.optimize();
	BgElements.BgDailyOv.filter = LINEAR;
	BgElements.BgDailyOv.startx = 2;
	BgElements.BgDailyOv.starty = 2;

	BgElements.BgColor = {
		Color: getBgColor(),
		Progress: 0.0f,
		Previous: UserConfig.BgColor,
		Current: UserConfig.BgColor,
		Next: UserConfig.BgColor
	}

	BgElements.BgImage = {
		Image: false,
		TmpImage: false,
		TmpAlpha: 0,
		Alpha: 0,
		Progress: 0.0f
	}

	Screen.clearColor(Color.new(BgElements.BgColor.Color.R, BgElements.BgColor.Color.G, BgElements.BgColor.Color.B, 128));
}

//////////////////////////////////////////////////////////////////////////
///*				   		     Drawing							  *///
//////////////////////////////////////////////////////////////////////////
function getBgColor(param = UserConfig.BgColor) {
	if (param === 0) { return monthColors[getLocalTime().getMonth()]; }
	else { return monthColors[param - 1]; }
}
function getDailyBrightness() {
    const hour = gTime.getHours();
    const minutes = gTime.getMinutes();

	const DAY_START	  = 6;  // Hour to Start to Decrease Overlay
	const DAY_PEAK    = 12; // Hour of Zero Overlay
	const NIGHT_START = 15; // Hour to Start to Apply Overlay
	const NIGHT_PEAK  = 22; // Hour of Max Overlay

	if 		((hour >= DAY_PEAK)    && (hour < NIGHT_START)) { return 0; }
	else if ((hour >= NIGHT_PEAK)  || (hour < DAY_START))   { return 128; }
    else if ((hour >= NIGHT_START) && (hour < NIGHT_PEAK))  {
        const totalMinutes = ~~((hour - NIGHT_START) * 60 + minutes);
        return ~~((totalMinutes / ((NIGHT_PEAK - NIGHT_START) * 60)) * 128);
    }
	else if ((hour >= DAY_START)   && (hour < DAY_PEAK))	{
        const totalMinutes = ~~((hour - DAY_START) * 60 + minutes);
        return ~~(128 - (totalMinutes / ((DAY_PEAK - DAY_START) * 60)) * 128);
    }
}
function DrawDailyOverlay() {
	if (BgElements.BgColor.Current !== 0 && BgElements.BgColor.Next !== 0) { /* Apply Custom User Brightness */ return; }

	let daily = 0;//getDailyBrightness();

	if ((BgElements.BgColor.Current !== 0) && (BgElements.BgColor.Next === 0)) {
		daily = ~~(daily * BgElements.BgColor.Progress);
	}
	else if ((BgElements.BgColor.Next !== 0) && (BgElements.BgColor.Current === 0))	{
		daily = ~~(daily - (daily * BgElements.BgColor.Progress));
	}

	BgElements.BgDailyOv.width = ScrCanvas.width;
	BgElements.BgDailyOv.height = ScrCanvas.height + 5;
    BgElements.BgDailyOv.color = Color.setA(BgElements.BgDailyOv.color, daily);
	BgElements.BgDailyOv.draw(0,-5);
}
function DrawTexture() {
	BgElements.BgTex.width = ScrCanvas.width;
	BgElements.BgTex.height = ScrCanvas.height;
	BgElements.BgTex.draw(0,0);
}

//////////////////////////////////////////////////////////////////////////
///*				   	     Background Image						  *///
//////////////////////////////////////////////////////////////////////////
function SetNewCustomBgImg(Path) {
    UserConfig.DisplayBg = true;
    const BgImage = BgElements.BgImage;

    if (UserConfig.CustomBgImg !== Path || !BgImage.Image) {
		// If there is already an Image being displayed, place it on Tmp and switch from one to another
        if (BgImage.Image) {
            BgImage.TmpImage = BgImage.Image;
            BgImage.TmpAlpha = 128;
		}

		UserConfig.CustomBgImg = Path;
        BgImage.Image = new Image(UserConfig.CustomBgImg);
        BgImage.Image.optimize();
        BgImage.Image.filter = LINEAR;
        BgImage.Image.width = ScrCanvas.width;
        BgImage.Image.height = ScrCanvas.height;
	}

    BgImage.Alpha = 0;
    BgImage.Progress = 0.0f;

	// Animation to make it appear.
	let ival = os.setInterval(() => {
        if (BgImage.TmpImage) { BgImage.TmpAlpha = 128 - ~~(128 * BgImage.Progress); }
        BgImage.Alpha = ~~(128 * BgImage.Progress);
        BgImage.Progress += 0.1f;

        if (BgImage.Progress >= 1.0)	{
            BgImage.Progress = 0.0f;
            BgImage.Alpha = 128;

            if (BgImage.TmpImage) {
                BgImage.TmpAlpha = 0;
                BgImage.TmpImage = false;
			}

			os.clearInterval(ival);
		}
	}, 0);
}
function DisableCustomBgImg() {
	if (!UserConfig.DisplayBg || !BgElements.BgImage.Image) { return; }

	BgElements.BgImage.Alpha = 128;
	BgElements.BgImage.Progress = 1.0f;

	// Animation to make it disappear.
	let ival = os.setInterval(() => {
		BgElements.BgImage.Alpha = ~~(128 * BgElements.BgImage.Progress);
		BgElements.BgImage.Progress -= 0.1f;

		if (BgElements.BgImage.Progress <= 0.0)
		{
			BgElements.BgImage.Progress = 0.0f;
			BgElements.BgImage.Alpha = 0;
			UserConfig.DisplayBg = false;
			os.clearInterval(ival);
		}
	}, 0);
}

//////////////////////////////////////////////////////////////////////////
///*				   			 Init Work							  *///
//////////////////////////////////////////////////////////////////////////

MonthColorsInit();
BgElementsInit();
console.log("INIT LIB: BG COMPLETE");

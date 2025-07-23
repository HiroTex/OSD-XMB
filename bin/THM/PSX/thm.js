UserConfig.BgColor = 8;
BgElements.BgColor.Next = UserConfig.BgColor;
BgElements.BgColor.Progress = 0.0f;

if (!DashElements.ItemFocus)
{	
	DashElements.ItemFocus = new Image(`${PATHS.Theme}${UserConfig.Theme}/icons/focus.png`);
	DashElements.ItemFocus.optimize();
	DashElements.ItemFocus.filter = LINEAR;
}

SetNewCustomBgImg(`${PATHS.Theme}${UserConfig.Theme}/bg/bg.png`)
UICONST.Category.IconSelectedColor = { R: 160, G: 140, B: 50 };
UICONST.TextSelectedColor = { R: 180, G: 120, B: 0 };
UICONST.Context.Tint = { R: 40, G: 96, B: 220 };

UserConfig.BgColor = 8;
BgElements.BgColor.Next = UserConfig.BgColor;
BgElements.BgColor.Progress = 0.0f;

if (!DashElements.ItemFocus) {
	DashElements.ItemFocus = new Image(`${PATHS.Theme}${UserConfig.Theme}/icons/focus.png`);
	DashElements.ItemFocus.optimize();
	DashElements.ItemFocus.filter = LINEAR;
}

SetNewCustomBgImg(`${PATHS.Theme}${UserConfig.Theme}/bg/bg.png`)
UICONST.Category.IconSelectedColor = { R: 160, G: 140, B: 50 };
UICONST.TextSelectedColor = { R: 180, G: 120, B: 0 };
UICONST.Context.Tint = { R: 40, G: 96, B: 220 };

const thm_GameBG = {};
thm_GameBG.Image = new Image(`${PATHS.Theme}${UserConfig.Theme}/bg/game_bg.png`);
thm_GameBG.Image.optimize();
thm_GameBG.Image.filter = LINEAR;
thm_GameBG.Fade = createFade();
thm_GameBG.Alpha = 0;

UICONST.LayersBg.push(() => {
    const subMenu = DashUI.SubMenu;
    if (subMenu.Level < 0 || DashUI.Category.Current !== 5) { thm_GameBG.Alpha = 0; thm_GameBG.Fade.Progress = 0.0f; return; }
    if (thm_GameBG.Alpha < 1) { thm_GameBG.Fade.Progress = 0.1f; DashUI.AnimationQueue.push(() => UIAnimationCommon_Work(thm_GameBG.Fade, 0.1f)); }
    thm_GameBG.Alpha = ~~(128 * thm_GameBG.Fade.Progress);
    const fadeOut = subMenu.Fade.Running && !subMenu.Fade.In && subMenu.Level === 0;
    if (fadeOut) { thm_GameBG.Alpha -= ~~(128 * subMenu.Fade.Progress); }
    thm_GameBG.Alpha = alphaCap(thm_GameBG.Alpha);
    thm_GameBG.Image.width = ScrCanvas.width;
    thm_GameBG.Image.height = ScrCanvas.height;
    thm_GameBG.Image.color = Color.setA(thm_GameBG.Image.color, thm_GameBG.Alpha);
    thm_GameBG.Image.draw(0, 0);
});

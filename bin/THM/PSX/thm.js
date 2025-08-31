function InitThemeDashElements() {
    DashElements.CustomThemeBG = {};
    DashElements.CustomThemeBG.Image = new Image(`${PATHS.Theme}${UserConfig.Theme}/bg/game_bg.png`);
    DashElements.CustomThemeBG.Image.optimize();
    DashElements.CustomThemeBG.Image.filter = LINEAR;
    DashElements.CustomThemeBG.Fade = createFade();
    DashElements.ItemFocus = new Image(`${PATHS.Theme}${UserConfig.Theme}/icons/focus.png`);
    DashElements.ItemFocus.optimize();
    DashElements.ItemFocus.filter = LINEAR;
}

function DrawThemeDynamicBackground() {
    const thm_GameBG = DashElements.CustomThemeBG;
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
}

InitThemeDashElements();
PushThemeBgLayer(DrawThemeDynamicBackground);
SetNewCustomBgImg(`${PATHS.Theme}${UserConfig.Theme}/bg/bg.png`);
UserConfig.BgColor = 8;
BgElements.BgColor.Next = UserConfig.BgColor;
BgElements.BgColor.Progress = 0.0f;
UICONST.Category.IconSelectedColor = { R: 160, G: 140, B: 50 };
UICONST.TextSelectedColor = { R: 180, G: 120, B: 0 };
UICONST.Context.Tint = { R: 40, G: 96, B: 220 };

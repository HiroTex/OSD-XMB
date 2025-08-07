//////////////////////////////////////////////////////////////////////////
///*				   			    UI								  *///
/// 				   		  										   ///
///		  The Main User Interface Module, with all the Graphical	   ///
///					Interface objects and animations.				   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const UICONST 		 = {};
const DashUI 		 = {};
const DashElements 	 = {};
const DashIcons 	 = [];
const DashCatItems 	 = [];
const DashPluginData = [];
const DashIconsInfo  = JSON.parse(std.loadFile(`${PATHS.XMB}dash/dash_icons.json`));

//////////////////////////////////////////////////////////////////////////
///*				   			 Handlers							  *///
//////////////////////////////////////////////////////////////////////////

function UIHandler() {
    DashUIStateHandler();

	switch(DashUI.State.Current) {
		case 0: // Boot Sequence
			BootSequenceHandler();
			break;
		case 1: // Main User Interface
		case 2: // Sub Menu Interface
		case 3: // Context Interface
        case 4: // Message Interface
            DrawUIObjectBg();
            DiscTray.Process();
			break;
		case 5: // Exit Interface
			ExitSequenceHandler();
			break;
	}

	DashUIAnimationHandler();
	DrawUICategoryItems();
	DrawUICategories();
	DrawUISubMenu();
    DrawUIClock();
    DrawUIOptionBox();
	DrawUIContext();
	UpdateIconSpinning();
    FontGlowUpdate();
    OvHandler();
}
function OvHandler() {
    DashUI.Overlay.Alpha = alphaCap(DashUI.Overlay.Alpha);
    if (DashUI.Overlay.Alpha < 1) { return; }
    const ovColor = Color.setA(DashUI.Overlay.Color, DashUI.Overlay.Alpha);
    Draw.rect(0, 0, ScrCanvas.width, ScrCanvas.height, ovColor);

    switch (DashUI.OverlayState) {
        case 1: // Show Boot Warning Text
            UICONST.BootWarningText.Position = { X: 0, Y: 0 };
            UICONST.BootWarningText.Alpha = alphaCap(DashUI.BootWarningAlpha);
            TxtPrint(UICONST.BootWarningText);
            break;
        case 2: // Show Dialog
            DrawUIDialog();
            break;
    }

}
function BootSequenceHandler() {
	const StateDuration = UICONST.BootInfo.StateDurations[DashUI.BootState];

	switch (DashUI.BootState) {
		case 0: // Fade In Screen
			DashUI.Overlay.Alpha--;
			if (DashUI.BootFrame === UICONST.BootInfo.SfxFrame) { PlayBootSfx(); }
			if (DashUI.BootFrame > StateDuration) { DashUI.BootState++; DashUI.BootFrame = 0; }
			break;
		case 1: // Fade In Screen + Boot Logo
			DashUI.Overlay.Alpha--;
			UIAnimateBootLogo_Work(DashUI.BootFrame);
			if (DashUI.BootFrame > StateDuration) { DashUI.BootState++; DashUI.BootFrame = 0; }
			break;
		case 2: // Show Boot Logo
			UIAnimateBootLogo_Work(128);
			if (DashUI.BootFrame > StateDuration) { DashUI.BootState++; DashUI.BootFrame = 0; }
			break;
		case 3: // Fade Out Boot Logo
			UIAnimateBootLogo_Work(128 - DashUI.BootFrame);
			if (DashUI.BootFrame > StateDuration) { DashUI.OverlayState = 1; DashUI.BootState++; DashUI.BootFrame = 0; }
			break;
		case 4: // Fade In Epilepsy Warning Message
			DashUI.Overlay.Alpha++;
			DashUI.BootWarningAlpha+=2;
            if (DashUI.BootFrame > StateDuration) { DashPluginsProcess(); DashUI.BootState++; DashUI.BootFrame = 0; }
			break;
		case 5: // Show Epilepsy Warning Message
            if ((DashUI.BootFrame > StateDuration) && (DashUI.LoadedPlugins)) { DashUI.BootState++; DashUI.BootFrame = 0; }
			break;
		case 6: // Fade Out Epilepsy Warning Message
			DashUI.Overlay.Alpha--;
			DashUI.BootWarningAlpha-=2;
			if (DashUI.BootFrame > StateDuration) { DashUI.OverlayState = 0; DashUI.BootState++; DashUI.BootFrame = 0; }
			break;
		case 7: // Fade In Main UI
			if (std.exists(`${PATHS.Theme}${UserConfig.Theme}/thm.js`))	{ std.loadScript(`${PATHS.Theme}${UserConfig.Theme}/thm.js`); }

			UIAnimationCommonFade_Start(DashUI.Clock, () => UIAnimationCommon_Work(DashUI.Clock.Fade, 0.04f), true);
			UIAnimationCommonFade_Start(DashUI.Category, () => UIAnimationCommon_Work(DashUI.Category.Fade, 0.04f), true);
			UIAnimationCommonFade_Start(DashUI.Items, () => UIAnimationCommon_Work(DashUI.Items.Fade, 0.04f), true);
			DashUI.BootState++;
			break;
		case 8: //
			if (DashUI.AnimationQueue.length < 1) {
				DashUI.BootState++;
				DashUI.State.Next = 1;
			}
			break;
	}

	DashUI.BootFrame++;
}
function ExitSequenceHandler() {
	switch (DashUI.ExitState) {
		case 0: // Fade Out Main UI
			DashUI.Overlay.Alpha = 0;
			DashUI.Overlay.Color = { R: 0, G: 0, B: 0 };
			UIAnimationCommonFade_Start(DashUI.Clock, () => UIAnimationCommon_Work(DashUI.Clock.Fade, 0.075f), false);
			UIAnimationCommonFade_Start(DashUI.Category, () => UIAnimationCommon_Work(DashUI.Category.Fade, 0.04f), false);
			UIAnimationCommonFade_Start(DashUI.Items, () => UIAnimationCommon_Work(DashUI.Items.Fade, 0.04f), false);
			if (DashUI.SubMenu.Level > -1) {
				UIAnimationCommonFade_Start(DashUI.SubMenu.Animation, () => UIAnimationCommon_Work(DashUI.SubMenu.Animation.Fade, 0.04f), false);
			}
			if (DashUI.SubMenu.Level > 0) {
				UIAnimationCommonFade_Start(DashUI.SubMenu.PrevAnimation, () => UIAnimationCommon_Work(DashUI.SubMenu.PrevAnimation.Fade, 0.04f), false);
			}
			DashUI.ExitState++;
			break;
		case 1: // Wait for Interface Fade Out Animation to Complete
			if (DashUI.AnimationQueue.length < 1) {	DashUI.ExitState++; }
			break;
		case 2: // Error Handler
			ExitErrorHandler();
			break;
		case 3: // Screen Fade Out
			DashUI.Overlay.Alpha+=4;
			if (DashUI.Overlay.Alpha === 128) {	DashUI.ExitState++;	}
			break;
		case 4: // Execute
			CfgMan.Process();
			if ('Elf' in gExit)	{ ExecuteELF(); }
			else { ExecuteSpecial() }
			break;
		case 5: // Fade Back In
			if (!DashUI.Dialog.Display) {
				UIAnimationCommonFade_Start(DashUI.Clock, () => UIAnimationCommon_Work(DashUI.Clock.Fade, 0.075f), true);
				UIAnimationCommonFade_Start(DashUI.Category, () => UIAnimationCommon_Work(DashUI.Category.Fade, 0.04f), true);
				UIAnimationCommonFade_Start(DashUI.Items, () => UIAnimationCommon_Work(DashUI.Items.Fade, 0.04f), true);
				if (DashUI.SubMenu.Level > -1) {
					UIAnimationCommonFade_Start(DashUI.SubMenu.Animation, () => UIAnimationCommon_Work(DashUI.SubMenu.Animation.Fade, 0.04f), true);
				}
				if (DashUI.SubMenu.Level > 0) {
					UIAnimationCommonFade_Start(DashUI.SubMenu.PrevAnimation, () => UIAnimationCommon_Work(DashUI.SubMenu.PrevAnimation.Fade, 0.04f), true);
				}
				DashUI.ExitState++;
			}
			break;
		case 6: // Wait for Interface Fade In Animation to Complete
			if (DashUI.AnimationQueue.length < 1) {	DashUI.ExitState++; }
			break;
		case 7: // Wait for Interface Fade In Animation to Complete
			DashUI.State.Next = DashUI.State.Previous;
			DashUI.ExitState = 0;
			break;
	}
}
function ExitErrorHandler() {
	let result = true; // No problems found

	if ('Elf' in gExit)	{
        // Check if File Exists.
        if (Array.isArray(gExit.Elf.Path)) {
            result = false;
            for (let i = 0; i < gExit.Elf.Path.length; i++) {
                gExit.Elf.Path[i] = resolveFilePath(gExit.Elf.Path[i]);
                if (std.exists(gExit.Elf.Path[i])) {
                    gExit.Elf.Path = gExit.Elf.Path[i];
                    result = true; // File Found
                    break;
                }
            }
            if (!result) {
                // Show new Error Message
                OpenDialogErrorMsg(XMBLANG.ERROR.ELF_NOT_FOUND);
            }
        }
        else {
            gExit.Elf.Path = resolveFilePath(gExit.Elf.Path);
            const elfExists = std.exists(gExit.Elf.Path);
            if (!elfExists) {
                result = false; // An Error has been encountered

                // Show new Error Message
                OpenDialogErrorMsg(XMBLANG.ERROR.ELF_NOT_FOUND);
            }
        }
	}

	if (result) { DashUI.ExitState++; } // Continue
	else { DashUI.ExitState = 5; } 		// Fade Back In
}
function DashUIAnimationHandler() {
    let length = DashUI.AnimationQueue.length;
    for (let i = 0; i < length; i++) {
        const f = DashUI.AnimationQueue.shift();
        if (!f()) { DashUI.AnimationQueue.push(f); }
    }
}
function DashUIObjectHandler(Item) {
    DashUI.SelectedItem = Item;

	switch (Item.Type) {
		case "ELF"	  : DashUISetElfExecution(Item.Value); break;
		case "SUBMENU": DashUISetNewSubMenu(Item.Value); break;
		case "CONTEXT": DashUISetNewContextMenu(Item.Value); break;
		case "CODE"	  : DashUISetSpecialExit(Item.Value); break;
		case "DIALOG" : DashUISetDialog(Item.Value); break;
	}
}
function DashUIStateHandler() {
	// Only handle State changes after animations are finished.

    if (DashUI.AnimationQueue.length > 0) { SetDashPadEvents(0); return; }
    const states = DashUI.State;

	// Check if there is a state change and handle it accordingly.
    if (states.Next !== states.Current) {
        const fix = (states.Next === 3 && DashUI.Context.Level < 0) || (states.Next === 4 && DashUI.Dialog.Level < 0);
        if (fix) { states.Next = (DashUI.SubMenu.Level > -1) ? 2 : 1; }

        states.Previous = states.Current;
        states.Current = states.Next;
	}

	// Update Pad Mode if there is a state change.
    if (PadSettings.Mode !== states.Current) { SetDashPadEvents(states.Current); }
}

//////////////////////////////////////////////////////////////////////////
///*				   		   Image Cache							  *///
//////////////////////////////////////////////////////////////////////////

const ImageCache = (() => {
    const MAX_CACHE_SIZE = 20;

    const cache = []; // { Path, Image }
    const queue = [];
    let isLoading = false;

    function findInCache(path) {
        return cache.find(entry => entry.Path === path);
    }

    function enqueue(path) {
        // Avoid duplicate queue entries
        if (queue.find(entry => entry.Path === path)) return;

        // If queue is full, remove oldest
        if (queue.length >= MAX_CACHE_SIZE) {
            const removed = queue.shift();
            // Also try removing from cache if not used
            const index = cache.findIndex(c => c.Path === removed.Path);
            if (index !== -1) {
                const obj = cache[index];
                if (obj.Image && obj.Image.ready()) {
                    obj.Image.free();
                }
                cache.splice(index, 1);
            }
        }

        queue.push({ Path: path });
    }

    function evictIfNeeded() {
        if (cache.length >= MAX_CACHE_SIZE) {
            const removed = cache.shift();
            if (removed.Image && removed.Image.ready()) {
                removed.Image.free();
            }
        }
    }

	function loadImages(itemsToLoad) {
		try {
			for (let i = 0; i < itemsToLoad.length; i++) {
				const { Path } = itemsToLoad[i];
				if (!std.exists(Path)) { continue; }
				const image = new Image(Path);
				image.optimize();
				image.filter = LINEAR;

				// Update cache entry with loaded image
				const cached = findInCache(Path);

				if (cached) { cached.Image = image; }
			}
		} catch (e) {
			xlog(e);
		} finally {
			isLoading = false;
		}
	}

    return {
        Get: function(path) {
            const entry = findInCache(path);
            if (entry && entry.Image) {
                return entry.Image;
            }

            if (!entry) {
                evictIfNeeded();
                const newEntry = { Path: path, Image: false };
                cache.push(newEntry);
                enqueue(path);
            }

            return false;
        },

        Process: function() {
            if (isLoading || queue.length === 0) return;
			const itemsToLoad = queue.splice(0, queue.length); // Shallow copy
			isLoading = true;
			if (!gThreads) { loadImages(itemsToLoad); }
			else { Threads.new(() => loadImages(itemsToLoad)).start(); }
        },

        Clear: function() {
            // Optional utility to fully clear the cache and free memory
            for (const entry of cache) {
                if (entry.Image && entry.Image.ready()) {
                    entry.Image.free();
                }
            }
            cache.length = 0;
            queue.length = 0;
        }
    };
})();

//////////////////////////////////////////////////////////////////////////
///*				   		  Initialization						  *///
//////////////////////////////////////////////////////////////////////////

function DashElementsInit() {
	DashElements.ClockIco = new Image(`${PATHS.XMB}dash/dash_clock.png`);
	DashElements.ClockIco.startx = 1;
	DashElements.ClockIco.starty = 1;

	DashElements.ClockOutline = new Image(`${PATHS.XMB}dash/dash_clock_outline.png`);
	DashElements.ClockOutline.height = ~~(DashElements.ClockOutline.height / 2);

	DashElements.Context = new Image(`${PATHS.XMB}dash/dash_context.png`);
	DashElements.Context.width = 275;
	DashElements.Context.startx = 4;
	DashElements.Context.starty = 2;

	DashElements.CtxIco = new Image(`${PATHS.XMB}color/ctx.png`);
	DashElements.CtxIco.width = 26;
	DashElements.CtxIco.height = 26;

	DashElements.LoadIco = new Image(`${PATHS.XMB}dash/dash_load.png`);

	DashElements.BootLogo = new Image(`${PATHS.XMB}dash/dash_logo.png`);

	DashElements.OptionBox = new Image(`${PATHS.XMB}dash/dash_option_box.png`);
	DashElements.OptionBox.height = 79;

	DashElements.OptionIco = new Image(`${PATHS.XMB}dash/triangle.png`);
	DashElements.OptionIco.width = 14;
	DashElements.OptionIco.height = 14;

	DashElements.Arrow = new Image(`${PATHS.XMB}dash/dash_submenu.png`);

	Object.values(DashElements).forEach((dashElem) => {
		dashElem.optimize();
		dashElem.filter = LINEAR;
	});

    DashElements.ItemFocus = false;

    while (DashIconsInfo.length > DashIcons.length) {
        const path = `${PATHS.Theme}${UserConfig.Theme}/icons/${DashIconsInfo[DashIcons.length].path}`;
        const icn = std.exists(path) ? new Image(path) : new Image(`${PATHS.Theme}Original/icons/${DashIconsInfo[DashIcons.length].path}`);
        icn.optimize();
        icn.filter = LINEAR;
        DashIcons.push(icn);
    }
}
function DashUIConstantsInit() {

    UICONST.StextLine = 17;
    UICONST.IcoSelSize = 72;
    UICONST.IcoUnselSize = 48;
    UICONST.IcoUnselMod = 24;
    UICONST.SubItemSlotSize = 52;
    UICONST.ScreenDrawLimit = 64;
    UICONST.ContextPreviewOptionX = ScrCanvas.width - 75;
    UICONST.ScrLowerLimit = ScrCanvas.height + UICONST.ScreenDrawLimit;
    UICONST.ScrRightLimit = ScrCanvas.width + UICONST.ScreenDrawLimit;
    UICONST.ClockX = ScrCanvas.width - 194;
    UICONST.ClockY = 35;
    UICONST.ClockIcoX = ScrCanvas.width - 24;
    UICONST.ClockTextObj.Scale = FontObj.SizeM;
    UICONST.BootInfo.SfxFrame = 12;
    UICONST.BootInfo.StateDurations = [63, 127, 29, 127, 63, 119, 127];
    UICONST.BootWarningText = {
        Text: PreprocessText(getLocalText(XMBLANG.BOOT_WARNING)),
		Alignment: "CENTER",
        Scale: FontObj.SizeM
	};
    UICONST.BootLogoY = ~~(ScrCanvas.height / 3) + 20;
    UICONST.BootLogoX = ScrCanvas.width - DashElements.BootLogo.width;
    UICONST.Category.IconX = (ScrCanvas.width >> 1) - 178;
    UICONST.Category.IconY = (ScrCanvas.height >> 1) - 120;
    UICONST.Category.SubX = 110;
    UICONST.CatItems.IconX = (ScrCanvas.width >> 1) - 178;
    UICONST.CatItems.IconY = (ScrCanvas.height >> 1) - 32;
    UICONST.CatItems.TextX = (ScrCanvas.width >> 1) - 80;
    UICONST.CatItems.TextY = (ScrCanvas.height >> 1) - 16;
    UICONST.CatItems.SubNoSelX = 46;
    UICONST.SubItems.ArrowX = (ScrCanvas.width >> 1) - 204;
    UICONST.SubItems.ArrowY = (ScrCanvas.height >> 1) - 6;
    UICONST.SubItems.IconX = (ScrCanvas.width >> 1) - 174;
    UICONST.SubItems.IconY = (ScrCanvas.height >> 1) - 32;
    UICONST.SubItems.TextX = (ScrCanvas.width >> 1) - 90;
    UICONST.SubItems.TextY = (ScrCanvas.height >> 1) - 16;
    UICONST.SubItems.PrevSelX = 116;
    UICONST.SubItems.PrevUnselX = 70;
    UICONST.OptionBox.XBOX = ScrCanvas.width - 100;
    UICONST.OptionBox.YBOX = ScrCanvas.height - 70;
    UICONST.OptionBox.XICO = ScrCanvas.width - 93;
    UICONST.OptionBox.YICO = ScrCanvas.height - 34;
    UICONST.OptionBox.XTXT = ScrCanvas.width - 73;
    UICONST.OptionBox.YTXT = ScrCanvas.height - 42;
    UICONST.Context.BoxX = 180;
    UICONST.Context.BoxA = 116;
    UICONST.Context.BaseX = ScrCanvas.width - 164;
    UICONST.Context.BaseY = (ScrCanvas.height >> 1) - 15;
    UICONST.Context.PreviewImgX = ScrCanvas.width - 450;
    UICONST.Context.PreviewImgY = (ScrCanvas.height >> 1) + 60;
    UICONST.DialogInfo.LineYTop = (ScrCanvas.height >> 1) - 160;
    UICONST.DialogInfo.LineYBottom = (ScrCanvas.height >> 1) + 170;
    UICONST.DialogInfo.IconX = (ScrCanvas.width >> 1) - 280;
    UICONST.DialogInfo.NameX = - (ScrCanvas.width >> 1) - 15;
    UICONST.DialogInfo.NameY = (ScrCanvas.height >> 1);
    UICONST.DialogInfo.DescX = (ScrCanvas.width >> 1);
    UICONST.Fun = {
        SubMenuFade: () => UIAnimationCommon_Work(DashUI.SubMenu.Animation.Fade, 0.04f),
        SubMenuPrevFade: () => UIAnimationCommon_Work(DashUI.SubMenu.PrevAnimation.Fade, 0.04f),
        DialogContentFade: () => UIAnimationCommon_Work(DashUI.Dialog.ContentFade, 0.04f),
        DialogAnimation: () => UIAnimationCommon_Work(DashUI.Dialog.Animation, 0.15f)
    };
}
function DashUICustomizationInit() {
    UICONST.ClockTextColor = {};
    UICONST.DefaultIconColor = Color.new(128, 128, 128, 128);
    UICONST.TextSelectedColor = { R: 128, G: 128, B: 128 };
    UICONST.TextUnselectedColor = { R: 128, G: 128, B: 128 };
    UICONST.Category.IconSelectedColor = { R: 128, G: 128, B: 128 };
    UICONST.Category.IconUnselectedColor = { R: 128, G: 128, B: 128 };
    UICONST.Context.Tint = false;
    UICONST.DialogInfo.LineCol = Color.new(196, 196, 196, 128);
}
function DashUInit() {
    // Constant Objects
    UICONST.ClockTextObj = {};
    UICONST.BootInfo = {};
    UICONST.BootWarningText = {};
    UICONST.Category = {};
    UICONST.CatItems = {};
    UICONST.Context = {};
    UICONST.SubItems = {};
    UICONST.OptionBox = {};
    UICONST.DialogInfo = {};
    UICONST.Fun = {};

    // Common Parameters
    DashUI.LoadedPlugins = false;
	DashUI.LoadSpinning = 0.0f;
	DashUI.BootWarningAlpha = 0;
	DashUI.State = {
		Current: 0,
		Previous: 0,
		Next: 0
	};
	DashUI.ExitState = 0;
	DashUI.BootState = 0;
	DashUI.BootFrame = 0;
	DashUI.OverlayState = 0;
	DashUI.AnimationQueue = [];

	// Overlay Object
	DashUI.Overlay = {};
	DashUI.Overlay.Alpha = 128;
	DashUI.Overlay.Color = { R: 0, G: 0, B: 0 }

	// Init Clock Object
	DashUI.Clock = {};
	DashUI.Clock.Display = false;
	DashUI.Clock.Fade = createFade();

	// Init Item Backgroud Object
	DashUI.ItemBG = {};

	// Init Categories Object
	DashUI.Category = {};
	DashUI.Category.Display = false;
	DashUI.Category.Next = 5;
	DashUI.Category.Current = 5;
	DashUI.Category.Animation = {};
	DashUI.Category.Animation.Running = false;
	DashUI.Category.Animation.Progress = 0.0f;
	DashUI.Category.Fade = createFade();

	// Init Items Object
	DashUI.ItemCollection = {};
	DashUI.ItemCollection.Current = DashCatItems[DashUI.Category.Current].Items;
	DashUI.ItemCollection.Next = DashCatItems[DashUI.Category.Next].Items;
	DashUI.ItemCollection.Swipe = {
		Dir: 0,
		Progress: 0.0f,
		Running: false
	};

	DashUI.Items = {};
	DashUI.Items.Display = false;
	DashUI.Items.Current = 0;
	DashUI.Items.Next = 0;
	DashUI.Items.Animation = {};
	DashUI.Items.Animation.Running = false;
	DashUI.Items.Animation.Progress = 0.0f;
	DashUI.Items.Fade = createFade();

	// Init Sub Menu Object
    DashUI.SubMenu = {};
    DashUI.SubMenu.Fade = createFade();
	DashUI.SubMenu.Display = false;
	DashUI.SubMenu.Level = -1;
	DashUI.SubMenu.ItemCollection = [];
	DashUI.SubMenu.Items = {};
	DashUI.SubMenu.Items.Current = 0;
	DashUI.SubMenu.Items.Next = 0;
	DashUI.SubMenu.Animation = {};
	DashUI.SubMenu.Animation.Running = false;
	DashUI.SubMenu.Animation.Progress = 0.0f;
	DashUI.SubMenu.Animation.Fade = createFade();
	DashUI.SubMenu.PrevAnimation = {};
	DashUI.SubMenu.PrevAnimation.Fade = createFade();

	// Init Context Object
	DashUI.Context = {};
	DashUI.Context.Display = false;
	DashUI.Context.Level = -1;
	DashUI.Context.PreviewA = 0;
	DashUI.Context.ItemCollection = [];
	DashUI.Context.Items = {};
	DashUI.Context.Items.Current = 0;
	DashUI.Context.Items.Next = 0;
	DashUI.Context.Items.UpperLimit = 0;
	DashUI.Context.Items.LowerLimit = 0;
	DashUI.Context.Animation = {};
	DashUI.Context.Animation.Running = false;
	DashUI.Context.Animation.Progress = 0.0f;
    DashUI.Context.Fade = createFade();

	DashUI.OptionBox = {};
	DashUI.OptionBox.Progress = 0.0f;

	// Init Dialog Object
	DashUI.Dialog = {};
	DashUI.Dialog.Display = false;
	DashUI.Dialog.Level = -1;
	DashUI.Dialog.Data = [];
	DashUI.Dialog.Animation = {};
	DashUI.Dialog.Animation.Running = false;
	DashUI.Dialog.Animation.Progress = 0.0f;
	DashUI.Dialog.Fade = createFade();
	DashUI.Dialog.ContentFade = createFade();
}
function DashCatInit() {
	for (let i = 0; i < CATNAME.length; i++) { DashCatItems.push({ Items: [], Default: 0 }); }
}
function DashPluginsInit() {
    const plugins = System.listDir(PATHS.Plugins).sort((a, b) => a.name.localeCompare(b.name));

    for (let i = 0; i < plugins.length; i++) {
        if ((plugins[i].dir) || (!extensionMatches(plugins[i].name, ["json", "xml"]))) { continue; }

        xlog(`DashPluginsInit(): Loading Plugin: ${plugins[i].name}`);
        const fname = plugins[i].name.toLowerCase();
        const path = `${PATHS.Plugins}${plugins[i].name}`;
        let plg = false;
        try {
            plg = std.open(path, "r");
            if (!plg) { throw new Error(`DashPluginsInit(): Error opening plugin ${plugins[i].name}`); }
            let data = "";
            const type = getFileExtension(fname).toUpperCase();
            switch (type) {
                case "JSON": data = plg.readAsString(); break;
                case "XML": data = xmlParseElement(plg.readAsString()); break;
            }
            DashPluginData.push({ Data: data, Type: type });
        } catch (e) {
            xlog(e);
            continue;
        } finally {
            if (plg) { plg.close(); }
        }

        xlog(`DashPluginsInit(): Loaded Plugin: ${plugins[i].name}`);
    }
}
function DashPluginsProcess() {
    const plgIval = os.setInterval(() => {
        if (DashPluginData.length < 1) {
            DashUI.LoadedPlugins = true;
            os.clearInterval(plgIval);
            return;
        }

        const plg = DashPluginData.shift();
        let Plugin = false;

        switch (plg.Type) {
            case "JSON": Plugin = JSON.parse(plg.Data); break;
            case "XML": Plugin = parseXmlPlugin(plg.Data); break;
        }

        if (Plugin) { AddNewPlugin(Plugin); }
    }, 0);
}
function DashBackgroundLoad() {
    if (gThreads) { Threads.new(DashPluginsInit).start(); }
    else { DashPluginsInit(); }
}

//////////////////////////////////////////////////////////////////////////
///*				   			 Boot Logo							  *///
//////////////////////////////////////////////////////////////////////////

function UIAnimateBootLogo_Work(Alpha) {
    Alpha = alphaCap(Alpha);
    if (Alpha < 1) { return; }
    const logo = DashElements.BootLogo;
    logo.color = Color.setA(logo.color, Alpha);
    logo.draw(UICONST.BootLogoX, UICONST.BootLogoY);
}

//////////////////////////////////////////////////////////////////////////
///*				   			   Clock							  *///
//////////////////////////////////////////////////////////////////////////

function UIClockText(a) {
    const obj  = UICONST.ClockTextObj;
    const MM   = String(gTime.month).padStart(2, '0');
    const DD   = String(gTime.day).padStart(2, '0');
    const mm   = String(gTime.minute).padStart(2, '0');
    const H24  = gTime.hour;
    const H12  = (H24 % 12) || 12;
    const amPm = H24 >= 12 ? 'PM' : 'AM';
    const Hstr = (UserConfig.HourFormat === 0) ? String(H12).padStart(2, '0') : String(H24).padStart(2, '0');

    const date = (UserConfig.DateFormat === 0) ? `${DD}/${MM}` : `${MM}/${DD}`;
    const time = (UserConfig.HourFormat === 0) ? `${Hstr}:${mm} ${amPm}` : `${Hstr}:${mm}`;

    obj.Text = [`${date}  ${time}`];
    obj.Position = { X: UICONST.ClockX + 12, Y: UICONST.ClockY - 1 };
    obj.Alpha = a;
    if ('R' in UICONST.ClockTextColor) { obj.Color = UICONST.ClockTextColor; }

    TxtPrint(obj);
}
function DrawUIClock() {
	if (DashUI.Clock.Display === false) { return; }
	const p = getFadeProgress(DashUI.Clock.Fade);
	const a   = ~~(128 * p);
	const box = DashElements.ClockOutline;
    const ico = DashElements.ClockIco;
    const col = Color.setA(box.color, a);
    const y   = UICONST.ClockY;
    const x   = UICONST.ClockX;

    // Draw Start of Clock Outline
    box.width = 32;
    box.startx = 2;
    box.color = col;
    box.draw(x, y);

    // Draw End of Clock Outline
    box.width = 196;
    box.startx = 34;
    box.color = col;
    box.draw(x + 29, y);

    ico.color = col;
    ico.draw(UICONST.ClockIcoX, y + 7);

	UIClockText(a);
}

//////////////////////////////////////////////////////////////////////////
///*				   			     BG 							  *///
//////////////////////////////////////////////////////////////////////////

function DashUIResetBg() {
    Timer.reset(DashUI.ItemBG.Timer);
    Timer.resume(DashUI.ItemBG.Timer);
    if ('Image' in DashUI.ItemBG) { delete DashUI.ItemBG.Image; }
}
function DrawUIObjectBg() {
    const obj = DashUI.ItemBG;
    if (!('Timer' in obj)) { obj.Timer = Timer.new(); }
    let time = getTimerSec(obj.Timer);
    if (time < 8) { obj.A = 0; return; }

    if (!('Image' in obj)) { obj.A = 0; return; }

    const customBg = ImageCache.Get(obj.Image);
    const Ready = customBg && customBg.ready();
    if (!Ready) { obj.A = 0; return; }

    if (obj.A === 0) {
        let ival = os.setInterval(() => {
            obj.A += 8;
            if (obj.A > 120) { os.clearInterval(ival); }
        }, 0);
    }

    customBg.width = ScrCanvas.width;
    customBg.height = ScrCanvas.height;
    customBg.color = Color.setA(customBg.color, obj.A);
    customBg.draw(0, 0);
}

//////////////////////////////////////////////////////////////////////////
///*				   			   Generic							  *///
//////////////////////////////////////////////////////////////////////////

function DrawDashLoadIcon(Properties) {
	Properties.Alpha = alphaCap(Properties.Alpha);
    if (Properties.Alpha < 1) { return; }

	DashElements.LoadIco.width = Properties.Width;
	DashElements.LoadIco.height = Properties.Height;
    DashElements.LoadIco.color = Color.setA(DashElements.LoadIco.color, Properties.Alpha);
	DashElements.LoadIco.angle = DashUI.LoadSpinning;
	DashElements.LoadIco.draw(Properties.X, Properties.Y);
}
function DrawDashIcon(Properties) {
	let Image = false;
	let Ready = false;
	Properties.Alpha = alphaCap(Properties.Alpha);
	if (Properties.Alpha < 1) { return; }

	if (('CustomIcon' in Properties) && (typeof Properties.CustomIcon === "string")) {
		const customImg = ImageCache.Get(Properties.CustomIcon);
		Ready = customImg && customImg.ready();
		if (Ready) { Image = customImg; }
	}
	else {
		if ((Properties.ID < 0)) { return; }
		Ready = DashIcons[Properties.ID] && DashIcons[Properties.ID].ready();
		if (Ready) { Image = DashIcons[Properties.ID]; }
	}

	if (Ready) {
        if ('Tint' in Properties) { Image.color = Color.new(Properties.Tint.R, Properties.Tint.G, Properties.Tint.B, Properties.Alpha); }
        else { Image.color = Color.setA(UICONST.DefaultIconColor, Properties.Alpha); }
		Image.width  = Properties.Width;
		Image.height = Properties.Height;
		Image.angle  = ('Rotation' in Properties) ? Properties.Rotation : 0.0f;
		Image.draw(Properties.X, Properties.Y);
	}
	else { DrawDashLoadIcon(Properties); }
}
function DashUISetSpecialExit(type) {
	gExit = { Type: type };
	DashUI.State.Next = 5;
}
function DashUISetElfExecution(Data) {
	gExit = {};
    gExit.Elf = { Path: Data.Path };
	if ('Args' in Data) 	 { gExit.Elf.Args = Data.Args; }
	if ('RebootIOP' in Data) { gExit.Elf.RebootIOP = Data.RebootIOP === "true"; }
	if ('Code' in Data)		 { gExit.Elf.Code = Data.Code; }
	DashUI.State.Next = 5;
}
function UpdateIconSpinning() {
    DashUI.LoadSpinning = DashUI.LoadSpinning + 0.05f;
    if (DashUI.LoadSpinning == 6.05f) { DashUI.LoadSpinning = 0.05f; }
}
function UIAnimationCommonFade_Start(element, work, isIn) {
	if ((element.Display && isIn === true) || (!element.Display && isIn === false)) {
		return;
	}

	element.Fade.In = isIn;
	element.Fade.Progress = 0.0f;
	element.Fade.Running = true;
	element.Display = true;

	DashUI.AnimationQueue.push(() => {
		const result = work();
		if (result) { element.Display = isIn; }
		return result;
	});
}
function UIAnimationCommon_Work(anim, progress) {

	anim.Progress += progress;

	if (anim.Progress >= 1.0f) {
		anim.Progress = 1.0f;
		anim.Running = false;
		return true;
	}

	return false;
}

//////////////////////////////////////////////////////////////////////////
///*				   			 Categories							  *///
//////////////////////////////////////////////////////////////////////////

function UIAnimationCategoryMove_Start(delta) {
    const obj = DashUI.Category;
    const next = obj.Next + delta;
	const run = next >= 0 && next < CATNAME.length;
    if ((run) && (obj.Current === obj.Next)) {
		DashUIResetBg();
		PlayCursorSfx();
        obj.Next = next;
        obj.Animation.Running = true;
        obj.Animation.Progress = 0.0f;
		DashUI.AnimationQueue.push(UIAnimationCategoryMove_Work);
		UIAnimationItemCollectionMove_Start();
	}
}
function UIAnimationCategoryMove_Work() {
    const anim = DashUI.Category.Animation;
    if (!anim.Running) { return true; }
    anim.Progress += 0.075f;
    if (anim.Progress < 1.0f) {
		const l = pad.pressed(Pads.LEFT) || (pad.lx < -64);
		const r = pad.pressed(Pads.RIGHT) || (pad.lx > 64);
        if ((anim.Progress > 0.6f) && (l || r)) {
			const delta = l ? -1 : 1;
			UIAnimationCategoryMove_Reset(delta)
		}
		return false;
	}

    anim.Progress = 0.0f;
    anim.Running = false;
	DashUI.Category.Current = DashUI.Category.Next;

	return true;
}
function UIAnimationCategoryMove_Reset(delta) {
    const catObj = DashUI.Category;
    const next = catObj.Next + delta;
	const run = next >= 0 && next < CATNAME.length;
	if (!run) { return }

	DashUIResetBg();
    PlayCursorSfx();
    const collObj = DashUI.ItemCollection;

	DashUI.Items.Current        = DashCatItems[catObj.Next].Default;
	DashUI.Items.Next           = DashUI.Items.Current;
    catObj.Current              = catObj.Next;
    catObj.Next                 = next;
    catObj.Animation.Progress   = 0.0f;
    collObj.Swipe.Dir           = catObj.Next - catObj.Current;
    collObj.Current             = collObj.Next;
    collObj.Next                = DashCatItems[catObj.Next].Items;
    collObj.Swipe.Progress      = -0.075f;
}
function DrawUICategories() {
	if ((!DashUI.Category.Display) || (DashUI.SubMenu.Level > 1)) { return; }

	const Icon      = {};
	const Text      = {};
	Text.Position   = {};
	Text.Alignment  = "CENTER";
	Text.Scale      = FontObj.SizeM;

    const fade          = DashUI.Category.Fade;
    const dialogFade    = (DashUI.Dialog.Display && (!DashUI.Dialog.Data[DashUI.Dialog.Level].BG))
	const faderunning   = fade.Running || dialogFade;
	let fadeProgress    = getFadeProgress(fade);
    if (dialogFade) { fadeProgress = 1 - getFadeProgress(DashUI.Dialog.Fade); }

    const anim      = DashUI.Category.Animation;
	const easing    = (anim.Running) ? cubicEaseOut(anim.Progress) : 0;
	const current   = DashUI.Category.Current;
	const next      = DashUI.Category.Next;
	const nextDif   = next - current;
    const fadeX     = 20 * (1 - fadeProgress);
    const fadeY     = -10 * (1 - fadeProgress)

	// Sub Menu Modifiers
    const subMod = DashUI.SubMenu.Display;
    const subLvl = DashUI.SubMenu.Level;
	const subfade = DashUI.SubMenu.Fade;
	const subfadeProgress = getFadeProgress(subfade);

	const subSelXmod 	= UICONST.Category.SubX * subfadeProgress;
	const subSelAmod 	= ~~(128 * subfadeProgress);
	const subNoSelXmod 	= 18 * subfadeProgress + (18 * subLvl);
	const subNoSelYmod 	= 5 * subfadeProgress + (5 * subLvl);
    const subNoSelAmod  = (subLvl < 1) ? ~~(-102 * subfadeProgress) : -102 - (26 * subfadeProgress);
    const subLevelXmod  = UICONST.Category.SubX * subLvl;

	// Context Modifiers
	const contextMod          = DashUI.Context.Display;
	const contextfade         = DashUI.Context.Fade;
    const contextfadeProgress = getFadeProgress(contextfade);
    const unselAsubCtxMod     = ~~(-8 * contextfadeProgress);
    const UnselACtxMod        = ~~(-102 * contextfadeProgress);
    const UnselPosCtxMod      = 5 * contextfadeProgress;

    const halfMod    = UICONST.IcoUnselMod >> 1;
	const contextX 	 = halfMod * contextfadeProgress;

    for (let i = 0; i < CATNAME.length; i++) {

        // Cull: Objects greatly above and below the selected item
		const dif = i - current;
		if (dif < -3) { continue; }
		else if (dif > 7) { break; }

		Icon.ID 		= i;
		Icon.Alpha 		= 110;
		Icon.Width 	    = UICONST.IcoUnselSize;
		Icon.Height     = UICONST.IcoUnselSize;
		Icon.X 			= UICONST.Category.IconX;
		Icon.Y 			= UICONST.Category.IconY;
		Icon.Tint		= UICONST.Category.IconUnselectedColor;

        const isSelected = (i === current || i === next);

        if (isSelected) {
            Text.Text = [getLocalText(CATNAME[i])];
            Text.Position.X = -142;
            Text.Position.Y = -54;
        }

        if (i === current) {
            const sizeMod = UICONST.IcoSelSize - UICONST.IcoUnselMod * easing;
			Icon.X 			+= ((nextDif < 0) ? 102 * easing : 81 * easing) * -nextDif;
			Icon.Y 			+= 15 * easing;
			Icon.Width 		= sizeMod;
			Icon.Height 	= sizeMod;
			Icon.Tint		 = (anim.Running) ? interpolateColorObj(UICONST.Category.IconSelectedColor, UICONST.Category.IconUnselectedColor, anim.Progress) : UICONST.Category.IconSelectedColor;
			Text.Color		 = (anim.Running) ? interpolateColorObj(UICONST.TextSelectedColor, UICONST.TextUnselectedColor, anim.Progress) : UICONST.TextSelectedColor;
			Text.Alpha 	     = 128 + (-120 * easing);
			Text.Position.X  = Text.Position.X - (92 * easing * nextDif);

			if (subMod) {
				Icon.X 			-= (subSelXmod + subLevelXmod);
				Icon.Alpha 		-= (128 * subfadeProgress) * subLvl;
				Text.Position.X -= (subSelXmod + subLevelXmod);
				Text.Alpha 	    -= subSelAmod;
				Text.Alpha 	    -= (128 * subLvl);
			}

			if (contextMod) {
				Icon.Tint		 = interpolateColorObj(UICONST.Category.IconSelectedColor, UICONST.Category.IconUnselectedColor, contextfadeProgress);
				Text.Alpha 	    -= ~~(128 * contextfadeProgress); ;
				if (subMod) { Icon.X -= contextX; }
			}
		}
        else if (i === next) {
            const sizeMod = UICONST.IcoSelSize - UICONST.IcoUnselMod * (1 - easing);
			Icon.X 			 = Icon.X - ((nextDif > 0) ? 102 * (1 - easing) : 81 * (1 - easing)) * -nextDif;
			Icon.Y 			+= 15 * (1 - easing);
            Icon.Width       = sizeMod;
			Icon.Height 	 = sizeMod;
			Icon.Tint		 = interpolateColorObj(UICONST.Category.IconUnselectedColor, UICONST.Category.IconSelectedColor, anim.Progress);
			Text.Position.X  = Text.Position.X + (((nextDif < 0) ? 88 : 92) * (1 - easing) * nextDif);
			Text.Color		 = interpolateColorObj(UICONST.TextUnselectedColor, UICONST.TextSelectedColor, anim.Progress);
			Text.Alpha 	     = 128 - (110 * (1 - easing));
		}
		else {
			const baseX = (dif < 0) ? dif * 81 : (dif * 81 + 21);
			Icon.Y 		+= 15;
			Icon.X 		+= baseX;
			Icon.X 		+= 81 * -nextDif * easing;

            if (subMod) {
                Icon.Alpha += (subNoSelAmod);
                Icon.X -= subNoSelXmod;
                Icon.Y += subNoSelYmod;
                if (contextMod) {
                    Icon.Alpha += unselAsubCtxMod;
                }
            }
			else if (contextMod) {
                Icon.Alpha += UnselACtxMod;
                Icon.X -= UnselPosCtxMod;
                Icon.Y += UnselPosCtxMod;
			}
		}

		if (faderunning) {
			Icon.Alpha 		= ~~(Icon.Alpha * fadeProgress);
            const offsetX = (dif > 0) ? fadeX : -fadeX;
			Icon.X += offsetX;
            Icon.Y += fadeY;

            if (isSelected) {
                Text.Alpha = ~~(Text.Alpha * fadeProgress);
                Text.Position.X += offsetX;
                Text.Position.Y += fadeY;
            }
		}

		const insideLimits = (Icon.X > -UICONST.ScreenDrawLimit) && (Icon.X < UICONST.ScrRightLimit);
		if (insideLimits) { DrawDashIcon(Icon); }
        if (isSelected) { TxtPrint(Text); }
	}
}

//////////////////////////////////////////////////////////////////////////
///*				   			   Items							  *///
//////////////////////////////////////////////////////////////////////////

function UIAnimationCategoryItemsMove_Start(delta) {
    const obj = DashUI.Items;
    const next = obj.Next + delta;
	const run = next >= 0 && next < DashUI.ItemCollection.Current.length;
    if ((run) && (obj.Current === obj.Next)) {
		DashUIResetBg();
		PlayCursorSfx();
        obj.Next = next;
        obj.Animation.Running = true;
        obj.Animation.Progress = 0.0f;
		DashCatItems[DashUI.Category.Current].Default = next;
		DashUI.AnimationQueue.push(UIAnimationCategoryItemsMove_Work);
	}
}
function UIAnimationCategoryItemsMove_Work() {
    const anim = DashUI.Items.Animation;
    if (!anim.Running) { return true; }

    anim.Progress += 0.07f;
    if (anim.Progress < 1.0f) {
		const u = pad.pressed(Pads.UP) || (pad.ly < -64);
		const d = pad.pressed(Pads.DOWN) || (pad.ly > 64);
        if ((anim.Progress > 0.6f) && (u || d)) {
			const delta = u ? -1 : 1;
			UIAnimationCategoryItemsMove_Reset(delta)
		}
		return false;
	}

    anim.Progress = 0.0f;
    anim.Running = false;
	DashUI.Items.Current = DashUI.Items.Next;

	return true;
}
function UIAnimationCategoryItemsMove_Reset(delta) {
    const obj = DashUI.Items;
    const next = obj.Next + delta;
	const run = next >= 0 && next < DashUI.ItemCollection.Current.length;
	if (!run) { return; }

	PlayCursorSfx();
	DashUIResetBg();
    obj.Animation.Progress = 0.0f;
    obj.Current = obj.Next;
    obj.Next = next;
	DashCatItems[DashUI.Category.Current].Default = next;
}
function UIAnimationItemCollectionMove_Start() {
    const swipe = DashUI.ItemCollection.Swipe;
    swipe.Running = true;
    swipe.Progress = 0.0f;
    swipe.Dir = DashUI.Category.Next - DashUI.Category.Current;
	DashUI.ItemCollection.Next = DashCatItems[DashUI.Category.Next].Items;
	DashUI.AnimationQueue.push(UIAnimationItemCollectionMove_Work);
}
function UIAnimationItemCollectionMove_Work() {
    const swipe = DashUI.ItemCollection.Swipe;
    if (!swipe.Running) { return true; }
    swipe.Progress += 0.075f;
    if (swipe.Progress < 1.0f) { return false; }

    swipe.Progress = 0.0f;
    swipe.Running = false;

	DashUI.ItemCollection.Current = DashUI.ItemCollection.Next;
	DashUI.Items.Current = DashCatItems[DashUI.Category.Next].Default;
	DashUI.Items.Next = DashUI.Items.Current;

	return true;
}
function DrawUICategoryItems() {
	DrawUICategoryItems_Work(DashUI.ItemCollection.Current, DashUI.Items.Current, 0)
	if (DashUI.ItemCollection.Swipe.Running) {
		DrawUICategoryItems_Work(DashUI.ItemCollection.Next, DashCatItems[DashUI.Category.Next].Default, 92 * DashUI.ItemCollection.Swipe.Dir);
	}
}
function DrawUICategoryItems_Work(items, current, x) {
    if ((!DashUI.Items.Display) || (DashUI.SubMenu.Level > 1)) return;

	const Name = {};
	const Icon = {};

	const swipe = DashUI.ItemCollection.Swipe;
	const swipeProgress = swipe.Running ?
		((x !== 0) ?
			cubicEaseOut(swipe.Progress) :
			cubicEaseIn(swipe.Progress))
		: 1;

	const swipeConst = swipe.Running ? cubicEaseOut(swipe.Progress) : 0;
	const swipeoffsetX = x + 92 * swipeConst * -swipe.Dir;

    const fade          = DashUI.Items.Fade;
    const dialogBg      = (DashUI.Dialog.Display && (!DashUI.Dialog.Data[DashUI.Dialog.Level].BG));
    let faderunning     = fade.Running || dialogBg;
	let fadeProgress    = getFadeProgress(fade);
    if (dialogBg) { fadeProgress = 1 - getFadeProgress(DashUI.Dialog.Fade); }

    const anim       = DashUI.Items.Animation;
    const easing     = anim.Running ? cubicEaseOut(anim.Progress) : 0;
    const next       = DashUI.Items.Next;
    const dir        = next - current;
    const total      = items.length;

    const halfMod    = UICONST.IcoUnselMod >> 1;
    const upOff      = -102;
    const downOff    = 18;
    const textUp     = -99;
    const textDown   = 21;
    const icoSelSize = UICONST.IcoSelSize - UICONST.IcoUnselMod * easing;

    const modCurrY      = (dir < 0 ? 82 : -142) * easing;
    const modNextShift  = UICONST.SubItemSlotSize * easing * (-dir);

    // Sub Menu Modifiers
    const subLevel          = DashUI.SubMenu.Level;
	const subMod            = DashUI.SubMenu.Display;
	const subfade           = DashUI.SubMenu.Fade;
	const subfadeProgress   = getFadeProgress(subfade);

    const subNoSelAmod      = (subLevel < 1) ? ~~(-98 * subfadeProgress) : -98 - ~~(12 * subfadeProgress);
	const subNoSelXmod 		= UICONST.CatItems.SubNoSelX * subfadeProgress + (UICONST.CatItems.SubNoSelX * subLevel);
    const subSelAmod        = (subLevel < 1) ? ~~(-128 * subfadeProgress) : -128;
	const subSelXmod 		= UICONST.Category.SubX * subfadeProgress;
	const subLevelXmod 		= UICONST.Category.SubX * subLevel;
    const subNoSelTextAmod  = (subLevel < 1) ? ~~(-128 * subfadeProgress) : -128;
	const subSelAFadeMod 	= ~~((128 * subfadeProgress) * subLevel);

	// Context Modifiers
	const contextMod        = DashUI.Context.Display;
	const contextfade       = DashUI.Context.Fade;
	const contextfadeProgress = getFadeProgress(contextfade);
	const contextX          = halfMod * contextfadeProgress;

    for (let i = 0; i < total; i++) {
		// Cull: Objects greatly above and below the selected item
		const diff = i - current;
		if (diff < -4) continue;
		if (diff > 5) break;

        const info = items[i];
        let Desc = false;

        if ('CustomIcon' in info) { Icon.CustomIcon = info.CustomIcon; }
        else if ('CustomIcon' in Icon) { delete Icon.CustomIcon; }
        if ('Color' in Name) { delete Name.Color; }
        if (typeof info.Icon === "string") { info.Icon = FindDashIcon(info.Icon); }

		Icon.ID 		= info.Icon;
		Icon.Alpha 		= 110;
		Icon.Width 		= UICONST.IcoUnselSize;
		Icon.Height 	= UICONST.IcoUnselSize;
		Icon.X 			= UICONST.CatItems.IconX;
		Icon.Y 			= UICONST.CatItems.IconY;
        Name.Text 		= [ getLocalText(info.Name) ];
		Name.Position 	= { X:UICONST.CatItems.TextX, Y: UICONST.CatItems.TextY };
		Name.Scale 		= FontObj.SizeL;
		Name.Alpha 	    = 128;
		Name.Glow   	= false;

        if (i === current) {
            Icon.X      	+= halfMod * easing;
            Icon.Y      	+= modCurrY;
            Icon.Width  	= icoSelSize;
            Icon.Height 	= icoSelSize;
            Name.Position.Y += modCurrY - (9 * easing);
            Name.Glow   	= !anim.Running && !contextMod && !faderunning && !subMod && !swipe.Running;
			Name.Color 		= (anim.Running) ? interpolateColorObj(UICONST.TextSelectedColor, UICONST.TextUnselectedColor, anim.Progress) : UICONST.TextSelectedColor;

            if (Name.Glow) { if (('CustomBG' in info) && (!('Image' in DashUI.ItemBG))) { DashUI.ItemBG.Image = info.CustomBG; } }

			Desc = {
                Text: [ getLocalText(info.Description) ],
                Scale: FontObj.SizeM,
                Position: {
                    X: Name.Position.X,
                    Y: Name.Position.Y + 20
                },
                Alpha: ~~(128 - (128 * easing))
            };

			if (subMod) {
				Icon.X 			-= (subSelXmod + subLevelXmod);
				Icon.Alpha 		-= subSelAFadeMod;
				Name.Alpha 	    += subSelAmod;
				Desc.Alpha 	    += subSelAmod;
				Name.Position.X -= subSelXmod;
                Desc.Position.X -= subSelXmod;
                if (contextMod) { Icon.X -= contextX; }
			}
            else if (contextMod) {
                Icon.X -= contextX;
                Icon.Y -= contextX;
                Icon.Width += UICONST.IcoUnselMod * contextfadeProgress;
                Icon.Height += UICONST.IcoUnselMod * contextfadeProgress;
                Name.Alpha += ~~(-90 * contextfadeProgress);
                Desc.Alpha += ~~(-90 * contextfadeProgress);
                Name.Position.X += contextX;
                Desc.Position.X += contextX;
			}
        }
        else {
            const modOffsetY = diff * UICONST.SubItemSlotSize + modNextShift;
            const baseY 	 = (diff > 0 ? downOff : upOff) + modOffsetY;
            Icon.Y      	+= baseY + halfMod;
            Icon.X      	+= halfMod;

            Name.Position.Y += ((diff > 0 ? textDown : textUp) + modOffsetY);

            if ((anim.Running) && (i === next)) {
                const modYNext 	= (dir < 0 ? 102 : -18) * easing;
                Icon.Width   	+= UICONST.IcoUnselMod * easing;
                Icon.Height  	+= UICONST.IcoUnselMod * easing;
                Icon.X       	-= halfMod * easing;
                Icon.Y       	-= halfMod * easing;
                Icon.Y       	+= modYNext;
                Name.Position.Y += modYNext - (3 * easing);
				Name.Color 		= interpolateColorObj(UICONST.TextUnselectedColor, UICONST.TextSelectedColor, anim.Progress);
				Name.Alpha 	    = 128;

				Desc = {
                    Text: [ getLocalText(info.Description) ],
                    Scale: FontObj.SizeM,
                    Position: {
                        X: Name.Position.X,
                        Y: Name.Position.Y + 20
                    },
                    Alpha: ~~(128 * easing)
                };
            }

			if (subMod) {
				const subNoSelYmod = ((diff > 0) ? -8 : 8) * subfadeProgress;
				Icon.X 			-= subNoSelXmod;
				Icon.Y 			+= (subNoSelYmod + (((diff > 0) ? -8 : 8) * subLevel));
				Icon.Alpha 		+= subNoSelAmod;
				Name.Alpha 	    += subNoSelTextAmod;
				Name.Position.X -= subNoSelXmod;
                Name.Position.Y += subNoSelYmod;
                if (contextMod) {
                    Icon.Alpha += ~~(-12 * contextfadeProgress);
                }
			}
            else if (contextMod) {
				const ctxNoSelYmod = ((diff > 0) ? 10 : -10) * contextfadeProgress;
				Icon.Y 			+= ctxNoSelYmod;
				Icon.Alpha 		+= ~~(-98 * contextfadeProgress);
				Name.Alpha 	    += ~~(-128 * contextfadeProgress);
				Name.Position.Y += ctxNoSelYmod;
			}
        }

		if (faderunning) {
			Icon.Alpha 	= ~~(Icon.Alpha * fadeProgress);
			Name.Alpha 	= ~~(Name.Alpha * fadeProgress);

			const rel = i - current;
			let offsetX = -5 * (1 - fadeProgress);
			let offsetY = 0;
			if (rel < 0)      { offsetY = -20 * (1 - fadeProgress); }
			else if (rel > 0) { offsetY =  20 * (1 - fadeProgress); }

			Icon.X 			+= offsetX;
			Icon.Y 			+= offsetY;
			Name.Position.X += offsetX;
			Name.Position.Y += offsetY;

			if (Desc) {
				Desc.Alpha 	= ~~(Desc.Alpha * fadeProgress);
				Desc.Position.X += offsetX;
				Desc.Position.Y += offsetY;
			}
		}
		else if (swipe.Running) {
			Icon.Alpha 		= ~~(Icon.Alpha * swipeProgress);
			Name.Alpha 	    = (x !== 0) ? ~~(Name.Alpha * swipeProgress) : ~~((Name.Alpha - 64) * swipeProgress);
			Icon.X 			+= swipeoffsetX;
			Name.Position.X += swipeoffsetX;

			if (Desc) { Desc.Alpha = Name.Alpha; Desc.Position.X = Name.Position.X; }
		}

        if (Icon.Y < -UICONST.ScreenDrawLimit) continue;
        if (Icon.Y > UICONST.ScrLowerLimit) break;

		// Draw Focus
		if ((DashUI.SubMenu.Level < 1) && (DashElements.ItemFocus) && (i === current || i === next) && Desc) {
            let FocusA = (subMod) ? Desc.Alpha : (contextMod ? ~~(128 * (1 - contextfadeProgress)) : Desc.Alpha);
            if (FocusA > 0) {

                let focus = DashElements.ItemFocus;

                let isCurrent = (i === current);
                let isNext = (i === next);
                focus.width = 82;
                focus.height = 72;

                if (anim.Running) {
                    const mod = 24 * (isNext ? (1 - easing) : easing);
                    focus.width -= mod;
                    focus.height -= mod;
                }
                else if (contextMod) {
                    const mod = 24 * contextfadeProgress;
                    focus.width += mod;
                    focus.height += mod;
                }

                focus.color = Color.setA(focus.color, FocusA);
                focus.draw(Icon.X - 5, Icon.Y + 2);
            }
		}

        DrawDashIcon(Icon);
        TxtPrint(Name);
		if (Desc) { TxtPrint(Desc); }
    }
}

//////////////////////////////////////////////////////////////////////////
///*				   			 Sub Menu							  *///
//////////////////////////////////////////////////////////////////////////

function DashUISetNewSubMenu(SubMenu) {
    if ('Init' in SubMenu) { SubMenu.Init(SubMenu); }
    PlayCursorSfx();
    const obj = DashUI.SubMenu;
    obj.Items.Current = SubMenu.Default;
    obj.Items.Next = SubMenu.Default;
    obj.Level++;
    obj.ItemCollection[obj.Level] = SubMenu;
    DashUI.State.Next = 2;
	UIAnimateSubMenuItemsFade_Start(true);
}
function DashUIBackFromSubMenu() {
	PlayCursorSfx();
	UIAnimateSubMenuItemsFade_Start(false);
}
function UIAnimateSubMenuItemsFade_Start(isIn) {
	DashUIResetBg();

	const element = DashUI.SubMenu;
	element.Fade.In = isIn;
	element.Fade.Progress = 0.0f;
	element.Fade.Running = true;
	element.Display = true;
	element.PrevAnimation.Display = true;
	DashUI.AnimationQueue.push(UIAnimateSubMenuItemsFade_Work);

	const subElement = DashUI.SubMenu.Animation;
	subElement.Fade.In = isIn;
	subElement.Fade.Progress = 0.0f;
	subElement.Fade.Running = true;
    subElement.Display = true;
    DashUI.AnimationQueue.push(UICONST.Fun.SubMenuFade);
}
function UIAnimateSubMenuItemsFade_Work() {
    const fade = DashUI.SubMenu.Fade;
    if (!fade.Running) { return true; }
    fade.Progress += 0.04f;
    if (fade.Progress < 1.0f) { return false; }

    if (!fade.In) {
        const submenu = DashUI.SubMenu;
        submenu.Level--;
        submenu.Display = (submenu.Level > -1);
        if (submenu.Level > -1) {
            const next = submenu.ItemCollection[submenu.Level].Default;
            submenu.Items.Current = next;
            submenu.Items.Next = next;
        }
        else {
            DashUI.State.Next = 1;
        }
    }

    fade.Progress = 1.0f;
    fade.Running = false;

    return true;
}
function UIAnimationSubMenuItemsMove_Start(delta) {
    const obj = DashUI.SubMenu;
    const objItems = obj.Items;
    const next = objItems.Next + delta;
    const run = next >= 0 && next < obj.ItemCollection[obj.Level].Items.length;
    if ((run) && (objItems.Current === objItems.Next)) {
		DashUIResetBg();
		PlayCursorSfx();
        objItems.Next = next;
        obj.Animation.Running = true;
        obj.Animation.Progress = 0.0f;
		DashUI.AnimationQueue.push(UIAnimationSubMenuItemsMove_Work);
	}
}
function UIAnimationSubMenuItemsMove_Work() {
    const anim = DashUI.SubMenu.Animation;
    if (!anim.Running) { return true; }

    anim.Progress += 0.07f;
    if (anim.Progress < 1.0f) {
		const u = pad.pressed(Pads.UP) || (pad.ly < -64);
		const d = pad.pressed(Pads.DOWN) || (pad.ly > 64);
        if ((anim.Progress > 0.6f) && (u || d)) {
			const delta = u ? -1 : 1;
			UIAnimationSubMenuItemsMove_Reset(delta)
		}

		return false;
	}

	DashUI.SubMenu.Items.Current = DashUI.SubMenu.Items.Next;
	DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level].Default = DashUI.SubMenu.Items.Current;
    anim.Progress = 0.0f;
    anim.Running = false;

	return true;
}
function UIAnimationSubMenuItemsMove_Reset(delta) {
    const obj = DashUI.SubMenu;
    const objitems = obj.Items;
    const next = objitems.Next + delta;
    const run = next >= 0 && next < obj.ItemCollection[obj.Level].Items.length;
	if (!run) { return; }

	PlayCursorSfx();
	DashUIResetBg();
    objitems.Current = objitems.Next;
    objitems.Next = next;
    obj.ItemCollection[obj.Level].Default = objitems.Current;
    obj.Animation.Progress = 0.0f;
}
function DrawUISubMenuFadingInitialLevel() {
	if ((DashUI.SubMenu.Level < 2) || (!DashUI.SubMenu.Fade.Running)) return;

    const mainObj = DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level - 2];
	const items   = mainObj.Items;
    const current = mainObj.Default;
    const fadeProgress = getFadeProgress(DashUI.SubMenu.Fade);

	const halfMod    = UICONST.IcoUnselMod >> 1;
	const icoA       = 110;
	const SelIcoA    = icoA * fadeProgress;
	const SelModX    = UICONST.SubItems.PrevSelX + SelIcoA;
    const noSelModX  = UICONST.SubItems.PrevUnselX + (UICONST.SubItems.PrevUnselX * fadeProgress);
	const noSelModA  = icoA + ~~(-96 - 14 * fadeProgress);

	let Icon = {
		Width:  UICONST.IcoSelSize,
		Height: UICONST.IcoSelSize,
		X: UICONST.SubItems.IconX,
		Y: UICONST.SubItems.IconY
	};

    for (let i = 0; i < items.length; i++) {
		const diff = i - current;
		if (diff <= -6) continue;
		if (diff >= 6) break;

		const info = items[i];
		Icon.ID    = info.Icon;
        Icon.Alpha = noSelModA;
        Icon.Width = UICONST.IcoUnselSize;
        Icon.Height = UICONST.IcoUnselSize;
		Icon.X = UICONST.SubItems.IconX;
		Icon.Y = UICONST.SubItems.IconY;

		if ('CustomIcon' in info) { Icon.CustomIcon = info.CustomIcon; }
		else if ('CustomIcon' in Icon) { delete Icon.CustomIcon; }

        if (i === current) {
            Icon.Width  = UICONST.IcoSelSize;
            Icon.Height = UICONST.IcoSelSize;
			Icon.Alpha  = icoA - SelIcoA;
			Icon.X     -= SelModX;
		}
		else {
			const mod     = (diff > 0) ? 24 : -24;
			const yOffset = ((diff > 0) ? -10 : 10);
			const baseY   = mod + diff * UICONST.SubItemSlotSize;

			Icon.X       += halfMod - noSelModX;
			Icon.Y       += halfMod + yOffset + (yOffset * fadeProgress) + baseY;
		}

		if ((Icon.Y < -UICONST.ScreenDrawLimit) || (Icon.Y > UICONST.ScrLowerLimit)) continue;
		DrawDashIcon(Icon);
	}
}
function DrawUISubMenuPreviousLevel() {
    if (DashUI.SubMenu.Level < 1) return;

    const mainObj = DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level - 1];
	const items   = mainObj.Items;
    const current = mainObj.Default;
	const fade    = DashUI.SubMenu.Fade;
	const fadeProgress = getFadeProgress(fade);

	const aFade 		= DashUI.SubMenu.PrevAnimation.Fade;
	const aFadeProgress	= (aFade.Running) ? getFadeProgress(aFade) : 1;

	const icoA      = 110 * aFadeProgress;
	const halfMod   = UICONST.IcoUnselMod >> 1;
	const baseA     = ~~(128 - 128 * fadeProgress);
	const SelModX   = UICONST.SubItems.PrevSelX * fadeProgress;
    const noSelModX = UICONST.SubItems.PrevUnselX * fadeProgress;
    const noSelModA = icoA + ((aFade.Running) ? ~~(-96 * aFadeProgress) : ~~(-96 * fadeProgress));
	const ArrowA    = ~~(84 - 84 * fadeProgress);

	DashElements.Arrow.width  = 20;
	DashElements.Arrow.height = 20;
    DashElements.Arrow.color  = Color.setA(DashElements.Arrow.color, ArrowA);
	DashElements.Arrow.draw(UICONST.SubItems.ArrowX - (80 * fadeProgress), UICONST.SubItems.ArrowY);

    let Icon = {}, Name = {}, Desc = false, Ctxt = {};

	// Context Modifiers
	const contextMod = DashUI.Context.Display;
	const contextfade = DashUI.Context.Fade;
    const contextfadeProgress = getFadeProgress(contextfade);

	const contextX = halfMod * contextfadeProgress;

    for (let i = 0; i < items.length; i++) {
		const diff = i - current;
		if (diff <= -6) continue;
		if (diff >= 6) break;

		Desc = false;
		const info = items[i];
		Icon.ID     = info.Icon;
		Icon.Alpha  = noSelModA;
		Icon.Width  = UICONST.IcoUnselSize;
        Icon.Height = UICONST.IcoUnselSize;
		Icon.X      = UICONST.SubItems.IconX;
		Icon.Y      = UICONST.SubItems.IconY;

		if ('CustomIcon' in info) { Icon.CustomIcon = info.CustomIcon; }
		else if ('CustomIcon' in Icon) { delete Icon.CustomIcon; }

        if ('Color' in Name) { delete Name.Color; }
		Name.Text     = [ getLocalText(info.Name) ];
		Name.Position = { X: UICONST.SubItems.TextX, Y: UICONST.SubItems.TextY };
		Name.Scale    = FontObj.SizeL;
		Name.Alpha    = baseA;
		Name.Glow     = false;

        const CtxtName = (info.Type === "CONTEXT") ? info.Value.Items[info.Value.Default].Name : false;

		if (i === current) {
		    Icon.Alpha      = icoA;
		    Icon.Width      = UICONST.IcoSelSize;
		    Icon.Height     = UICONST.IcoSelSize;
			Icon.X 			-= SelModX;
			Name.Position.X -= SelModX;
			Name.Color   	 = UICONST.TextSelectedColor;
			Name.Alpha 	     = baseA;

			Desc = {
                Text: [ getLocalText(info.Description) ],
				Scale: FontObj.SizeM,
				Position: {
					X: Name.Position.X,
					Y: Name.Position.Y + 20
                },
                Alpha: baseA
			};

			if (contextMod)	{ Icon.X -= contextX; }
		}
		else {
			const mod     = (diff > 0) ? 24 : -24;
			const yOffset = ((diff > 0) ? -10 : 10) * fadeProgress;
			const baseY   = mod + diff * UICONST.SubItemSlotSize;

			Icon.X       += halfMod - noSelModX;
			Icon.Y       += yOffset + baseY + halfMod;
            Name.Position.Y += yOffset + baseY;
			Name.Position.X -= noSelModX;

			if (contextMod)	{
				Icon.X -= contextX;
				Icon.Y -= ((diff > 0) ? contextX : -contextX);
				Icon.Alpha -= contextX;
			}
		}

		if ((Icon.Y < -UICONST.ScreenDrawLimit) || (Icon.Y > UICONST.ScrLowerLimit)) continue;
		if (Desc) TxtPrint(Desc);
		if (CtxtName) {
            const modX = (i === current) ? SelModX : noSelModX;
            let ctext = getLocalText(CtxtName);
            (ctext.length > 8) && (ctext = ctext.substr(0, 8) + "...");
			Ctxt.Text	    = [ ctext ];
            Ctxt.Position   = { X: UICONST.ContextPreviewOptionX - modX , Y: Name.Position.Y };
            Ctxt.Alpha      = Name.Alpha;
            TxtPrint(Ctxt);
		}

		// Draw Focus
		if ((DashElements.ItemFocus) && Desc) {
			let focus = DashElements.ItemFocus;
			focus.width = 82;
			focus.height = 72;
            focus.color = Color.setA(focus.color, Desc.Alpha);
            focus.draw(Icon.X - 5, Icon.Y + 1);
		}

		TxtPrint(Name);
		DrawDashIcon(Icon);
	}
}
function DrawUISubMenu() {
	if ((!DashUI.SubMenu.Display) || (!DashUI.SubMenu.Animation.Display)) { return; }

	DrawUISubMenuFadingInitialLevel();
	DrawUISubMenuPreviousLevel();

	const Name 		= {};
    const Icon      = {};
    const Ctxt      = {};

    const level     = DashUI.SubMenu.Level;
	const items 	= DashUI.SubMenu.ItemCollection[level].Items;
    const current   = DashUI.SubMenu.Items.Current;
    const next      = DashUI.SubMenu.Items.Next;
    const dir       = next - current;

	const anim 		 = DashUI.SubMenu.Animation;
    const easing     = anim.Running ? cubicEaseOut(anim.Progress) : 0;
    const animYMod   = (UICONST.SubItemSlotSize * -dir) * easing;

	const fade			= DashUI.SubMenu.Fade;
	const fadeProgress	= getFadeProgress(fade);
	const aFade 		= DashUI.SubMenu.Animation.Fade;
	let aFadeProgress 	= getFadeProgress(aFade);

	if (!aFade.Running) { aFadeProgress = fadeProgress; }

    const halfMod    	= UICONST.IcoUnselMod >> 1;
	const baseA 	 	= ~~(128 * aFadeProgress);
	const icoA		 	= ~~(110 * aFadeProgress);
	const xFadeMod 	 	= ((level > 0) ? 4 : 14) * (1 - fadeProgress);
    const yFadeMod      = halfMod * (1 - fadeProgress);
    const modCurrY      = (dir < 0 ? 89 : -65) * easing;
    const modCurrNameY  = (12 * easing);
    const modCurrSize   = UICONST.IcoSelSize - UICONST.IcoUnselMod * easing;
    const modNextY      = (dir < 0 ? 65 : -87) * (1 - easing);
    const modNextNameY  = (12 * (1 - easing));
    const modNextSize   = UICONST.IcoSelSize - UICONST.IcoUnselMod * (1 - easing);

	// Context Modifiers
	const contextMod          = DashUI.Context.Display;
	const contextfade         = DashUI.Context.Fade;
    const contextfadeProgress = getFadeProgress(contextfade);
    const contextNameX        = UICONST.ContextPreviewOptionX - xFadeMod;
    const contextPosMod       = halfMod * contextfadeProgress;
    const contextAmod         = ~~(90 * contextfadeProgress);
    const contextNAmod        = ~~(128 * contextfadeProgress);
    const contextSizeMod      = UICONST.IcoUnselMod * contextfadeProgress;

	const ArrowA = ~~(84 * aFadeProgress);
    const ArrowX = (contextMod) ? ~~(-contextPosMod) : 0;

	DashElements.Arrow.width = 20;
	DashElements.Arrow.height = 20;
    DashElements.Arrow.color = Color.setA(DashElements.Arrow.color, ArrowA);
	DashElements.Arrow.draw(UICONST.SubItems.ArrowX + ArrowX, UICONST.SubItems.ArrowY);

	// Display Empty Message
	if (items.length < 1) {
		Name.Text 		= [ getLocalText(XMBLANG.MSG_SUBMENU_EMPTY) ];
		Name.Position 	= { X: UICONST.SubItems.TextX - xFadeMod, Y:UICONST.SubItems.TextY + 5 };
		Name.Scale 		= FontObj.SizeM;
        Name.Alpha 		= baseA;

        TxtPrint(Name);
        return;
    }

    const ContextItems = [];

	for (let i = 0; i < items.length; i++) {
		const diff = i - current;
		if (diff <= -6) continue;
		if (diff >= 6) break;

		let Desc = false;
        const info = items[i];

        if ('CustomIcon' in info)           { Icon.CustomIcon = info.CustomIcon; }
        else if ('CustomIcon' in Icon)      { delete Icon.CustomIcon; }
        if ('Color' in Name)                { delete Name.Color; }
        if (typeof info.Icon === "string")  { info.Icon = FindDashIcon(info.Icon); }

		Icon.ID 		= info.Icon;
		Icon.Alpha 		= icoA;
		Icon.Width 		= UICONST.IcoUnselSize;
		Icon.Height 	= UICONST.IcoUnselSize;
		Icon.X 			= UICONST.SubItems.IconX - xFadeMod;
		Icon.Y 			= UICONST.SubItems.IconY;
        Name.Text 		= [ getLocalText(info.Name) ];
		Name.Position 	= { X: UICONST.SubItems.TextX - xFadeMod, Y:UICONST.SubItems.TextY };
		Name.Scale 		= FontObj.SizeL;
		Name.Alpha 	    = baseA;
		Name.Glow   	= false;

        let CtxtName = (info.Type === "CONTEXT") ? getLocalText(info.Value.Items[info.Value.Default].Name) : false;

        if (i === current) {
            Icon.Width  	= modCurrSize;
            Icon.Height 	= modCurrSize;
            Icon.X     		+= halfMod * easing;
            Icon.Y      	+= modCurrY;
            Name.Position.Y += modCurrY - modCurrNameY;
			Name.Color 		 = (anim.Running) ? interpolateColorObj(UICONST.TextSelectedColor, UICONST.TextUnselectedColor, anim.Progress) : UICONST.TextSelectedColor;
			Name.Glow   	 = (baseA === 128) && (!anim.Running) && (!contextMod);

			if (Name.Glow) { if (('CustomBG' in info) && (!('Image' in DashUI.ItemBG))) { DashUI.ItemBG.Image = info.CustomBG; } }

			if (contextMod) {
				Icon.X      	-= contextPosMod;
				Icon.Y      	-= contextPosMod;
				Icon.Width  	+= contextSizeMod;
				Icon.Height 	+= contextSizeMod;
				Name.Alpha 	    -= contextAmod;
                Name.Position.X += contextPosMod;
            }

            Desc = {
                Text: [ getLocalText(info.Description) ],
                Scale: FontObj.SizeM,
                Position: { X: Name.Position.X, Y: Name.Position.Y + 20 },
                Alpha: (contextMod) ? Name.Alpha : ~~(baseA - (128 * easing))
            };
		}
        else if (i === next) {
            Icon.Width      = modNextSize;
            Icon.Height     = modNextSize;
            Icon.X          += halfMod * (1 - easing);
            Icon.Y          -= modNextY;
            Name.Position.Y -= modNextY + modNextNameY;
            Name.Color      = interpolateColorObj(UICONST.TextUnselectedColor, UICONST.TextSelectedColor, anim.Progress);
            Desc = {
                Text: [ getLocalText(info.Description) ],
                Scale: FontObj.SizeM,
                Position: { X: Name.Position.X, Y: Name.Position.Y + 20 },
                Alpha: ~~(128 * easing)
            };
        }
        else {
            const iDir  = (diff > 0) ? 1 : -1;
            const YMOD  = halfMod + (diff * UICONST.SubItemSlotSize) + (25 * iDir) + animYMod - (yFadeMod * iDir);
            Icon.X      += halfMod;
            Icon.Y      += YMOD;
            Name.Position.Y += (YMOD - 12);

            if (contextMod) {
                const yOffset   = iDir * contextPosMod;
                Icon.Y          += yOffset;
                Name.Position.Y += yOffset;
                Name.Alpha      -= contextNAmod;
                Icon.Alpha      -= contextAmod;
            }
		}

        if (Icon.Y < -UICONST.ScreenDrawLimit) continue;
        if (Icon.Y > UICONST.ScrLowerLimit) break;

		if (Desc) { TxtPrint(Desc); }

		// Draw Focus
		if ((DashElements.ItemFocus) && (i === current || i === next) && Desc) {
			let FocusA = contextMod ? ~~(128 * (1 - contextfadeProgress)) : Desc.Alpha;
            FocusA = (DashUI.Dialog.Fade.Running && !DashUI.Dialog.Fade.In) ? ~~(128 * fadeProgress) : (DashUI.Dialog.Fade.Running ? 0 : FocusA);
            if (FocusA > 0) {
                let focus = DashElements.ItemFocus;

                let isCurrent = (i === current);
                let isNext = (i === next);
                focus.width = 82;
                focus.height = 72;

                if (anim.Running) {
                    const mod = isNext ? UICONST.IcoUnselMod * (1 - easing) : UICONST.IcoUnselMod * easing;
                    focus.width -= mod;
                    focus.height -= mod;
                }
                else if (contextMod) {
                    focus.width += contextSizeMod;
                    focus.height += contextSizeMod;
                }

                focus.color = Color.setA(focus.color, FocusA);
                focus.draw(Icon.X - 5, Icon.Y + 1);
            }
		}

        TxtPrint(Name);
        DrawDashIcon(Icon);

        // Context Option Selected
        if (CtxtName) {
            CtxtName.length > 8 && (CtxtName = CtxtName.substr(0, 8) + "...");
            Ctxt.Text = CtxtName;
            Ctxt.Alpha = Name.Alpha;
            Ctxt.Position = { X: contextNameX, Y: Name.Position.Y - 5 };
            if (contextMod) Ctxt.Alpha += ~~(-128 * contextfadeProgress);
            TxtPrint(Ctxt);
        }
    }
}

//////////////////////////////////////////////////////////////////////////
///*				   			  Context							  *///
//////////////////////////////////////////////////////////////////////////

function DashUISetNewContextMenu(Context) {
	if (typeof Context.Items === "function") { Context.Items = Context.Items(); }

    PlayCursorSfx();

    const obj = DashUI.Context;
    const items = obj.Items;

    obj.Timer = Timer.new();
    Timer.reset(DashUI.Context.Timer);
    Timer.pause(DashUI.Context.Timer);

    items.Current = Context.Default;
    items.Next = Context.Default;
    obj.Level++;
    obj.ItemCollection[obj.Level] = Context;
	DashUI.State.Next = 3;

    items.UpperLimit = 0;
    items.LowerLimit = 9;

    if (Context.Items.length < 9) { items.LowerLimit = Context.Items.length; }

    if (Context.Default > 8)
    {
        if ((Context.Default + 8) >= Context.Items.length) {
            items.LowerLimit = Context.Items.length;
            items.UpperLimit = items.LowerLimit - 9;
		}
        else {
            items.UpperLimit = Context.Default;
            items.LowerLimit = items.UpperLimit + 9;
		}
    }

	UIAnimateContextMenuItemsFade_Start(true);
}
function UIAnimateContextMenuItemsFade_Start(isIn) {
	const element = DashUI.Context;
	if (isIn === element.Fade.In) { return; }

	element.Fade.In = isIn;
	element.Fade.Progress = 0.0f;
	element.Fade.Running = true;
	element.Display = true;
	DashUI.AnimationQueue.push(UIAnimateContextMenuItemsFade_Work);
}
function UIAnimateContextMenuItemsFade_Work() {
    const obj = DashUI.Context;
    const fade = obj.Fade;
    if (!fade.Running) { return true; }
    fade.Progress += 0.04f;
    if (fade.Progress < 1.0f) { return false; }

    if (!fade.In) {
        obj.Level--;
        obj.Display = (obj.Level > -1);
        if (obj.Display) {
            const next = obj.ItemCollection[obj.Level].Default;
            obj.Items.Current = next;
            obj.Items.Next = next;
        }
        else if (DashUI.State.Next === DashUI.State.Current) {
            Timer.destroy(obj.Timer);
            DashUI.State.Next = DashUI.State.Previous;
        }
    }

    fade.Progress = 1.0f;
    fade.Running = false;
    return true;
}
function UIAnimationContextMenuItemsMove_Start(delta) {
    const obj = DashUI.Context;
    const objitems = obj.Items;
    const next = objitems.Current + delta;
    const run = next >= 0 && next < obj.ItemCollection[obj.Level].Items.length;
	if (!run) { return; }

	PlayCursorSfx();
    if (next >= objitems.LowerLimit) {
        objitems.UpperLimit++;
        objitems.LowerLimit++;
	}
    else if (next < objitems.UpperLimit) {
        objitems.UpperLimit--;
        objitems.LowerLimit--;
	}

    objitems.Next = next;
    obj.Animation.Running = true;
    obj.Animation.Progress = 0.0f;
	DashUI.AnimationQueue.push(UIAnimationContextMenuItemsMove_Work);
}
function UIAnimationContextMenuItemsMove_Work() {
    const anim = DashUI.Context.Animation;
    if (!anim.Running) { return true; }
    anim.Progress += 0.2f;
    if (anim.Progress < 1.0f) { return false; }
    anim.Progress = 0.0f;
    anim.Running = false;
    DashUI.Context.Items.Current = DashUI.Context.Items.Next;
	return true;
}
function DashUISelectContextItem() {
	const current = DashUI.Context.Items.Current;
	const context = DashUI.Context.ItemCollection[DashUI.Context.Level];
    const item = context.Items[current];

    PlayCursorSfx();
    UIAnimateContextMenuItemsFade_Start(false);

	if ('Confirm' in item) {
		const result = item.Confirm(current, item);
		if ((result !== undefined) && (result === false)) { return; }
	}
	if ('Confirm' in context) {
		const result = context.Confirm(current, item);
		if ((result !== undefined) && (result === false)) { return; }
    }

	context.Default = current;
}
function DashUIBackFromContextMenu() {
	const current = DashUI.Context.Items.Current;
	const context = DashUI.Context.ItemCollection[DashUI.Context.Level];
	const item = context.Items[current];

	if ('Cancel' in context) { context.Cancel(current, item); }

	PlayCursorSfx();
	UIAnimateContextMenuItemsFade_Start(false);
}
function DashUIContextPreviewHandler(item) {
    const obj = DashUI.Context;
    if (DashUI.AnimationQueue.length > 0) {
        obj.pFunExecuted = false;
        Timer.reset(obj.Timer);
        Timer.resume(obj.Timer);
		return;
	}

    let time = getTimerSec(obj.Timer);
    if (('Preview' in obj.ItemCollection[obj.Level]) && (time > 10)) {
        if (!obj.pFunExecuted) {
            Timer.pause(obj.Timer);
            const fun = obj.ItemCollection[obj.Level].Preview;
            fun(obj.Items.Current, item);
            obj.pFunExecuted = true;
        }
    }

	if (('PreviewImage' in item) && (time > 6))	{
		const customImg = ImageCache.Get(item.PreviewImage);
		const Ready = customImg && customImg.ready();
		if (Ready) {
            if (obj.PreviewA === 0)
			{
                let ival = os.setInterval(() => {
                    obj.PreviewA += 8;
                    if (obj.PreviewA > 120) { os.clearInterval(ival); }
                }, 0);
            }

			customImg.width = 240;
			customImg.height = 135;
            customImg.color = Color.setA(customImg.color, obj.PreviewA);
            customImg.draw(UICONST.Context.PreviewImgX, UICONST.Context.PreviewImgY);
            return;
		}
	}

    obj.PreviewA = 0;
}
function DrawUIContext() {
    const obj = DashUI.Context;
    if (!obj.Display) { return; }

    const fade = obj.Fade;
	const fadeProgress = getFadeProgress(fade);

	const boxA = UICONST.Context.BoxA * fadeProgress;
	const boxX = UICONST.Context.BoxX + (25 * fadeProgress);

	const Box = DashElements.Context;
	const Col = (UICONST.Context.Tint) ? UICONST.Context.Tint : BgElements.BgColor.Color;

	Box.height = ScrCanvas.height;
	Box.color = Color.new(Col.R, Col.G, Col.B, boxA);
	Box.draw(ScrCanvas.width - boxX, 0);

    const items = obj.ItemCollection[obj.Level].Items;
    const current = obj.Items.Current;
	const baseX = UICONST.Context.BaseX - (25 * fadeProgress);
	const baseY = UICONST.Context.BaseY;
	const baseA = ~~(128 * fadeProgress);
    const first = obj.Items.UpperLimit;
    const last = obj.Items.LowerLimit;

	const NameTexts = [];
	const Icon = {};
	Icon.Width 		= 14;
	Icon.Height 	= 14;
	Icon.Alpha 		= baseA;
	Icon.X 			= baseX;

    let selico = false;
    let selYmod = 0;
	let slotPos = 0;

	for (let i = first; i < last; i++) {
		const item = items[i];
		let icomodX = false;
		if (('Icon' in item) && (item.Icon !== -1)) {
            selico = (i === current);
            icomodX = true;

			Icon.ID 		= item.Icon;
			Icon.Y 			= 7 + baseY + slotPos;

			if (typeof item.Icon === "string") { Icon.CustomIcon = item.Icon; }

            if (selico && !fade.Running) {
                DashElements.CtxIco.color = Color.setA(DashElements.CtxIco.color, FontObj.Glow.Value + 64);
                DashElements.CtxIco.draw(Icon.X - 6, Icon.Y - 6);
			}

			DrawDashIcon(Icon);
		}

        if (i === current) { selYmod = slotPos;  NameTexts.push(""); }
        else {
            let text = getLocalText(item.Name);
            if (text.length > 24) { text = text.substring(0, 20) + "..."; }
            if (icomodX) { text = `     ${text}`; }
            NameTexts.push(text);
		}

        slotPos += UICONST.StextLine;
    }

    const Names = {
        Text: NameTexts,
        Position: { X: baseX, Y: baseY },
        Alpha: baseA
    };

    TxtPrint(Names);

    let selText = getLocalText(items[current].Name);

    if (selText.length > 24) {
        let currT = 1 + getTimerSec(obj.Timer);
        let start = ((currT + 20) < selText.length) ? currT : (selText.length - 20);
        selText = "..." + selText.substring(start, start + 20);
    }

    const SelName = {
        Text: selico ? [`     ${selText}`] : [selText],
        Position: { X: baseX, Y: baseY + selYmod },
        Alpha: baseA,
        Color: { R: UICONST.TextSelectedColor.R, G: UICONST.TextSelectedColor.G, B: UICONST.TextSelectedColor.B },
        Glow: DashUI.AnimationQueue.length < 1
    };

    TxtPrint(SelName);

    const arrowA = (!fade.Running) ? -FontObj.Glow.Value : 0;

    if (first > 0 || last < items.length) {
        DashElements.Arrow.width = 12;
        DashElements.Arrow.height = 12;
        DashElements.Arrow.color = Color.setA(DashElements.Arrow.color, baseA + arrowA);
        if (first > 0) {
            DashElements.Arrow.angle = -0.5f;
            DashElements.Arrow.draw(baseX, baseY - 6);
        }
        if (last < items.length) {
            DashElements.Arrow.angle = 0.5f;
            DashElements.Arrow.draw(baseX, baseY + slotPos + 6);
        }
        DashElements.Arrow.angle = 0.0f;
    }

	DashUIContextPreviewHandler(items[current]);
}

//////////////////////////////////////////////////////////////////////////
///*				   			  Option							  *///
//////////////////////////////////////////////////////////////////////////

function GetOptionContext() {
	const mainItem = DashUI.ItemCollection.Current[DashUI.Items.Current];
	const item = (DashUI.SubMenu.Level > -1) ? DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level].Items[DashUI.SubMenu.Items.Current] : mainItem;
	if (!item) { return false; }
	if (item && ('Option' in item)) { return item.Option; }
	else if (mainItem && ('OptionContext' in mainItem)) {
		if ('Filter' in mainItem.OptionContext) {
			switch (mainItem.OptionContext.Filter) {
				case "File": if (!('Type' in item) || item.Type !== "SUBMENU") { return mainItem.OptionContext; } break;
				case "SubDeviceOnly":
					if (('FullPath' in item) && item.FullPath.substring(0,3) !== "hdd")	{
						return mainItem.OptionContext;
					}
					break;
				case "Custom":
					if ('Condition' in mainItem.OptionContext) {
						if (eval(mainItem.OptionContext.Condition)) {
							return mainItem.OptionContext;
						}
					}
					break;
			}
		}
		else { return mainItem.OptionContext; }
	}

	return false;
}
function OpenOptionBox() {
	const context = GetOptionContext();
	if (context) { DashUISetNewContextMenu(context); }
}
function DrawUIOptionBox() {
    const box = DashElements.OptionBox;
	if ((DashUI.AnimationQueue.length > 0) || (DashUI.State.Next > 2) || (DashUI.State.Current < 1))
    { box.Progress = 0.0f; return; }

	const context = GetOptionContext();

	if (!context) { return; }

    box.Progress += 0.05f;
    if (box.Progress >= 1.0f) { box.Progress = 1.0f; }

    const alpha = ~~(box.Progress * 128);

	const optxt = {
		Text: [ getLocalText(XMBLANG.OPTIONS) ],
        Position: { X: UICONST.OptionBox.XTXT, Y: UICONST.OptionBox.YTXT },
        Alpha: alpha
	};

    const elementBox = DashElements.OptionBox;
    const elementIco = DashElements.OptionIco;
    elementBox.width = 80 + Math.fround((optxt.Text[0].length + 7) / 2);
    elementBox.color = Color.setA(elementBox.color, alpha);
    elementIco.color = Color.setA(elementIco.color, alpha);
    elementBox.draw(UICONST.OptionBox.XBOX, UICONST.OptionBox.YBOX);
    elementIco.draw(UICONST.OptionBox.XICO, UICONST.OptionBox.YICO);

	TxtPrint(optxt);
}

//////////////////////////////////////////////////////////////////////////
///*				   			  Dialog							  *///
//////////////////////////////////////////////////////////////////////////

function DashUISetDialog(Dialog) {
	DashUI.Dialog.Level++;
	DashUI.Dialog.Data.push({ ...Dialog });

	DashUI.State.Next = 4; 	 // Dialog Message State
    DashUI.OverlayState = 2; // Show Dialog Overlay
	DashUI.Overlay.Color = { R: 0, G: 0, B: 0 }
	DashUI.Overlay.Alpha = 0;
	UIAnimationDialogFade_Start(true);
}
function OpenDialogErrorMsg(Message) {
	const dialog = {
        Icon: -1,
        Title: "",
        BG: false,
        Type: "TEXT",
        Text: Message,
        BACK_BTN: true,
        ENTER_BTN: true,
	};

	DashUISetDialog(dialog);
}
function OpenDialogParentalCheck(Item) {
	const dialog = {
        Icon: -1,
        Title: "",
        BG: true,
        Type: "PARENTAL_CHECK",
        Text: XMBLANG.PASS_CUR_MSG,
        BACK_BTN: true,
        ENTER_BTN: true,
	};

    dialog.Confirm = function() {
		let succeed = true;
		for (let i = 0; i < 4; i++)	{ if (DashUI.Dialog.Data[DashUI.Dialog.Level].TmpCode[i] !== UserConfig.ParentalCode[i]) { succeed = false; break; } }
		if (succeed) { DashUIObjectHandler(Item); }
		UIAnimationDialogFade_Start(false);
    };

	DashUISetDialog(dialog);
}
function UIAnimationDialogFade_Start(isIn) {
	const element = DashUI.Dialog;
	if (isIn === element.Fade.In) { return; }

	element.Fade.In = isIn;
	element.Fade.Progress = 0.0f;
	element.Fade.Running = true;
	element.Display = true;
	DashUI.AnimationQueue.push(UIAnimationDialogFade_Work);
    UIAnimationDialogContentFade_Start(isIn);

    if (DashUI.Dialog.Data[DashUI.Dialog.Level].BG) { return; }

    const level = DashUI.SubMenu.Level;
    if ((level > -1)) {
        UIAnimationCommonFade_Start(DashUI.SubMenu.Animation, UICONST.Fun.SubMenuFade, !isIn);
        if ((level > 0)) {
            UIAnimationCommonFade_Start(DashUI.SubMenu.PrevAnimation, UICONST.Fun.SubMenuPrevFade, !isIn);
        }
	}
}
function UIAnimationDialogFade_Work() {
	const fade = DashUI.Dialog.Fade;
	if (!fade.Running) { return true; }
	const upperlimit = (DashUI.Dialog.Data[DashUI.Dialog.Level].BG) ? 96 : 64;
	fade.Progress += 0.04f;
	DashUI.Overlay.Alpha = (fade.In) ? (DashUI.Overlay.Alpha + 4) : (DashUI.Overlay.Alpha - 4);
	const ovLimit = (fade.In) ? DashUI.Overlay.Alpha >= upperlimit : DashUI.Overlay.Alpha <= 0;

	DashUI.Overlay.Alpha = (ovLimit) ? ((fade.In) ? upperlimit : 0) : DashUI.Overlay.Alpha;

	if ((fade.Progress >= 1.0f) && (ovLimit)) {
		fade.Progress = 1.0f;
		fade.Running = false;
		if (!fade.In) {
			DashUI.Dialog.Level = -1;
			DashUI.Dialog.Data = [];
			DashUI.OverlayState = 0; // Hide Overlay
			DashUI.Dialog.Display = (DashUI.Dialog.Level > -1);
			if ((!DashUI.Dialog.Display) && (DashUI.State.Next === DashUI.State.Current)) {
				DashUI.State.Next = DashUI.State.Previous;
			}
		}
		return true;
	}

	return false;
}
function UIAnimationDialogContentFade_Start(isIn) {
    const element = DashUI.Dialog.ContentFade;
    element.In = isIn;
    element.Progress = 0.0f;
    element.Running = true;
    DashUI.AnimationQueue.push(UICONST.Fun.DialogContentFade);
}
function UIAnimationDialogAnimStart() {
    PlayCursorSfx();
    const element = DashUI.Dialog.Animation;
    element.Progress = 0.0f;
    element.Running = true;
    DashUI.AnimationQueue.push(UICONST.Fun.DialogAnimation);
}
function UIAnimationDialogMove_Start(delta, upperLimit) {
	const data = DashUI.Dialog.Data[DashUI.Dialog.Level];
	const next = data.Selected + delta;
	const run = next >= 0 && next < upperLimit;
    if (!run) { return; }
    data.Selected = next;
    UIAnimationDialogAnimStart();
}
function UIAnimationDialogInfoMove_Start(delta) {
	const data = DashUI.Dialog.Data[DashUI.Dialog.Level];
	if (data.Selected < 0) { return; }
	const item = data.Info[data.Selected];
	if (!item.Selectable) { return; }

	const next = item.Selected + delta;
	const run = next >= 0 && next < item.Value.length;
    if (!run) { return; }
    item.Selected = next;

    UIAnimationDialogAnimStart();
}
function UIAnimationParentalDialogChange_Start(delta) {
	const data = DashUI.Dialog.Data[DashUI.Dialog.Level];
	let next = data.TmpCode[data.Selected] + delta;
    next = (next > 9) ? 0 : ((next < 0) ? 9 : next);
    data.TmpCode[data.Selected] = next;
    UIAnimationDialogAnimStart();
}
function DrawUIDialogParentalScreen(data, baseA) {
	if (!('Selected' in data)) { data.Selected = 0; }
	if (!('TmpCode' in data)) { data.TmpCode = [ 0, 0, 0, 0]; }

	if (DashUI.AnimationQueue.length < 1) { SetPadEvents_Parental(); }

	const Message = {
		Text: getLocalText(data.Text),
		Alignment: "CENTER",
        Position: { X: 0, Y: -40 },
        Alpha: baseA
	};

	TxtPrint(Message);

	for (let i = 0; i < 4; i++) {
		const CodeChar = {
			Text: (i == data.Selected) ? [ data.TmpCode[i].toString() ] : [ "*" ],
			Alignment: "CENTER",
            Position: { X: -48 + (i * 30), Y: 41 },
            Alpha: baseA,
			Glow: ((i === data.Selected) && (baseA === 128)),
		};
		TxtPrint(CodeChar);
	}

	let baseY = (ScrCanvas.height >> 1) + 20;
	let arrowX = (ScrCanvas.width >> 1) - 56 + (data.Selected * 30);
    const arrowElement = DashElements.Arrow;
    arrowElement.angle = -0.5f;
    arrowElement.width = 16;
    arrowElement.height = 16;
    arrowElement.color = Color.setA(arrowElement.color,baseA);
    arrowElement.draw(arrowX, baseY + 5);
    arrowElement.angle = 0.5f;
    arrowElement.draw(arrowX, baseY + 31);
    arrowElement.angle = 0.0f;
}
function DrawUIDialogInfoScreen(data, baseA) {
	if (!('Processed' in data)) {
		data.Info = data.Info.filter(item => item.Value !== "");
		data.Processed = true;
	}

	if (DashUI.AnimationQueue.length < 1) { SetPadEvents_Information(); }

	const items = data.Info;
	const baseX = (ScrCanvas.width >> 1);
    const nameY = UICONST.DialogInfo.NameY - (8 * (items.length - 1));
    const nameTxt = [];
    const valTxt = [];

    for (let i = 0; i < items.length; i++) {
        nameTxt.push(getLocalText(items[i].Name) + ":");
        if (Array.isArray(items[i].Value)) {
            if (data.Selected === i) { valTxt.push(""); continue; }
            valTxt.push(getLocalText(items[i].Value[items[i].Selected]));
        }
        else {
            valTxt.push(getLocalText(items[i].Value));
        }
    }

    const Name = {
        Text: nameTxt,
        Alignment: "RIGHT",
        Position: { X: UICONST.DialogInfo.NameX, Y: nameY },
        Alpha: baseA,
    };

    const Value = {
        Text: valTxt,
        Alignment: "LEFT",
        Position: { X: UICONST.DialogInfo.DescX, Y: nameY },
        Alpha: baseA
    };

    TxtPrint(Name);
    TxtPrint(Value);

    if (data.Selected > -1) {

        const selYpos = nameY + (data.Selected * UICONST.StextLine);

        const SelValue = {
            Text: [ getLocalText(items[data.Selected].Value[items[data.Selected].Selected]) ],
            Alignment: "LEFT",
            Position: { X: UICONST.DialogInfo.DescX, Y: selYpos },
            Alpha: baseA,
            Glow: DashUI.AnimationQueue.length < 1
        };

        const seltxtSize = FontObj.Font.getTextSize(SelValue.Text).width;

        TxtPrint(SelValue);

        const arrowElement = DashElements.Arrow;

        arrowElement.width = 16;
        arrowElement.height = 16;
        arrowElement.color = Color.setA(arrowElement.color,baseA);

		if (items[data.Selected].Selected > 0) {
            arrowElement.angle = 0.0f;
            arrowElement.draw(UICONST.DialogInfo.DescX - 16, selYpos + 7);
		}
		if (items[data.Selected].Selected < (items[data.Selected].Value.length - 1)) {
            arrowElement.angle = 1.0f;
            arrowElement.draw(UICONST.DialogInfo.DescX + seltxtSize, selYpos + 7);
		}

        arrowElement.angle = 0.0f;
	}
}
function DrawUIConfirmationScreen(data, txtA) {
	if (DashUI.AnimationQueue.length < 1) { SetPadEvents_Confirmation(); }

	const Message = {
		Text: getLocalText(data.Text),
		Alignment: "CENTER",
        Position: { X: 0, Y: -40 },
        Alpha: txtA
    };

    let modY = 0;

    if ('Timer' in data) {
        modY = 100;

        const timerText = {
            Text: `${getLocalText(XMBLANG.REMTIME)}\n${data.Timer} ${getLocalText(XMBLANG.SECONDS)}`,
            Alignment: "HCENTER",
            Position: { X: 0, Y: 40 },
            Alpha: txtA
        };

        TxtPrint(timerText);
    }

	const Yes = {
		Text: getLocalText(XMBLANG.YES),
		Alignment: "CENTER",
        Position: { X: -30, Y: 0 + modY },
        Alpha: txtA
	};

	const No = {
		Text: getLocalText(XMBLANG.NO),
		Alignment: "CENTER",
        Position: { X: 30, Y: 0 + modY },
        Alpha: txtA
	};

	if (DashUI.AnimationQueue.length < 1) {
		if (!('Selected' in data)) { data.Selected = 1; }
        else if (data.Selected === 0) {
            Yes.Color = UICONST.TextSelectedColor;
            Yes.Glow = true;
        }
        else {
            No.Color = UICONST.TextSelectedColor;
            No.Glow = true;
        }
	}

	TxtPrint(Message);
	TxtPrint(Yes);
	TxtPrint(No);
}
function DrawUITextDialog(data, a) {
	const TXT = {
		Text: getLocalText(data.Text),
		Alignment: "CENTER",
        Position: { X: 0, Y: 0 },
        Alpha: a
	};

	if ('Align' in data) { TXT.Alignment = data.Align; }
	if ('X' 	in data) { TXT.Position.X = data.X; }
	if ('Y' 	in data) { TXT.Position.Y = data.Y; }

	TxtPrint(TXT);

	if ((DashUI.AnimationQueue.length < 1) && ('Fun' in data)) {
		if (gThreads) { Threads.new(data.Fun).start(); }
		else { data.Fun(); }
		delete data.Fun;
	}
}
function DrawUIDialog() {
	if (!DashUI.Dialog.Display) { return; }

	const cfad = DashUI.Dialog.ContentFade;
	const fade = DashUI.Dialog.Fade;
	const data = DashUI.Dialog.Data[DashUI.Dialog.Level];

	const fadeProgress = getFadeProgress(fade);
	const cfadProgress = (cfad.Running) ? getFadeProgress(cfad) : (cfad.In ? 1 : 0);
	const baseA = ~~(128 * fadeProgress);
	const contentAlpha = ~~(128 * cfadProgress);
    const lineCol = Color.setA(UICONST.DialogInfo.LineCol, baseA);
	const lineTopY = UICONST.DialogInfo.LineYTop;
	const lineBottomY = UICONST.DialogInfo.LineYBottom;
	const iconX = UICONST.DialogInfo.IconX;

	Draw.line(0, lineTopY, ScrCanvas.width, lineTopY, lineCol);
    Draw.line(0, lineBottomY, ScrCanvas.width, lineBottomY, lineCol);

    if (('Icon' in data) && (data.Icon !== -1)) {

        if (typeof data.Icon === "string") { data.Icon = FindDashIcon(data.Icon); }

        const Icon = {
			ID: 	data.Icon,
			Alpha:	baseA,
			Width: 	24,
			Height:	24,
			X:		iconX,
			Y:		lineTopY - 25
		};

		DrawDashIcon(Icon);
    }

    if (('Title' in data) && (data.Title != "")) {
        const Title = {
			Text: getLocalText(data.Title),
            Position: { X: iconX + 30, Y: lineTopY - 25 },
            Alpha: baseA
		};

		TxtPrint(Title);
    }

	if (("BACK_BTN" in data) && (data.BACK_BTN)) {
        const Back = {
			Text: `${(UserConfig.ConfirmBtn === 0) ? "O" : "X"}  ${XMBLANG.BACK[0]}`,
			Alignment: "CENTER",
            Position: { X: 65, Y: 178 },
            Alpha: baseA
		};

		TxtPrint(Back);
    }

    if (("ENTER_BTN" in data) && (data.ENTER_BTN)) {
        const Enter = {
			Text: `${(UserConfig.ConfirmBtn === 0) ? "X" : "O"}  ${XMBLANG.ENTER[0]}`,
			Alignment: "CENTER",
            Position: { X: -70, Y: 178 },
            Alpha: baseA
		};

		TxtPrint(Enter);
    }

    if (contentAlpha < 1) { return; }

	switch (data.Type) {
		case "TEXT":            DrawUITextDialog(data, contentAlpha); break;
		case "CONFIRMATION":    DrawUIConfirmationScreen(data, contentAlpha); break;
		case "INFO":            DrawUIDialogInfoScreen(data, contentAlpha); break;
		case "PARENTAL_SET":
		case "PARENTAL_CHECK":  DrawUIDialogParentalScreen(data, contentAlpha); break;
	}
}

//////////////////////////////////////////////////////////////////////////
///*				   			 Init Work							  *///
//////////////////////////////////////////////////////////////////////////

DashCatInit();
DashUInit();
DashElementsInit();
DashUIConstantsInit();
DashUICustomizationInit();
DashBackgroundLoad();
console.log("INIT LIB: UI COMPLETE");

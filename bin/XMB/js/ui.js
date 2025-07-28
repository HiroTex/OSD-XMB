//////////////////////////////////////////////////////////////////////////
///*				   			    UI								  *///
/// 				   		  										   ///
///		  The Main User Interface Module, with all the Graphical	   ///
///					Interface objects and animations.				   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const UICONST 		= {};
const DashUI 		= {};
const DashElements 	= {};
const DashIcons 	= [];
const DashCatItems 	= [];
const DashPluginData = [];
const DashIconsInfo = JSON.parse(std.loadFile(`${PATHS.XMB}dash/dash_icons.json`));

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
			break;
		case 5: // Exit Interface
			ExitSequenceHandler();
			break;
	}

	DashUIAnimationHandler();
	DrawUIObjectBg();
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
		const elfExists = std.exists(gExit.Elf.Path);
		if (!elfExists) {
			result = false; // An Error has been encountered

			// Show new Error Message
			OpenDialogErrorMsg(XMBLANG.ERROR.ELF_NOT_FOUND);
		}
	}

	if (result) { DashUI.ExitState++; } // Continue
	else { DashUI.ExitState = 5; } 		// Fade Back In
}
function DashUIAnimationHandler() {
	let result = true;
	for (let i = 0; i < DashUI.AnimationQueue.length; i++)
	{
		const f = DashUI.AnimationQueue[i];
		const thisResult = f();
		if ((result) && (thisResult)) { result = true; }
		else { result = false; }
	}
	if (result) DashUI.AnimationQueue = [];
}
function OvHandler() {
    DashUI.Overlay.Alpha = alphaCap(DashUI.Overlay.Alpha);
    if (DashUI.Overlay.Alpha < 1) { return; }
    const ovColor = Color.setA(DashUI.Overlay.Color, DashUI.Overlay.Alpha);
	Draw.rect(0, 0, ScrCanvas.width, ScrCanvas.height, ovColor);

	switch(DashUI.OverlayState)
	{
		case 1: // Show Boot Warning Text
			UICONST.BootWarningText.Position.X = 0;
			UICONST.BootWarningText.Position.Y = 0;
			UICONST.BootWarningText.Alpha = alphaCap(DashUI.BootWarningAlpha);
			TxtPrint(UICONST.BootWarningText);
			break;
		case 2: // Show Dialog
			DrawUIDialog();
			break;
	}

}
function DashUIObjectHandler(Item) {
	switch (Item.Type)
	{
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
			else { const thread = Threads.new(() => loadImages(itemsToLoad)); thread.start(); }
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
}
function DashPluginsInit() {
    const plugins = System.listDir(PATHS.Plugins).sort((a, b) => a.name.localeCompare(b.name));

	for (let i = 0; i < plugins.length; i++) {
		if ((plugins[i].dir) || (!extensionMatches(plugins[i].name, [ "json", "xml" ]))) { continue; }

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

    DashUI.LoadedPlugins = true;
}
function DashPluginsProcess() {
    while (DashPluginData.length > 0) {
        const plg = DashPluginData.shift();
        let Plugin = false;

        switch (plg.Type) {
            case "JSON": Plugin = JSON.parse(plg.Data); break;
            case "XML" : Plugin = parseXmlPlugin(plg.Data); break;
        }

        if (Plugin) { AddNewPlugin(Plugin); }
    }
}
function DashBackgroundLoad() {
	try {
		while (DashIconsInfo.length > DashIcons.length) {
			const path = `${PATHS.Theme}${UserConfig.Theme}/icons/${DashIconsInfo[DashIcons.length].path}`;
			const icn = std.exists(path) ? new Image(path) : new Image(`${PATHS.Theme}Original/icons/${DashIconsInfo[DashIcons.length].path}`);
			icn.optimize();
			icn.filter = LINEAR;
			DashIcons.push(icn);
		}

		DashPluginsInit();
	} catch (e) {
		xlog(e);
	}
}
function DashBackgroundThreadWork() {
	if (gThreads) {	const thread = Threads.new(DashBackgroundLoad); thread.start(); }
	else { DashBackgroundLoad(); }
}
function DashUIConstantsInit() {

	UICONST.ClockTextObj = {
		Text: "",
		Position: { X: 0, Y: 0 },
        Scale: FontObj.SizeM,
        Alpha: 128
	};

	UICONST.BootInfo = {
		SfxFrame: 12,
		StateDurations: [ 63, 127, 29, 127, 63, 119, 127 ]
    };

	UICONST.BootWarningText = {
        Text: PreprocessText(getLocalText(XMBLANG.BOOT_WARNING)),
		Position: { X: 0, Y: 0 },
		Alignment: "CENTER",
        Scale: FontObj.SizeM,
        Alpha: 0
	};

	UICONST.BootLogoY = ~~(ScrCanvas.height / 3) + 20;
	UICONST.BootLogoX = ScrCanvas.width - DashElements.BootLogo.width;
	UICONST.CatItems = {
		IconX: (ScrCanvas.width >> 1) - 178,
		IconY: (ScrCanvas.height >> 1) - 32,
		TextX: (ScrCanvas.width >> 1) - 80,
		TextY: (ScrCanvas.height >> 1) - 16
	};
	UICONST.Category = {
		IconSelectedColor: { R: 128, G: 128, B: 128 },
		IconUnselectedColor: { R: 128, G: 128, B: 128 },
		IconX: (ScrCanvas.width >> 1) - 178,
		IconY: (ScrCanvas.height >> 1) - 120
	};
	UICONST.Context = {
		BoxX: 180,
		BoxA: 116,
		BaseX: ScrCanvas.width - 164,
		BaseY: (ScrCanvas.height >> 1) - 15,
		Tint: false
	};

	UICONST.ScreenDrawLimit = 64;
	UICONST.IcoSelSize = 72;
	UICONST.IcoUnselMod = 24;
	UICONST.SubItemSlotSize = 52;
    UICONST.DefaultIconColor = Color.new(128, 128, 128, 128);
	UICONST.TextSelectedColor = { R: 128, G: 128, B: 128 };
	UICONST.TextUnselectedColor = { R: 128, G: 128, B: 128 };
	UICONST.ClockX = ScrCanvas.width - 194;
    UICONST.ClockY = 35;
    UICONST.ClockIcoX = ScrCanvas.width - 24;

	UICONST.SubItems = {
		ArrowX: (ScrCanvas.width >> 1) - 174,
		ArrowY: (ScrCanvas.height >> 1) - 6,
		IconX: (ScrCanvas.width >> 1) - 146,
		IconY: (ScrCanvas.height >> 1) - 32,
		TextX: (ScrCanvas.width >> 1) - 60,
		TextY: (ScrCanvas.height >> 1) - 16
	};

	UICONST.ScrLowerLimit = ScrCanvas.height + UICONST.ScreenDrawLimit;
	UICONST.ScrRightLimit = ScrCanvas.width + UICONST.ScreenDrawLimit;

    UICONST.Fun = {
        SubMenuFade: () => UIAnimationCommon_Work(DashUI.SubMenu.Animation.Fade, 0.04f),
        SubMenuPrevFade: () => UIAnimationCommon_Work(DashUI.SubMenu.PrevAnimation.Fade, 0.04f),
        DialogContentFade: () => UIAnimationCommon_Work(DashUI.Dialog.ContentFade, 0.04f),
        DialogAnimation: () => UIAnimationCommon_Work(DashUI.Dialog.Animation, 0.15f)
    };

    UICONST.DialogInfo = {
        LineCol: Color.new(196,196,196,128),
		LineYTop: (ScrCanvas.height >> 1) - 160,
		LineYBottom: (ScrCanvas.height >> 1) + 170,
		IconX: (ScrCanvas.width >> 1) - 280,
		NameX: - (ScrCanvas.width >> 1) - 15,
		NameY: (ScrCanvas.height >> 1),
		DescX: (ScrCanvas.width >> 1),
	}

	UICONST.OptionBox = {
		XBOX: ScrCanvas.width - 100,
		YBOX: ScrCanvas.height - 70,
		XICO: ScrCanvas.width - 93,
		YICO: ScrCanvas.height - 34,
		XTXT: ScrCanvas.width - 73,
		YTXT: ScrCanvas.height - 42
	};
}
function DashUInit() {
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
	DashUI.ItemBG.Timer = Timer.new();
	Timer.reset(DashUI.ItemBG.Timer);
	Timer.pause(DashUI.ItemBG.Timer);

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
	DashUI.SubMenu.Display = false;
	DashUI.SubMenu.Level = -1;
	DashUI.SubMenu.ItemCollection = [];
	DashUI.SubMenu.Items = {};
	DashUI.SubMenu.Items.Current = 0;
	DashUI.SubMenu.Items.Next = 0;
	DashUI.SubMenu.Animation = {};
	DashUI.SubMenu.Animation.Running = false;
	DashUI.SubMenu.Animation.Progress = 0.0f;
	DashUI.SubMenu.Fade = createFade();
	DashUI.SubMenu.Animation.Fade = createFade();
	DashUI.SubMenu.PrevAnimation = {};
	DashUI.SubMenu.PrevAnimation.Fade = createFade();

	// Init Context Object
	DashUI.Context = {};
	DashUI.Context.Display = false;
	DashUI.Context.Level = -1;
	DashUI.Context.PreviewA = 0;
	DashUI.Context.Timer = Timer.new();
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
	Timer.reset(DashUI.Context.Timer);
	Timer.pause(DashUI.Context.Timer);

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

//////////////////////////////////////////////////////////////////////////
///*				   			 Boot Logo							  *///
//////////////////////////////////////////////////////////////////////////

function UIAnimateBootLogo_Work(Alpha) {
    Alpha = alphaCap(Alpha);
    if (Alpha < 1) { return; }
    DashElements.BootLogo.color = Color.setA(DashElements.BootLogo.color, Alpha);
	DashElements.BootLogo.draw(UICONST.BootLogoX, UICONST.BootLogoY);
}

//////////////////////////////////////////////////////////////////////////
///*				   			   Clock							  *///
//////////////////////////////////////////////////////////////////////////

function UIClockText(a) {
    const month = String(gTime.month).padStart(2, '0');
    const day = String(gTime.day).padStart(2, '0');
    const minutes = String(gTime.minute).padStart(2, '0');
    const hours24 = gTime.hour;
    const hours12 = (hours24 % 12) || 12;
    const amPm = hours24 >= 12 ? 'PM' : 'AM';
    const strHour = (UserConfig.HourFormat === 0) ? String(hours12).padStart(2, '0') : String(hours24).padStart(2, '0');

    const date = (UserConfig.DateFormat === 0) ? `${day}/${month}` : `${month}/${day}`;
    const time = (UserConfig.HourFormat === 0) ? `${strHour}:${minutes} ${amPm}` : `${strHour}:${minutes}`;

	UICONST.ClockTextObj.Text = [`${date}  ${time}`];
    UICONST.ClockTextObj.Position.X = UICONST.ClockX + 12;
    UICONST.ClockTextObj.Position.Y = UICONST.ClockY - 1;
    UICONST.ClockTextObj.Alpha = a;

    return UICONST.ClockTextObj;
}
function DrawUIClock() {
	if (DashUI.Clock.Display === false) { return; }
	const fadeProgress = getFadeProgress(DashUI.Clock.Fade);
	const alpha    = ~~(128 * fadeProgress);
	const clockBox = DashElements.ClockOutline;
    const clockIco = DashElements.ClockIco;
    const clockCol = Color.setA(clockBox.color, alpha);

    // Draw Start of Clock Outline
    clockBox.width = 32;
    clockBox.startx = 2;
    clockBox.color = clockCol;
    clockBox.draw(UICONST.ClockX, UICONST.ClockY);

    // Draw End of Clock Outline
    clockBox.width = 196;
    clockBox.startx = 34;
    clockBox.color = clockCol;
    clockBox.draw(UICONST.ClockX + 29, UICONST.ClockY);

    clockIco.color = clockCol;
    clockIco.draw(UICONST.ClockIcoX, UICONST.ClockY + 7);

	TxtPrint(UIClockText(alpha));
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
    let time = ~~(Timer.getTime(DashUI.ItemBG.Timer) / 100000);
    if (time < 8) { DashUI.ItemBG.A = 0; return; }

    if (!('Image' in DashUI.ItemBG)) { DashUI.ItemBG.A = 0; return; }

    const customBg = ImageCache.Get(DashUI.ItemBG.Image);
    const Ready = customBg && customBg.ready();
    if (!Ready) { DashUI.ItemBG.A = 0; return; }

    if (DashUI.ItemBG.A === 0) {
        let ival = os.setInterval(() => {
            DashUI.ItemBG.A += 8;
            if (DashUI.ItemBG.A > 120) { os.clearInterval(ival); }
        }, 0);
    }

    customBg.width = ScrCanvas.width;
    customBg.height = ScrCanvas.height;
    customBg.color = Color.new(128, 128, 128, DashUI.ItemBG.A);
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
	gExit.Elf = { Path: resolveFilePath(Data.Path) };
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
	if (!anim.Running) { return true; }
	anim.Progress += progress;

	if (anim.Progress >= 1.0f)
	{
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
	const next = DashUI.Category.Next + delta;
	const run = next >= 0 && next < CATNAME.length;
	if ((run) && (DashUI.Category.Current === DashUI.Category.Next)) {
		DashUIResetBg();
		PlayCursorSfx();
		DashUI.Category.Next = next;
		DashUI.Category.Animation.Running = true;
		DashUI.Category.Animation.Progress = 0.0f;
		DashUI.AnimationQueue.push(UIAnimationCategoryMove_Work);
		UIAnimationItemCollectionMove_Start();
	}
}
function UIAnimationCategoryMove_Work() {
	if (!DashUI.Category.Animation.Running) { return true; }
	DashUI.Category.Animation.Progress += 0.075f;
	if (DashUI.Category.Animation.Progress < 1.0f) {
		const l = pad.pressed(Pads.LEFT) || (pad.lx < -64);
		const r = pad.pressed(Pads.RIGHT) || (pad.lx > 64);
		if ((DashUI.Category.Animation.Progress > 0.6f) && (l || r)) {
			const delta = l ? -1 : 1;
			UIAnimationCategoryMove_Reset(delta)
		}
		return false;
	}

	DashUI.Category.Current = DashUI.Category.Next;
	DashUI.Category.Animation.Progress = 0.0f;
	DashUI.Category.Animation.Running = false;

	return true;
}
function UIAnimationCategoryMove_Reset(delta) {
	const next = DashUI.Category.Next + delta;
	const run = next >= 0 && next < CATNAME.length;
	if (!run) { return }

	DashUIResetBg();
	PlayCursorSfx();
	DashUI.Category.Current = DashUI.Category.Next;
	DashUI.ItemCollection.Current = DashUI.ItemCollection.Next;
	DashUI.Items.Current = DashCatItems[DashUI.Category.Next].Default;
	DashUI.Items.Next = DashUI.Items.Current;
	DashUI.Category.Next = next;
	DashUI.ItemCollection.Swipe.Dir = DashUI.Category.Next - DashUI.Category.Current;
	DashUI.ItemCollection.Next = DashCatItems[DashUI.Category.Next].Items;
	DashUI.Category.Animation.Progress = 0.0f;
	DashUI.ItemCollection.Swipe.Progress = 0.0f;
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

	// Sub Menu Modifiers
	const subMod = DashUI.SubMenu.Display;

	const subfade = DashUI.SubMenu.Fade;
	const subfadeProgress = getFadeProgress(subfade);

	const subSelXmod 	= 80 * subfadeProgress;
	const subSelAmod 	= ~~(128 * subfadeProgress);
	const subNoSelXmod 	= 18 * subfadeProgress + (18 * DashUI.SubMenu.Level);
	const subNoSelYmod 	= 5 * subfadeProgress + (5 * DashUI.SubMenu.Level);
    const subNoSelAmod  = (DashUI.SubMenu.Level < 1) ? ~~(-102 * subfadeProgress) : -102 - (26 * subfadeProgress);
	const subLevelXmod 	= 80 * DashUI.SubMenu.Level;

	// Context Modifiers
	const contextMod          = DashUI.Context.Display;
	const contextfade         = DashUI.Context.Fade;
    const contextfadeProgress = getFadeProgress(contextfade);
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
		Icon.Width 		= UICONST.IcoSelSize;
		Icon.Height 	= UICONST.IcoSelSize;
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
			Icon.X 			+= ((nextDif < 0) ? 102 * easing : 81 * easing) * -nextDif;
			Icon.Y 			+= 15 * easing;
			Icon.Width 		-= UICONST.IcoUnselMod * easing;
			Icon.Height 	-= UICONST.IcoUnselMod * easing;
			Icon.Tint		 = (anim.Running) ? interpolateColorObj(UICONST.Category.IconSelectedColor, UICONST.Category.IconUnselectedColor, anim.Progress) : UICONST.Category.IconSelectedColor;
			Text.Color		 = (anim.Running) ? interpolateColorObj(UICONST.TextSelectedColor, UICONST.TextUnselectedColor, anim.Progress) : UICONST.TextSelectedColor;
			Text.Alpha 	     = 128 + (-120 * easing);
			Text.Position.X  = Text.Position.X - (92 * easing * nextDif);

			if (subMod) {
				Icon.X 			-= (subSelXmod + subLevelXmod);
				Icon.Alpha 		-= (128 * subfadeProgress) * DashUI.SubMenu.Level;
				Text.Position.X -= (subSelXmod + subLevelXmod);
				Text.Alpha 	    -= subSelAmod;
				Text.Alpha 	    -= (128 * DashUI.SubMenu.Level);
			}

			if (contextMod) {
				Icon.Tint		 = interpolateColorObj(UICONST.Category.IconSelectedColor, UICONST.Category.IconUnselectedColor, contextfadeProgress);
				Text.Alpha 	    -= ~~(128 * contextfadeProgress); ;
				if (subMod) { Icon.X -= contextX; }
			}
		}
		else if (i === next) {
			Icon.X 			 = Icon.X - ((nextDif > 0) ? 102 * (1 - easing) : 81 * (1 - easing)) * -nextDif;
			Icon.Y 			+= 15 * (1 - easing);
			Icon.Width 		-= UICONST.IcoUnselMod * (1 - easing);
			Icon.Height 	-= UICONST.IcoUnselMod * (1 - easing);
			Icon.Tint		 = interpolateColorObj(UICONST.Category.IconUnselectedColor, UICONST.Category.IconSelectedColor, anim.Progress);
			Text.Position.X  = Text.Position.X + (((nextDif < 0) ? 88 : 92) * (1 - easing) * nextDif);
			Text.Color		 = interpolateColorObj(UICONST.TextUnselectedColor, UICONST.TextSelectedColor, anim.Progress);
			Text.Alpha 	     = 128 - (110 * (1 - easing));
		}
		else {
			const baseX = (dif < 0) ? dif * 81 : (dif * 81 + 21);
			Icon.Width 	= 48;
			Icon.Height = 48;
			Icon.Y 		+= 15;
			Icon.X 		+= baseX;
			Icon.X 		+= 81 * -nextDif * easing;

            if (subMod) {
                Icon.Alpha += (subNoSelAmod);
                Icon.X -= subNoSelXmod;
                Icon.Y += subNoSelYmod;
                if (contextMod) {
                    Icon.Alpha += ~~(-8 * contextfadeProgress);
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

			// Movimiento interpolado
			let offsetX = 0;
			let offsetY = -10 * (1 - fadeProgress);
			if (dif < 0)      { offsetX = -20 * (1 - fadeProgress); }
			else if (dif > 0) { offsetX =  20 * (1 - fadeProgress); }

			Icon.X	 		+= offsetX;
            Icon.Y += offsetY;

            if (isSelected) {
                Text.Alpha = ~~(Text.Alpha * fadeProgress);
                Text.Position.X += offsetX;
                Text.Position.Y += offsetY;
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
	const next = DashUI.Items.Next + delta;
	const run = next >= 0 && next < DashUI.ItemCollection.Current.length;
	if ((run) && (DashUI.Items.Current === DashUI.Items.Next)) {
		DashUIResetBg();
		PlayCursorSfx();
		DashUI.Items.Next = next;
		DashCatItems[DashUI.Category.Current].Default = next;
		DashUI.Items.Animation.Running = true;
		DashUI.Items.Animation.Progress = 0.0f;
		DashUI.AnimationQueue.push(UIAnimationCategoryItemsMove_Work);
	}
}
function UIAnimationCategoryItemsMove_Work() {
	if (!DashUI.Items.Animation.Running) { return true; }

	DashUI.Items.Animation.Progress += 0.07f;
	if (DashUI.Items.Animation.Progress < 1.0f) {
		const u = pad.pressed(Pads.UP) || (pad.ly < -64);
		const d = pad.pressed(Pads.DOWN) || (pad.ly > 64);
		if ((DashUI.Items.Animation.Progress > 0.6f) && (u || d)) {
			const delta = u ? -1 : 1;
			UIAnimationCategoryItemsMove_Reset(delta)
		}
		return false;
	}

	DashUI.Items.Current = DashUI.Items.Next;
	DashUI.Items.Animation.Progress = 0.0f;
	DashUI.Items.Animation.Running = false;

	return true;
}
function UIAnimationCategoryItemsMove_Reset(delta) {
	const next = DashUI.Items.Next + delta;
	const run = next >= 0 && next < DashUI.ItemCollection.Current.length;
	if (!run) { return; }

	PlayCursorSfx();
	DashUIResetBg();
	DashUI.Items.Animation.Progress = 0.0f;
	DashUI.Items.Current = DashUI.Items.Next;
	DashUI.Items.Next = next;
	DashCatItems[DashUI.Category.Current].Default = next;
}
function UIAnimationItemCollectionMove_Start() {
	DashUI.ItemCollection.Swipe.Running = true;
	DashUI.ItemCollection.Swipe.Progress = 0.0f;
	DashUI.ItemCollection.Swipe.Dir = DashUI.Category.Next - DashUI.Category.Current;
	DashUI.ItemCollection.Next = DashCatItems[DashUI.Category.Next].Items;
	DashUI.AnimationQueue.push(UIAnimationItemCollectionMove_Work);
}
function UIAnimationItemCollectionMove_Work() {
	if (!DashUI.ItemCollection.Swipe.Running) { return true; }
	DashUI.ItemCollection.Swipe.Progress += 0.075f;
	if (DashUI.ItemCollection.Swipe.Progress < 1.0f) { return false; }

	DashUI.ItemCollection.Swipe.Progress = 0.0f;
	DashUI.ItemCollection.Swipe.Running = false;
	DashUI.ItemCollection.Current = DashUI.ItemCollection.Next;
	DashUI.Items.Current = DashCatItems[DashUI.Category.Next].Default;
	DashUI.Items.Next = DashUI.Items.Current;

	return true;
}
function DrawUICategoryItems() {
	DrawUICategoryItems_Work(DashUI.ItemCollection.Current, DashUI.Items.Current, 0)
	if (DashUI.ItemCollection.Swipe.Running) {
		DrawUICategoryItems_Work(DashUI.ItemCollection.Next, DashCatItems[DashUI.Category.Next].Default, 90 * DashUI.ItemCollection.Swipe.Dir);
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
	const swipeoffsetX = x + 90 * swipeConst * -swipe.Dir;

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

    const modCurrY      = (dir < 0 ? 82 : -142) * easing;
    const modNextShift  = UICONST.SubItemSlotSize * easing * (-dir);

	// Sub Menu Modifiers
	const subMod            = DashUI.SubMenu.Display;
	const subfade           = DashUI.SubMenu.Fade;
	const subfadeProgress   = getFadeProgress(subfade);

    const subNoSelAmod      = (DashUI.SubMenu.Level < 1) ? ~~(-98 * subfadeProgress) : -98 - ~~(12 * subfadeProgress);
	const subNoSelXmod 		= 28 * subfadeProgress + (28 * DashUI.SubMenu.Level);
    const subSelAmod        = (DashUI.SubMenu.Level < 1) ? ~~(-128 * subfadeProgress) : -128;
	const subSelXmod 		= 80 * subfadeProgress;
	const subLevelXmod 		= 80 * DashUI.SubMenu.Level;
    const subNoSelTextAmod  = (DashUI.SubMenu.Level < 1) ? ~~(-128 * subfadeProgress) : -128;
	const subSelAFadeMod 	= ~~((128 * subfadeProgress) * DashUI.SubMenu.Level);

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
        if (typeof info.Icon === "string") { info.Icon = FindDashIcon(info.Icon); }

		Icon.ID 		= info.Icon;
		Icon.Alpha 		= 110;
		Icon.Width 		= UICONST.IcoSelSize;
		Icon.Height 	= UICONST.IcoSelSize;
		Icon.X 			= UICONST.CatItems.IconX;
		Icon.Y 			= UICONST.CatItems.IconY;

		if ('CustomIcon' in info) { Icon.CustomIcon = info.CustomIcon; }
		else if ('CustomIcon' in Icon) { delete Icon.CustomIcon; }
        if ('Color' in Name) { delete Name.Color; }
        Name.Text 		= [ getLocalText(info.Name) ];
		Name.Position 	= { X:UICONST.CatItems.TextX, Y: UICONST.CatItems.TextY };
		Name.Scale 		= FontObj.SizeL;
		Name.Alpha 	    = 128;
		Name.Glow   	= false;

        if (i === current) {
            Icon.X      	+= halfMod * easing;
            Icon.Y      	+= modCurrY;
            Icon.Width  	-= UICONST.IcoUnselMod * easing;
            Icon.Height 	-= UICONST.IcoUnselMod * easing;
            Name.Position.Y += modCurrY - (9 * easing);
            Name.Glow   	= !anim.Running && !contextMod && !faderunning && !subMod && !swipe.Running;
			Name.Color 		= (anim.Running) ? interpolateColorObj(UICONST.TextSelectedColor, UICONST.TextUnselectedColor, anim.Progress) : UICONST.TextSelectedColor;
			Name.Alpha 	    = 128;

            if (Name.Glow) { if (('CustomBG' in info) && (!('Image' in DashUI.ItemBG))) { DashUI.ItemBG.Image = info.CustomBG; } }

			Desc = {
                Text: [ getLocalText(info.Description) ],
                Scale: FontObj.SizeM,
                Position: {
                    X: Name.Position.X,
                    Y: Name.Position.Y + 18
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
            const baseY 	= (diff > 0 ? downOff : upOff)
							+ diff * UICONST.SubItemSlotSize
							+ modNextShift;
            Icon.Y      	+= baseY + halfMod;
            Icon.Width  	-= UICONST.IcoUnselMod;
            Icon.Height 	-= UICONST.IcoUnselMod;
            Icon.X      	+= halfMod;

            Name.Position.Y += ((diff > 0 ? textDown : textUp)
                                + diff * UICONST.SubItemSlotSize
                                + modNextShift );

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
                        Y: Name.Position.Y + 18
                    },
                    Alpha: ~~(128 * easing)
                };
            }

			if (subMod) {
				const subNoSelYmod = ((diff > 0) ? -8 : 8) * subfadeProgress;
				Icon.X 			-= subNoSelXmod;
				Icon.Y 			+= (subNoSelYmod + (((diff > 0) ? -8 : 8) * DashUI.SubMenu.Level));
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
			Name.Alpha 	    = ~~(Name.Alpha * swipeProgress);
			Icon.X 			+= swipeoffsetX;
			Name.Position.X += swipeoffsetX;

			if (Desc) { Desc.Alpha = Name.Alpha; Desc.Position.X = Name.Position.X; }
		}

        if (Icon.Y < -UICONST.ScreenDrawLimit) continue;
        if (Icon.Y > UICONST.ScrLowerLimit) break;

		// Draw Focus
		if ((DashUI.SubMenu.Level < 1) && (DashElements.ItemFocus) && (i === current || i === next) && Desc) {
			let FocusX = Icon.X - 5;
			let FocusY = Icon.Y + 2;
			let FocusA = (subMod) ? Desc.Alpha : (contextMod ? ~~(128 * (1 - contextfadeProgress)) : Desc.Alpha);
			let focus = DashElements.ItemFocus;

			let isCurrent = (i === current);
			let isNext = (i === next);

			if (anim.Running) {
				const mod = 24 * (isNext ? (1 - easing) : easing);
				focus.width = 82 - mod;
				focus.height = 72 - mod;
			}
			else if (contextMod) {
				const mod = 24 * contextfadeProgress;
				focus.width = 82 + mod;
				focus.height = 72 + mod;
			}
			else if (!anim.Running && isCurrent) {
				focus.width = 82;
				focus.height = 72;
			}

			focus.color = Color.new(128, 128, 128, FocusA);
			focus.draw(FocusX, FocusY);
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
	PlayCursorSfx();
	DashUI.SubMenu.Items.Current = SubMenu.Default;
	DashUI.SubMenu.Items.Next = SubMenu.Default;
	DashUI.SubMenu.Level++;
	DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level] = SubMenu;
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
	if (!DashUI.SubMenu.Fade.Running) { return true; }
	DashUI.SubMenu.Fade.Progress += 0.04f;

	if (DashUI.SubMenu.Fade.Progress >= 1.0f) {
		DashUI.SubMenu.Fade.Progress = 1.0f;
		DashUI.SubMenu.Fade.Running = false;
		if (!DashUI.SubMenu.Fade.In) {
			DashUI.SubMenu.Level--;
			DashUI.SubMenu.Display = (DashUI.SubMenu.Level > -1);
			if (DashUI.SubMenu.Level > -1) {
				const next = DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level].Default;
				DashUI.SubMenu.Items.Current = next;
				DashUI.SubMenu.Items.Next = next;
			}
			else {
				DashUI.State.Next = 1;
			}
		}
		return true;
	}

	return false;
}
function UIAnimationSubMenuItemsMove_Start(delta) {
	const next = DashUI.SubMenu.Items.Next + delta;
	const run = next >= 0 && next < DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level].Items.length;
	if ((run) && (DashUI.SubMenu.Items.Current === DashUI.SubMenu.Items.Next)) {
		DashUIResetBg();
		PlayCursorSfx();
		DashUI.SubMenu.Items.Next = next;
		DashUI.SubMenu.Animation.Running = true;
		DashUI.SubMenu.Animation.Progress = 0.0f;
		DashUI.AnimationQueue.push(UIAnimationSubMenuItemsMove_Work);
	}
}
function UIAnimationSubMenuItemsMove_Work() {
	if (!DashUI.SubMenu.Animation.Running) { return true; }

	DashUI.SubMenu.Animation.Progress += 0.07f;
	if (DashUI.SubMenu.Animation.Progress < 1.0f) {
		const u = pad.pressed(Pads.UP) || (pad.ly < -64);
		const d = pad.pressed(Pads.DOWN) || (pad.ly > 64);
		if ((DashUI.SubMenu.Animation.Progress > 0.6f) && (u || d)) {
			const delta = u ? -1 : 1;
			UIAnimationSubMenuItemsMove_Reset(delta)
		}

		return false;
	}

	DashUI.SubMenu.Items.Current = DashUI.SubMenu.Items.Next;
	DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level].Default = DashUI.SubMenu.Items.Current;
	DashUI.SubMenu.Animation.Progress = 0.0f;
	DashUI.SubMenu.Animation.Running = false;

	return true;
}
function UIAnimationSubMenuItemsMove_Reset(delta) {
	const next = DashUI.SubMenu.Items.Next + delta;
	const run = next >= 0 && next < DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level].Items.length;
	if (!run) { return; }

	PlayCursorSfx();
	DashUIResetBg();
	DashUI.SubMenu.Items.Current = DashUI.SubMenu.Items.Next;
	DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level].Default = DashUI.SubMenu.Items.Current;
	DashUI.SubMenu.Items.Next = next;
	DashUI.SubMenu.Animation.Progress = 0.0f;
}
function DrawUISubMenuFadingInitialLevel() {
	if ((DashUI.SubMenu.Level < 2) || (!DashUI.SubMenu.Fade.Running)) return;

	const items   = DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level - 2].Items;
	const current = DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level - 2].Default;
	const fade    = DashUI.SubMenu.Fade;
	const fadeProgress = fade.In ? cubicEaseOut(fade.Progress) : cubicEaseIn(fade.Progress);

	const halfMod    = UICONST.IcoUnselMod >> 1;
	const icoA       = 110;
	const SelIcoA    = icoA * fadeProgress;
	const SelModX    = 110 + SelIcoA;
	const noSelModX  = 56 + (56 * fadeProgress);
	const noSelModA  = ~~(-96 - 14 * fadeProgress);

	let Icon = {
		Width:  UICONST.IcoSelSize,
		Height: UICONST.IcoSelSize,
		X: UICONST.SubItems.IconX,
		Y: UICONST.SubItems.IconY
	};

	for (let i = 0, len = items.length; i < len; i++) {
		const diff = i - current;
		if (diff < -8) continue;
		if (diff > 6) break;

		const info = items[i];
		Icon.ID    = info.Icon;
		Icon.Alpha = icoA;
		Icon.Width = UICONST.IcoSelSize;
		Icon.Height = UICONST.IcoSelSize;
		Icon.X = UICONST.SubItems.IconX;
		Icon.Y = UICONST.SubItems.IconY;

		if ('CustomIcon' in info) { Icon.CustomIcon = info.CustomIcon; }
		else if ('CustomIcon' in Icon) { delete Icon.CustomIcon; }

		if (i === current) {
			Icon.Alpha -= SelIcoA;
			Icon.X     -= SelModX;
		}
		else {
			const mod     = (diff > 0) ? 24 : -24;
			const yOffset = ((diff > 0) ? -10 : 10);
			const baseY   = mod + diff * UICONST.SubItemSlotSize;

			Icon.Alpha   += noSelModA;
			Icon.Width   -= UICONST.IcoUnselMod;
			Icon.Height  -= UICONST.IcoUnselMod;
			Icon.X       += halfMod - noSelModX;
			Icon.Y       += halfMod + yOffset + (yOffset * fadeProgress) + baseY;
		}

		if ((Icon.Y < -UICONST.ScreenDrawLimit) || (Icon.Y > UICONST.ScrLowerLimit)) continue;
		DrawDashIcon(Icon);
	}
}
function DrawUISubMenuPreviousLevel() {
	if (DashUI.SubMenu.Level < 1) return;

	const items   = DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level - 1].Items;
	const current = DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level - 1].Default;
	const fade    = DashUI.SubMenu.Fade;
	const fadeProgress = getFadeProgress(fade);

	const aFade 		= DashUI.SubMenu.PrevAnimation.Fade;
	const aFadeProgress	= (aFade.Running) ? getFadeProgress(aFade) : 1;

	const icoA      = 110 * aFadeProgress;
	const halfMod   = UICONST.IcoUnselMod >> 1;
	const baseA     = ~~(128 - 128 * fadeProgress);
	const SelModX   = 110 * fadeProgress;
	const noSelModX = 56 * fadeProgress;
	const noSelModA = (aFade.Running) ? ~~(-96 * aFadeProgress) : ~~(-96 * fadeProgress);
	const ArrowA    = ~~(84 - 84 * fadeProgress);

	DashElements.Arrow.width  = 20;
	DashElements.Arrow.height = 20;
    DashElements.Arrow.color  = Color.setA(DashElements.Arrow.color, ArrowA);
	DashElements.Arrow.draw(UICONST.SubItems.ArrowX - (80 * fadeProgress), UICONST.SubItems.ArrowY);

    let Icon = {}, Name = {}, Desc = false, Ctxt = {};
    Ctxt.Alignment = "RIGHT";

	// Context Modifiers
	const contextMod = DashUI.Context.Display;
	const contextfade = DashUI.Context.Fade;
    const contextfadeProgress = getFadeProgress(contextfade);

	const contextX = halfMod * contextfadeProgress;

	for (let i = 0, len = items.length; i < len; i++) {
		const diff = i - current;
		if (diff < -8) continue;
		if (diff > 6) break;

		Desc = false;
		const info = items[i];
		Icon.ID     = info.Icon;
		Icon.Alpha  = icoA;
		Icon.Width  = UICONST.IcoSelSize;
		Icon.Height = UICONST.IcoSelSize;
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

        const CtxtName = info.Type === "CONTEXT";

		if (i === current) {
			Icon.X 			-= SelModX;
			Name.Position.X -= SelModX;
			Name.Color   	 = UICONST.TextSelectedColor;
			Name.Alpha 	     = baseA;

			Desc = {
				Text: [ getLocalText(info.Description) ],
				Scale: FontObj.SizeM,
				Position: {
					X: Name.Position.X,
					Y: Name.Position.Y + 18
                },
                Alpha: baseA
			};

			if (contextMod)	{ Icon.X -= contextX; }
		}
		else {
			const mod     = (diff > 0) ? 24 : -24;
			const yOffset = ((diff > 0) ? -10 : 10) * fadeProgress;
			const baseY   = mod + diff * UICONST.SubItemSlotSize;

			Icon.Alpha   += noSelModA;
			Icon.Width   -= UICONST.IcoUnselMod;
			Icon.Height  -= UICONST.IcoUnselMod;
			Icon.X       += halfMod - noSelModX;
			Icon.Y       += yOffset + baseY + halfMod;
			Name.Position.Y += yOffset + mod + diff * UICONST.SubItemSlotSize;
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
			const modX      = (i === current) ? SelModX : noSelModX;
			Ctxt.Text	    = [ info.Value.Items[info.Value.Default].Name ];
            Ctxt.Position   = { X: -40 - modX , Y: Name.Position.Y };
            Ctxt.Alpha      = Name.Alpha;
            TxtPrint(Ctxt);
		}

		// Draw Focus
		if ((DashElements.ItemFocus) && Desc) {
			let FocusX = Icon.X - 5;
			let FocusY = Icon.Y + 2;
			let FocusA = Desc.Alpha;
			let focus = DashElements.ItemFocus;
			focus.width = 82;
			focus.height = 72;
            focus.color = Color.setA(focus.color, FocusA);
			focus.draw(FocusX, FocusY);
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
    Ctxt.Alignment = "RIGHT";
    Ctxt.Color      = { R: UICONST.TextUnselectedColor.R, G: UICONST.TextUnselectedColor.G, B: UICONST.TextUnselectedColor.B };

	const items 	= DashUI.SubMenu.ItemCollection[DashUI.SubMenu.Level].Items;
	const current 	= DashUI.SubMenu.Items.Current;

	const anim 		 = DashUI.SubMenu.Animation;
    const easing     = anim.Running ? cubicEaseOut(anim.Progress) : 0;
    const next       = DashUI.SubMenu.Items.Next;
    const dir        = next - current;

	const fade			= DashUI.SubMenu.Fade;
	const fadeProgress	= getFadeProgress(fade);
	const aFade 		= DashUI.SubMenu.Animation.Fade;
	let aFadeProgress 	= getFadeProgress(aFade);

	if (!aFade.Running) { aFadeProgress = fadeProgress; }

    const halfMod    	= UICONST.IcoUnselMod >> 1;
	const baseA 	 	= ~~(128 * aFadeProgress);
	const icoA		 	= ~~(110 * aFadeProgress);
	const xFadeMod 	 	= ((DashUI.SubMenu.Level > 0) ? 4 : 24) * (1 - fadeProgress);
    const modNextShift  = UICONST.SubItemSlotSize * easing * (-dir);
    const modCurrY      = (dir < 0 ? 87 : -65) * easing;

	// Context Modifiers
	const contextMod = DashUI.Context.Display;
	const contextfade = DashUI.Context.Fade;
	const contextfadeProgress = contextfade.Running ? (contextfade.In ? cubicEaseOut(contextfade.Progress) : cubicEaseIn(contextfade.Progress)) : 1;
    const contextNameX = -40 - xFadeMod;
	const ArrowA = ~~(84 * aFadeProgress);
	const ArrowX = (contextMod) ? ~~(-halfMod * contextfadeProgress) : 0;

	DashElements.Arrow.width = 20;
	DashElements.Arrow.height = 20;
	DashElements.Arrow.color = Color.new(128,128,128,ArrowA);
	DashElements.Arrow.draw(UICONST.SubItems.ArrowX + ArrowX, UICONST.SubItems.ArrowY);

	// Display Empty Message
	if (items.length < 1) {
		Name.Text 		= [ getLocalText(XMBLANG.MSG_SUBMENU_EMPTY) ];
		Name.Position 	= { X: UICONST.SubItems.TextX, Y:UICONST.SubItems.TextY + 5 };
		Name.Scale 		= FontObj.SizeM;
        Name.Alpha 		= baseA;
		if (fade.Running) Name.Position.X -= xFadeMod;

        TxtPrint(Name);
        return;
    }

    const ContextItems = [];

	for (let i = 0; i < items.length; i++) {
		const diff = i - current;
		if (diff < -8) continue;
		if (diff > 6) break;

		let Desc = false;
        const info = items[i];
        if (typeof info.Icon === "string") { info.Icon = FindDashIcon(info.Icon); }

		Icon.ID 		= info.Icon;
		Icon.Alpha 		= icoA;
		Icon.Width 		= UICONST.IcoSelSize;
		Icon.Height 	= UICONST.IcoSelSize;
		Icon.X 			= UICONST.SubItems.IconX;
		Icon.Y 			= UICONST.SubItems.IconY;

		if ('CustomIcon' in info) { Icon.CustomIcon = info.CustomIcon; }
		else if ('CustomIcon' in Icon) { delete Icon.CustomIcon; }
        if ('Color' in Name) { delete Name.Color; }
        Name.Text 		= [ getLocalText(info.Name) ];
		Name.Position 	= { X: UICONST.SubItems.TextX, Y:UICONST.SubItems.TextY };
		Name.Scale 		= FontObj.SizeL;
		Name.Alpha 	    = baseA;
		Name.Glow   	= false;

        let CtxtName = (info.Type === "CONTEXT") ? getLocalText(info.Value.Items[info.Value.Default].Name) : false;

		if (i === current) {

            Icon.X     		+= halfMod * easing;
            Icon.Y      	+= modCurrY;
            Icon.Width  	-= UICONST.IcoUnselMod * easing;
            Icon.Height 	-= UICONST.IcoUnselMod * easing;
            Name.Position.Y += modCurrY - (11 * easing);
			Name.Color 		 = (anim.Running) ? interpolateColorObj(UICONST.TextSelectedColor, UICONST.TextUnselectedColor, anim.Progress) : UICONST.TextSelectedColor;
			Name.Alpha 	     = baseA;
			Name.Glow   	 = (baseA === 128) && (!anim.Running) && (!contextMod);

			if (Name.Glow) { if (('CustomBG' in info) && (!('Image' in DashUI.ItemBG))) { DashUI.ItemBG.Image = info.CustomBG; } }

			Desc = {
				Text: 		[ getLocalText(info.Description) ],
				Scale:		FontObj.SizeM,
				Position:	{ X:Name.Position.X, Y:Name.Position.Y + 18 },
                Alpha:      ~~(baseA - (128 * easing))
			};

			if (fade.Running) {
				Icon.X -= xFadeMod;
				Name.Position.X -= xFadeMod;
				Desc.Position.X -= xFadeMod;
			}

			if (contextMod) {
				Icon.X      	-= halfMod * contextfadeProgress;
				Icon.Y      	-= halfMod * contextfadeProgress;
				Icon.Width  	+= UICONST.IcoUnselMod * contextfadeProgress;
				Icon.Height 	+= UICONST.IcoUnselMod * contextfadeProgress;
				Name.Alpha 	+= ~~(-90 * contextfadeProgress);
				Desc.Alpha 	+= ~~(-90 * contextfadeProgress);
				Name.Position.X += halfMod * contextfadeProgress;
				Desc.Position.X += halfMod * contextfadeProgress;
			}
		}
		else {
			const mod = (diff > 0) ? 24 : -24;

            const baseY = mod + diff * UICONST.SubItemSlotSize + modNextShift;
            Icon.Y      += baseY + halfMod;
            Icon.Width  -= UICONST.IcoUnselMod;
            Icon.Height -= UICONST.IcoUnselMod;
            Icon.X      += halfMod;
            Name.Position.Y += mod + diff * UICONST.SubItemSlotSize + modNextShift;

            if ((anim.Running) && (i === next)) {
                const modYNext = (dir < 0 ? 24 : -24) * easing;
                Icon.Width   += UICONST.IcoUnselMod * easing;
                Icon.Height  += UICONST.IcoUnselMod * easing;
                Icon.X       -= halfMod * easing;
                Icon.Y       -= halfMod * easing;
                Icon.Y       += modYNext;

				Name.Color 	    = interpolateColorObj(UICONST.TextUnselectedColor, UICONST.TextSelectedColor, anim.Progress);
				Name.Alpha 	    = baseA;
                Name.Position.Y += modYNext;

				Desc = {
					Text: 		[ getLocalText(info.Description) ],
					Scale:		FontObj.SizeM,
					Position:	{ X:Name.Position.X, Y:Name.Position.Y + 18 },
                    Alpha:      ~~(128 * easing)
				};
            }

			if (fade.Running) {
				const yMod = mod * (1 - fadeProgress);
				Icon.X -= xFadeMod;
				Icon.Y -= yMod
				Name.Position.X -= xFadeMod;
				Name.Position.Y -= yMod;
			}

			if (contextMod)	{
				const ctxNoSelYmod = ((diff > 0) ? 10 : -10) * contextfadeProgress;
				Icon.Y 			+= ctxNoSelYmod;
				Icon.Alpha 		+= ~~(-98 * contextfadeProgress);
				Name.Alpha 	    += ~~(-128 * contextfadeProgress);
				Name.Position.Y += ctxNoSelYmod;
			}
		}

        if (Icon.Y < -UICONST.ScreenDrawLimit) continue;
        if (Icon.Y > UICONST.ScrLowerLimit) break;

		if (Desc) { TxtPrint(Desc); }

		// Draw Focus
		if ((DashElements.ItemFocus) && (i === current || i === next) && Desc) {
			let FocusX = Icon.X - 5;
			let FocusY = Icon.Y + 2;
			let FocusA = contextMod ? ~~(128 * (1 - contextfadeProgress)) : Desc.Alpha;
			FocusA = (DashUI.Dialog.Fade.Running && !DashUI.Dialog.Fade.In) ? ~~(128 * fadeProgress) : (DashUI.Dialog.Fade.Running ? 0 : FocusA);
			let focus = DashElements.ItemFocus;

			let isCurrent = (i === current);
			let isNext = (i === next);

			if (anim.Running) {
				const mod = 24 * (isNext ? (1 - easing) : easing);
				focus.width = 82 - mod;
				focus.height = 72 - mod;
			}
			else if (contextMod) {
				const mod = 24 * contextfadeProgress;
				focus.width = 82 + mod;
				focus.height = 72 + mod;
			}
			else if (!anim.Running && isCurrent) {
				focus.width = 82;
				focus.height = 72;
			}

            focus.color = Color.setA(focus.color, FocusA);
			focus.draw(FocusX, FocusY);
		}

        TxtPrint(Name);
        DrawDashIcon(Icon);

        // Context Option Selected
        if (CtxtName) {
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
	DashUI.Context.Items.Current = Context.Default;
	DashUI.Context.Items.Next = Context.Default;
	DashUI.Context.Level++;
	DashUI.Context.ItemCollection[DashUI.Context.Level] = Context;
	DashUI.State.Next = 3;

	DashUI.Context.Items.UpperLimit = 0;
	DashUI.Context.Items.LowerLimit = 9;

    if (Context.Items.length < 9) { DashUI.Context.Items.LowerLimit = Context.Items.length; }

    if (Context.Default > 8)
    {
        if ((Context.Default + 8) >= Context.Items.length) {
			DashUI.Context.Items.LowerLimit = Context.Items.length;
			DashUI.Context.Items.UpperLimit = DashUI.Context.Items.LowerLimit - 9;
		}
        else {
			DashUI.Context.Items.UpperLimit = Context.Default;
			DashUI.Context.Items.LowerLimit = DashUI.Context.Items.UpperLimit + 9;
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
	if (!DashUI.Context.Fade.Running) { return true; }
	DashUI.Context.Fade.Progress += 0.04f;

	if (DashUI.Context.Fade.Progress >= 1.0f) {
		DashUI.Context.Fade.Progress = 1.0f;
		DashUI.Context.Fade.Running = false;
		if (!DashUI.Context.Fade.In) {
			DashUI.Context.Level--;
			DashUI.Context.Display = (DashUI.Context.Level > -1);
			if (DashUI.Context.Display)	{
				const next = DashUI.Context.ItemCollection[DashUI.Context.Level].Default;
				DashUI.Context.Items.Current = next;
				DashUI.Context.Items.Next = next;
			}
			else if (DashUI.State.Next === DashUI.State.Current) {
				DashUI.State.Next = DashUI.State.Previous;
			}
		}
		return true;
	}

	return false;
}
function UIAnimationContextMenuItemsMove_Start(delta) {
	const next = DashUI.Context.Items.Current + delta;
	const run = next >= 0 && next < DashUI.Context.ItemCollection[DashUI.Context.Level].Items.length;
	if (!run) { return; }

	PlayCursorSfx();
	if (next >= DashUI.Context.Items.LowerLimit) {
		DashUI.Context.Items.UpperLimit++;
		DashUI.Context.Items.LowerLimit++;
	}
	else if (next < DashUI.Context.Items.UpperLimit) {
		DashUI.Context.Items.UpperLimit--;
		DashUI.Context.Items.LowerLimit--;
	}

	DashUI.Context.Items.Next = next;
	DashUI.Context.Animation.Running = true;
	DashUI.Context.Animation.Progress = 0.0f;
	DashUI.AnimationQueue.push(UIAnimationContextMenuItemsMove_Work);
}
function UIAnimationContextMenuItemsMove_Work() {
	if (!DashUI.Context.Animation.Running) { return true; }

	DashUI.Context.Animation.Progress += 0.2f;
	if (DashUI.Context.Animation.Progress < 1.0f) { return false; }

	DashUI.Context.Items.Current = DashUI.Context.Items.Next;
	DashUI.Context.Animation.Progress = 0.0f;
	DashUI.Context.Animation.Running = false;

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
	if (DashUI.AnimationQueue.length > 0) {
		Timer.reset(DashUI.Context.Timer);
		Timer.resume(DashUI.Context.Timer);
		return;
	}

	let time = ~~(Timer.getTime(DashUI.Context.Timer) / 100000);
    if (('Preview' in DashUI.Context.ItemCollection[DashUI.Context.Level]) && (time > 10)) {
        if (Timer.isPlaying(DashUI.Context.Timer)) {
            Timer.pause(DashUI.Context.Timer);
            const fun = DashUI.Context.ItemCollection[DashUI.Context.Level].Preview;
            fun(DashUI.Context.Items.Current, item);
        }
    }

	if (('PreviewImage' in item) && (time > 6))	{
		const customImg = ImageCache.Get(item.PreviewImage);
		const Ready = customImg && customImg.ready();
		if (Ready) {
			if (DashUI.Context.PreviewA === 0)
			{
				let ival = os.setInterval(() => {
					DashUI.Context.PreviewA += 8;
					if (DashUI.Context.PreviewA > 120) { os.clearInterval(ival); }
				}, 0)
			}

			customImg.width = 240;
			customImg.height = 135;
			customImg.color = Color.new(128, 128, 128, DashUI.Context.PreviewA);
			customImg.draw(ScrCanvas.width - 450, (ScrCanvas.height >> 1) + 60);
		}
		else {
			DashUI.Context.PreviewA = 0;
		}
	}
	else {
		DashUI.Context.PreviewA = 0;
	}
}
function DrawUIContext() {
	if (!DashUI.Context.Display) { return; }

	const fade = DashUI.Context.Fade;
	const fadeProgress = getFadeProgress(fade);

	const boxA = UICONST.Context.BoxA * fadeProgress;
	const boxX = UICONST.Context.BoxX + (25 * fadeProgress);

	const Box = DashElements.Context;
	const Col = (UICONST.Context.Tint) ? UICONST.Context.Tint : BgElements.BgColor.Color;

	Box.height = ScrCanvas.height;
	Box.color = Color.new(Col.R, Col.G, Col.B, boxA);
	Box.draw(ScrCanvas.width - boxX, 0);

	const items = DashUI.Context.ItemCollection[DashUI.Context.Level].Items;
	const current = DashUI.Context.Items.Current;
	const baseX = UICONST.Context.BaseX - (25 * fadeProgress);
	const baseY = UICONST.Context.BaseY;
	const baseA = ~~(128 * fadeProgress);
	const first = DashUI.Context.Items.UpperLimit;
	const last = DashUI.Context.Items.LowerLimit;

	const NameTexts = [];
	const Icon = {};
	Icon.Width 		= 14;
	Icon.Height 	= 14;
	Icon.Alpha 		= baseA;
	Icon.X 			= baseX;

    let selico = false;
    let selYmod = 0;
	let slotPos = 0;

	for (let i = first; i < last; i++)
	{
		const item = items[i];
		let icomodX = false;
		if (('Icon' in item) && (item.Icon !== -1))
		{
            icomodX = true;

			Icon.ID 		= item.Icon;
			Icon.Y 			= 7 + baseY + slotPos;

			if (typeof item.Icon === "string") { Icon.CustomIcon = item.Icon; }

            if (!fade.Running && i === current) {
                selico = true;
				DashElements.CtxIco.color = Color.new(128,128,128, FontObj.Glow.Value + 64);
				DashElements.CtxIco.draw(Icon.X - 6, Icon.Y - 6);
			}

			DrawDashIcon(Icon);
		}

        if (i === current) { selYmod = slotPos;  NameTexts.push(""); }
        else {
            const text = (icomodX) ? `     ${getLocalText(item.Name)}` : getLocalText(item.Name);
            NameTexts.push(text);
		}

		slotPos += 16;
    }

    const Names = {
        Text: NameTexts,
        Position: { X: baseX, Y: baseY },
        Alpha: baseA
    };

    TxtPrint(Names);

    const selText = getLocalText(items[current].Name);
    const SelName = {
        Text: selico ? [`     ${selText}`] : [selText],
        Position: { X: baseX, Y: baseY + selYmod },
        Alpha: baseA,
        Color: { R: UICONST.TextSelectedColor.R, G: UICONST.TextSelectedColor.G, B: UICONST.TextSelectedColor.B },
        Glow: DashUI.AnimationQueue.length < 1
    };

    TxtPrint(SelName);

	const arrowA = (!fade.Running) ? -FontObj.Glow.Value : 0;

	if (first > 0) {
		DashElements.Arrow.angle = -0.5f;
		DashElements.Arrow.width = 12;
		DashElements.Arrow.height = 12;
        DashElements.Arrow.color = Color.setA(DashElements.Arrow.color, baseA + arrowA);
		DashElements.Arrow.draw(baseX, baseY - 6);
	}

	if (last < items.length) {
		DashElements.Arrow.angle = 0.5f;
		DashElements.Arrow.width = 12;
		DashElements.Arrow.height = 12;
		DashElements.Arrow.color = Color.new(128,128,128,baseA + arrowA);
		DashElements.Arrow.draw(baseX, baseY + slotPos + 6);
	}

	DashElements.Arrow.angle = 0.0f;

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
	if ((DashUI.AnimationQueue.length > 0) || (DashUI.State.Next > 2) || (DashUI.State.Current < 1))
	{ DashUI.OptionBox.Progress = 0.0f; return; }

	const context = GetOptionContext();

	if (!context) { return; }

	DashUI.OptionBox.Progress += 0.05f;
	if (DashUI.OptionBox.Progress >= 1.0f) { DashUI.OptionBox.Progress = 1.0f; }

	const alpha = ~~(DashUI.OptionBox.Progress * 128);

	const optxt = {
		Text: [ getLocalText(XMBLANG.OPTIONS) ],
        Position: { X: UICONST.OptionBox.XTXT, Y: UICONST.OptionBox.YTXT },
        Alpha: alpha
	};

	DashElements.OptionBox.width = 80 + Math.fround((optxt.Text[0].length + 7) / 2);
    DashElements.OptionBox.color = Color.setA(DashElements.OptionBox.color, alpha);
    DashElements.OptionIco.color = Color.setA(DashElements.OptionIco.color, alpha);
	DashElements.OptionBox.draw(UICONST.OptionBox.XBOX, UICONST.OptionBox.YBOX);
	DashElements.OptionIco.draw(UICONST.OptionBox.XICO, UICONST.OptionBox.YICO);

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

	DashElements.Arrow.angle = -0.5f;
	DashElements.Arrow.width = 16;
	DashElements.Arrow.height = 16;
    DashElements.Arrow.color = Color.setA(DashElements.Arrow.color,baseA);
	DashElements.Arrow.draw(arrowX, baseY + 5);
	DashElements.Arrow.angle = 0.5f;
	DashElements.Arrow.draw(arrowX, baseY + 31);
	DashElements.Arrow.angle = 0.0f;
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
	let posY = 0;
	let seltxtSize = 0;
    let selYpos = 0;

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

        selYpos = nameY + (data.Selected * 16);

        const SelValue = {
            Text: [ getLocalText(items[data.Selected].Value[items[data.Selected].Selected]) ],
            Alignment: "LEFT",
            Position: { X: UICONST.DialogInfo.DescX, Y: selYpos },
            Alpha: baseA,
            Glow: DashUI.AnimationQueue.length < 1
        };

        seltxtSize = FontObj.Font.getTextSize(SelValue.Text).width;

        TxtPrint(SelValue);

		DashElements.Arrow.width = 16;
		DashElements.Arrow.height = 16;
        DashElements.Arrow.color = Color.setA(DashElements.Arrow.color,baseA);

		if (items[data.Selected].Selected > 0) {
			DashElements.Arrow.angle = 0.0f;
			DashElements.Arrow.draw(UICONST.DialogInfo.DescX - 16, selYpos + 7);
		}
		if (items[data.Selected].Selected < (items[data.Selected].Value.length - 1)) {
			DashElements.Arrow.angle = 1.0f;
			DashElements.Arrow.draw(UICONST.DialogInfo.DescX + seltxtSize, selYpos + 7);
		}

		DashElements.Arrow.angle = 0.0f;
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

	const Yes = {
		Text: getLocalText(XMBLANG.YES),
		Alignment: "CENTER",
        Position: { X: -30, Y: 0 },
        Alpha: txtA
	};

	const No = {
		Text: getLocalText(XMBLANG.NO),
		Alignment: "CENTER",
        Position: { X: 30, Y: 0 },
        Alpha: txtA
	};

	if (DashUI.AnimationQueue.length < 1) {
		if (!('Selected' in data)) { data.Selected = 1; }
		else if (data.Selected === 0) { Yes.Glow = true; }
		else { No.Glow = true; }
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
		if (gThreads) {
			const thread = Threads.new(data.Fun);
			thread.start();
		}
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
DashBackgroundLoad();
console.log("INIT LIB: UI COMPLETE");

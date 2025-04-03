//////////////////////////////////////////////////////////////////////////
///*				   		    DASHBOARD							  *///
/// 				   		  										   ///
///		  Probably the most important part of the app. This will	   ///
///		     handle all graphics for the main user interface.		   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const DASH_CAT = [];	// Category Object Array.
const DASH_SUB = [];	// Sub Menu Object Array.
const DASH_CTX = [];	// Context Menu Object Array
let DASH_SEL = {};		// Temporary Object to hold the current Selected Item Object.
let DASH_CTX_PRWIMG = false;
let DASH_CTX_PRWALPHA = 0;

// Boot Logo
let boot_logo = new Image(`./XMB/dash/dash_logo.png`);
boot_logo.optimize();
boot_logo.width = boot_logo.width - 32;

// Clock
let dash_clock_outline = new Image(`./XMB/dash/dash_clock_outline.png`);
dash_clock_outline.optimize();
dash_clock_outline.height = Math.fround(dash_clock_outline.height / 2);

let dash_clock = new Image(`./XMB/dash/dash_clock.png`);
dash_clock.optimize();

// Sub Menu and Options Menu
let dash_arrow = new Image(`./XMB/dash/dash_submenu.png`);
dash_arrow.optimize();

let dash_context = new Image(`./XMB/dash/dash_context.png`);
dash_context.optimize();
dash_context.width = 275;

let dash_ctx_ico = new Image(`./XMB/color/ctx.png`);
dash_ctx_ico.width = 28;
dash_ctx_ico.height = 28;

let dash_load_ico = new Image(`./XMB/dash/dash_load.png`);
dash_load_ico.optimize();

let dash_opt_box = new Image(`./XMB/dash/dash_option_box.png`);
dash_opt_box.optimize();
dash_opt_box.filter = LINEAR;
dash_opt_box.height = 79;

let dash_opt_triangle = new Image(`./XMB/dash/triangle.png`);
dash_opt_triangle.optimize();
dash_opt_triangle.filter = LINEAR;
dash_opt_triangle.width = 14;
dash_opt_triangle.height = 14;

// Arrow glowing animation.
const glowArr = { Dir: 1, Value: 100, Min: 50, Max: 100, };

// Loading icon
let spining = 0.0;

// Option Box Alpha
let optBoxA = 0;

let loaded_icons = 0;					// Counter to get the current initialized icons.
const dash_icons = [];					// Image Array containing the loaded images.
const colr_icons = [];					// Image Array for the color icons on the Theme Settings.

// Image Names to search and load
// from the current selected Theme.
const dash_icons_info = xmlParseElement(std.loadFile("./XMB/dash/dash_icons.xml"));

function findDashIcon(targetName)
{
    for (let i = 0; i < dash_icons_info.children.length; i++)
    {
        if (dash_icons_info.children[i].attributes.name === targetName) { return i; }
    }

    return -1;
}

//////////////////////////////////////////////////////////////////////////
///*				   		    PARAMETERS							  *///
//////////////////////////////////////////////////////////////////////////

const ICOFULLA = 100;
const TXTFULLA = 128;
const ICOTINT = { r: 128, g: 128, b: 128 };
let ICOSELCOL = { r: 128, g: 128, b: 128 };
let TXTSELCOL = { r: 255, g: 255, b: 255 };
let CTXTINT = { r: 128, g: 128, b: 128 };

class ImageLoader
{
    constructor(limit = 15)
    {
        this.limit = limit;
        this.cache = Array.from({ length: limit }, (_, id) => ({ ID: id, Path: "", Img: false }));
        this.images = [];
        this.currentID = 0;
        this.asyncImgList = new ImageList();
        this.pendingRequests = [];
        this.processing = false;
    }

    isProcessing()
    {
        return this.processing;
    }

    loadCached(path)
    {
        // Check if the image is already loaded
        let existing = this.cache.find(img => img.Path === path);
        if (existing) return existing.Img;

        if (this.processing)
        {
            // Queue request if processing is active
            if (!this.pendingRequests.includes(path)) {
                this.pendingRequests.push(path);
            }
            return false;
        }

        // Replace the oldest image
        let slot = this.cache[this.currentID];
        slot.Path = path;
        slot.Img = new Image(path, RAM, this.asyncImgList);

        // Update ID tracker
        this.currentID = (this.currentID + 1) % this.limit;

        return slot.Img;
    }

    loadConstant(path)
    {
        // Check if the image is already loaded
        let existing = this.images.find(img => img.Path === path);
        if (existing) return existing.Img;
        this.images.push({ Path: path, Img: new Image(path, RAM, this.asyncImgList) });
        return this.images[this.images.length - 1].Img;
    }

    process()
    {
        if (this.processing)
        {
            // Check if all images in the current batch are ready
            let allReady = true;
            this.cache.forEach(img => { if ((img.Img) && (!img.Img.ready())) { allReady = false; }});
            this.images.forEach(img => { if ((img.Img) && (!img.Img.ready())) { allReady = false; }});

            if (!allReady) return;

            // Reset processing state and constImgs array
            this.processing = false;
            this.images = [];

            // Move pending requests to main array
            while (this.pendingRequests.length > 0)
            {
                let path = this.pendingRequests.shift();
                this.loadCached(path);
            }
        } // Only call process() if there are images that are not ready
        else if ((!this.processing) && ((this.cache.some(img => img.Img && !img.Img.ready())) || (this.images.some(img => img.Img && !img.Img.ready()))))
        {
            this.processing = true;
            this.asyncImgList.process();
        }
    }
}

const imgLoader = new ImageLoader();

//////////////////////////////////////////////////////////////////////////
///*				   		    FUNCTIONS							  *///
//////////////////////////////////////////////////////////////////////////

// Main function to update the Animation Frame and Next State when it's done.

function DASH_UPDATE_FRAME(NEW_STATE)
{
    // Increment frame counter
    DATA.DASH_MOVE_FRAME++;

    // End animation if completed
    if (DATA.DASH_MOVE_FRAME >= 20) { DATA.DASH_STATE = NEW_STATE; }
}

// Main function to do eased animations (Fast at start, then slower on each frame).

function getDashFrameEasedMovement(direction)
{
    let easedProgress = easeOutCubic(Math.min(DATA.DASH_MOVE_FRAME / 20, 1));
    let reverseEased = easeInCubic(Math.min((20 - DATA.DASH_MOVE_FRAME) / 20, 1));
    if (direction < 0)
    {
        reverseEased = easeOutCubic(Math.min(DATA.DASH_MOVE_FRAME / 20, 1));
        easedProgress = easeInCubic(Math.min((20 - DATA.DASH_MOVE_FRAME) / 20, 1));
    }

    return { easedProgress, reverseEased };
}

/*	Info:

    Draws a dashboard icon to the screen with the settings given.
        i: icon to draw.
        w: width of the icon.
        h: height of the icon.
        a: transparency of the icon.
        x: X Position on screen.
        y: Y Position on screen.
        r: Angle, default is 0.

*/

function drawDashIcon(i, w, h, a, x, y, r = 0.0, tint)
{
    if ((i > -1) && (a > 0))
    {
        if (dash_icons[i].ready())
        {
            dash_icons[i].width = w;
            dash_icons[i].height = h;
            dash_icons[i].color = Color.new(tint.r, tint.g, tint.b, a);
            dash_icons[i].angle = r;
            dash_icons[i].draw(x, y);
        }
        else
        {
            drawDashLoadIcon(w, h, a, x, y);
        }
    }
}

function drawCustomIcon(img, size, x, y, a)
{
    if (img.ready())
    {
        if (img.filter !== LINEAR) { img.filter = LINEAR; }
        if (ICOFULLA + a > 0)
        {
            const imgcolor = neutralizeOverlayWithAlpha();
            img.width = size;
            img.height = size;
            img.color = Color.new(imgcolor.r, imgcolor.g, imgcolor.b, 128 + a);
            img.draw(x, y);
        }
    }
    else
    {
        drawDashLoadIcon(size, size, ICOFULLA + a, x, y);
    }
}

// Draws the 'Loading' Icon and rotates it.

function drawDashLoadIcon(w, h, a, x, y)
{
    spining = spining + 0.05;
    if (spining == 6.05) { spining = 0.05; }
    if (a > 0)
    {
        const xRes = Math.round((w - 78) / 2);
        const yRes = Math.round((h - 78) / 2);
        dash_load_ico.width = w;
        dash_load_ico.height = h;
        dash_load_ico.color = Color.new(128,128,128,a);
        dash_load_ico.angle = spining;
        dash_load_ico.draw(x + 39 + xRes, y + yRes + 39);
    }
}

// Draws an interface element's icon.

function DrawDashElementIcon(Obj, size, x, y, a, tint = ICOTINT)
{
    if (ICOFULLA + a < 0) { a = -ICOFULLA; } else if (ICOFULLA + a > ICOFULLA) { a = 0; }

    if ("CustomIcon" in Obj)
    {
        if (typeof Obj.CustomIcon !== "string") { drawCustomIcon(Obj.CustomIcon, size, x, y, a); }
        else if (typeof Obj.CustomIcon === "string")
        {
            Obj.CustomIcon = resolveFilePath(Obj.CustomIcon);
            const img = imgLoader.loadCached(Obj.CustomIcon);
            if (img) { drawCustomIcon(img, size, x, y, a); }
            else { drawDashLoadIcon(size, size, ICOFULLA + a, x, y); }
        }
    }
    else
    {
        if (typeof Obj.Icon === "string") { Obj.Icon = findDashIcon(Obj.Icon); }
        drawDashIcon(Obj.Icon, size, size, ICOFULLA + a, x, y, undefined, tint);
    }
}

// Draws the Focus Icon overlay

function DrawFocusIcon(x, y, a, s)
{
    if (a < 0) { a = 0; } else if (a > ICOFULLA) { a = ICOFULLA; }
    if (("DASH_FOCUS" in DATA) && (DATA.DASH_FOCUS) && (a > 0))
    {
        DATA.DASH_FOCUS.width = 84 + s;
        DATA.DASH_FOCUS.height = 76 + s;
        DATA.DASH_FOCUS.color = Color.new(128, 128, 128, a);
        DATA.DASH_FOCUS.draw(x, y);
    }
}

// Draws an interface element's background.

function DrawDashElementBackground(Obj, draw)
{
    if (("CustomBG" in Obj) && (typeof Obj.CustomBG === "string") && (Obj.CustomBG != "") && (draw) && (!imgLoader.isProcessing()))
    {
        const col = neutralizeOverlayWithAlpha();

        if (DATA.BGIMGTMPSTATE === 15)
        {
            Obj.CustomBG = resolveFilePath(Obj.CustomBG);
            xmblog("Loading Custom Background Image: " + Obj.CustomBG);
            DATA.BGIMGTMP = new Image(Obj.CustomBG);
            DATA.BGIMGTMP.optimize();
            DATA.BGIMGTMP.filter = LINEAR;
            DATA.BGIMGTMP.width = DATA.CANVAS.width;
            DATA.BGIMGTMP.height = DATA.CANVAS.height;
            DATA.BGIMGTMP.color = Color.new(col.r, col.g, col.b, 0);
            DATA.BGIMGTMPSTATE = 16;
        }
        else if (DATA.BGIMGTMPSTATE < 15)
        {
            DATA.BGIMGTMPSTATE++;
        }
    }
}

// Draws an interface element's text.

function DrawDashElementText(obj, glow, nameInfo, descInfo = -1, cntxInfo = -1, txtCol = { r: textColor.r, g: textColor.g, b: textColor.b, a: 0 })
{
    if ((descInfo != -1) && ((TXTFULLA + descInfo.a) > 0) && (obj.Description !== ""))
    {
        txtCol.a = TXTFULLA + descInfo.a;
        const desc = (Array.isArray(obj.Description)) ? obj.Description[DATA.LANGUAGE] : obj.Description;
        const pos = { x: descInfo.x, y: descInfo.y };
        TxtPrint(desc, txtCol, pos, "LEFT", font_ss);
    }

    if ((TXTFULLA + nameInfo.a) > 0)
    {
        txtCol.a = TXTFULLA + nameInfo.a;
        const name = (Array.isArray(obj.Name)) ? obj.Name[DATA.LANGUAGE] : obj.Name;
        const pos = { x: nameInfo.x, y: nameInfo.y };
        TxtPrint(name, txtCol, pos, "LEFT", font_m, glow);

        if ((cntxInfo !== -1) && ("Type" in obj) && (obj.Type == "CONTEXT") && ("Default" in obj.Value))
        {
            const defItem = obj.Value.Default;
            if ((defItem > -1) && ((TXTFULLA + cntxInfo.a) > 0))
            {
                txtCol.r = textColor.r;
                txtCol.g = textColor.g;
                txtCol.b = textColor.b;
                txtCol.a = TXTFULLA + cntxInfo.a;
                const opttext = (Array.isArray(obj.Value.Options[defItem].Name)) ? obj.Value.Options[defItem].Name[DATA.LANGUAGE] : obj.Value.Options[defItem].Name;
                const ctxpos = { x: cntxInfo.x, y: cntxInfo.y};
                TxtPrint(opttext, txtCol, ctxpos, "RIGHT", font_ss);
            }
        }
    }
}

// Draw the little Option Box at the bottom right corner if conditions met.

function DrawOptionBox(direction = 1)
{
    let obj = DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT];

    if (DATA.DASH_CURSUB > -1)
    {
        obj = DASH_SUB[DATA.DASH_CURSUB].Options[DATA.DASH_CURSUBOPT];
    }

    if ((obj) && ("Option" in obj))
    {
        const col = neutralizeOverlayWithAlpha();
        optBoxA = (optBoxA >= 420) ? 428 : (optBoxA + (12 * direction));
        const alpha = ((optBoxA - 300) > 0) ? (optBoxA - 300) : 0;
        dash_opt_box.width = 80 + ((XMBLANG.OPTIONS[DATA.LANGUAGE].length + 6) / 2);
        dash_opt_box.color = Color.new(col.r, col.g, col.b, alpha);
        dash_opt_box.draw(DATA.CANVAS.width - 100, DATA.CANVAS.height - 70);
        dash_opt_triangle.color = Color.new(col.r, col.g, col.b, alpha);
        dash_opt_triangle.draw(DATA.CANVAS.width - 93, DATA.CANVAS.height - 34);
        TxtPrint(XMBLANG.OPTIONS[DATA.LANGUAGE], { r: 255, g: 255, b: 255, a: alpha }, { x: DATA.CANVAS.width - 73, y: DATA.CANVAS.height - 47 }, "LEFT", font_ss);
    }
}

// Draws the Sub Menu Arrow Element.

function DrawSubMenuArrow(aMod = 0, xMod = 0, yMod = 0)
{
    let a = glowArr.Value;

    if (aMod != 0)
    {
        glowArr.Value = 100;
        a = 100 + aMod;
        if (a > 100) { a = 100; }
        if (a < 0) { a = 0; }
    }
    else
    {
        if (glowArr.Value == glowArr.Min) { glowArr.Dir = 1; }
        else if (glowArr.Value == glowArr.Max) { glowArr.Dir = -1; }
        glowArr.Value += glowArr.Dir;
    }

    dash_arrow.width = 20;
    dash_arrow.height = 20;
    dash_arrow.color = Color.new(255,255,255,a);
    dash_arrow.draw(152 + xMod, 223 + yMod);
}

// Displays an empty Sub Menu Text.

function DrawMsg_SubMenuEmpty(a = 0, x = 0, y = 0)
{
    if ((TXTFULLA + a) > TXTFULLA) { a = 0; } else if ((TXTFULLA + a) < 0) { a = -TXTFULLA; }
    if ((TXTFULLA + a) > 0)
    {
        TxtPrint(XMBLANG.MSG_SUBMENU_EMPTY[DATA.LANGUAGE], { r:192, g:192, b:192, a: TXTFULLA + a }, { x: 263 + x, y: 214 + y }, "LEFT", font_ss);
    }
}

// Draws the Context (Option) Menu Box

function DrawContextMenu(a = 0, x = 0, y = 0)
{
    if (90 + a > 90) { a = 0; } else if (90 + a < 0) { a = -90; }
    if (90 + a > 0)
    {
        dash_context.height = DATA.CANVAS.height;
        dash_context.color = Color.new(CTXTINT.r, CTXTINT.g, CTXTINT.b, 90 + a);
        dash_context.draw((DATA.CANVAS.width - 205) + x, y);
    }
}

//////////////////////////////////////////////////////////////////////////
///*				   		        TOP 							  *///
//////////////////////////////////////////////////////////////////////////

// Draws an Interface Fade animation (In or out defined by the direction param).

function DrawInterfaceFade(frm, direction = 1)
{
    let easedProgress = easeOutCubic(Math.min(frm / 20, 1));
    let reverseEased = easeInCubic(Math.min((20 - frm) / 20, 1));

    if (direction < 0)
    {
        reverseEased = easeOutCubic(Math.min(frm / 20, 1));
        easedProgress = easeInCubic(Math.min((20 - frm) / 20, 1));
    }

    const xMod = -10 * reverseEased;
    const yMod = -10 * reverseEased;
    const aMod = (direction > 0) ? (-ICOFULLA + (frm * 12)) : (-frm * 12);

    // Draw Categories Fade
    DrawSelectedCat(DATA.DASH_CURCAT, 0, xMod, yMod, aMod, aMod);

    if (DATA.DASH_CURCAT > 0)
    {
        let xPosMod = 80;

        for (let i = (DATA.DASH_CURCAT - 1); i > -1; i--)
        {
            if (xPosMod < -60) { break; }
            DrawUnselectedCat(i, 140, -xPosMod + xMod, yMod, aMod);
            xPosMod += 80;
        }
    }

    const revX = (140 - 130) * reverseEased;
    if (DATA.DASH_CURCAT < 7)
    {
        let xPosMod = 80;

        for (let i = DATA.DASH_CURCAT + 1; i < 7; i++)
        {
            if (xPosMod > 500) { break; }
            DrawUnselectedCat(i, 166, xPosMod + revX, yMod, aMod);
            xPosMod += 80;
        }
    }

    // Draw Items Fade

    if (DASH_CAT[DATA.DASH_CURCAT].Options.length < 1) { return; }

    DrawSelectedItem(DATA.DASH_CURCAT, DATA.DASH_CUROPT, 0, xMod, 0, aMod, aMod, xMod, 0, aMod);

    if (DASH_CAT[DATA.DASH_CURCAT].Options.length < 2) { return; }

    let itemID = 0
    for (let i = DATA.DASH_CUROPT - 1; i > -1; i--)
    {
        let yPos = (50 - (itemID * 50))
        if (yPos < -100) { continue; }
        DrawUnselectedItem(DATA.DASH_CURCAT, i, 155 + xMod, yPos + yMod, aMod, aMod)
        itemID++;
    }

    itemID = 0;
    for (let i = (DATA.DASH_CUROPT + 1); i < DASH_CAT[DATA.DASH_CURCAT].Options.length; i++)
    {
        let yPos = (280 + (itemID * 50))
        if (yPos > 500) { break; }
        DrawUnselectedItem(DATA.DASH_CURCAT, i, 155 + xMod, yPos - yMod, aMod, aMod)
        itemID++;
    }

    if ((DATA.DISPLAYBG) && (DATA.BGIMG) && (direction > 0) && (DATA.BGIMGA < 128))
    {
        DATA.BGIMGA = frm * 12;
        if (DATA.BGIMGA > 128) { DATA.BGIMGA = 128; }
    }
}

// Draws the Interface selected Category Icon and Text.

function DrawSelectedCat(cat = DATA.DASH_CURCAT, sizeMod = 0, xMod = 0, yMod = 0, aMod = 0, txtAmod = 0, tint = ICOSELCOL)
{
    DrawDashElementIcon(DASH_CAT[cat], 72 + sizeMod, 142 + xMod, 104 + yMod, aMod, tint);
    const yPos = (Math.round((DATA.CANVAS.height - 328) / 2));
    TxtPrint(DASH_CAT[cat].Name[DATA.LANGUAGE], { r:255, g: 255, b: 255, a: TXTFULLA + txtAmod }, { x: (-142 + xMod), y: -yPos }, "CENTER");
}

// Draws an Unselected Category Icon.

function DrawUnselectedCat(cat = DATA.DASH_CURCAT, basePos, xPosMod, yMod = 0, aMod = 0)
{
    DrawDashElementIcon(DASH_CAT[cat], 48, basePos + xPosMod, 119 + yMod, aMod);
}

// Draw all the Unselected Categories while Idle.

function DrawUnselectedCats(aMod = 0, xMod = 0, yMod = 0)
{
    // Draw all the categories before the current selected one.
    if (DATA.DASH_CURCAT > 0)
    {
        let xPosMod = 80;

        for (let i = (DATA.DASH_CURCAT - 1); i > -1; i--)
        {
            if (xPosMod < -60) { break; } // DO NOT DRAW UNNECESARILLY OFF-SCREEN
            DrawUnselectedCat(i, 140 + xMod, -xPosMod, yMod, aMod);
            xPosMod += 80;
        }
    }

    // Draw all the categories after the current selected one.
    if (DATA.DASH_CURCAT < 7)
    {
        let xPosMod = 80;

        for (let i = DATA.DASH_CURCAT + 1; i < 7; i++)
        {
            if (xPosMod > (DATA.CANVAS.width + 20)) { break; } // DO NOT DRAW UNNECESARILLY OFF-SCREEN
            DrawUnselectedCat(i, 166 + xMod, xPosMod, yMod, aMod);
            xPosMod += 80;
        }
    }
}

// Draw Categories Moving Animation in a direction.

function DrawMovingCats(direction)
{
    // Calculate easing progress
    const { easedProgress, reverseEased } = getDashFrameEasedMovement(direction);

    // Interpolate values
    const sizeMod = (48 - 72) * easedProgress; // Size goes from 78 to 48
    const xMod = (246 - 142) * easedProgress;  // X moves from 140 to 246
    const yMod = (119 - 104) * easedProgress;  // Y moves from 100 to 119
    const txtMod = (direction > 0) ? (-24 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
    const cat = (direction > 0) ? DATA.DASH_CURCAT + 1 : DATA.DASH_CURCAT;
    const previcoTint = interpolateColorObj(ICOSELCOL,ICOTINT, easedProgress);
    DrawSelectedCat(cat, sizeMod, xMod, yMod, 0, txtMod, previcoTint);

    const nextSizeMod = -reverseEased * (72 - 48);
    const nextxMod = -reverseEased * (142 - 60);
    const nextyMod = -reverseEased * (104 - 119);
    const nexttxtMod =  (direction < 0) ? (-24 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
    const nextcat = (direction > 0) ? DATA.DASH_CURCAT : DATA.DASH_CURCAT - 1;
    const nexticoTint = interpolateColorObj(ICOTINT, ICOSELCOL, easedProgress);
    DrawSelectedCat(nextcat, nextSizeMod, nextxMod, nextyMod, 0, nexttxtMod, nexticoTint);

    // Draw Unselected Cats

    let prevLimit = (direction > 0) ? 0 : 1;
    let nextLimit = (direction > 0) ? 6 : 7;
    let prevCats = (direction > 0) ? DATA.DASH_CURCAT - 1 : DATA.DASH_CURCAT - 2;
    let nextCats = (direction > 0) ? DATA.DASH_CURCAT + 2 : DATA.DASH_CURCAT + 1;

    if (DATA.DASH_CURCAT > prevLimit)
    {
        let xPosMod = 80 + 80 * reverseEased;

        for (let i = prevCats; i > -1; i--)
        {
            if (xPosMod < -60) { break; }
            DrawUnselectedCat(i, 140, -xPosMod);
            xPosMod += 80;
        }
    }

    if (DATA.DASH_CURCAT < nextLimit)
    {
        let xPosMod = 80 + 80 * easedProgress;

        for (let i = nextCats; i < 7; i++)
        {
            if (xPosMod > 500) { break; }
            DrawUnselectedCat(i, 166, xPosMod);
            xPosMod += 80;
        }
    }
}

// Draw the Interface current Selected Item's Icon and Text.

function DrawSelectedItem(cat = DATA.DASH_CURCAT, opt = DATA.DASH_CUROPT, sizeMod = 0, xMod = 0, yMod = 0, aMod = 0, txtAmod = 0, txtXmod = 0, txtYmod = 0, descTxtAmod = 0)
{
    if ((DASH_CAT[cat].Options.length < 1) || !DASH_CAT[cat].Options[opt]) { return; }

    const nameInfo = { x: 240 + txtXmod, y: 212 + txtYmod, a: txtAmod };
    const descInfo = { x: 242 + txtXmod, y: 226 + txtYmod, a: descTxtAmod };
    const glow = ((opt == DATA.DASH_CUROPT) && (txtAmod == 0));
    const drawBg = ((sizeMod === 0) && (aMod === 0));
    const textCol = { r: TXTSELCOL.r, g: TXTSELCOL.g, b: TXTSELCOL.b, a: 0 };
    DrawDashElementIcon(DASH_CAT[cat].Options[opt], 78 + sizeMod, 140 + xMod, 190 + yMod, aMod);
    DrawDashElementText(DASH_CAT[cat].Options[opt], glow, nameInfo, descInfo, undefined, textCol)
    DrawDashElementBackground(DASH_CAT[cat].Options[opt], drawBg);
    if (DATA.DASH_CURSUB < 0) { DrawFocusIcon(138 + xMod, 192 + yMod, ICOFULLA + aMod, sizeMod); }
}

// Draw an Unselected Item's Icon and Text.

function DrawUnselectedItem(cat = DATA.DASH_CURCAT, opt = DATA.DASH_CUROPT, xPos, yPos, aMod = 0, txtAmod = 0)
{
    const nameInfo = { x: xPos + 85, y: yPos + 8, a: txtAmod };
    DrawDashElementIcon(DASH_CAT[cat].Options[opt], 48, xPos, yPos, aMod);
    DrawDashElementText(DASH_CAT[cat].Options[opt], false, nameInfo);
}

// Draws all the Unselected Item's Icon and Text while Idle.

function DrawUnselectedItems(cat = DATA.DASH_CURCAT, opt = DATA.DASH_CUROPT, xMod = 0, yMod = 0, aMod = 0, txtAmod = 0)
{
    if (DASH_CAT[cat].Options.length < 2) { return; }

    let itemID = 0
    for (let i = opt - 1; i > -1; i--)
    {
        let yPos = (50 - (itemID * 50));
        if (yPos < -50) { continue; }
        DrawUnselectedItem(cat, i, 155 + xMod, yPos + yMod, aMod, txtAmod);
        itemID++;
    }

    itemID = 0;
    for (let i = (opt + 1); i < DASH_CAT[cat].Options.length; i++)
    {
        let yPos = (280 + (itemID * 50)) + yMod;
        if (yPos > (DATA.CANVAS.height + 20)) { break; }
        DrawUnselectedItem(cat, i, 155 + xMod, yPos, aMod, txtAmod);
        itemID++;
    }
}

// Draws all the unselected items while inside a Sub Menu.

function DrawUnselectedItemsInsideSub(xModAbove = 0, xModBelow = 0, yModAbove = 0, yModBelow = 0, aMod = 0, txtAmod = 0)
{
    if (DASH_CAT[DATA.DASH_CURCAT].Options.length < 2) { return; }

    let itemID = 0
    for (let i = DATA.DASH_CUROPT - 1; i > -1; i--)
    {
        let yPos = (50 - (itemID * 50))
        if (yPos < -100) { continue; }
        DrawUnselectedItem(DATA.DASH_CURCAT, i, 155 + xModAbove, yPos + yModAbove, aMod, txtAmod)
        itemID++;
    }

    itemID = 0;
    for (let i = (DATA.DASH_CUROPT + 1); i < DASH_CAT[DATA.DASH_CURCAT].Options.length; i++)
    {
        let yPos = (280 + (itemID * 50))
        if (yPos > 500) { break; }
        DrawUnselectedItem(DATA.DASH_CURCAT, i, 155 + xModBelow, yPos + yModBelow, aMod, txtAmod)
        itemID++;
    }
}

// Draws all Items on a moving left/right animation.

function DrawMovingOptsLR(direction)
{
    // Calculate easing progress
    const { easedProgress, reverseEased } = getDashFrameEasedMovement(direction);

    // Interpolate values
    const xMod = 90 * easedProgress;
    const txtMod = (direction > 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
    const cat = (direction > 0) ? DATA.DASH_CURCAT + 1 : DATA.DASH_CURCAT;
    DrawSelectedItem(cat, DASH_CAT[cat].Default, 0, xMod, 0, txtMod, txtMod, xMod, 0, txtMod);

    const nextxMod = -reverseEased * 90;
    const nexttxtMod =  (direction < 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
    const nextcat = (direction > 0) ? DATA.DASH_CURCAT : DATA.DASH_CURCAT - 1;

    DrawSelectedItem(nextcat, DASH_CAT[nextcat].Default, 0, nextxMod, 0, nexttxtMod, nexttxtMod, nextxMod, 0, nexttxtMod);
    DrawUnselectedItems(cat, DASH_CAT[cat].Default, xMod, 0, txtMod, txtMod);
    DrawUnselectedItems(nextcat, DASH_CAT[nextcat].Default, nextxMod, 0, nexttxtMod, nexttxtMod);
}

// Draws all Items on a moving up/down animation.

function DrawMovingOptsUD(direction)
{
    // Calculate easing progress
    const { easedProgress, reverseEased } = getDashFrameEasedMovement(direction);

    // Interpolate values
    const xMod = 15 * easedProgress;
    const sizeMod = (48 - 78) * easedProgress;
    const icoyMod = 90 * easedProgress;
    const yMod = 76 * easedProgress;
    const txtMod = (direction > 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-3 * (20 - DATA.DASH_MOVE_FRAME));
    const opt = (direction > 0) ? DATA.DASH_CUROPT + 1 : DATA.DASH_CUROPT;
    DrawSelectedItem(DATA.DASH_CURCAT, opt, sizeMod, xMod, icoyMod, 0, 0, 0, yMod, txtMod);

    const nextxMod = reverseEased * 15;
    const nextSizeMod = -reverseEased * (79 - 48);
    const nexticoyMod = -reverseEased * 140;
    const nextyMod = -reverseEased * 154;
    const nexttxtMod = (direction < 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-3 * (20 - DATA.DASH_MOVE_FRAME));
    const nextopt = (direction > 0) ? DATA.DASH_CUROPT : DATA.DASH_CUROPT - 1;

    DrawSelectedItem(DATA.DASH_CURCAT, nextopt, nextSizeMod, nextxMod, nexticoyMod, 0, 0, 0, nextyMod, nexttxtMod);

    if (DASH_CAT[DATA.DASH_CURCAT].Options.length < 2) { return; }

    let prevItem = (direction > 0) ? DATA.DASH_CUROPT - 1 : DATA.DASH_CUROPT - 2;
    let itemID = 0
    for (let i = prevItem; i > -1; i--)
    {
        let yPos = (-itemID * 50)
        if (yPos < -100) { continue; }
        DrawUnselectedItem(DATA.DASH_CURCAT, i, 155, yPos + 50 * easedProgress)
        itemID++;
    }

    let nextItem = (direction > 0) ? DATA.DASH_CUROPT + 2 : DATA.DASH_CUROPT + 1;
    itemID = 0;
    for (let i = nextItem; i < DASH_CAT[DATA.DASH_CURCAT].Options.length; i++)
    {
        let yPos = (280 + (itemID * 50))
        if (yPos > 500) { break; }
        DrawUnselectedItem(DATA.DASH_CURCAT, i, 155, yPos + 50 * easedProgress)
        itemID++;
    }
}

//////////////////////////////////////////////////////////////////////////
///*				   		        SUB 							  *///
//////////////////////////////////////////////////////////////////////////

// Draws an animation for entering/exiting the first level of a sub menu.

function DrawInitialSubMenuFade(direction)
{
    // Calculate easing progress
    const { easedProgress, reverseEased } = getDashFrameEasedMovement(direction);

    // Interpolate values
    const xMod = (62 - 142) * easedProgress;
    const txtMod = (direction > 0) ? (-24 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
    DrawSelectedCat(DATA.DASH_CURCAT, 0, xMod, 0, 0, txtMod);

    const unselCatsX = 18 * easedProgress;
    const unselCatsY = 5 * easedProgress;
    const unselCatsA = (direction > 0) ? (-4 * DATA.DASH_MOVE_FRAME) : (-4 * (20 - DATA.DASH_MOVE_FRAME));
    DrawUnselectedCats(unselCatsA - 8, -unselCatsX, unselCatsY);

    const itmxMod = 80 * easedProgress;  // X moves from 140 to 246
    const itmtxtMod = (direction > 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
    DrawSelectedItem(DATA.DASH_CURCAT, DATA.DASH_CUROPT, 0, -itmxMod, 0, 0, itmtxtMod, -itmxMod, 0, itmtxtMod);

    const unitmx = -30 * easedProgress;
    const unitmy = 8 * easedProgress;
    DrawUnselectedItemsInsideSub(unitmx, unitmx, unitmy, -unitmy, unselCatsA - 8, itmtxtMod);
    const arrXmod = 40 * reverseEased;
    const arrAMod = (direction < 0) ? (-5 * DATA.DASH_MOVE_FRAME) : (-5 * (20 - DATA.DASH_MOVE_FRAME));
    DrawSubMenuArrow(arrAMod, arrXmod);

    if (DATA.DASH_CURSUBOPT > -1)
    {
        const selItemX = 20 * -reverseEased;
        const selitmtxtMod = (direction < 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
        DrawSubMenuSelectedItem(0, DATA.DASH_CURSUBOPT, 0, arrAMod, selItemX, 0, selitmtxtMod, selItemX, 0, selitmtxtMod, selitmtxtMod);
        if (DASH_SUB[0].Options.length < 2) { return; }

        let yMod = 5 * reverseEased;
        let itemID = 0;
        for (let i = DATA.DASH_CURSUBOPT - 1; i > -1; i--)
        {
            let yPos = (150 - (itemID * 50));
            if (yPos < -100) { continue; }
            DrawSubMenuUnselectedItem(0, i, 190 + selItemX, yPos + yMod, arrAMod, selitmtxtMod);
            itemID++;
        }

        yMod = 5 * -reverseEased;
        itemID = 0;
        for (let i = (DATA.DASH_CURSUBOPT + 1); i < DASH_SUB[0].Options.length; i++)
        {
            let yPos = (280 + (itemID * 50));
            if (yPos > 500) { break; }
            DrawSubMenuUnselectedItem(0, i, 190 + selItemX, yPos + yMod, arrAMod, selitmtxtMod);
            itemID++;
        }
    }
    else
    {
        const selItemX = 20 * -reverseEased;
        const selitmtxtMod = (direction < 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
        DrawMsg_SubMenuEmpty(selitmtxtMod, selItemX);
    }
}

// Draws a Sub Menu selected Item's Icon and Text.

function DrawSubMenuSelectedItem(sub = DATA.DASH_CURSUB, opt = DATA.DASH_CURSUBOPT, sizeMod = 0, aMod = 0, xMod = 0, yMod = 0, txtAmod = 0, txtXmod = 0, txtYmod = 0, descTxtAmod = 0, contxtA = 0)
{
    if (DASH_SUB[sub].Options.length < 1) { return; }

    const namePpts = { x: 263 + txtXmod, y: 215 + txtYmod, a: txtAmod };
    const descPpts = { x: 265 + txtXmod, y: 229 + txtYmod, a: descTxtAmod };
    const cntxPpts = { x: -35 + txtXmod, y: 215 + txtYmod, a: contxtA };
    const glow = ((opt === DATA.DASH_CURSUBOPT) && (txtAmod === 0));
    const drawBg = ((txtYmod === 0) && (aMod === 0));
    const textCol = { r: TXTSELCOL.r, g: TXTSELCOL.g, b: TXTSELCOL.b, a: 0 };
    DrawDashElementIcon(DASH_SUB[sub].Options[opt], 78 + sizeMod, 175 + xMod, 195 + yMod, aMod);
    DrawDashElementText(DASH_SUB[sub].Options[opt], glow, namePpts, descPpts, cntxPpts, textCol);
    DrawDashElementBackground(DASH_SUB[sub].Options[opt], drawBg);
    if (sub === DATA.DASH_CURSUB) { DrawFocusIcon(172 + xMod, 196 + yMod, ICOFULLA + aMod, sizeMod); }
}

// Draws a Sub Menu unselected Item Icon and Text.

function DrawSubMenuUnselectedItem(sub, opt, xPos, yPos, aMod = 0, txtAmod = 0)
{
    if (DASH_SUB[sub].Options[opt])
    {
        const namePpts = { x: xPos + 73, y: yPos + 6, a: txtAmod };
        const descPpts = { x: xPos + 73, y: yPos + 12, a: -255 };
        const cntxPpts = { x: xPos - 225, y: yPos + 6, a: txtAmod };

        DrawDashElementIcon(DASH_SUB[sub].Options[opt], 48, xPos, yPos, aMod);
        DrawDashElementText(DASH_SUB[sub].Options[opt], false, namePpts, descPpts, cntxPpts);
    }
}

// Draws all the Sub Menu Unselected Items while Idle.

function DrawSubMenuUnselectedItems(sub = DATA.DASH_CURSUB, opt = DATA.DASH_CURSUBOPT, xMod = 0, yModAbove = 0, yModBelow = 0, aMod = 0, txtAmod = 0)
{
    if (DASH_SUB[sub].Options.length < 2) { return; }

    let itemID = 0
    for (let i = opt - 1; i > -1; i--)
    {
        let yPos = (150 - (itemID * 50)) + yModAbove;
        if (yPos < -50) { continue; }
        DrawSubMenuUnselectedItem(sub, i, 190 + xMod, yPos, aMod, txtAmod);
        itemID++;
    }

    itemID = 0;
    for (let i = (opt + 1); i < DASH_SUB[sub].Options.length; i++)
    {
        let yPos = (280 + (itemID * 50)) + yModBelow;
        if (yPos > (DATA.CANVAS.height + 20)) { break; }
        DrawSubMenuUnselectedItem(sub, i, 190 + xMod, yPos, aMod, txtAmod);
        itemID++;
    }
}

// Draws the sub menu items moving up/down animation.

function DrawSubMenuMovingOptionsUD(direction)
{
    // Calculate easing progress
    const { easedProgress, reverseEased } = getDashFrameEasedMovement(direction);

    // Interpolate values
    const xMod = 15 * easedProgress;
    const sizeMod = (48 - 78) * easedProgress;
    const icoyMod = 85 * easedProgress;
    const yMod = 71 * easedProgress;
    const txtMod = (direction > 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-3 * (20 - DATA.DASH_MOVE_FRAME));
    const opt = (direction > 0) ? DATA.DASH_CURSUBOPT + 1 : DATA.DASH_CURSUBOPT;
    DrawSubMenuSelectedItem(DATA.DASH_CURSUB, opt, sizeMod, 0, xMod, icoyMod, 0, 0, yMod, txtMod);

    const nextxMod = reverseEased * 15;
    const nextSizeMod = -reverseEased * (79 - 48);
    const nexticoyMod = -reverseEased * 45;
    const nextyMod = -reverseEased * 59;
    const nexttxtMod = (direction < 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-3 * (20 - DATA.DASH_MOVE_FRAME));
    const nextopt = (direction > 0) ? DATA.DASH_CURSUBOPT : DATA.DASH_CURSUBOPT - 1;

    DrawSubMenuSelectedItem(DATA.DASH_CURSUB, nextopt, nextSizeMod, 0, nextxMod, nexticoyMod, 0, 0, nextyMod, nexttxtMod);

    if (DASH_SUB[DATA.DASH_CURSUB].Options.length < 2) { return; }

    let prevItem = (direction > 0) ? (DATA.DASH_CURSUBOPT - 1) : (DATA.DASH_CURSUBOPT - 2);
    let itemID = 0
    let unselyMod = 50 * easedProgress;

    for (let i = prevItem; i > -1; i--)
    {
        let yPos = (100 - (itemID * 50)) + unselyMod;
        if (yPos < -50) { continue; }
        DrawSubMenuUnselectedItem(DATA.DASH_CURSUB, i, 190, yPos);
        itemID++;
    }

    let nextItem = (direction > 0) ? (DATA.DASH_CURSUBOPT + 2) : (DATA.DASH_CURSUBOPT + 1);
    itemID = 0;
    for (let i = nextItem; i < DASH_SUB[DATA.DASH_CURSUB].Options.length; i++)
    {
        let yPos = (280 + (itemID * 50)) + unselyMod;
        if (yPos > (DATA.CANVAS.height + 20)) { break; }
        DrawSubMenuUnselectedItem(DATA.DASH_CURSUB, i, 190, yPos);
        itemID++;
    }
}

// Draws a Fade In/Out animation for the Sub Menu Interface.

function DrawSubMenuContentFade(direction)
{
    switch(direction)
    {
        case 1: // Fade In
            DrawSubMenuContent(true);
            DrawSubMenuOptions(true);
            break;
        case 2: // Fade Out
            DrawSubMenuContent(false, true);
            DrawSubMenuOptions(false, true);
            break;
    }
}

// Draws the Sub Menu Side Content

function DrawSubMenuContent(fadeIn = false, fadeOut = false)
{
    let aMod = 0;
    if (fadeIn || fadeOut)
    {
        aMod = (fadeIn) ? ((20 - DATA.DASH_MOVE_FRAME) * -5) : (DATA.DASH_MOVE_FRAME * -5);
    }

    if (DATA.DASH_CURSUB > 0)
    {
        DrawSubMenuUnselectedItems(DATA.DASH_PRVSUB, DASH_SUB[DATA.DASH_PRVSUB].Selected, -60, 8, -8, -90 + Math.round(aMod / 10), -128);
        DrawDashElementIcon(DASH_SUB[DATA.DASH_PRVSUB].Options[DASH_SUB[DATA.DASH_PRVSUB].Selected], 78, 60, 195, aMod);
    }
    else
    {
        DrawUnselectedItemsInsideSub(-30, -30, 8, -8, -90 + Math.round(aMod / 10), -128);
        DrawUnselectedCats(-90 + Math.round(aMod / 10), -18, 5);
        DrawDashElementIcon(DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT], 78, 60, 190, aMod);
        DrawDashElementIcon(DASH_CAT[DATA.DASH_CURCAT], 72, 62, 104, aMod, ICOSELCOL);
    }

    DrawSubMenuArrow(aMod);
}

// Draws the Sub Menu Main Items

function DrawSubMenuOptions(fadeIn = false, fadeOut = false)
{
    let aMod = 0;
    if (fadeIn || fadeOut)
    {
        aMod = (fadeIn) ? ((20 - DATA.DASH_MOVE_FRAME) * -5) : (DATA.DASH_MOVE_FRAME * -5);
    }

    if (DATA.DASH_CURSUBOPT > -1)
    {
        DrawSubMenuSelectedItem(undefined, undefined, undefined, aMod, undefined, undefined, aMod, undefined, undefined, aMod, aMod);
        DrawSubMenuUnselectedItems(undefined, undefined, undefined, undefined, undefined, aMod, aMod);
    }
    else
    {
        DrawMsg_SubMenuEmpty();
    }
}

// Draws an Internal Sub Menu entering/exiting animation.

function DrawNewSubMenuFade(direction)
{
    // Calculate easing progress
    const { easedProgress, reverseEased } = getDashFrameEasedMovement(direction);

    // Fade Prev Arrow
    let arrXmod = -130 * easedProgress;
    let arrAMod = (direction > 0) ? (-5 * DATA.DASH_MOVE_FRAME) : (-5 * (20 - DATA.DASH_MOVE_FRAME));
    DrawSubMenuArrow(arrAMod, arrXmod);

    // Fade Categories Items
    if (DATA.DASH_CURSUB < 2)
    {

        const unselCatsX = 18 * easedProgress;
        const unselCatsY = 5 * easedProgress;
        const unselCatsA = (direction > 0) ? (-1 * DATA.DASH_MOVE_FRAME) : (-1 * (20 - DATA.DASH_MOVE_FRAME));
        DrawUnselectedCats(-90 + unselCatsA, -18 - unselCatsX, 5 + unselCatsY)

        const unitmx = -30 * easedProgress;
        const unitmy = 8 * easedProgress
        DrawUnselectedItemsInsideSub(-30 + unitmx, -30 + unitmx, 8 + unitmy, -8 - unitmy, -90 + unselCatsA, -128);

        const xMod = -130 * easedProgress;
        const fadeOutA = (direction > 0) ? (-6 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
        DrawDashElementIcon(DASH_CAT[DATA.DASH_CURCAT], 72, 62 + xMod, 104, fadeOutA, ICOSELCOL);

        const itmxMod = -130 * easedProgress;
        DrawDashElementIcon(DASH_CAT[DATA.DASH_CURCAT].Options[DATA.DASH_CUROPT], 78, 60 + itmxMod, 190, fadeOutA);
    }
    else
    {
        // Slide Prev Prev Item
        const fadeOutA = (direction > 0) ? (-6 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
        DrawSubMenuSelectedItem(DATA.DASH_PRVSUB - 1, DASH_SUB[DATA.DASH_PRVSUB - 1].Selected, 0, fadeOutA, -115 + arrXmod, 0, -128, 0, 0, -128, -128);

        // Fade Prev Prev Unselected Items
        const prevprevsx = -60 + (-60 * easedProgress);
        const prevprevsy = 8 + (8 * easedProgress)
        const prevprevsA = (direction > 0) ? (-1 * DATA.DASH_MOVE_FRAME) : (-1 * (20 - DATA.DASH_MOVE_FRAME));
        DrawSubMenuUnselectedItems(DATA.DASH_PRVSUB - 1, DASH_SUB[DATA.DASH_PRVSUB - 1].Selected, prevprevsx, prevprevsy, -prevprevsy, -90 + prevprevsA, -128);
    }

    // Slide Prev Item
    const prevXmod = -115 * easedProgress;
    const previtmtxtMod = (direction > 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
    DrawSubMenuSelectedItem(DATA.DASH_PRVSUB, DASH_SUB[DATA.DASH_PRVSUB].Selected, 0, 0, prevXmod, 0, previtmtxtMod, prevXmod, 0, previtmtxtMod, previtmtxtMod);

    // Fade Prev Unselected Items
    const prevsx = -60 * easedProgress;
    const prevsy = 8 * easedProgress
    const prevsA = (direction > 0) ? (-4 * DATA.DASH_MOVE_FRAME) : (-4 * (20 - DATA.DASH_MOVE_FRAME));
    DrawSubMenuUnselectedItems(DATA.DASH_PRVSUB, DASH_SUB[DATA.DASH_PRVSUB].Selected, prevsx, prevsy, -prevsy, prevsA - 8, previtmtxtMod);

    // Fade New Arrow
    arrXmod = 40 * reverseEased;
    arrAMod = (direction < 0) ? (-5 * DATA.DASH_MOVE_FRAME) : (-5 * (20 - DATA.DASH_MOVE_FRAME));
    DrawSubMenuArrow(arrAMod, arrXmod);

    // Fade New Items
    if (DATA.DASH_CURSUBOPT > -1)
    {
        const selItemX = 2 * -reverseEased
        const selitmtxtMod = (direction < 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
        DrawSubMenuSelectedItem(DATA.DASH_CURSUB, DATA.DASH_CURSUBOPT, 0, arrAMod, selItemX, 0, selitmtxtMod, selItemX, 0, selitmtxtMod, selitmtxtMod)

        if (DASH_SUB[DATA.DASH_CURSUB].Options.length < 2) { return; }

        let yMod = 5 * reverseEased;
        let itemID = 0
        for (let i = DATA.DASH_CURSUBOPT - 1; i > -1; i--)
        {
            let yPos = (150 - (itemID * 50))
            if (yPos < -100) { continue; }
            DrawSubMenuUnselectedItem(DATA.DASH_CURSUB, i, 190 + selItemX, yPos + yMod, arrAMod, selitmtxtMod)
            itemID++;
        }

        yMod = 5 * -reverseEased
        itemID = 0;
        for (let i = (DATA.DASH_CURSUBOPT + 1); i < DASH_SUB[DATA.DASH_CURSUB].Options.length; i++)
        {
            let yPos = (280 + (itemID * 50))
            if (yPos > 500) { break; }
            DrawSubMenuUnselectedItem(DATA.DASH_CURSUB, i, 190 + selItemX, yPos + yMod, arrAMod, selitmtxtMod)
            itemID++;
        }
    }
    else
    {
        const selItemX = 20 * -reverseEased
        const selitmtxtMod = (direction < 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
        DrawMsg_SubMenuEmpty(selitmtxtMod, selItemX);
    }
}

//////////////////////////////////////////////////////////////////////////
///*				   		     CONTEXT 							  *///
//////////////////////////////////////////////////////////////////////////

// Draws a entering/exiting Context (Option) Menu animation on the main interface.

function DrawContextMenuAnimation(direction, fadeFull = false)
{
    // Calculate easing progress
    const { easedProgress, reverseEased } = getDashFrameEasedMovement(direction);

    // Interpolate values

    const selSize = 20 * easedProgress;
    const selX = -10 * easedProgress;
    const fadeOutA = (direction > 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
    const semifadeA = (direction > 0) ? (-5 * DATA.DASH_MOVE_FRAME) : (-5 * (20 - DATA.DASH_MOVE_FRAME));
    const semifadeIcoA = (direction > 0) ? (-3 * DATA.DASH_MOVE_FRAME) : (-3 * (20 - DATA.DASH_MOVE_FRAME));
    const txtMod = (direction > 0) ? (-24 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
    const unitmy = 8 * easedProgress;
    const uncaty = 4 * easedProgress;

    DrawSelectedCat(DATA.DASH_CURCAT, 0, 0, 0, 0, txtMod);
    DrawUnselectedCats(semifadeIcoA, -unitmy, uncaty);
    DrawSelectedItem(DATA.DASH_CURCAT, DATA.DASH_CUROPT, selSize, selX, selX, 0, semifadeA, selSize, 0, semifadeA);
    DrawUnselectedItemsInsideSub(0, 0, -unitmy, unitmy, semifadeIcoA, txtMod);

    DrawOptionBox(direction * -1);

    const fadeIn = (direction < 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
    DrawContextMenu(fadeIn, 60 * reverseEased);
    DrawContextOptions(fadeIn, 60 * reverseEased);
}

// Draws a entering/exiting Context (Option) Menu animation on sub menus.

function DrawContextSubMenuAnimation(direction, fadeFull = false)
{
    // Calculate easing progress
    const { easedProgress, reverseEased } = getDashFrameEasedMovement(direction);

    if (DATA.DASH_CURSUB > 0)
    {
        DrawSubMenuSelectedItem(DATA.DASH_PRVSUB, DASH_SUB[DATA.DASH_PRVSUB].Selected, 0, 0, -115, 0, -128, 0, 0, -128);
        DrawSubMenuUnselectedItems(DATA.DASH_PRVSUB, DASH_SUB[DATA.DASH_PRVSUB].Selected, -60, 8, -8, -90, -128);
    }
    else
    {
        let modX = -30 * easedProgress;
        let modY = 7 * easedProgress;
        let modY2 = 5 * easedProgress;
        let modA = (direction > 0) ? (Math.round(-DATA.DASH_MOVE_FRAME / 2)) : (Math.round(-(20 - DATA.DASH_MOVE_FRAME) / 2));
        let fadeAfull = 0;

        if (fadeFull)
        {
            modA = -100;
            fadeAfull = (direction < 0) ? (Math.round(-12 * DATA.DASH_MOVE_FRAME)) : (Math.round((20 - DATA.DASH_MOVE_FRAME) * -12));
        }

        DrawSelectedItem(DATA.DASH_CURCAT, DATA.DASH_CUROPT, 0, -80 + modX, 0, fadeAfull, -128, 0, 0, -128);
        DrawUnselectedItemsInsideSub(-30 + modX, -30 + modX, 8 + modY, -8 - modY, -90 + modA, -128);
        DrawSelectedCat(DATA.DASH_CURCAT, 0, -80 + modX, 0, fadeAfull, -128);
        DrawUnselectedCats(-90 + modA, -18 - modY, 5 + modY2);
    }

    let aFade = 0;
    let fadeOutA = (direction > 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
    let semifadeA = (direction > 0) ? (-5 * DATA.DASH_MOVE_FRAME) : (-5 * (20 - DATA.DASH_MOVE_FRAME));
    let semifadeIcoA = (direction > 0) ? (-3 * DATA.DASH_MOVE_FRAME) : (-3 * (20 - DATA.DASH_MOVE_FRAME));
    const selSize = 20 * easedProgress;
    const selX = -10 * easedProgress;
    const modArrowX = -20 * easedProgress;

    if (fadeFull)
    {
        aFade = (direction < 0) ? (Math.round(-12 * DATA.DASH_MOVE_FRAME)) : (Math.round((20 - DATA.DASH_MOVE_FRAME) * -12));
        fadeOutA = -128;
        semifadeA = -100;
        semifadeIcoA = -60;
    }

    DrawSubMenuArrow(aFade, modArrowX);
    DrawSubMenuSelectedItem(DATA.DASH_CURSUB, DATA.DASH_CURSUBOPT, selSize, aFade, selX, selX, semifadeA + aFade, selSize, 0, semifadeA + aFade, fadeOutA);
    DrawSubMenuUnselectedItems(DATA.DASH_CURSUB, DATA.DASH_CURSUBOPT, 0, -10 * easedProgress, 10 * easedProgress, semifadeIcoA + aFade, fadeOutA);

    const fadeIn = (direction < 0) ? (-12 * DATA.DASH_MOVE_FRAME) : (-6 * (20 - DATA.DASH_MOVE_FRAME));
    DrawContextMenu(fadeIn, 60 * reverseEased);
    DrawContextOptions(fadeIn, 60 * reverseEased);

    if (direction < 0)
    {
        if ((DATA.DISPLAYBG) && (DATA.BGIMG) && (DATA.BGIMGA < 128))
        {
            DATA.BGIMGA = (12 * DATA.DASH_MOVE_FRAME);
            if (DATA.BGIMGA > 128) { DATA.BGIMGA = 128; }
        }
        else if ((!DATA.DISPLAYBG) && (DATA.BGIMGA > 0))
        {
            DATA.BGIMGA = 128 - (12 * DATA.DASH_MOVE_FRAME);
            if (DATA.BGIMGA < 0) { DATA.BGIMGA = 0; }
        }
    }
}

// Draws the background content of a Context (Option) Menu from a Sub Menu.

function DrawContextSubMenuContent()
{
    if (DATA.DASH_CURSUB > 0)
    {
        DrawSubMenuSelectedItem(DATA.DASH_PRVSUB, DASH_SUB[DATA.DASH_PRVSUB].Selected, 0, 0, -115, 0, -128, 0, 0, -128);
        DrawSubMenuUnselectedItems(DATA.DASH_PRVSUB, DASH_SUB[DATA.DASH_PRVSUB].Selected, -60, 8, -8, -90, -128);
    }
    else
    {
        DrawSelectedItem(DATA.DASH_CURCAT, DATA.DASH_CUROPT, 0, -110, 0, 0, -128, 0, 0, -128);
        DrawSelectedCat(DATA.DASH_CURCAT, 0, -110, 0, 0, -128);
    }

    DrawSubMenuArrow(0, -20);
    DrawSubMenuSelectedItem(DATA.DASH_CURSUB, DATA.DASH_CURSUBOPT, 20, 0, -10, -10, -105, 20, 0, -105, -128);
    DrawSubMenuUnselectedItems(DATA.DASH_CURSUB, DATA.DASH_CURSUBOPT, 0, -10, 10, -60, -128);
}

// Draws a Context Menu Item's Icon and Text.

function DrawContextOption(x, y, lvl = DATA.DASH_CURCTXLVL, opt = DASH_CTX[DATA.DASH_CURCTXLVL].Selected, a = 0)
{
    if ((lvl < 0) || (DASH_CTX[lvl].Options.length < opt)) { return; }

    if (DASH_CTX[lvl].Options[opt])
    {
        let xIcnMod = 0;
        let currentSelected = false;
        if ((opt == DASH_CTX[DATA.DASH_CURCTXLVL].Selected) && a == 0)
        {
            currentSelected = true;
        }

        if ((DASH_CTX[lvl].Options[opt].Icon != -1) && (TXTFULLA + a > 0) && (DASH_CTX[lvl].Options[opt].Icon.ready()))
        {
            if (currentSelected)
            {
                if (DASH_CTX[lvl].Options[opt].Name === "")
                {
                    // Update Glow Value if context option has no text to make the Icon still glow.
                    if (glowText.Value == glowText.Max) { glowText.Dir = -1; }
                    if (glowText.Value == glowText.Min) { glowText.Dir = 1; }
                    glowText.Value = glowText.Value + glowText.Dir;
                }

                dash_ctx_ico.color = Color.new(255, 255, 255, glowText.Value * 2);
                dash_ctx_ico.draw(x - 8, y + 4);
            }

            DASH_CTX[lvl].Options[opt].Icon.width = 16;
            DASH_CTX[lvl].Options[opt].Icon.height = 16;
            DASH_CTX[lvl].Options[opt].Icon.color = Color.new(190, 190, 190, TXTFULLA + a);
            DASH_CTX[lvl].Options[opt].Icon.draw(x, y + 11);
            xIcnMod += 20;
        }

        if ((DASH_CTX[lvl].Options[opt].Name != "") && (TXTFULLA + a > 0))
        {
            let nameText = (Array.isArray(DASH_CTX[lvl].Options[opt].Name)) ? DASH_CTX[lvl].Options[opt].Name[DATA.LANGUAGE] : DASH_CTX[lvl].Options[opt].Name;
            let displayText = (nameText.length > 24) ? (nameText.substring(0, 24) + "...") : nameText;
            let colorText = { r: textColor.r, g: textColor.g, b: textColor.b, a: TXTFULLA + a };

            if (currentSelected)
            {
                colorText.r = TXTSELCOL.r;
                colorText.g = TXTSELCOL.g;
                colorText.b = TXTSELCOL.b;

                if (nameText.length > 24)
                {
                    if ((scrollIndex == 0) && (!DATA.DASH_TXT_TIMER))
                    {
                        DATA.DASH_TXT_TIMER = Timer.new();
                    }

                    const endIndex = scrollIndex + 24;
                    if (scrollIndex === 0)
                    {
                        displayText = nameText.substring(0, 24) + "..";
                    } else if (endIndex >= nameText.length)
                    {
                        displayText = ".." + nameText.substring(scrollIndex);
                    } else
                    {
                        displayText = ".." + nameText.substring(scrollIndex, endIndex) + "..";
                    }

                    if (endIndex < nameText.length)
                    {
                        let time = Math.round(Timer.getTime(DATA.DASH_TXT_TIMER) / 100000);
                        if (time > 1)
                        {
                            scrollIndex++;
                            Timer.reset(DATA.DASH_TXT_TIMER);
                        }
                    }
                    else if (endIndex > nameText.length)
                    {
                        Timer.destroy(DATA.DASH_TXT_TIMER);
                        DATA.DASH_TXT_TIMER = false;
                    }
                }

                DrawContextPreviewImage();
            }

            TxtPrint(displayText, colorText, { x: x + xIcnMod, y: y }, "LEFT", font_ss, currentSelected);
        }
    }
}

// Draws the arrows on Context Menus to indicate next or previous selectable items.

function DrawContextArrows(aMod = 0, xMod = 0)
{
    let a = glowArr.Value;

    if (aMod != 0)
    {
        glowArr.Value = 100;
        a = 100 + aMod;
        if (a > 100) { a = 100; }
        if (a < 0) { a = 0; }
    }
    else
    {
        if (glowArr.Value == glowArr.Min) { glowArr.Dir = 1; }
        else if (glowArr.Value == glowArr.Max) { glowArr.Dir = -1; }
        glowArr.Value += glowArr.Dir;
    }

    if (a === 0) { return; }

    dash_arrow.width = 16;
    dash_arrow.height = 16;
    dash_arrow.color = Color.new(255,255,255,a);

    // Draw Top Arrow
    if (DATA.DASH_CURCTXITMFIRST > 0)
    {
        dash_arrow.angle = -0.5f;
        dash_arrow.draw((DATA.CANVAS.width - 179) + xMod, 217);
        dash_arrow.angle = 0.0f;
    }

    // Draw Bottom Arrow
    if (DATA.DASH_CURCTXITMLAST < DASH_CTX[DATA.DASH_CURCTXLVL].Options.length)
    {
        dash_arrow.angle = 0.5f;
        dash_arrow.draw((DATA.CANVAS.width - 179) + xMod, 390);
        dash_arrow.angle = 0.0f;
    }
}

// Draws all the Context Menu Content.

function DrawContextOptions(aMod = 0, xMod = 0)
{
    let y = 215;

    for (let i = DATA.DASH_CURCTXITMFIRST; i < DATA.DASH_CURCTXITMLAST; i++)
    {
        DrawContextOption((DATA.CANVAS.width - 185) + xMod, y, DATA.DASH_CURCTXLVL, i, aMod);
        y+=20;
    }

    if ((DATA.DASH_CURCTXITMFIRST > 0) || (DATA.DASH_CURCTXITMLAST < DASH_CTX[DATA.DASH_CURCTXLVL].Options.length))
    { DrawContextArrows(aMod, xMod); }
}

function DrawContextPreviewImage()
{
    let time = Math.round(Timer.getTime(DATA.DASH_CTX_TIMER) / 100000);

    if (("PreviewImage" in DASH_CTX[DATA.DASH_CURCTXLVL].Options[DASH_CTX[DATA.DASH_CURCTXLVL].Selected]) && (time > 6))
    {
        if (!DASH_CTX_PRWIMG)
        {
            DASH_CTX_PRWALPHA = 0;
            DASH_CTX_PRWIMG = imgLoader.loadConstant(DASH_CTX[DATA.DASH_CURCTXLVL].Options[DASH_CTX[DATA.DASH_CURCTXLVL].Selected].PreviewImage);
        }
        else if (!DASH_CTX_PRWIMG.ready()) { return; }

        if (DASH_CTX_PRWALPHA > 20) { DASH_CTX_PRWALPHA = 20; }
        let easedProgress = easeOutCubic(Math.min(DASH_CTX_PRWALPHA++ / 20, 1));
        let col = neutralizeOverlayWithAlpha();
        let a = Math.round(easedProgress * 128);
        DASH_CTX_PRWIMG.width = 240;
        DASH_CTX_PRWIMG.height = 135;
        DASH_CTX_PRWIMG.color = Color.new(col.r, col.g, col.b, a);
        DASH_CTX_PRWIMG.draw(DATA.CANVAS.width - 450, 300);
    }
    else
    {
        DASH_CTX_PRWALPHA = 0;
        DASH_CTX_PRWIMG = false;
    }
}

// Executes a custom function (if available) on the Context Menu
// after an Item has been highlighted for a period of time, while Idle.

function ExecutePreviewFunc()
{
    let time = Math.round(Timer.getTime(DATA.DASH_CTX_TIMER) / 100000);
    if (("Preview" in DASH_CTX[DATA.DASH_CURCTXLVL]) && (time > 10))
    {
        if (Timer.isPlaying(DATA.DASH_CTX_TIMER))
        {
            Timer.pause(DATA.DASH_CTX_TIMER);
            const fun = DASH_CTX[DATA.DASH_CURCTXLVL].Preview;
            fun(DATA, DASH_CTX[DATA.DASH_CURCTXLVL].Selected);
        }
    }
}

xmblog("INIT: MAIN GRAPHICS INIT COMPLETE");

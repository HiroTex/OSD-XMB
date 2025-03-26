//////////////////////////////////////////////////////////////////////////
///*				   			   TEXT								  *///
/// 				   		  										   ///
///		Here are all the localization strings and Text Rendering	   ///
///		functions, as well as the Font initialization.				   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
///*				   	   LOCALIZATION STRINGS						  *///
//////////////////////////////////////////////////////////////////////////

const XMBLANG = JSON.parse(std.loadFile("./XMB/lang/lang.json"));

// Category Names, one for each category on the 7 different languages.

const CAT_NAMES = [];
CAT_NAMES.push(XMBLANG.CATEGORY.USER);
CAT_NAMES.push(XMBLANG.CATEGORY.SETTINGS);
CAT_NAMES.push(XMBLANG.CATEGORY.PHOTO);
CAT_NAMES.push(XMBLANG.CATEGORY.MUSIC);
CAT_NAMES.push(XMBLANG.CATEGORY.VIDEO);
CAT_NAMES.push(XMBLANG.CATEGORY.GAME);
CAT_NAMES.push(XMBLANG.CATEGORY.NETWORK);

//////////////////////////////////////////////////////////////////////////
///*				   	   		PARAMETERS							  *///
//////////////////////////////////////////////////////////////////////////

// Index for Left-to-right scrolling text
let scrollIndex = 0;

// Default Text Color
const textColor = { r:255, g:255, b:255, a:128 };

// glowText object for selected text glowing animation.
const glowText = { Dir: 1, Value: 1, Min: 0, Max: 64, };

//////////////////////////////////////////////////////////////////////////
///*				   	   		   FONT								  *///
//////////////////////////////////////////////////////////////////////////

// Init Font System
let font_m = false;
let font_s = false;
let font_ss = false;

function LoadFONT()
{
    let font_path = `./THM/Original/text/font.ttf`; // Default Font
    if ((os.readdir(`${DATA.THEME_PATH}`)[0].includes("text")) && (os.readdir(`${DATA.THEME_PATH}text/`)[0].includes("font.ttf")))
    {
        font_path = `${DATA.THEME_PATH}text/font.ttf`
    }

    font_m = new Font(font_path);
    font_s = new Font(font_path);
    font_ss = new Font(font_path);
    font_m.scale = 0.65f;
    font_s.scale = 0.5f;
    font_ss.scale = 0.44f;
}

//////////////////////////////////////////////////////////////////////////
///*				   	   	   TEXT RENDERER						  *///
//////////////////////////////////////////////////////////////////////////

// Main Text Render object that will handle all text rendering on screen.

const TextRender = {
    currentFont: null,
    x: 0,
    y: 0,
    basex: 0,
    basey: 0,
    maxWidth: 512,
    screenWidth: 640,
    screenHeight: 448,
    textColor: Color.new(255, 255, 255, 128),

    // SetFont method to set the current font
    SetFont: function(font) {
        this.currentFont = font;
    },

    // SetPosition method to set the position for text rendering
    SetPosition: function(x, y) {
        this.x = x;
        this.y = y;
        this.basex = x;
        this.basey = y;
    },

    // SetTextColor method to set the color for the main text line
    SetTextColor: function(r, g, b, a) {
        if (a < 0) { a = 0; }
        if (a > 128) { a = 128; }
        this.textColor = Color.new(r, g, b, a);
    },

    // Function to get screen width and height from Screen.getMode()
    SetScreenDimensions: function() {
        const canvas = Screen.getMode();  // Assuming it returns an object with width and height properties
        this.maxWidth = 512;
        this.screenWidth = 640;
        this.screenHeight = canvas.height;
    },

    // Function to process the input text into lines based on pixel width
    ProcessText: function(text) {
        let lines = typeof text === 'string' ? text.split('\n') : text;
        let finalLines = [];

        lines.forEach((line) =>
        {
            let splitLines = (this.currentFont.getTextSize(line).width < this.maxWidth) ? [ line ] : this.WrapTextByPixelWidth(line);
            finalLines.push(...splitLines);
        });

        return finalLines;
    },

    // Wrap text based on pixel width (line wrapping)
    WrapTextByPixelWidth: function(line) {
        let lines = [];
        let words = line.split(' ');
        let currentLine = '';
        let currentWidth = 0;

        // Precompute word widths to avoid repeated calls
        let wordWidths = words.map(word => this.currentFont.getTextSize(word).width);
        let spaceWidth = this.currentFont.getTextSize(' ').width;

        let i = 0;
        while (i < words.length)
        {
            let start = i;
            let end = words.length;
            let bestFitIndex = start;

            // Binary search for the longest segment that fits within maxWidth
            while (start < end)
            {
                let mid = Math.floor((start + end) / 2);
                let testWidth = wordWidths.slice(i, mid + 1).reduce((sum, w) => sum + w, 0) + (mid - i) * spaceWidth;

                if (testWidth <= this.maxWidth)
                {
                    bestFitIndex = mid;
                    start = mid + 1;
                } else
                {
                    end = mid;
                }
            }

            // Form the best-fitting line
            currentLine = words.slice(i, bestFitIndex + 1).join(' ');
            lines.push(currentLine);

            // Move to the next set of words
            i = bestFitIndex + 1;
        }

        return lines;
    },

    // Calculate alignment position for text
    CalculateAlignedPosition: function(lines, alignment) {

        if (alignment === "LEFT") { return; }

        let totalTextWidth = 0;
        let totalTextHeight = 0;
        let longestLine = "";
        let lineSize = this.currentFont.scale * 32

        lines.forEach((line) =>
        {
            if (line.length > longestLine.length) { longestLine = line; }
            totalTextHeight += lineSize;
        });

        totalTextWidth = this.currentFont.getTextSize(longestLine).width;

        if (alignment === "CENTER") {
          this.x = ((this.screenWidth - totalTextWidth) / 2) + this.basex;
        } else if (alignment === "RIGHT") {
          this.x = (this.screenWidth - totalTextWidth) + this.basex;
        }

        if (alignment === "CENTER") { this.y = ((this.screenHeight - totalTextHeight) / 2) + this.basey; }
    },

    // Print method to render text, with shadow and alignment
    Print: function(lines, alignment = "LEFT", outline = true)
    {
        // If only one line, make an array of one item.

        if (typeof lines === 'string') { lines = [lines]; }

        this.CalculateAlignedPosition(lines, alignment);

        const opacity = Color.getA(this.textColor);
        const shadowOpacity = Math.max(0, opacity - 32);

        lines.forEach((line, index) =>
        {
            const lineY = this.y + index * (this.currentFont.scale * 32);

            if ((outline) && (shadowOpacity > 0))
            {
                this.currentFont.color = Color.new(0, 0, 0, shadowOpacity);
                this.currentFont.print(this.x + 1, lineY + 1, line);
            }

            this.currentFont.color = this.textColor;
            this.currentFont.print(this.x, lineY, line);
        });
    }
};

/*	Info:

    Main Function to render Text on Screen with several options.
        txt: 	String to render on screen.
        clr: 	Text Color.
        pos: 	Object with properties x and y to set the Text Position on screen.
        align: 	Text Alignment. Default is LEFT, but can be set to "CENTER" or "RIGHT".
        font: 	Text Font to use, default is "small".
        glow: 	Boolean to indicate if text should glow or not.
*/

function TxtPrint(txt, clr, pos, align = "LEFT", font = font_s, glow = false)
{
    if ((txt != "") && (clr.a > 0))
    {
        TextRender.SetFont(font);
        TextRender.SetTextColor(clr.r, clr.g, clr.b, clr.a);
        TextRender.SetPosition(pos.x, pos.y);
        TextRender.Print(txt, align);

        if (glow)
        {
            if (glowText.Value == glowText.Max) { glowText.Dir = -1; }
            if (glowText.Value == glowText.Min) { glowText.Dir = 1; }
            glowText.Value = glowText.Value + glowText.Dir;
            TextRender.SetTextColor(clr.r, clr.g, clr.b, glowText.Value * 2);
            TextRender.SetPosition(pos.x + 1, pos.y);
            TextRender.Print(txt, align, false);
        }
    }
}

// Function exclusively made to render the Boot Warning Text at Boot.
function DisplayBootWarningText(alpha)
{
    if (BOOT_WARNING_TEXT === false)
    {
        TextRender.SetFont(font_s);
        BOOT_WARNING_TEXT = TextRender.ProcessText(XMBLANG.BOOT_WARNING[DATA.LANGUAGE]);
    }

    TxtPrint(BOOT_WARNING_TEXT, { r: 255, g: 255, b: 255, a: alpha }, { x: 10 + (DATA.WIDESCREEN * 32), y: -20 }, "CENTER");
}

// Function exclusively made to render the Debug Info at the bottom of the screen.
function PrintDebugInfo()
{
    let mem = System.getMemoryStats();
    TxtPrint(`${Screen.getFPS(360)}  FPS - RAM USAGE: ${Math.floor(mem.used / 1024)}KB / ${Math.floor(DATA.EE_INFO.RAMSize / 1024)}KB - W: ${DATA.CANVAS.width} H: ${DATA.CANVAS.height} - FREE VRAM: ${Screen.getFreeVRAM()} KB`, textColor, { x:20 + (DATA.WIDESCREEN * 32), y: DATA.CANVAS.height - 40 }, "LEFT", font_ss);
}

// Set Text Renderer Initial Parameters
TextRender.SetScreenDimensions();
let BOOT_WARNING_TEXT = false;
console.log("INIT: TEXT INIT COMPLETE");

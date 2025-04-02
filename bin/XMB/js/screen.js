//////////////////////////////////////////////////////////////////////////
///*				   			  SCREEN 							  *///
/// 				   		  										   ///
///		This script will initialize the Screen Info and provide		   ///
///		                functions to manage it.                        ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

function setScreenWidth()
{
    DATA.CANVAS.width = (DATA.WIDESCREEN) ? 704 : 640;
}
function setScreenHeight()
{
    switch (DATA.CANVAS.mode)
    {
        case NTSC:
        case DTV_480p: DATA.CANVAS.height = 448; break;
        case PAL: DATA.CANVAS.height = 512; break;
    }
}
function setScreeniMode()
{
    switch (DATA.CANVAS.mode)
    {
        case NTSC:
        case PAL: DATA.CANVAS.interlace = INTERLACED; break;
        case DTV_480p: DATA.CANVAS.interlace = PROGRESSIVE; break;
    }
}

// The 6 possible video modes that Athena can set.
// Used by the "Video Settings" plugin.

const vmodes = [];
vmodes.push({ Name: "NTSC", Value: NTSC });
vmodes.push({ Name: "PAL", Value: PAL });
vmodes.push({ Name: "DTV 480p", Value: DTV_480p });
vmodes.push({ Name: "DTV 576p", Value: DTV_576p });
vmodes.push({ Name: "DTV 720p", Value: DTV_720p });
vmodes.push({ Name: "DTV 1080i", Value: DTV_1080i });

// Set Screen Parameters.

DATA.CANVAS.double_buffering = true;
DATA.CANVAS.zbuffering = false;
Screen.setMode(DATA.CANVAS);
Screen.setVSync(true);
if (DBGMODE) { Screen.setFrameCounter(true); }
DATA.SCREEN_PREVMODE = DATA.CANVAS.mode; 		// Store current Canvas mode for backup.

xmblog("INIT: SCREEN INIT COMPLETE");

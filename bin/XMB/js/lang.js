//////////////////////////////////////////////////////////////////////////
///*				   			   LANG								  *///
/// 				   		  										   ///
///		 This handles all 7 Languages' related strings and objects.	   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const langPath = `${PATHS.XMB}lang/`;
const XMBLANG = {};		// Common Language Strings Object
const CATNAME = []; 	// Category Names, one for each category on the 7 different languages.

function XMBLangInit() {
	const files = os.readdir(langPath)[0];
	for (const file of files) {
		if (file.endsWith(".json"))	{
			const filePath = langPath + file;
			const data = JSON.parse(std.loadFile(filePath));
			Object.assign(XMBLANG, data); // Merge into XMBLANG
		}
	}
}

function CatNameInit() {
	if (!(`CATEGORY` in XMBLANG)) { return; }
	CATNAME.push(XMBLANG.CATEGORY.USER);
	CATNAME.push(XMBLANG.CATEGORY.SETTINGS);
	CATNAME.push(XMBLANG.CATEGORY.PHOTO);
	CATNAME.push(XMBLANG.CATEGORY.MUSIC);
	CATNAME.push(XMBLANG.CATEGORY.VIDEO);
	CATNAME.push(XMBLANG.CATEGORY.GAME);
	CATNAME.push(XMBLANG.CATEGORY.NETWORK);
}

//////////////////////////////////////////////////////////////////////////
///*				   			 Init Work							  *///
//////////////////////////////////////////////////////////////////////////

XMBLangInit();
CatNameInit();
console.log("INIT LIB: LANG COMPLETE");
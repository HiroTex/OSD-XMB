//////////////////////////////////////////////////////////////////////////
///*				   			   FONT								  *///
/// 				   		  										   ///
///		Here are all the localization strings and Text Rendering	   ///
///		functions, as well as the Font initialization.				   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

let FontObj = {
	DefaultFont: new Font(`${PATHS.Theme}Original/text/font.ttf`),
	Font: false,
	SizeS: false,
	SizeM: false,
	SizeL: false,
	Glow: { Value: 0, Dir: 1, Min: 0, Max: 64 },
	Color: Color.new(128,128,128,128),
	Wrap: 205
}

function FontInit() {
	FontObj.Font = FontObj.DefaultFont;
	if (UserConfig.Theme !== "Original") {
		const custom_font = `${PATHS.Theme}${UserConfig.Theme}/text/font.ttf`
		if (std.exists(custom_font)) { FontObj.Font = new Font(custom_font); }
	}

    FontObj.SizeS = 0.55f;
    FontObj.SizeM = 0.63f;
    FontObj.SizeL = 0.75f;
    FontObj.Font.dropshadow = 1.0f;
}
function WrapTextByPixelWidth(line) {
	const limit = (ScrCanvas.width - FontObj.Wrap);

	let lines = [];
	let words = line.split(' ');
	let currentLine = '';
	let currentWidth = 0;

	// Precompute word widths to avoid repeated calls
	let wordWidths = words.map(word => FontObj.Font.getTextSize(word).width);
	let spaceWidth = FontObj.Font.getTextSize(' ').width;

	let i = 0;
	while (i < words.length)
	{
		let start = i;
		let end = words.length;
		let bestFitIndex = start;

		// Binary search for the longest segment that fits within maxWidth
		while (start < end)
		{
			let mid = Math.floor((start + end) >> 1);
			let testWidth = wordWidths.slice(i, mid + 1).reduce((sum, w) => sum + w, 0) + (mid - i) * spaceWidth;

			if (testWidth <= limit)
			{
				bestFitIndex = mid;
				start = mid + 1;
			} else {
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
}
function PreprocessText(txt) {

    FontObj.Font.scale = FontObj.SizeS;
    let lines = typeof txt === 'string' ? txt.split('\n') : txt;
    let finalLines = [];

    const limit = ScrCanvas.width - FontObj.Wrap;
    for (const line of lines) {
        let splitLines = (FontObj.Font.getTextSize(line).width < limit) ? [line] : WrapTextByPixelWidth(line);
        finalLines.push(...splitLines);
    }

	return finalLines;
}
function FontGlowUpdate() {
	if (FontObj.Glow.Value == FontObj.Glow.Max) { FontObj.Glow.Dir = -2; }
	if (FontObj.Glow.Value == FontObj.Glow.Min) { FontObj.Glow.Dir = 2; }
	FontObj.Glow.Value = FontObj.Glow.Value + FontObj.Glow.Dir;
}
function FontAlignPos(Text, Alignment = "LEFT", Position) {
	switch(Alignment) {
		case "LEFT":
			Position.Y += 10;
			FontObj.Font.align = Font.ALIGN_LEFT;
			break;
		case "HCENTER":
			Position.X = Position.X + (ScrCanvas.width >> 1);
			Position.Y = (ScrCanvas.height >> 1) + (Position.Y - ((FontObj.Font.scale * 16) * (Text.length - 1)));
			FontObj.Font.align = Font.ALIGN_HCENTER;
			break;
		case "RIGHT":
			Position.Y += 10;
            Position.X = ScrCanvas.width + Position.X;
			FontObj.Font.align = Font.ALIGN_RIGHT;
			break;
		case "CENTER":
			let longestLine = Text[0];
			for (let i = 1; i < Text.length; i++) { if (Text[i].length > longestLine.length) { longestLine = Text[i]; } }
			const totalTextWidth = FontObj.Font.getTextSize(longestLine).width;
			Position.X = ((ScrCanvas.width - totalTextWidth) >> 1) + Position.X;
			Position.Y = (ScrCanvas.height >> 1) + (Position.Y - ((FontObj.Font.scale * 16) * (Text.length - 1)));
			FontObj.Font.align = Font.ALIGN_LEFT;
			break;
	}

	return Position;
}
function FontTextPrint(txt, pos) {
	const lineSize = ~~(FontObj.Font.scale * 32);
    let y = pos.Y;

    for (const t of txt) {
        FontObj.Font.print(pos.X, y, t);
        y += lineSize;
    }
}
function TxtPrint(Obj) {
	// Validate Object
    if (!Obj.Text || !Obj.Position || !('X' in Obj.Position) || !('Y' in Obj.Position)) {
        return;
    }

	// Cap Alpha Value
    if ('Alpha' in Obj) { Obj.Alpha = alphaCap(Obj.Alpha); }
    else { Obj.Alpha = 128; }

	// Exit if Alpha less than 1
    if (Obj.Alpha < 1) { return; }

    // Prepare Text Array.
    if (typeof Obj.Text === 'string') { Obj.Text = PreprocessText(Obj.Text); }

    // Prepare Default Parameters
    if (!('Scale' in Obj)) { Obj.Scale = FontObj.SizeS; }
    if (!('Glow' in Obj)) { Obj.Glow = false; }

	FontObj.Font.scale = Obj.Scale;
    FontObj.Font.dropshadow_color = Color.new(0, 0, 0, Obj.Alpha >> 1);
    FontAlignPos(Obj.Text, Obj.Alignment, Obj.Position);

    if ('Color' in Obj) { FontObj.Font.color = Color.new(Obj.Color.R, Obj.Color.G, Obj.Color.B, Obj.Alpha); }
    else { FontObj.Font.color = Color.setA(FontObj.Color, Obj.Alpha); }

	FontTextPrint(Obj.Text, Obj.Position);

	if (!Obj.Glow) { return; }
    FontObj.Font.dropshadow_color = Color.setA(FontObj.Font.color, FontObj.Glow.Value);
	FontObj.Font.color = Color.setA(FontObj.Font.color, FontObj.Glow.Value * 2);
	FontTextPrint(Obj.Text, Obj.Position);
}

FontInit();
console.log("INIT LIB: FONT COMPLETE");

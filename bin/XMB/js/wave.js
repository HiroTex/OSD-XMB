//////////////////////////////////////////////////////////////////////////
///*				   				WAVE							  *///
/// 				   		  										   ///
///					The Background Wave visual effect.				   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const Waves = (() => {
    // Wave constants
    let screenWidth = ScrCanvas.width;
    let time = 0;
    const step = 6;

    // Wave constants
    const wave1ColorBottom = Color.new(0, 0, 0, 36);
    const wave1Amplitude = 30.0f;
    const wave1Speed = 0.019f;
    const wave2Amplitude = 32.0f;
    const waveLength = 0.005f;
    const wave2Speed = 0.021f;

    // Precompute x-wave values
    const precomputedXWave = [];

    function precomputeValues() {
        for (let x = 0; x <= screenWidth; x += step) {
            precomputedXWave[x] = x * waveLength;
        }
    }

    precomputeValues();

    let wave2ColorTop, wave2ColorBottom;

    function SetColor(themeColor) {
        const r = Math.min(themeColor.R + 65, 255);
        const g = Math.min(themeColor.G + 65, 255);
        const b = Math.min(themeColor.B + 90, 255);

        wave2ColorTop = Color.new(r, g, b, 127);
        wave2ColorBottom = Color.new(r, g, b, 96);
    }

    function Render() {
		const width = ScrCanvas.width;
		const height = ScrCanvas.height;
		const baseYStart = (height >> 1) + 96;

		if (width !== screenWidth) {
			screenWidth = width;
			precomputeValues();
		}

		const timeWave1 = time * wave1Speed;
		const timeWave2 = time * wave2Speed;

		for (let x = 0; x <= screenWidth; x += step) {
			const waveX = precomputedXWave[x];
			
			const y1 = Math.sinf(precomputedXWave[x] + timeWave1) * wave1Amplitude;
            const y2 = Math.sinf(precomputedXWave[x] + timeWave2) * wave2Amplitude;
			
			const currentY1 = baseYStart + y1;
			const currentY2 = baseYStart + y2;

			const rectW = (x + step > screenWidth) ? screenWidth - x : step;

			Draw.rect(x, currentY1 + 1, rectW, height, wave1ColorBottom);
			Draw.rect(x, currentY2 - 1, rectW, 2, wave2ColorTop);
			Draw.rect(x, currentY2 + 1, rectW, height, wave2ColorBottom);
		}
		
		time = (time + 1) % 6284;
    }

    return {
        Render, SetColor,
    };
})();

// Set the Waves' color.
Waves.SetColor(getBgColor());
console.log("INIT LIB: WAVES COMPLETE");
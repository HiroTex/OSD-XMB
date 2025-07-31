//////////////////////////////////////////////////////////////////////////
///*				   				WAVE							  *///
/// 				   		  										   ///
///					The Background Wave visual effect.				   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const Waves = (() => {
    // Wave constants
    let screenHeight = ScrCanvas.height;
    let screenWidth  = ScrCanvas.width;
    let time         = 0;
    let frame        = 0;
    const step       = 6;
    const data       = {};
    data.Y1          = [];
    data.Y2          = [];

    // Wave constants
    const wave1ColorBottom = Color.new(0, 0, 0, 36);
    const wave1Amplitude   = 30;
    const wave1Speed       = 0.038f;
    const wave2Amplitude   = 32;
    const waveLength       = 0.005f;
    const wave2Speed       = 0.042f;

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
        const baseYStart = (screenHeight >> 1) + 96;

        if (ScrCanvas.width !== screenWidth) {
            screenWidth = ScrCanvas.width;
            precomputeValues();
        }

        if (frame % 2 !== 0) {
            for (let x = 0; x <= screenWidth; x += step) {
                const rectW = (x + step > screenWidth) ? screenWidth - x : step;
                Draw.rect(x, data.Y1[x], rectW, screenHeight, wave1ColorBottom);
                Draw.rect(x, data.Y2[x] - 1, rectW, 2, wave2ColorTop);
                Draw.rect(x, data.Y2[x], rectW, screenHeight, wave2ColorBottom);
            }
        }
        else {
            data.Y1 = [];
            data.Y2 = [];
            const timeWave1 = time * wave1Speed;
            const timeWave2 = time * wave2Speed;

            for (let x = 0; x <= screenWidth; x += step) {
                const waveX = precomputedXWave[x];

                const y1 = Math.sinf(waveX + timeWave1) * wave1Amplitude;
                const y2 = Math.sinf(waveX + timeWave2) * wave2Amplitude;

                data.Y1[x] = ~~(baseYStart + y1);
                data.Y2[x] = ~~(baseYStart + y2);

                const rectW = (x + step > screenWidth) ? screenWidth - x : step;

                Draw.rect(x, data.Y1[x], rectW, screenHeight, wave1ColorBottom);
                Draw.rect(x, data.Y2[x] - 1, rectW, 2, wave2ColorTop);
                Draw.rect(x, data.Y2[x], rectW, screenHeight, wave2ColorBottom);
            }

            time++; if (time === 6284) time = 0;
        }

        frame++; if (frame === 2) frame = 0;
    }

    return {
        Render, SetColor,
    };
})();

// Set the Waves' color.
Waves.SetColor(getBgColor());
console.log("INIT LIB: WAVES COMPLETE");

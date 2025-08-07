//////////////////////////////////////////////////////////////////////////
///*				   			  AUDIO								  *///
/// 				   		  										   ///
///		  This handles all audio related functions and systems.		   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const Sounds = {
    BOOT:   `${PATHS.Theme}Original/sound/snd_boot.wav`,
    CURSOR: Sound.Sfx(`${PATHS.Theme}Original/sound/cursor.adp`),
    CANCEL: Sound.Sfx(`${PATHS.Theme}Original/sound/cancel.adp`)
};

function playSfx(sound) {
    if (!sound) return;
    sound.play();
}
function playBgm(sound) {
    if (!sound) return;
    const bgm = Sound.Stream(sound);
    bgm.play();
    let ival = os.setInterval(() => {
        if (!bgm.playing()) {
            bgm.free();
            os.clearInterval(ival);
        }
    }, 0);
}

const PlayBootSfx   = () => playBgm(false);
const PlayCursorSfx = () => playSfx(false);
const PlayCancelSfx = () => playSfx(false);

//////////////////////////////////////////////////////////////////////////
///*				   			 Init Work							  *///
//////////////////////////////////////////////////////////////////////////

Sound.setVolume(100);
console.log("INIT LIB: AUDIO COMPLETE");

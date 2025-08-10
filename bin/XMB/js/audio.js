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

let CurrentBGM = false; // Current BGM Playing.

function SoundHandler() {
    // This function is called every frame to handle audio.
    if (CurrentBGM && !CurrentBGM.playing()) {
        CurrentBGM.free();
        CurrentBGM = false;
    }
 }

function playSfx(sound) {
    if (!sound) return;
    sound.play();
}
function playBgm(sound) {
    if (!sound) return;
    if (CWD.substring(0, 4) === "mmce") { return; } // Do not play Sounds from MMCE.
    const bgm = Sound.Stream(sound);
    bgm.play();
    CurrentBGM = bgm; // Set the current BGM to the one playing.
}

const PlayBootSfx   = () => playBgm(Sounds.BOOT);
const PlayCursorSfx = () => playSfx(false);
const PlayCancelSfx = () => playSfx(false);

//////////////////////////////////////////////////////////////////////////
///*				   			 Init Work							  *///
//////////////////////////////////////////////////////////////////////////

Sound.setVolume(100);
console.log("INIT LIB: AUDIO COMPLETE");

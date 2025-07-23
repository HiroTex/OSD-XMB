//////////////////////////////////////////////////////////////////////////
///*				   			  AUDIO								  *///
/// 				   		  										   ///
///		  This handles all audio related functions and systems.		   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const Sounds = {
    BOOT:   Sound.Stream(`${PATHS.Theme}Original/sound/snd_boot.wav`),
    CURSOR: Sound.Stream(`${PATHS.Theme}Original/sound/snd_cursor.wav`),
    CANCEL: Sound.Stream(`${PATHS.Theme}Original/sound/snd_cancel.wav`)
};

function playSfx(sound) {
    if (!sound) return;
	
    if (sound.playing()) {
        sound.rewind();
    } else {
        sound.play();
    }
}

const PlayBootSfx   = () => playSfx(Sounds.BOOT);
const PlayCursorSfx = () => playSfx(/*Sounds.CURSOR*/false);
const PlayCancelSfx = () => playSfx(/*Sounds.CANCEL*/false);

//////////////////////////////////////////////////////////////////////////
///*				   			 Init Work							  *///
//////////////////////////////////////////////////////////////////////////

Sound.setVolume(100);
console.log("INIT LIB: AUDIO COMPLETE");
//////////////////////////////////////////////////////////////////////////
///*				   			   SOUND							  *///
/// 				   		  										   ///
///		NOTE: Most of the Sound System will be disabled since 		   ///
///		Athena can't process sounds very well in its current 		   ///
///		state (V3).	  												   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const soundEnabled = false;

Sound.setVolume(0);

// Load Boot Sound Effect and play it immediatelly.
const sfx_boot = (std.exists(`${DATA.THEME_PATH}sound/snd_boot.wav`)) ? `${DATA.THEME_PATH}sound/snd_boot.wav` : `./THM/Original/sound/snd_boot.wav`;
let currAudioDuration = calculateWavValue(sfx_boot);
let AudioPlaying = Sound.load(sfx_boot);

const sfx_cursor = (std.exists(`${DATA.THEME_PATH}sound/snd_cursor.wav`)) ? `${DATA.THEME_PATH}sound/snd_cursor.wav` : `./THM/Original/sound/snd_cursor.wav`;
const cursorSFX_AudioDuration = (!soundEnabled) ? 0 : calculateWavValue(sfx_cursor);
const cursorSFX = (!soundEnabled) ? false : Sound.load(sfx_cursor);

const sfx_cancel = (std.exists(`${DATA.THEME_PATH}sound/snd_cancel.wav`)) ? `${DATA.THEME_PATH}sound/snd_cancel.wav` : `./THM/Original/sound/snd_cancel.wav`;
const cancelSFX_AudioDuration = (!soundEnabled) ? 0 : calculateWavValue(sfx_cancel);
const cancelSFX = (!soundEnabled) ? false : Sound.load(sfx_cancel);

/*	Manual Sound Stop process to avoid the audio to finish (and crash the app)  */

function SoundStopProcess()
{
    let audCurPos = Sound.getPosition(AudioPlaying);

    if (Sound.isPlaying() && (currAudioDuration <= audCurPos))
    {
        Sound.setVolume(0);
        Sound.setPosition(AudioPlaying, 0);
        Sound.pause(AudioPlaying);
        xmblog("SFX LEN: " + currAudioDuration);
        xmblog("SFX POS: " + audCurPos);
    }
}

/*	Manual WAV Length calculation value to avoid using 'getDuration' method  */
/*	using the 'getDuration' method will make any sound crash when finishing. */

function calculateWavValue(filePath)
{
    // Open the file
    const file = std.open(filePath, "rb");

    // Helper to read 4 bytes as a 32-bit little-endian integer
    const readUInt32LE = (buffer) =>
    {
        return (buffer[0]) |
            (buffer[1] << 8) |
            (buffer[2] << 16) |
            (buffer[3] << 24);
    };

    // Read Data Size (4 bytes from position 4)
    const dataSizeBuffer = new Uint8Array(4); // Allocate a 4-byte buffer
    file.seek(4, std.SEEK_SET);
    file.read(dataSizeBuffer.buffer, 0, 4);   // Read 4 bytes starting at position 4
    const dataSize = readUInt32LE(dataSizeBuffer);

    // Read Samples Per Second (4 bytes from position 24)
    const samplesPerSecondBuffer = new Uint8Array(4); // Allocate a 4-byte buffer
    file.seek(28, std.SEEK_SET);
    file.read(samplesPerSecondBuffer.buffer, 0, 4);   // Read 4 bytes starting at position 24
    const samplesPerSecond = readUInt32LE(samplesPerSecondBuffer);

    file.close();

    // Compute the result
    const result = Math.round((dataSize / samplesPerSecond) * 1000);
    return Math.round(result - (result / 40));
}

/*	Play a Sound file from 'path'  */

function playSound(path)
{
    if (!path.endsWith(".wav")) { return; }

    Sound.pause(AudioPlaying);
    currAudioDuration = calculateWavValue(path);
    let audioToPlay = Sound.load(path);

    Sound.setVolume(100);
    Sound.play(audioToPlay, 0);
    Sound.repeat(false);

    let audioPrevious = AudioPlaying;
    AudioPlaying = audioToPlay;

    if (AudioPlaying != cursorSFX && AudioPlaying != cancelSFX)
    {
        Sound.free(audioPrevious);
    }
}

/*	Play the XMB's Cursor movement SFX  */

function playCursorSFX()
{
    if (!soundEnabled) { return; }

    Sound.setVolume(100);

    if (AudioPlaying != cursorSFX && AudioPlaying != cancelSFX)
    {
        Sound.pause(AudioPlaying);
        currAudioDuration = cursorSFX_AudioDuration;
        let audioPrevious = AudioPlaying;
        AudioPlaying = cursorSFX;
        Sound.play(AudioPlaying, 0);
        Sound.free(audioPrevious);
    }
    else
    {
        Sound.restart(AudioPlaying);
        Sound.play(AudioPlaying);
    }
}

/*	Play the XMB's Cancel SFX  */

function playCancelSFX()
{
    if (!soundEnabled) { return; }

    Sound.setVolume(100);

    if (AudioPlaying != cancelSFX && AudioPlaying != cursorSFX)
    {
        Sound.pause(AudioPlaying);
        currAudioDuration = cancelSFX_AudioDuration;
        let audioPrevious = AudioPlaying;
        AudioPlaying = cancelSFX;
        Sound.play(AudioPlaying, 0);
        Sound.free(audioPrevious);
    }
    else
    {
        Sound.restart(AudioPlaying);
        Sound.play(AudioPlaying);
    }
}

xmblog("INIT: SOUND INIT COMPLETE");

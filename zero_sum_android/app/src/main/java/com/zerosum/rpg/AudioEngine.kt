package com.zerosum.rpg

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.SoundPool
import android.media.ToneGenerator
import android.util.Log
import kotlinx.coroutines.*

/**
 * AudioEngine for Zero Sum RPG.
 * Theme: Everyday Hero Crisis Realism. Gritty, grounded, desperate.
 * 
 * Uses procedural ToneGenerator for UI feedback, alarms, and interference (no Sci-Fi sounds, 
 * purely analog/digital infrastructural realism).
 * Uses SoundPool for short actual audio FX (e.g., recorded foley).
 */
class AudioEngine(private val context: Context) {

    private val toneGen: ToneGenerator = ToneGenerator(AudioManager.STREAM_MUSIC, 100)
    private val soundPool: SoundPool
    private val loadedSounds = mutableMapOf<String, Int>()

    private val scope = CoroutineScope(Dispatchers.Default + Job())

    init {
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        soundPool = SoundPool.Builder()
            .setMaxStreams(12)
            .setAudioAttributes(audioAttributes)
            .build()
    }

    enum class Profile {
        HEARTBEAT,              // Heavy, slow pulsing, under duress
        DATA_PING,              // Short, sharp data reception
        SYSTEM_BLACKOUT,        // Complete power loss descending tone
        GLITCH,                 // Rapid analog stutter
        SUCCESS_ACTION,         // Positive acknowledgment, non-musical
        ERROR_CRITICAL,         // Harsh rejection tone
        SCAN_LINE,              // Sweeping digital rapid sequence
        FLATLINE_MONITOR,       // Continuous critical failure tone
        RADIO_STATIC_BURST,     // Interference simulation
        ALARM_LEVEL_1,          // Minor infrastructure warning
        ALARM_LEVEL_3,          // Severe evacuation siren rhythm
        POWER_RESTORED,         // System boot sequence
        MECHANICAL_LOCK_OPENED, // Harsh clack (simulated via DTMF)
        ACCESS_DENIED,          // Triple low busy beep
        GEIGER_COUNTER_CLICK,   // Radiation/hazard single tick
        COMM_LINK_ESTABLISHED,  // Handshake tone
        COMM_LINK_LOST,         // Dropped signal error
        PROXIMITY_WARNING,      // Speeding up tension beeps
        DIAGNOSTIC_RUN,         // Rapid calculation/processing sounds
        BATTERY_CRITICAL        // Slow, haunting low power warning
    }

    fun play(profile: Profile) {
        scope.launch {
            try {
                when (profile) {
                    Profile.HEARTBEAT -> {
                        toneGen.startTone(ToneGenerator.TONE_CDMA_LOW_L, 100)
                        delay(250)
                        toneGen.startTone(ToneGenerator.TONE_CDMA_LOW_L, 150)
                    }
                    Profile.DATA_PING -> {
                        toneGen.startTone(ToneGenerator.TONE_PROP_BEEP, 40)
                    }
                    Profile.SYSTEM_BLACKOUT -> {
                        toneGen.startTone(ToneGenerator.TONE_SUP_ERROR, 600)
                        delay(650)
                        toneGen.startTone(ToneGenerator.TONE_CDMA_NETWORK_BUSY, 1000)
                    }
                    Profile.GLITCH -> {
                        for (i in 0..4) {
                            val duration = (10..30).random()
                            toneGen.startTone(ToneGenerator.TONE_CDMA_ABBR_INTERCEPT, duration)
                            delay((20..60).random().toLong())
                        }
                    }
                    Profile.SUCCESS_ACTION -> {
                        toneGen.startTone(ToneGenerator.TONE_PROP_ACK, 80)
                        delay(100)
                        toneGen.startTone(ToneGenerator.TONE_PROP_ACK, 120)
                    }
                    Profile.ERROR_CRITICAL -> {
                        toneGen.startTone(ToneGenerator.TONE_PROP_NACK, 400)
                    }
                    Profile.SCAN_LINE -> {
                        for (i in 0..5) {
                            toneGen.startTone(ToneGenerator.TONE_CDMA_KEYPAD_VOLUME_KEY_LITE, 20)
                            delay(40)
                        }
                    }
                    Profile.FLATLINE_MONITOR -> {
                        toneGen.startTone(ToneGenerator.TONE_CDMA_HIGH_L, 2000)
                    }
                    Profile.RADIO_STATIC_BURST -> {
                        for (i in 0..8) {
                            toneGen.startTone(ToneGenerator.TONE_CDMA_SIGNAL_OFF, 15)
                            delay((10..25).random().toLong())
                        }
                    }
                    Profile.ALARM_LEVEL_1 -> {
                        toneGen.startTone(ToneGenerator.TONE_CDMA_EMERGENCY_RINGBACK, 300)
                    }
                    Profile.ALARM_LEVEL_3 -> {
                        for (i in 0..2) {
                            toneGen.startTone(ToneGenerator.TONE_CDMA_EMERGENCY_RINGBACK, 500)
                            delay(700)
                        }
                    }
                    Profile.POWER_RESTORED -> {
                        toneGen.startTone(ToneGenerator.TONE_CDMA_KEYPAD_VOLUME_KEY_LITE, 100)
                        delay(150)
                        toneGen.startTone(ToneGenerator.TONE_PROP_ACK, 250)
                    }
                    Profile.MECHANICAL_LOCK_OPENED -> {
                        toneGen.startTone(ToneGenerator.TONE_DTMF_0, 30)
                        delay(40)
                        toneGen.startTone(ToneGenerator.TONE_DTMF_8, 50)
                    }
                    Profile.ACCESS_DENIED -> {
                        for (i in 0..2) {
                            toneGen.startTone(ToneGenerator.TONE_SUP_BUSY, 150)
                            delay(220)
                        }
                    }
                    Profile.GEIGER_COUNTER_CLICK -> {
                        toneGen.startTone(ToneGenerator.TONE_CDMA_PRESSHOLDKEY_LITE, 15)
                    }
                    Profile.COMM_LINK_ESTABLISHED -> {
                        toneGen.startTone(ToneGenerator.TONE_CDMA_NETWORK_USA_RINGBACK, 150)
                        delay(200)
                        toneGen.startTone(ToneGenerator.TONE_PROP_ACK, 100)
                    }
                    Profile.COMM_LINK_LOST -> {
                        toneGen.startTone(ToneGenerator.TONE_SUP_ERROR, 200)
                        delay(250)
                        toneGen.startTone(ToneGenerator.TONE_CDMA_SOFT_ERROR_LITE, 400)
                    }
                    Profile.PROXIMITY_WARNING -> {
                        for (i in 5 downTo 1) {
                            toneGen.startTone(ToneGenerator.TONE_PROP_BEEP, 40)
                            delay((i * 80).toLong())
                        }
                    }
                    Profile.DIAGNOSTIC_RUN -> {
                        for (i in 0..7) {
                            toneGen.startTone(ToneGenerator.TONE_CDMA_KEYPAD_VOLUME_KEY_LITE, 25)
                            delay((30..90).random().toLong())
                        }
                    }
                    Profile.BATTERY_CRITICAL -> {
                        toneGen.startTone(ToneGenerator.TONE_CDMA_ABBR_REORDER, 800)
                    }
                }
            } catch (e: Exception) {
                Log.e("AudioEngine", "Error playing procedural tone profile: ${profile.name}", e)
            }
        }
    }

    /**
     * Loads a raw or asset sound file into the SoundPool.
     */
    fun loadSound(name: String, resourceId: Int) {
        val soundId = soundPool.load(context, resourceId, 1)
        loadedSounds[name] = soundId
    }

    /**
     * Plays a previously loaded sound.
     */
    fun playSound(name: String, volume: Float = 1.0f) {
        loadedSounds[name]?.let { soundId ->
            soundPool.play(soundId, volume, volume, 1, 0, 1.0f)
        } ?: Log.w("AudioEngine", "Sound $name not loaded in SoundPool.")
    }

    fun release() {
        toneGen.release()
        soundPool.release()
        scope.cancel()
    }
}

package com.zerosum.rpg

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

class HapticEngine(private val context: Context) {

    private val vibrator: Vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        vibratorManager.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }

    enum class Profile {
        HEARTBEAT_CRITICAL,
        HEARTBEAT_STEADY,
        SERVER_PING_SUCCESS,
        SERVER_PING_FAILURE,
        HEAVY_IMPACT,
        ANALOG_CLICK,
        GEIGER_COUNTER,
        DEFIBRILLATOR_CHARGE,
        DEFIBRILLATOR_SHOCK,
        RADIO_STATIC,
        POWER_OUTAGE,
        GENERATOR_STARTUP,
        DOOR_BREACH,
        SIREN_WAIL,
        KEYSTROKE_MECHANICAL,
        FOOTSTEP_CONCRETE,
        GLASS_SHATTER,
        FLASHLIGHT_TOGGLE,
        WIRE_SPARK,
        LOCKPICK_TENSION,
        LOCKPICK_SUCCESS,
        LOCKPICK_FAIL,
        WATER_DRIP,
        STORM_THUNDER,
        METRO_RUMBLE,
        PULSE_FLATLINE,
        UI_NEOMORPHIC_TAP,
        UI_NEOMORPHIC_ELEVATE
    }

    fun play(profile: Profile) {
        if (!vibrator.hasVibrator()) return

        val effect = when (profile) {
            Profile.HEARTBEAT_CRITICAL -> VibrationEffect.createWaveform(longArrayOf(0, 50, 150, 50, 600), intArrayOf(0, 255, 0, 150, 0), -1)
            Profile.HEARTBEAT_STEADY -> VibrationEffect.createWaveform(longArrayOf(0, 40, 200, 40, 800), intArrayOf(0, 100, 0, 80, 0), -1)
            Profile.SERVER_PING_SUCCESS -> VibrationEffect.createWaveform(longArrayOf(0, 20, 50, 20), intArrayOf(0, 120, 0, 180), -1)
            Profile.SERVER_PING_FAILURE -> VibrationEffect.createWaveform(longArrayOf(0, 50, 20, 50, 20, 80), intArrayOf(0, 255, 0, 255, 0, 255), -1)
            Profile.HEAVY_IMPACT -> VibrationEffect.createWaveform(longArrayOf(0, 30, 80, 200), intArrayOf(0, 255, 128, 0), -1)
            Profile.ANALOG_CLICK -> VibrationEffect.createWaveform(longArrayOf(0, 10, 20, 10), intArrayOf(0, 200, 0, 100), -1)
            Profile.GEIGER_COUNTER -> VibrationEffect.createWaveform(longArrayOf(0, 10, 40, 5, 80, 15, 30, 10), intArrayOf(0, 180, 0, 100, 0, 255, 0, 150), -1)
            Profile.DEFIBRILLATOR_CHARGE -> VibrationEffect.createWaveform(longArrayOf(0, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100), intArrayOf(0, 20, 40, 60, 80, 100, 140, 180, 220, 240, 255), -1)
            Profile.DEFIBRILLATOR_SHOCK -> VibrationEffect.createWaveform(longArrayOf(0, 200, 50, 150), intArrayOf(0, 255, 0, 180), -1)
            Profile.RADIO_STATIC -> VibrationEffect.createWaveform(longArrayOf(0, 15, 15, 15, 15, 15, 15, 15, 15), intArrayOf(0, 80, 40, 100, 50, 90, 60, 110, 30), -1)
            Profile.POWER_OUTAGE -> VibrationEffect.createWaveform(longArrayOf(0, 300, 400, 50), intArrayOf(0, 255, 128, 0), -1)
            Profile.GENERATOR_STARTUP -> VibrationEffect.createWaveform(longArrayOf(0, 200, 150, 150, 100, 100, 80, 80, 60, 50), intArrayOf(0, 80, 0, 120, 0, 160, 0, 200, 0, 255), -1)
            Profile.DOOR_BREACH -> VibrationEffect.createWaveform(longArrayOf(0, 40, 100, 250), intArrayOf(0, 255, 0, 150), -1)
            Profile.SIREN_WAIL -> VibrationEffect.createWaveform(longArrayOf(0, 600, 600, 600, 600), intArrayOf(0, 150, 255, 150, 255), -1)
            Profile.KEYSTROKE_MECHANICAL -> VibrationEffect.createWaveform(longArrayOf(0, 15, 10, 10), intArrayOf(0, 200, 0, 100), -1)
            Profile.FOOTSTEP_CONCRETE -> VibrationEffect.createWaveform(longArrayOf(0, 25, 400, 25, 400), intArrayOf(0, 120, 0, 120, 0), -1)
            Profile.GLASS_SHATTER -> VibrationEffect.createWaveform(longArrayOf(0, 40, 20, 20, 10, 20, 10), intArrayOf(0, 255, 0, 200, 0, 150, 0), -1)
            Profile.FLASHLIGHT_TOGGLE -> VibrationEffect.createWaveform(longArrayOf(0, 15, 80, 15), intArrayOf(0, 220, 0, 100), -1)
            Profile.WIRE_SPARK -> VibrationEffect.createWaveform(longArrayOf(0, 5, 40, 10, 20, 5), intArrayOf(0, 255, 0, 200, 0, 150), -1)
            Profile.LOCKPICK_TENSION -> VibrationEffect.createWaveform(longArrayOf(0, 250), intArrayOf(0, 60), -1)
            Profile.LOCKPICK_SUCCESS -> VibrationEffect.createWaveform(longArrayOf(0, 30, 30, 40), intArrayOf(0, 120, 0, 255), -1)
            Profile.LOCKPICK_FAIL -> VibrationEffect.createWaveform(longArrayOf(0, 60, 20, 60), intArrayOf(0, 220, 0, 120), -1)
            Profile.WATER_DRIP -> VibrationEffect.createWaveform(longArrayOf(0, 10, 800, 10), intArrayOf(0, 60, 0, 40), -1)
            Profile.STORM_THUNDER -> VibrationEffect.createWaveform(longArrayOf(0, 80, 50, 250, 100, 400), intArrayOf(0, 180, 0, 255, 80, 150), -1)
            Profile.METRO_RUMBLE -> VibrationEffect.createWaveform(longArrayOf(0, 500, 500, 500, 500), intArrayOf(0, 100, 120, 140, 100), -1)
            Profile.PULSE_FLATLINE -> VibrationEffect.createWaveform(longArrayOf(0, 2000), intArrayOf(0, 255), -1)
            Profile.UI_NEOMORPHIC_TAP -> VibrationEffect.createWaveform(longArrayOf(0, 12), intArrayOf(0, 150), -1)
            Profile.UI_NEOMORPHIC_ELEVATE -> VibrationEffect.createWaveform(longArrayOf(0, 20), intArrayOf(0, 100), -1)
        }

        vibrator.vibrate(effect)
    }
}

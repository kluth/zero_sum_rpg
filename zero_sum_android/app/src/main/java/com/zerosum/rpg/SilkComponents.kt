package com.zerosum.rpg

import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.content.Context
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.waitForUpOrCancellation
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Silk Colors
val SilkIndigo = Color(0xFF6366f1)
val SilkCoolGray = Color(0xFFe8eaf0)
val SilkShadowLight = Color(0xFFffffff)
val SilkShadowDark = Color(0xFFb8b9be)
val SilkDarkIndigo = Color(0xFF4338ca)

fun Modifier.neumorphic(
    isPressed: Boolean = false,
    cornerRadius: Dp = 12.dp,
    lightShadowColor: Color = SilkShadowLight,
    darkShadowColor: Color = SilkShadowDark
) = this.drawBehind {
    drawIntoCanvas { canvas ->
        val paint = Paint()
        val frameworkPaint = paint.asFrameworkPaint()
        val blurRadius = 15.dp.toPx()
        val offset = if (isPressed) 2.dp.toPx() else 8.dp.toPx()

        if (!isPressed) {
            // Light shadow (top left)
            frameworkPaint.color = android.graphics.Color.TRANSPARENT
            frameworkPaint.setShadowLayer(blurRadius, -offset, -offset, lightShadowColor.toArgb())
            canvas.drawRoundRect(
                left = 0f, top = 0f, right = size.width, bottom = size.height,
                radiusX = cornerRadius.toPx(), radiusY = cornerRadius.toPx(), paint = paint
            )

            // Dark shadow (bottom right)
            frameworkPaint.setShadowLayer(blurRadius, offset, offset, darkShadowColor.toArgb())
            canvas.drawRoundRect(
                left = 0f, top = 0f, right = size.width, bottom = size.height,
                radiusX = cornerRadius.toPx(), radiusY = cornerRadius.toPx(), paint = paint
            )
        } else {
            // Inset shadow simulation (a bit darker background)
            frameworkPaint.setShadowLayer(blurRadius, 0f, 0f, darkShadowColor.toArgb())
            canvas.drawRoundRect(
                left = 0f, top = 0f, right = size.width, bottom = size.height,
                radiusX = cornerRadius.toPx(), radiusY = cornerRadius.toPx(), paint = paint
            )
        }
    }
}

@Composable
fun SilkButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isCritical: Boolean = false
) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(if (isPressed) 0.95f else 1.0f)
    val context = LocalContext.current

    Box(
        modifier = modifier
            .scale(scale)
            .clip(RoundedCornerShape(12.dp))
            .background(if (isPressed) SilkCoolGray.copy(alpha = 0.9f) else SilkCoolGray)
            .neumorphic(isPressed = isPressed)
            .pointerInput(Unit) {
                while (true) {
                    awaitPointerEventScope {
                        awaitFirstDown(false)
                        isPressed = true
                        triggerHaptic(context, isCritical)
                        waitForUpOrCancellation()
                        isPressed = false
                        onClick()
                    }
                }
            }
            .padding(horizontal = 24.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text.uppercase(),
            color = if (isCritical) Color.Red else SilkIndigo,
            fontSize = 14.sp,
            letterSpacing = 2.sp
        )
    }
}

fun triggerHaptic(context: Context, isCritical: Boolean = false) {
    val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        vibratorManager.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        if (isCritical) {
            val timings = longArrayOf(0, 50, 50, 50)
            val amplitudes = intArrayOf(0, 255, 0, 255)
            vibrator.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
        } else {
            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK))
        }
    } else {
        @Suppress("DEPRECATION")
        vibrator.vibrate(if (isCritical) 200 else 50)
    }
}

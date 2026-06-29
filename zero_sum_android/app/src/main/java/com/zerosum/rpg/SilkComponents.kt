package com.zerosum.rpg

import android.content.Context
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.Spring
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.waitForUpOrCancellation
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight

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
    darkShadowColor: Color = SilkShadowDark,
    elevation: Dp = 6.dp
): Modifier = composed {
    val offset by animateDpAsState(
        targetValue = if (isPressed) 1.dp else elevation,
        animationSpec = spring(dampingRatio = 0.8f, stiffness = 300f),
        label = "shadowOffset"
    )
    val blur by animateDpAsState(
        targetValue = if (isPressed) 2.dp else elevation * 2,
        animationSpec = spring(dampingRatio = 0.8f, stiffness = 300f),
        label = "shadowBlur"
    )

    this.drawBehind {
        drawIntoCanvas { canvas ->
            val paint = Paint()
            val frameworkPaint = paint.asFrameworkPaint()
            val blurPx = blur.toPx()
            val offsetPx = offset.toPx()
            
            if (blurPx > 0f) {
                if (!isPressed) {
                    // DROP SHADOW (Raised)
                    // Light shadow (top-left)
                    frameworkPaint.color = android.graphics.Color.TRANSPARENT
                    frameworkPaint.setShadowLayer(blurPx, -offsetPx, -offsetPx, lightShadowColor.toArgb())
                    canvas.drawRoundRect(
                        left = 0f, top = 0f, right = size.width, bottom = size.height,
                        radiusX = cornerRadius.toPx(), radiusY = cornerRadius.toPx(), paint = paint
                    )
    
                    // Dark shadow (bottom-right)
                    frameworkPaint.setShadowLayer(blurPx, offsetPx, offsetPx, darkShadowColor.toArgb())
                    canvas.drawRoundRect(
                        left = 0f, top = 0f, right = size.width, bottom = size.height,
                        radiusX = cornerRadius.toPx(), radiusY = cornerRadius.toPx(), paint = paint
                    )
                } else {
                    // INNER SHADOW (Inset)
                    // For a true inset shadow without complex clipping, we draw soft strokes inside the bounds.
                    val strokeWidth = offsetPx * 2f
                    
                    // Dark inner shadow (top-left)
                    val darkPaint = Paint().apply {
                        color = darkShadowColor.copy(alpha = 0.5f)
                        style = androidx.compose.ui.graphics.PaintingStyle.Stroke
                        this.strokeWidth = strokeWidth
                        asFrameworkPaint().apply {
                            setShadowLayer(blurPx, offsetPx, offsetPx, darkShadowColor.toArgb())
                        }
                    }
                    
                    // Light inner shadow (bottom-right)
                    val lightPaint = Paint().apply {
                        color = lightShadowColor.copy(alpha = 0.5f)
                        style = androidx.compose.ui.graphics.PaintingStyle.Stroke
                        this.strokeWidth = strokeWidth
                        asFrameworkPaint().apply {
                            setShadowLayer(blurPx, -offsetPx, -offsetPx, lightShadowColor.toArgb())
                        }
                    }

                    // Clip to exact shape to prevent bleeding outside
                    val clipPath = androidx.compose.ui.graphics.Path().apply {
                        addRoundRect(androidx.compose.ui.geometry.RoundRect(0f, 0f, size.width, size.height, androidx.compose.ui.geometry.CornerRadius(cornerRadius.toPx(), cornerRadius.toPx())))
                    }
                    
                    canvas.save()
                    canvas.clipPath(clipPath)
                    
                    // Draw strokes offset so their shadow falls *inside* the view
                    canvas.drawRoundRect(
                        left = -strokeWidth, top = -strokeWidth, right = size.width + strokeWidth, bottom = size.height + strokeWidth,
                        radiusX = cornerRadius.toPx(), radiusY = cornerRadius.toPx(), paint = darkPaint
                    )
                    
                    canvas.drawRoundRect(
                        left = -strokeWidth, top = -strokeWidth, right = size.width + strokeWidth, bottom = size.height + strokeWidth,
                        radiusX = cornerRadius.toPx(), radiusY = cornerRadius.toPx(), paint = lightPaint
                    )
                    
                    canvas.restore()
                }
            }
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
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.94f else 1.0f,
        animationSpec = spring(dampingRatio = 0.6f, stiffness = Spring.StiffnessMedium),
        label = "buttonScale"
    )
    
    val context = LocalContext.current
    val hapticEngine = remember { EngineProvider.getHaptic(context) }
    val audioEngine = remember { EngineProvider.getAudio(context) }

    var finalModifier = modifier
        .scale(scale)
        .neumorphic(isPressed = isPressed, cornerRadius = 12.dp)
        .clip(RoundedCornerShape(12.dp))
        .background(SilkCoolGray)
        
    if (isCritical) {
        finalModifier = finalModifier.neumorphicBreathing()
    }

    Box(
        modifier = finalModifier
            .pointerInput(Unit) {
                while (true) {
                    awaitPointerEventScope {
                        awaitFirstDown(false)
                        isPressed = true
                        hapticEngine.play(if (isCritical) HapticEngine.Profile.HEARTBEAT_CRITICAL else HapticEngine.Profile.UI_NEOMORPHIC_TAP)
                        audioEngine.play(if (isCritical) AudioEngine.Profile.ERROR_CRITICAL else AudioEngine.Profile.GEIGER_COUNTER_CLICK)
                        
                        val up = waitForUpOrCancellation()
                        isPressed = false
                        if (up != null) {
                            hapticEngine.play(HapticEngine.Profile.ANALOG_CLICK)
                            onClick()
                        }
                    }
                }
            }
            .padding(horizontal = 24.dp, vertical = 14.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text.uppercase(),
            color = if (isCritical) Color(0xFFD32F2F) else SilkDarkIndigo,
            fontSize = 14.sp,
            letterSpacing = 2.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

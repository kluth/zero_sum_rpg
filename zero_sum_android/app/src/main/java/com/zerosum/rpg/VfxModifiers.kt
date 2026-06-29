package com.zerosum.rpg

import androidx.compose.animation.core.*
import androidx.compose.foundation.ScrollState
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.graphics.graphicsLayer
import kotlinx.coroutines.delay
import kotlin.random.Random

val ThemeCoolGray = Color(0xFFE8EAF0)
val ThemeIndigo = Color(0xFF6366F1)
val ThemeViolet = Color(0xFF7C3AED)
val ShadowLight = Color(0xFFFFFFFF)
val ShadowDark = Color(0xFFB8BCC8)

// 1. Neumorphic Raised (Premium)
fun Modifier.neumorphicRaised(elevation: Float = 8f) = this.graphicsLayer {
    shadowElevation = elevation
    ambientShadowColor = ShadowDark
    spotShadowColor = ShadowDark
}

// 2. Neumorphic Inset (Premium realistic depth)
fun Modifier.neumorphicInset() = this.drawWithContent {
    drawContent()
    drawRect(
        brush = Brush.linearGradient(
            colors = listOf(ShadowDark.copy(alpha = 0.6f), Color.Transparent, ShadowLight.copy(alpha = 0.8f)),
            start = Offset.Zero,
            end = Offset(size.width, size.height)
        )
    )
}

// 3. Neumorphic Breathing
fun Modifier.neumorphicBreathing(): Modifier = composed {
    val infiniteTransition = rememberInfiniteTransition(label = "breathing")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.0f,
        targetValue = 0.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "breathingAlpha"
    )
    this.drawWithContent {
        drawContent()
        drawRect(
            brush = Brush.radialGradient(
                colors = listOf(Color.Red.copy(alpha = alpha), Color.Transparent),
                center = Offset(size.width / 2, size.height / 2),
                radius = size.width
            )
        )
    }
}

// 4. Analog Wobble (Structural vibration/shaking instead of glitch)
fun Modifier.analogWobble(isShaking: Boolean, intensity: Float = 4f): Modifier = composed {
    val infiniteTransition = rememberInfiniteTransition(label = "wobble")
    val offsetX by infiniteTransition.animateFloat(
        initialValue = -intensity,
        targetValue = intensity,
        animationSpec = infiniteRepeatable(
            animation = tween(40, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "wobbleX"
    )
    val offsetY by infiniteTransition.animateFloat(
        initialValue = -intensity * 0.5f,
        targetValue = intensity * 0.5f,
        animationSpec = infiniteRepeatable(
            animation = tween(60, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "wobbleY"
    )
    if (isShaking) {
        this.graphicsLayer {
            translationX = offsetX
            translationY = offsetY
            rotationZ = offsetX * 0.05f
        }
    } else {
        this
    }
}

// 5. Radio Interference Noise (Real-world screen disruption)
fun Modifier.radioInterferenceNoise(isActive: Boolean): Modifier = composed {
    var noiseOffset by remember { mutableFloatStateOf(0f) }
    LaunchedEffect(isActive) {
        while(isActive) {
            noiseOffset = Random.nextFloat() * 100f
            delay(50)
        }
    }
    this.drawWithContent {
        drawContent()
        if (isActive) {
            val scanlineHeight = 10f
            var y = noiseOffset % (scanlineHeight * 2)
            while (y < size.height) {
                drawRect(
                    color = Color.White.copy(alpha = 0.03f),
                    topLeft = Offset(0f, y),
                    size = Size(size.width, scanlineHeight)
                )
                y += scanlineHeight * 2
            }
        }
    }
}

// 6. Parallax Shadow
fun Modifier.parallaxShadow(scrollState: ScrollState, depth: Float = 0.5f): Modifier = this.graphicsLayer {
    val offset = scrollState.value * depth
    translationY = -offset * 0.1f
    shadowElevation = 8f + (offset * 0.05f).coerceIn(0f, 20f)
}

// 7. Power Surge Flicker (Infrastructure failure)
fun Modifier.powerSurgeFlicker(trigger: Boolean): Modifier = composed {
    val surgeAlpha = remember { Animatable(0f) }
    LaunchedEffect(trigger) {
        if (trigger) {
            surgeAlpha.animateTo(0.6f, tween(50))
            surgeAlpha.animateTo(0.1f, tween(100))
            surgeAlpha.animateTo(0.4f, tween(50))
            surgeAlpha.animateTo(0f, tween(300))
        }
    }
    this.drawWithContent {
        drawContent()
        if (surgeAlpha.value > 0f) {
            drawRect(ThemeCoolGray.copy(alpha = surgeAlpha.value), blendMode = BlendMode.Lighten)
        }
    }
}

// 8. Crisis Vignette
fun Modifier.crisisVignette(intensity: Float = 0.6f): Modifier = this.drawWithContent {
    drawContent()
    drawRect(
        brush = Brush.radialGradient(
            colors = listOf(Color.Transparent, Color.Black.copy(alpha = intensity)),
            center = Offset(size.width / 2, size.height / 2),
            radius = size.width * 0.9f
        )
    )
}

// 9. Heartbeat Pulse (Adrenaline/Tension)
fun Modifier.heartbeatPulse(): Modifier = composed {
    val infiniteTransition = rememberInfiniteTransition(label = "heartbeat")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.03f,
        animationSpec = infiniteRepeatable(
            animation = keyframes {
                durationMillis = 1200
                1f at 0
                1.02f at 150
                1f at 300
                1.03f at 450
                1f at 600
            }
        ),
        label = "heartbeatScale"
    )
    this.graphicsLayer {
        scaleX = scale
        scaleY = scale
    }
}

// 10. Physical Impact Flash
fun Modifier.physicalImpactFlash(isDamaged: Boolean): Modifier = composed {
    val flashAlpha = remember { Animatable(0f) }
    LaunchedEffect(isDamaged) {
        if (isDamaged) {
            flashAlpha.animateTo(0.4f, tween(40))
            flashAlpha.animateTo(0f, tween(300, easing = FastOutSlowInEasing))
        }
    }
    this.drawWithContent {
        drawContent()
        if (flashAlpha.value > 0f) {
            drawRect(Color(0xFF8B0000).copy(alpha = flashAlpha.value)) // Deep blood red
        }
    }
}

// 11. Low Power Dimming (Real-world battery drain)
fun Modifier.lowPowerDimming(batteryLevel: Float): Modifier = this.drawWithContent {
    drawContent()
    if (batteryLevel < 0.2f) {
        val dimAlpha = ((0.2f - batteryLevel) * 3f).coerceIn(0f, 0.7f)
        drawRect(Color.Black.copy(alpha = dimAlpha))
    }
}

// 12. Heavy Breathing (Fatigue/Stress camera movement)
fun Modifier.heavyBreathingCam(isExhausted: Boolean): Modifier = composed {
    val infiniteTransition = rememberInfiniteTransition(label = "exhausted")
    val offsetY by infiniteTransition.animateFloat(
        initialValue = -2f,
        targetValue = 4f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "exhaustedY"
    )
    if (isExhausted) {
        this.graphicsLayer { translationY = offsetY }
    } else {
        this
    }
}

// 13. Rubble Dust Overlay (Environmental hazard)
fun Modifier.rubbleDustOverlay(): Modifier = composed {
    var dustOffset by remember { mutableFloatStateOf(0f) }
    LaunchedEffect(Unit) {
        val anim = Animatable(0f)
        anim.animateTo(2000f, infiniteRepeatable(tween(30000, easing = LinearEasing))) {
            dustOffset = value
        }
    }
    this.drawWithContent {
        drawContent()
        val rnd = kotlin.random.Random(42)
        for (i in 0..60) {
            val x = (rnd.nextFloat() * size.width + (dustOffset * rnd.nextFloat())) % size.width
            val y = (rnd.nextFloat() * size.height + dustOffset) % size.height
            val alpha = (rnd.nextFloat() * 0.3f).coerceAtMost(1f)
            drawCircle(
                color = Color(0xFF6B655B).copy(alpha = alpha), // Ash/Dust color
                radius = rnd.nextFloat() * 3f + 1f,
                center = Offset(x, y)
            )
        }
    }
}

// 14. Emergency Strobe (Ambulance/Police lights reflection)
fun Modifier.emergencyStrobe(isActive: Boolean): Modifier = composed {
    val infiniteTransition = rememberInfiniteTransition(label = "strobe")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 0.25f,
        animationSpec = infiniteRepeatable(
            animation = keyframes {
                durationMillis = 800
                0f at 0
                0.25f at 50
                0f at 100
                0.25f at 150
                0f at 200
                0f at 800
            }
        ),
        label = "strobeAlpha"
    )
    this.drawWithContent {
        drawContent()
        if (isActive) {
            // Blue and Red alternate reflection
            drawRect(
                brush = Brush.verticalGradient(
                    colors = listOf(Color.Blue.copy(alpha = alpha * 0.5f), Color.Red.copy(alpha = alpha))
                ),
                blendMode = BlendMode.Lighten
            )
        }
    }
}

// 15. Blackout Fade
fun Modifier.blackoutFade(isBlackout: Boolean): Modifier = composed {
    val alpha by animateFloatAsState(
        targetValue = if (isBlackout) 1f else 0f,
        animationSpec = tween(3000, easing = FastOutSlowInEasing),
        label = "blackoutAlpha"
    )
    this.drawWithContent {
        drawContent()
        if (alpha > 0f) {
            drawRect(Color.Black.copy(alpha = alpha))
        }
    }
}

package com.zerosum.rpg

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.keyframes
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.ScrollState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import kotlin.random.Random

val ThemeCoolGray = Color(0xFFE8EAF0)
val ThemeIndigo = Color(0xFF6366F1)
val ThemeViolet = Color(0xFF7C3AED)
val ShadowLight = Color(0xFFFFFFFF)
val ShadowDark = Color(0xFFB8BCC8)

// 1. Neumorphic Raised
fun Modifier.neumorphicRaised(elevation: Float = 8f) = this.graphicsLayer {
    shadowElevation = elevation
    ambientShadowColor = ShadowDark
    spotShadowColor = ShadowDark
}

// 2. Neumorphic Inset
fun Modifier.neumorphicInset() = this.drawWithContent {
    drawContent()
    drawRect(
        brush = Brush.linearGradient(
            colors = listOf(ShadowDark.copy(alpha = 0.5f), Color.Transparent, ShadowLight.copy(alpha = 0.5f)),
            start = Offset.Zero,
            end = Offset(size.width, size.height)
        )
    )
}

// 3. Neumorphic Breathing
fun Modifier.neumorphicBreathing(): Modifier = composed {
    val infiniteTransition = rememberInfiniteTransition(label = "breathing")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.8f,
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
                colors = listOf(ThemeIndigo.copy(alpha = alpha * 0.2f), Color.Transparent),
                center = Offset(size.width / 2, size.height / 2),
                radius = size.width
            )
        )
    }
}

// 4. Screen Shake
fun Modifier.screenShake(isShaking: Boolean, intensity: Float = 15f): Modifier = composed {
    val infiniteTransition = rememberInfiniteTransition(label = "shake")
    val offsetX by infiniteTransition.animateFloat(
        initialValue = -intensity,
        targetValue = intensity,
        animationSpec = infiniteRepeatable(
            animation = tween(50, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "shakeX"
    )
    val offsetY by infiniteTransition.animateFloat(
        initialValue = -intensity,
        targetValue = intensity,
        animationSpec = infiniteRepeatable(
            animation = tween(70, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "shakeY"
    )
    if (isShaking) {
        this.graphicsLayer {
            translationX = offsetX
            translationY = offsetY
        }
    } else {
        this
    }
}

// 5. CRT Scanlines
fun Modifier.crtScanlines(): Modifier = this.drawWithContent {
    drawContent()
    val scanlineHeight = 4f
    var y = 0f
    while (y < size.height) {
        drawRect(
            color = Color.Black.copy(alpha = 0.1f),
            topLeft = Offset(0f, y),
            size = Size(size.width, scanlineHeight / 2)
        )
        y += scanlineHeight
    }
}

// 6. CRT Flicker
fun Modifier.crtFlicker(): Modifier = composed {
    var alpha by remember { mutableFloatStateOf(1f) }
    LaunchedEffect(Unit) {
        while (true) {
            alpha = if (Random.nextFloat() > 0.95f) Random.nextFloat() * 0.5f + 0.5f else 1f
            delay(Random.nextLong(50, 200))
        }
    }
    this.graphicsLayer { this.alpha = alpha }
}

// 7. Glitch Displacement
fun Modifier.glitchDisplacement(isGlitching: Boolean): Modifier = composed {
    var shift by remember { mutableFloatStateOf(0f) }
    var sliceY by remember { mutableFloatStateOf(0f) }
    
    LaunchedEffect(isGlitching) {
        while (isGlitching) {
            shift = (Random.nextFloat() - 0.5f) * 20f
            sliceY = Random.nextFloat()
            delay(Random.nextLong(50, 150))
        }
        shift = 0f
    }
    
    this.drawWithContent {
        if (isGlitching && shift != 0f) {
            val sliceHeight = size.height * 0.1f
            val yPos = sliceY * size.height
            clipRect(top = 0f, bottom = yPos) {
                this@drawWithContent.drawContent()
            }
            clipRect(top = yPos, bottom = yPos + sliceHeight) {
                translate(left = shift, top = 0f) {
                    this@drawWithContent.drawContent()
                }
            }
            clipRect(top = yPos + sliceHeight, bottom = size.height) {
                this@drawWithContent.drawContent()
            }
        } else {
            drawContent()
        }
    }
}

// 8. Parallax Shadow
fun Modifier.parallaxShadow(scrollState: ScrollState, depth: Float = 0.5f): Modifier = this.graphicsLayer {
    val offset = scrollState.value * depth
    translationY = -offset * 0.1f
    shadowElevation = 8f + (offset * 0.05f).coerceIn(0f, 20f)
}

// 9. Power Surge Flicker
fun Modifier.powerSurgeFlicker(trigger: Boolean): Modifier = composed {
    val surgeAlpha = remember { Animatable(0f) }
    LaunchedEffect(trigger) {
        if (trigger) {
            surgeAlpha.animateTo(0.8f, tween(100))
            surgeAlpha.animateTo(0f, tween(500))
        }
    }
    this.drawWithContent {
        drawContent()
        if (surgeAlpha.value > 0f) {
            drawRect(ThemeCoolGray.copy(alpha = surgeAlpha.value))
        }
    }
}

// 10. CCTV Static Noise
fun Modifier.cctvStaticNoise(): Modifier = composed {
    var noiseSeed by remember { mutableIntStateOf(0) }
    LaunchedEffect(Unit) {
        while(true) {
            noiseSeed = Random.nextInt()
            delay(100)
        }
    }
    this.drawWithContent {
        drawContent()
        val rnd = kotlin.random.Random(noiseSeed)
        for (i in 0..100) {
            val x = rnd.nextFloat() * size.width
            val y = rnd.nextFloat() * size.height
            drawCircle(
                color = Color.Black.copy(alpha = 0.2f),
                radius = 2f,
                center = Offset(x, y)
            )
        }
    }
}

// 11. Crisis Vignette
fun Modifier.crisisVignette(intensity: Float = 0.8f): Modifier = this.drawWithContent {
    drawContent()
    drawRect(
        brush = Brush.radialGradient(
            colors = listOf(Color.Transparent, Color.Black.copy(alpha = intensity)),
            center = Offset(size.width / 2, size.height / 2),
            radius = size.width * 0.7f
        )
    )
}

// 12. Heartbeat Pulse
fun Modifier.heartbeatPulse(): Modifier = composed {
    val infiniteTransition = rememberInfiniteTransition(label = "heartbeat")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = keyframes {
                durationMillis = 1000
                1f at 0
                1.05f at 150
                1f at 300
                1.05f at 450
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

// 13. Damage Flash
fun Modifier.damageFlash(isDamaged: Boolean): Modifier = composed {
    val flashAlpha = remember { Animatable(0f) }
    LaunchedEffect(isDamaged) {
        if (isDamaged) {
            flashAlpha.animateTo(0.6f, tween(50))
            flashAlpha.animateTo(0f, tween(400))
        }
    }
    this.drawWithContent {
        drawContent()
        if (flashAlpha.value > 0f) {
            drawRect(Color.Red.copy(alpha = flashAlpha.value))
        }
    }
}

// 14. Low Battery Dimming
fun Modifier.lowBatteryDimming(batteryLevel: Float): Modifier = this.drawWithContent {
    drawContent()
    if (batteryLevel < 0.2f) {
        val dimAlpha = (0.2f - batteryLevel) * 4f
        drawRect(Color.Black.copy(alpha = dimAlpha.coerceIn(0f, 0.8f)))
    }
}

// 15. Data Corruption Stutter
fun Modifier.dataCorruptionStutter(isCorrupted: Boolean): Modifier = composed {
    var offsetX by remember { mutableFloatStateOf(0f) }
    LaunchedEffect(isCorrupted) {
        while(isCorrupted) {
            offsetX = if (Random.nextBoolean()) 10f else -10f
            delay(Random.nextLong(20, 80))
            offsetX = 0f
            delay(Random.nextLong(200, 1000))
        }
        offsetX = 0f
    }
    this.graphicsLayer {
        translationX = offsetX
    }
}

// 16. Chromatic Aberration
fun Modifier.chromaticAberration(intensity: Float = 2f): Modifier = this.drawWithContent {
    translate(left = -intensity) {
        this@drawWithContent.drawContent()
        drawRect(Color.Red.copy(alpha = 0.1f), blendMode = BlendMode.Color)
    }
    translate(left = intensity) {
        this@drawWithContent.drawContent()
        drawRect(Color.Blue.copy(alpha = 0.1f), blendMode = BlendMode.Color)
    }
    this@drawWithContent.drawContent()
}

// 17. CCTV Lens Distortion
fun Modifier.cctvLensDistortion(): Modifier = this.graphicsLayer {
    scaleX = 1.02f
    scaleY = 1.02f
    rotationZ = 0.5f
}

// 18. Rubble Dust Overlay
fun Modifier.rubbleDustOverlay(): Modifier = composed {
    var dustOffset by remember { mutableFloatStateOf(0f) }
    LaunchedEffect(Unit) {
        val anim = Animatable(0f)
        anim.animateTo(1000f, infiniteRepeatable(tween(20000, easing = LinearEasing))) {
            dustOffset = value
        }
    }
    this.drawWithContent {
        drawContent()
        val rnd = kotlin.random.Random(42)
        for (i in 0..50) {
            val x = (rnd.nextFloat() * size.width + dustOffset) % size.width
            val y = (rnd.nextFloat() * size.height + dustOffset) % size.height
            drawCircle(
                color = Color(0xFF888888).copy(alpha = 0.4f),
                radius = rnd.nextFloat() * 4f,
                center = Offset(x, y)
            )
        }
    }
}

// 19. Emergency Strobe
fun Modifier.emergencyStrobe(isActive: Boolean): Modifier = composed {
    val infiniteTransition = rememberInfiniteTransition(label = "strobe")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 0.4f,
        animationSpec = infiniteRepeatable(
            animation = keyframes {
                durationMillis = 600
                0f at 0
                0.4f at 100
                0f at 200
                0f at 600
            }
        ),
        label = "strobeAlpha"
    )
    this.drawWithContent {
        drawContent()
        if (isActive) {
            drawRect(ThemeIndigo.copy(alpha = alpha))
        }
    }
}

// 20. Blackout Fade
fun Modifier.blackoutFade(isBlackout: Boolean): Modifier = composed {
    val alpha by animateFloatAsState(
        targetValue = if (isBlackout) 1f else 0f,
        animationSpec = tween(2000),
        label = "blackoutAlpha"
    )
    this.drawWithContent {
        drawContent()
        if (alpha > 0f) {
            drawRect(Color.Black.copy(alpha = alpha))
        }
    }
}

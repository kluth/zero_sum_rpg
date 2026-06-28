package com.zerosum.rpg

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.tween
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import kotlinx.coroutines.launch
import kotlinx.coroutines.isActive
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import android.os.Vibrator
import android.os.VibrationEffect
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import android.media.MediaRecorder
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.json.JSONObject
import kotlin.random.Random
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextFieldDefaults
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.content.Context
import androidx.compose.foundation.Canvas
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.selection.selectableGroup



val AcidGreen = Color(0xFF39FF14)
val DarkBackground = Color(0xFF0A0A0C)
val GlassBackground = Color(0x0500F0FF)
val ToughpadArmor = Color(0xFF1E211D)
val ArmorHighlight = Color(0xFF454B41)
val TerminalGreen = Color(0xFF4AF626)
val TerminalDark = Color(0xFF091F05)
val DangerRed = Color(0xFFFF2A00)
val WarningAmber = Color(0xFFFFB300)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val isTestLab = android.provider.Settings.System.getString(contentResolver, "firebase.test.lab") == "true"
        if (isTestLab) {
            NetworkManager.connect()
        } else {
            NetworkManager.connect("http://10.0.2.2:9000")
        }
        if (isTestLab) {
            NetworkManager.processIntent(PlayerIntent.JoinSession("TEST"))
        }
        
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = DarkBackground,
                    surface = DarkBackground,
                    primary = TerminalGreen,
                    secondary = WarningAmber
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    ZeroSumApp(isTestLab)
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        NetworkManager.disconnect()
    }
}

enum class AppScreen { LOBBY, GAME }

@Composable
fun ZeroSumApp(isTestLab: Boolean) {
    var currentScreen by remember { mutableStateOf(AppScreen.LOBBY) }
    var sessionId by remember { mutableStateOf("") }

    if (currentScreen == AppScreen.LOBBY) {
        LobbyScreen(
            onHost = {
                NetworkManager.processIntent(PlayerIntent.HostSession)
                sessionId = "HOSTING" // Normally would extract from state, simplified here
                currentScreen = AppScreen.GAME
            },
            onJoin = { pin ->
                NetworkManager.processIntent(PlayerIntent.JoinSession(pin))
                sessionId = pin
                currentScreen = AppScreen.GAME
            }
        )
    } else {
        GameScreen(sessionId)
    }
}

@Composable
fun LobbyScreen(onHost: () -> Unit, onJoin: (String) -> Unit) {
    var joinPin by remember { mutableStateOf("") }

    Column(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("ZERO SUM", color = TerminalGreen, fontSize = 48.sp, fontWeight = FontWeight.Bold, letterSpacing = 4.sp)
        Spacer(modifier = Modifier.height(64.dp))
        
        Button(
            onClick = onHost,
            colors = ButtonDefaults.buttonColors(containerColor = WarningAmber.copy(alpha = 0.2f)),
            modifier = Modifier.fillMaxWidth().height(64.dp).border(2.dp, WarningAmber, RoundedCornerShape(8.dp)),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("HOST NEW OPERATION", color = WarningAmber, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        Text("--- OR ---", color = Color.Gray, fontSize = 16.sp)
        Spacer(modifier = Modifier.height(32.dp))
        
        OutlinedTextField(
            value = joinPin,
            onValueChange = { joinPin = it.uppercase().take(6) },
            label = { Text("ENTER SESSION PIN", color = TerminalGreen) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = TerminalGreen,
                unfocusedBorderColor = TerminalGreen.copy(alpha = 0.5f),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = { if (joinPin.length >= 4) onJoin(joinPin) },
            colors = ButtonDefaults.buttonColors(containerColor = TerminalGreen.copy(alpha = 0.2f)),
            modifier = Modifier.fillMaxWidth().height(64.dp).border(2.dp, TerminalGreen, RoundedCornerShape(8.dp)),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("JOIN SQUAD", color = TerminalGreen, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
    }
}

@Composable
fun GameScreen(sessionId: String) {
    val context = androidx.compose.ui.platform.LocalContext.current
    var hasMicPermission by remember { 
        mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) 
    }
    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { hasMicPermission = it }
    
    val uiState by NetworkManager.uiState.collectAsStateWithLifecycle()
    val remainingData = uiState.dataLimit - uiState.dataUsed
    val isCritical = remainingData < 30f && remainingData > 0f
    val isBlackout = remainingData <= 0f
    
    val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    LaunchedEffect(isCritical) {
        if (isCritical) {
            while(isActive) {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(500, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    vibrator.vibrate(500)
                }
                delay(1000)
            }
        }
    }

    LaunchedEffect(Unit) {
        if (!hasMicPermission) {
            permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        }
        NetworkManager.resetState()
        val initialChar = CharacterState(
            id = "char_1",
            name = "MAX MUSTERMANN",
            role = "IT-TECHNIKER",
            stats = FlatStats(
                hp_current = 78,
                stealth_total = 85,
                stress_current = 60
            )
        )
        NetworkManager.processIntent(PlayerIntent.SetupInitialProfile(initialChar))
    }

    DisposableEffect(hasMicPermission) {
        var recorder: MediaRecorder? = null
        var job: kotlinx.coroutines.Job? = null
        if (hasMicPermission) {
            try {
                // Use the context constructor to fix deprecation
                recorder = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                    MediaRecorder(context)
                } else {
                    MediaRecorder()
                }.apply {
                    setAudioSource(MediaRecorder.AudioSource.MIC)
                    setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP)
                    setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB)
                    setOutputFile(context.cacheDir.absolutePath + "/devnull.3gp")
                    prepare()
                    start()
                }
                job = kotlinx.coroutines.CoroutineScope(Dispatchers.IO).launch {
                    var highAmplitudeCount = 0
                    while (isActive) {
                        delay(1000)
                        val maxAmplitude = recorder?.maxAmplitude ?: 0
                        if (maxAmplitude > 10000) {
                            highAmplitudeCount++
                            if (highAmplitudeCount >= 3) {
                                NetworkManager.incrementHeatLevel()
                                highAmplitudeCount = 0
                            }
                        } else {
                            highAmplitudeCount = 0
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        onDispose {
            job?.cancel()
            try {
                recorder?.stop()
                recorder?.release()
            } catch (e: Exception) { }
        }
    }
    
    val infiniteTransition = rememberInfiniteTransition()
    val flashAlpha by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 0.5f,
        animationSpec = infiniteRepeatable(
            animation = tween(500, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "CriticalFlash"
    )

    if (isBlackout) {
        SystemBlackoutScreen()
    } else {
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
            HeaderSection(sessionId, remainingData)
        Spacer(modifier = Modifier.height(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            CharacterSheetSection(modifier = Modifier.weight(1f))
            Spacer(modifier = Modifier.height(16.dp))
            Column(modifier = Modifier.weight(2f)) {
                DiceRollerSection(modifier = Modifier.weight(1f))
                Spacer(modifier = Modifier.height(16.dp))
                MapGeneratorSection(modifier = Modifier.weight(1.5f))
            }
            Spacer(modifier = Modifier.height(16.dp))
            RemoteCommsSection(modifier = Modifier.weight(1f))
        }
        }
    }
    
    if (isCritical && !isBlackout) {
        Box(modifier = Modifier.fillMaxSize().background(Color.Red.copy(alpha = flashAlpha)))
    }
}

@Composable
fun HeaderSection(sessionId: String, remainingData: Float) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(GlassBackground, RoundedCornerShape(8.dp))
            .border(1.dp, TerminalGreen.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text(
                text = "SURVIVAL OS",
                color = TerminalGreen,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("${remainingData.toInt()} MB", color = if (remainingData < 30f) Color.Red else Color.Cyan, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Button(
                    onClick = { NetworkManager.processIntent(PlayerIntent.ConsumeData(25f)) },
                    colors = ButtonDefaults.buttonColors(containerColor = TerminalGreen.copy(alpha = 0.2f)),
                    modifier = Modifier.height(32.dp).border(1.dp, TerminalGreen, RoundedCornerShape(4.dp)),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp)
                ) {
                    Text("-25MB (Sat-Link)", color = TerminalGreen, fontSize = 10.sp)
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("SESSION: $sessionId", color = Color.White, fontSize = 12.sp, modifier = Modifier.align(Alignment.CenterVertically))
        }
    }
}

@Composable
fun SystemBlackoutScreen() {
    Column(
        modifier = Modifier.fillMaxSize().background(Color(0xFF0A0A0C)).padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("SYSTEM BLACKOUT", color = Color.Red, fontSize = 36.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(16.dp))
        Text("0 MB VERBLEIBEND", color = Color.White, fontSize = 24.sp)
        Spacer(modifier = Modifier.height(32.dp))
        Text("OFFLINE: DIGITALER COLLAPSE", color = Color.Gray, fontSize = 16.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text("Keine Verbindung zum Grid. Autonome Systeme kompromittiert. PnP Analog-Modus aktiv.", color = Color.Gray, fontSize = 12.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
        Spacer(modifier = Modifier.height(64.dp))
        Button(
            onClick = { NetworkManager.processIntent(PlayerIntent.ConsumeData(-150f)) },
            colors = ButtonDefaults.buttonColors(containerColor = Color.Red.copy(alpha = 0.2f)),
            modifier = Modifier.fillMaxWidth().height(64.dp).border(2.dp, Color.Red, RoundedCornerShape(8.dp))
        ) {
            Text("ANALOGER REBOOT (Finde Offline-Server)", color = Color.Red, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun CharacterSheetSection(modifier: Modifier = Modifier) {
    val uiState by NetworkManager.uiState.collectAsStateWithLifecycle()
    val character = uiState.character
    val hp = character?.stats?.hp_current ?: 78
    val maxHp = 100
    
    var selectedClass by remember { mutableStateOf("IT-Techniker") }
    val classes = listOf("IT-Techniker", "Sanitäter", "Aktivist", "Journalist")
    
    val dataUsed = uiState.dataUsed
    val dataLimit = uiState.dataLimit
    
    val haptic = LocalHapticFeedback.current

    // Toughpad Chassis
    Box(
        modifier = modifier
            .fillMaxHeight()
            .background(ToughpadArmor, RoundedCornerShape(16.dp))
            .border(4.dp, ArmorHighlight, RoundedCornerShape(16.dp))
            .padding(12.dp)
    ) {
        // Inner Screen
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(TerminalDark, RoundedCornerShape(8.dp))
                .border(2.dp, TerminalGreen.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                .padding(16.dp)
        ) {
            // Screen Content
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "SYS.OS.MIL // OFFLINE",
                        fontFamily = FontFamily.Monospace,
                        color = TerminalGreen,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "UPLINK ERR",
                        fontFamily = FontFamily.Monospace,
                        color = DangerRed,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.background(DangerRed.copy(alpha = 0.2f)).padding(horizontal = 4.dp)
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                
                // DATA LIMIT
                Text(
                    text = "SECURE DATA CHUNK: ${String.format(java.util.Locale.US, "%.1f", dataUsed)}MB / ${dataLimit.toInt()}MB",
                    fontFamily = FontFamily.Monospace,
                    color = WarningAmber,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                LinearProgressIndicator(
                    progress = dataUsed / dataLimit,
                    modifier = Modifier.fillMaxWidth().height(16.dp).border(1.dp, WarningAmber),
                    color = WarningAmber,
                    trackColor = TerminalDark,
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // HP
                Text(
                    text = "OPERATOR VITAL SIGN (HP): $hp / $maxHp",
                    fontFamily = FontFamily.Monospace,
                    color = if (hp < 30) DangerRed else TerminalGreen,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                LinearProgressIndicator(
                    progress = hp.toFloat() / maxHp,
                    modifier = Modifier.fillMaxWidth().height(24.dp).border(1.dp, TerminalGreen),
                    color = if (hp < 30) DangerRed else TerminalGreen,
                    trackColor = TerminalDark,
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // CLASS SELECTOR
                Text(
                    text = "ASSIGNED ROLE (MOS):",
                    fontFamily = FontFamily.Monospace,
                    color = TerminalGreen,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                Column(modifier = Modifier.selectableGroup()) {
                    classes.forEach { className ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .background(if (selectedClass == className) TerminalGreen.copy(alpha = 0.2f) else Color.Transparent)
                                .border(1.dp, if (selectedClass == className) TerminalGreen else TerminalGreen.copy(alpha = 0.3f))
                                .padding(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = (selectedClass == className),
                                onClick = { 
                                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                    selectedClass = className 
                                },
                                colors = RadioButtonDefaults.colors(
                                    selectedColor = TerminalGreen,
                                    unselectedColor = TerminalGreen.copy(alpha = 0.5f)
                                )
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = className.uppercase(),
                                fontFamily = FontFamily.Monospace,
                                color = if (selectedClass == className) TerminalGreen else TerminalGreen.copy(alpha = 0.7f),
                                fontWeight = if (selectedClass == className) FontWeight.Bold else FontWeight.Normal,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.weight(1f))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Button(
                        onClick = {
                            NetworkManager.processIntent(PlayerIntent.EmergencyHeal(25))
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = TerminalDark),
                        modifier = Modifier.weight(1f).border(1.dp, TerminalGreen, RoundedCornerShape(4.dp)),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text("MEDKIT (+25)", color = TerminalGreen, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            NetworkManager.pullData(10f)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = TerminalDark),
                        modifier = Modifier.weight(1f).border(1.dp, WarningAmber, RoundedCornerShape(4.dp)),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text("PULL DATA", color = WarningAmber, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                    }
                }
            }
            
            // Overlays (Cracked Screen & Scanlines)
            Spacer(modifier = Modifier.fillMaxSize().drawWithCache {
                val path1 = Path().apply {
                    moveTo(size.width * 0.8f, 0f)
                    lineTo(size.width * 0.7f, size.height * 0.3f)
                    lineTo(size.width * 0.9f, size.height * 0.5f)
                    lineTo(size.width * 0.6f, size.height * 0.8f)
                    lineTo(size.width * 0.75f, size.height)
                }
                val path2 = Path().apply {
                    moveTo(size.width * 0.7f, size.height * 0.3f)
                    lineTo(size.width * 0.3f, size.height * 0.4f)
                    lineTo(0f, size.height * 0.35f)
                }
                val path3 = Path().apply {
                    moveTo(size.width * 0.6f, size.height * 0.8f)
                    lineTo(size.width * 0.4f, size.height)
                }
                val barHeight = 2.dp.toPx()
                val gap = 4.dp.toPx()

                onDrawBehind {
                    drawPath(path = path1, color = Color.White.copy(alpha = 0.15f), style = Stroke(width = 3f))
                    drawPath(path = path2, color = Color.White.copy(alpha = 0.1f), style = Stroke(width = 2f))
                    drawPath(path = path3, color = Color.White.copy(alpha = 0.1f), style = Stroke(width = 1.5f))
                    
                    var y = 0f
                    while (y < size.height) {
                        drawRect(
                            color = Color.Black.copy(alpha = 0.1f),
                            topLeft = Offset(0f, y),
                            size = Size(size.width, barHeight)
                        )
                        y += barHeight + gap
                    }
                }
            })
        }
        
        // Screws in the corners of the chassis
        val screwColor = Color(0xFF111111)
        val screwRadius = 6.dp
        Box(modifier = Modifier.align(Alignment.TopStart).padding(4.dp).size(screwRadius * 2).background(screwColor, CircleShape))
        Box(modifier = Modifier.align(Alignment.TopEnd).padding(4.dp).size(screwRadius * 2).background(screwColor, CircleShape))
        Box(modifier = Modifier.align(Alignment.BottomStart).padding(4.dp).size(screwRadius * 2).background(screwColor, CircleShape))
        Box(modifier = Modifier.align(Alignment.BottomEnd).padding(4.dp).size(screwRadius * 2).background(screwColor, CircleShape))
    }
}

@Composable
fun StatBar(label: String, current: Int, max: Int, color: Color) {
    Column {
        Text(label, color = color, fontSize = 16.sp, fontWeight = FontWeight.Black, letterSpacing = 2.sp)
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(30.dp)
                .background(Color.Black)
                .border(2.dp, color.copy(alpha = 0.5f))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(current.toFloat() / max.toFloat())
                    .fillMaxHeight()
                    .background(color)
            )
        }
        Text("$current/$max", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold, modifier = Modifier.align(Alignment.End))
    }
}

@Composable
fun DiceRollerSection(modifier: Modifier = Modifier) {
    val uiState by NetworkManager.uiState.collectAsStateWithLifecycle()
    val mapState = uiState.map

    val coroutineScope = rememberCoroutineScope()
    val haptic = LocalHapticFeedback.current
    var isCalculating by remember { mutableStateOf(false) }
    var snrResult by remember { mutableStateOf<String?>(null) }
    var acousticRange by remember { mutableStateOf<String?>(null) }
    var raycastMaterial by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = modifier
            .fillMaxHeight()
            .background(GlassBackground, RoundedCornerShape(8.dp))
            .border(1.dp, TerminalGreen.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("ACOUSTIC PHYSICS & SNR CALC", color = Color.Gray, fontSize = 12.sp, modifier = Modifier.align(Alignment.Start))
        
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                if (snrResult != null) {
                    Text("SNR: $snrResult", color = TerminalGreen, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("AUDIBLE RANGE: $acousticRange", color = WarningAmber, fontSize = 14.sp)
                    Text("RAYCAST HIT: $raycastMaterial", color = Color.Gray, fontSize = 12.sp)
                } else {
                    Text("WAITING FOR SIGNAL", color = Color.DarkGray, fontSize = 18.sp)
                }
            }
        }
        
        Button(
            onClick = {
                if (isCalculating) return@Button
                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                coroutineScope.launch {
                    isCalculating = true
                    delay(300)
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    
                    val mapMaterials = mapState?.grid?.map { it.material }?.distinct()?.filter { it != "None" && it.isNotEmpty() } ?: emptyList()
                    val actualMaterial = if (mapMaterials.isNotEmpty()) {
                        mapMaterials.random()
                    } else {
                        "Concrete"
                    }
                    
                    val dropOff = when (actualMaterial.lowercase()) {
                        "drywall" -> 3
                        "concrete" -> 15
                        "glass" -> 2
                        else -> 5
                    }
                    
                    raycastMaterial = "$actualMaterial (-${dropOff}dB)"

                    val ambientDb = Random.nextInt(40, 60)
                    val gunshotDb = 140
                    val dropRequired = gunshotDb - ambientDb - dropOff
                    val distanceMeters = if (dropRequired <= 0) 1 else Math.pow(2.0, dropRequired / 6.0).toInt()
                    
                    val stealthScore = uiState.character?.stats?.stealth_total ?: 50
                    val pSignal = Math.pow(10.0, (100 - stealthScore) / 10.0)
                    val pNoise = Math.pow(10.0, ambientDb / 10.0)
                    val snr = String.format("%.2f", pSignal / pNoise)
                    
                    snrResult = snr
                    acousticRange = "$distanceMeters METERS"
                    isCalculating = false
                }
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
            modifier = Modifier
                .fillMaxWidth()
                .border(2.dp, TerminalGreen, RoundedCornerShape(8.dp)),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text(if (isCalculating) "CALCULATING..." else "SOLVE PHYSICS", color = TerminalGreen, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
    }
}

@Composable
fun RemoteCommsSection(modifier: Modifier = Modifier) {
    var hashInput by remember { mutableStateOf("") }
    var decryptedMessage by remember { mutableStateOf<String?>(null) }
    
    val SilkBg = Color(0xFFE8EAF0)
    val SilkIndigo = Color(0xFF6366F1)
    val SilkShadow = Color(0xFFC8CAD3)
    val SilkLight = Color(0xFFFFFFFF)

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(SilkBg, RoundedCornerShape(16.dp))
            .border(2.dp, SilkLight, RoundedCornerShape(16.dp))
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("SILK ANALOG SYNC", color = SilkIndigo, fontSize = 16.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Gib den 4-stelligen Hash-Code vom physischen PnP-Handout ein, um die Daten zu entschlüsseln.", color = Color.DarkGray, fontSize = 12.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = hashInput,
            onValueChange = { 
                val input = it.uppercase().take(4)
                hashInput = input
                if (input == "7B42") decryptedMessage = "GEHEIM: Verstecktes Medkit in Sektor B gefunden."
                else if (input == "9901") decryptedMessage = "WARNUNG: Nächster Raum ist mit EMP-Minen gesichert."
                else if (input.length == 4) decryptedMessage = "FEHLER: Hash-Code unbekannt oder beschädigt."
                else decryptedMessage = null
            },
            label = { Text("HASH-CODE EINGEBEN", color = SilkIndigo, fontSize = 10.sp) },
            modifier = Modifier.fillMaxWidth(0.7f),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = SilkIndigo,
                unfocusedBorderColor = SilkShadow,
                focusedTextColor = SilkIndigo,
                unfocusedTextColor = Color.DarkGray
            )
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        if (decryptedMessage != null) {
            Text(
                text = decryptedMessage!!,
                color = if (decryptedMessage!!.startsWith("FEHLER")) Color.Red else SilkIndigo,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                modifier = Modifier.fillMaxWidth().background(SilkLight, RoundedCornerShape(8.dp)).padding(8.dp)
            )
        }
    }
}

@Composable
fun VideoFeedCard(name: String, isMuted: Boolean) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(100.dp)
            .background(Color.Black, RoundedCornerShape(4.dp))
            .border(1.dp, Color.DarkGray, RoundedCornerShape(4.dp))
    ) {
        Text(
            text = name,
            color = Color.White,
            fontSize = 10.sp,
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(4.dp)
        )
        if (isMuted) {
            Text(
                text = "MUTED",
                color = WarningAmber,
                fontSize = 10.sp,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(4.dp)
                    .background(Color.DarkGray, RoundedCornerShape(2.dp))
                    .padding(horizontal = 4.dp, vertical = 2.dp)
            )
        }
    }
}

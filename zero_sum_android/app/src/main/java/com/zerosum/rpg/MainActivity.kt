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
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.random.Random
import android.os.Vibrator
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
import kotlinx.coroutines.Dispatchers
import android.os.VibrationEffect
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import android.media.MediaRecorder
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.json.JSONObject
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
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.foundation.clickable

object EngineProvider {
    var audio: AudioEngine? = null
    var haptic: HapticEngine? = null

    fun getAudio(context: Context): AudioEngine {
        if (audio == null) audio = AudioEngine(context.applicationContext)
        return audio!!
    }

    fun getHaptic(context: Context): HapticEngine {
        if (haptic == null) haptic = HapticEngine(context.applicationContext)
        return haptic!!
    }
}

val DarkBackground = Color(0xFFE8EAF0) // SilkCoolGray
val GlassBackground = Color(0xFFE8EAF0)
val ToughpadArmor = Color(0xFFE8EAF0)
val ArmorHighlight = Color(0xFFE8EAF0)
val TerminalGreen = Color(0xFF6366F1) // SilkIndigo
val TerminalDark = Color(0xFFE8EAF0)
val DangerRed = Color(0xFFFF2A00)
val WarningAmber = Color(0xFF7C3AED) // Tertiary Violet

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
                colorScheme = lightColorScheme(
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
        EngineProvider.audio?.release()
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
        
        SilkButton(
            text = "HOST NEW OPERATION",
            onClick = onHost,
            modifier = Modifier.fillMaxWidth().height(64.dp),
            isCritical = true
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        Text("--- OR ---", color = Color.Gray, fontSize = 16.sp)
        Spacer(modifier = Modifier.height(32.dp))
        
        OutlinedTextField(
            value = joinPin,
            onValueChange = { joinPin = it.uppercase().take(6) },
            label = { Text("ENTER SESSION PIN", color = TerminalGreen) },
            modifier = Modifier.fillMaxWidth().neumorphic(isPressed = true, cornerRadius = 8.dp),
            singleLine = true,
            shape = RoundedCornerShape(8.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color.Transparent,
                unfocusedBorderColor = Color.Transparent,
                focusedTextColor = TerminalGreen,
                unfocusedTextColor = TerminalGreen.copy(alpha = 0.7f),
                focusedContainerColor = DarkBackground,
                unfocusedContainerColor = DarkBackground
            )
        )
        Spacer(modifier = Modifier.height(16.dp))
        SilkButton(
            text = "JOIN SQUAD",
            onClick = { if (joinPin.length >= 4) onJoin(joinPin) },
            modifier = Modifier.fillMaxWidth().height(64.dp)
        )
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
    val isCritical = (uiState.character?.stats?.stress_current ?: 0) >= 80
    val isBlackout = remainingData <= 0f
    
    val hapticEngine = remember { EngineProvider.getHaptic(context) }
    val audioEngine = remember { EngineProvider.getAudio(context) }

    LaunchedEffect(isCritical) {
        if (isCritical) {
            audioEngine.play(AudioEngine.Profile.PROXIMITY_WARNING)
            while(isActive) {
                hapticEngine.play(HapticEngine.Profile.HEARTBEAT_CRITICAL)
                delay(1000)
            }
        }
    }

    LaunchedEffect(isBlackout) {
        if (isBlackout) {
            audioEngine.play(AudioEngine.Profile.SYSTEM_BLACKOUT)
            hapticEngine.play(HapticEngine.Profile.POWER_OUTAGE)
        }
    }

    val bleManager = remember { BleMeshManager(context) }
    LaunchedEffect(isBlackout) {
        if (isBlackout) {
            bleManager.startMeshNetworking(uiState.character?.id ?: "unknown")
        } else {
            bleManager.stopMeshNetworking()
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

    var isLightTableMode by remember { mutableStateOf(false) }
    var selectedTab by remember { mutableStateOf(0) } // 0 = Profile, 1 = Map, 2 = Comms

    if (isLightTableMode) {
        LightTableScreen(onClose = { isLightTableMode = false })
    } else if (isBlackout) {
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
                
                Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                    when(selectedTab) {
                        0 -> CharacterSheetSection(modifier = Modifier.fillMaxSize())
                        1 -> MapGeneratorSection(modifier = Modifier.fillMaxSize())
                        2 -> Column(modifier = Modifier.fillMaxSize()) {
                                 AcousticPhysicsSection(modifier = Modifier.weight(1f))
                                 Spacer(modifier = Modifier.height(16.dp))
                                 RemoteCommsSection(modifier = Modifier.weight(1f), onLightTableActivate = { isLightTableMode = true })
                             }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Neomorphic Bottom Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(DarkBackground, RoundedCornerShape(24.dp))
                        .neumorphic(cornerRadius = 24.dp)
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    TabButton("PROFILE", selectedTab == 0, Modifier.weight(1f)) { selectedTab = 0 }
                    TabButton("MAP", selectedTab == 1, Modifier.weight(1f)) { selectedTab = 1 }
                    TabButton("COMMS", selectedTab == 2, Modifier.weight(1f)) { selectedTab = 2 }
                }
            }
            
            uiState.gmIntel?.let { intel ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .background(SilkIndigo, RoundedCornerShape(12.dp))
                        .padding(16.dp)
                        .align(Alignment.TopCenter)
                ) {
                    Text("GM INTEL: $intel", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
            
            uiState.dilemma?.let { dilemma ->
                DilemmaOverlay(dilemma)
            }
        }
    }
    
    if (isCritical && !isBlackout) {
        Box(modifier = Modifier.fillMaxSize().background(Color.Red.copy(alpha = flashAlpha)))
    }
}

@Composable
fun TabButton(text: String, isSelected: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val haptic = LocalHapticFeedback.current
    Box(
        modifier = modifier
            .padding(horizontal = 4.dp)
            .background(DarkBackground, RoundedCornerShape(16.dp))
            .neumorphic(isPressed = isSelected, cornerRadius = 16.dp)
            .pointerInput(Unit) {
                detectTapGestures(
                    onTap = {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        onClick()
                    }
                )
            }
            .padding(vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            fontFamily = FontFamily.SansSerif,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            color = if (isSelected) SilkIndigo else Color.Gray,
            fontSize = 12.sp
        )
    }
}

@Composable
fun HeaderSection(sessionId: String, remainingData: Float) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkBackground, RoundedCornerShape(8.dp))
            .neumorphic()
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
                SilkButton(
                    text = "-25MB (SAT-LINK)",
                    onClick = { NetworkManager.processIntent(PlayerIntent.ConsumeData(25f)) },
                    modifier = Modifier.height(48.dp)
                )
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("SESSION: $sessionId", color = SilkIndigo, fontSize = 12.sp, modifier = Modifier.align(Alignment.CenterVertically))
        }
    }
}

@Composable
fun SystemBlackoutScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(32.dp),
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
        SilkButton(
            text = "ANALOGER REBOOT (FINDE OFFLINE-SERVER)",
            onClick = { NetworkManager.processIntent(PlayerIntent.ConsumeData(-150f)) },
            modifier = Modifier.fillMaxWidth().height(64.dp),
            isCritical = true
        )
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
            .background(DarkBackground, RoundedCornerShape(16.dp))
            .neumorphic()
            .padding(12.dp)
    ) {
        // Inner Screen
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(DarkBackground, RoundedCornerShape(8.dp))
                .neumorphic(isPressed = true)
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
                        fontFamily = FontFamily.SansSerif,
                        color = TerminalGreen,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "UPLINK ERR",
                        fontFamily = FontFamily.SansSerif,
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
                    modifier = Modifier.fillMaxWidth().height(16.dp).neumorphic(isPressed = true, cornerRadius = 8.dp),
                    color = WarningAmber,
                    trackColor = Color.Transparent,
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
                    modifier = Modifier.fillMaxWidth().height(24.dp).neumorphic(isPressed = true, cornerRadius = 12.dp),
                    color = if (hp < 30) DangerRed else TerminalGreen,
                    trackColor = Color.Transparent,
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
                                .background(if (selectedClass == className) TerminalGreen.copy(alpha = 0.1f) else DarkBackground, RoundedCornerShape(8.dp))
                                .neumorphic(isPressed = selectedClass == className, cornerRadius = 8.dp)
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
                                fontFamily = FontFamily.SansSerif,
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
                    SilkButton(
                        text = "MEDKIT (+25)",
                        onClick = { NetworkManager.processIntent(PlayerIntent.EmergencyHeal(25)) },
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    SilkButton(
                        text = "PULL DATA",
                        onClick = { NetworkManager.pullData(10f) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
        }

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
                .background(DarkBackground, RoundedCornerShape(8.dp))
                .neumorphic(isPressed = true, cornerRadius = 8.dp)
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
fun AcousticPhysicsSection(modifier: Modifier = Modifier) {
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
            .background(DarkBackground, RoundedCornerShape(8.dp))
            .neumorphic()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("ACOUSTIC SENSOR & SNR", color = Color.Gray, fontSize = 12.sp, modifier = Modifier.align(Alignment.Start))
        
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                if (snrResult != null) {
                    Text("SNR: $snrResult dB", color = TerminalGreen, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("AUDIBLE RANGE: $acousticRange", color = WarningAmber, fontSize = 14.sp)
                    Text("RAYCAST HIT: $raycastMaterial", color = Color.Gray, fontSize = 12.sp)
                } else {
                    Text("WAITING FOR PING", color = Color.DarkGray, fontSize = 18.sp)
                }
            }
        }
        
        SilkButton(
            text = if (isCalculating) "SCANNING..." else "PING ENVIRONMENT",
            onClick = {
                if (isCalculating) return@SilkButton
                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                coroutineScope.launch {
                    isCalculating = true
                    delay(500)
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
                    val sourceDb = 110 // Average loud noise source
                    val dropRequired = sourceDb - ambientDb - dropOff
                    val distanceMeters = if (dropRequired <= 0) 1 else Math.pow(2.0, dropRequired / 6.0).toInt()
                    
                    val snr = sourceDb - ambientDb
                    
                    snrResult = "$snr"
                    acousticRange = "$distanceMeters METERS"
                    isCalculating = false
                }
            },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
fun RemoteCommsSection(modifier: Modifier = Modifier, onLightTableActivate: () -> Unit = {}) {
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
            .neumorphic(cornerRadius = 16.dp)
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
                if (input.length == 4) {
                    if (input == "LITE") {
                        decryptedMessage = "INITIATING LIGHT TABLE..."
                        onLightTableActivate()
                    } else {
                        decryptedMessage = "DECRYPTING..."
                        NetworkManager.decryptHash(input) { result ->
                            decryptedMessage = result
                        }
                    }
                } else {
                    decryptedMessage = null
                }
            },
            label = { Text("HASH-CODE EINGEBEN", color = SilkIndigo, fontSize = 10.sp) },
            modifier = Modifier.fillMaxWidth(0.7f).neumorphic(isPressed = true, cornerRadius = 8.dp),
            singleLine = true,
            shape = RoundedCornerShape(8.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color.Transparent,
                unfocusedBorderColor = Color.Transparent,
                focusedTextColor = SilkIndigo,
                unfocusedTextColor = Color.DarkGray,
                focusedContainerColor = SilkBg,
                unfocusedContainerColor = SilkBg
            )
        )
        
        Spacer(modifier = Modifier.height(16.dp))

        var isScannerOpen by remember { mutableStateOf(false) }
        SilkButton(
            text = "GLITCH SCANNER (QR)",
            onClick = { isScannerOpen = true },
            modifier = Modifier.fillMaxWidth(0.7f)
        )
        
        if (isScannerOpen) {
            androidx.compose.ui.window.Dialog(onDismissRequest = { isScannerOpen = false }, properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false)) {
                Box(modifier = Modifier.fillMaxSize()) {
                    GlitchScannerScreen(
                        onBarcodeScanned = { barcode ->
                            val input = barcode.uppercase().take(4)
                            hashInput = input
                            isScannerOpen = false
                            if (input == "LITE") {
                                decryptedMessage = "INITIATING LIGHT TABLE..."
                                onLightTableActivate()
                            } else {
                                decryptedMessage = "DECRYPTING..."
                                NetworkManager.decryptHash(input) { result ->
                                    decryptedMessage = result
                                }
                            }
                        }
                    )
                }
            }
        }

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
fun DilemmaOverlay(dilemma: DilemmaState) {
    var timeLeft by remember(dilemma.expiresAt) { mutableStateOf(Math.max(0L, (dilemma.expiresAt - System.currentTimeMillis()) / 1000)) }
    
    LaunchedEffect(dilemma.expiresAt) {
        while(isActive) {
            timeLeft = Math.max(0L, (dilemma.expiresAt - System.currentTimeMillis()) / 1000)
            if (timeLeft <= 0) {
                NetworkManager.processIntent(PlayerIntent.VoteDilemma("B"))
                break
            }
            delay(1000)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.8f))
            .clickable(enabled = false) {},
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .background(DarkBackground, RoundedCornerShape(24.dp))
                .neumorphic(cornerRadius = 24.dp)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("CRITICAL DILEMMA", color = DangerRed, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(16.dp))
            Text(dilemma.text, color = SilkIndigo, fontSize = 16.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            Spacer(modifier = Modifier.height(24.dp))
            
            Text("TIME REMAINING: $timeLeft s", color = if (timeLeft < 10) DangerRed else WarningAmber, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(24.dp))
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                SilkButton(text = dilemma.optionA, onClick = { NetworkManager.processIntent(PlayerIntent.VoteDilemma("A")) })
                Spacer(modifier = Modifier.width(16.dp))
                SilkButton(text = dilemma.optionB, onClick = { NetworkManager.processIntent(PlayerIntent.VoteDilemma("B")) })
            }
        }
    }
}

@Composable
fun LightTableScreen(onClose: () -> Unit) {
    val infiniteTransition = rememberInfiniteTransition()
    val pulse by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "Pulse"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(16.dp)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val canvasWidth = size.width
            val canvasHeight = size.height
            val gridStep = 50.dp.toPx()

            // Draw alignment grid
            for (x in 0..canvasWidth.toInt() step gridStep.toInt()) {
                drawLine(
                    color = Color(0xFF6366F1).copy(alpha = 0.3f),
                    start = Offset(x.toFloat(), 0f),
                    end = Offset(x.toFloat(), canvasHeight),
                    strokeWidth = 2f
                )
            }
            for (y in 0..canvasHeight.toInt() step gridStep.toInt()) {
                drawLine(
                    color = Color(0xFF6366F1).copy(alpha = 0.3f),
                    start = Offset(0f, y.toFloat()),
                    end = Offset(canvasWidth, y.toFloat()),
                    strokeWidth = 2f
                )
            }

            // Draw specific "hidden" reveal nodes
            val nodeRadius = 20.dp.toPx() * pulse
            drawCircle(
                color = Color(0xFF6366F1),
                radius = nodeRadius,
                center = Offset(canvasWidth * 0.3f, canvasHeight * 0.4f)
            )
            drawCircle(
                color = Color(0xFF6366F1),
                radius = nodeRadius,
                center = Offset(canvasWidth * 0.7f, canvasHeight * 0.8f)
            )
            
            // Draw a thick line connecting them (e.g. secret tunnel)
            drawLine(
                color = Color(0xFF6366F1).copy(alpha = pulse),
                start = Offset(canvasWidth * 0.3f, canvasHeight * 0.4f),
                end = Offset(canvasWidth * 0.7f, canvasHeight * 0.8f),
                strokeWidth = 10f
            )
        }

        Text(
            "LEUCHTTISCH-PROTOKOLL AKTIV. LEGE FOLIE 'B' PASSGENAU AUF DAS DISPLAY.",
            color = Color(0xFF6366F1),
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.align(Alignment.TopCenter).padding(top = 32.dp)
        )

        SilkButton(
            text = "PROTOKOLL BEENDEN",
            onClick = onClose,
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 32.dp)
        )
    }
}

@Composable
fun VideoFeedCard(name: String, isMuted: Boolean) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(100.dp)
            .background(DarkBackground, RoundedCornerShape(8.dp))
            .neumorphic(isPressed = true, cornerRadius = 8.dp)
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

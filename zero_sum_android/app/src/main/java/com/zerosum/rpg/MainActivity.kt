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
import kotlinx.coroutines.launch
import kotlinx.coroutines.isActive
import kotlinx.coroutines.Dispatchers
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

val NeonRed = Color(0xFFFF2A2A)
val NeonBlue = Color(0xFF00E5FF)
val DarkBackground = Color(0xFF0A0F14)
val GlassBackground = Color(0x3300E5FF)

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
                    primary = NeonBlue,
                    secondary = NeonRed
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
        Text("ZERO SUM", color = NeonBlue, fontSize = 48.sp, fontWeight = FontWeight.Bold, letterSpacing = 4.sp)
        Spacer(modifier = Modifier.height(64.dp))
        
        Button(
            onClick = onHost,
            colors = ButtonDefaults.buttonColors(containerColor = NeonRed.copy(alpha = 0.2f)),
            modifier = Modifier.fillMaxWidth().height(64.dp).border(2.dp, NeonRed, RoundedCornerShape(8.dp)),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("HOST NEW OPERATION", color = NeonRed, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        Text("--- OR ---", color = Color.Gray, fontSize = 16.sp)
        Spacer(modifier = Modifier.height(32.dp))
        
        OutlinedTextField(
            value = joinPin,
            onValueChange = { joinPin = it.uppercase().take(6) },
            label = { Text("ENTER SESSION PIN", color = NeonBlue) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = NeonBlue,
                unfocusedBorderColor = NeonBlue.copy(alpha = 0.5f),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = { if (joinPin.length >= 4) onJoin(joinPin) },
            colors = ButtonDefaults.buttonColors(containerColor = NeonBlue.copy(alpha = 0.2f)),
            modifier = Modifier.fillMaxWidth().height(64.dp).border(2.dp, NeonBlue, RoundedCornerShape(8.dp)),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("JOIN SQUAD", color = NeonBlue, fontWeight = FontWeight.Bold, fontSize = 18.sp)
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

    LaunchedEffect(Unit) {
        if (!hasMicPermission) {
            permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        }
        NetworkManager.resetState()
        val initialChar = CharacterState(
            id = "char_1",
            name = "KAIRO 'GHOST' CHEN",
            role = "CYBER-INFILTRATOR",
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

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        HeaderSection(sessionId)
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

@Composable
fun HeaderSection(sessionId: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(GlassBackground, RoundedCornerShape(8.dp))
            .border(1.dp, NeonBlue.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = "ZERO SUM",
            color = NeonBlue,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 2.sp
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("SESSION: $sessionId", color = Color.White, fontSize = 12.sp, modifier = Modifier.align(Alignment.CenterVertically))
            Spacer(modifier = Modifier.width(8.dp))
            Text("LIVE SERVER SYNC", color = NeonRed, fontSize = 12.sp, modifier = Modifier.align(Alignment.CenterVertically))
        }
    }
}

@Composable
fun CharacterSheetSection(modifier: Modifier = Modifier) {
    val uiState by NetworkManager.uiState.collectAsStateWithLifecycle()
    val character = uiState.character

    val haptic = LocalHapticFeedback.current
    val name = character?.name ?: "KAIRO 'GHOST' CHEN"
    val role = character?.role ?: "CYBER-INFILTRATOR"
    val hp = character?.stats?.hp_current ?: 78
    val stealth = character?.stats?.stealth_total ?: 85
    val stress = character?.stats?.stress_current ?: 60

    val hacking = character?.hacking ?: 90
    val reflexes = character?.reflexes ?: 75
    val tech = character?.tech ?: 80

    val context = androidx.compose.ui.platform.LocalContext.current
    var mockHeartRate by remember { mutableStateOf(80) }
    
    DisposableEffect(Unit) {
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
        val heartRateSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_HEART_RATE)
        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent?) {
                event?.values?.firstOrNull()?.let { hr ->
                    if (hr > 0) mockHeartRate = hr.toInt()
                }
            }
            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
        }
        
        if (heartRateSensor != null) {
            sensorManager.registerListener(listener, heartRateSensor, SensorManager.SENSOR_DELAY_NORMAL)
        } else {
            // Fallback for emulators without hardware sensor: slow random walk around 80
            mockHeartRate = 80
        }
        
        onDispose {
            sensorManager?.unregisterListener(listener)
        }
    }

    val isCyberpsychosis = stress > 75
    val displayHp = if (isCyberpsychosis && Random.nextFloat() > 0.7f) {
        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
        Random.nextInt(1, 15)
    } else hp

    val glitchOffset by animateFloatAsState(if (isCyberpsychosis) Random.nextInt(-10, 10).toFloat() else 0f)

    LaunchedEffect(isCyberpsychosis) {
        if (isCyberpsychosis) {
            while (true) {
                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                delay(100)
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxHeight()
            .offset(x = glitchOffset.dp)
            .background(GlassBackground, RoundedCornerShape(8.dp))
            .border(1.dp, NeonBlue.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        Text("CHARACTER SHEET", color = Color.Gray, fontSize = 12.sp)
        Text("HEART RATE: $mockHeartRate BPM", color = if (mockHeartRate > 120) NeonRed else NeonBlue, fontSize = 10.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text(name, color = Color.White, fontWeight = FontWeight.Bold)
        Text(role, color = NeonRed, fontSize = 12.sp)
        
        Spacer(modifier = Modifier.height(24.dp))
        StatBar("HEALTH", displayHp, 100, if (displayHp < 20) NeonRed else NeonBlue)
        Spacer(modifier = Modifier.height(8.dp))
        StatBar("STEALTH", stealth, 100, NeonBlue)
        Spacer(modifier = Modifier.height(8.dp))
        StatBar("HACKING", hacking, 100, NeonBlue)
        Spacer(modifier = Modifier.height(8.dp))
        StatBar("REFLEXES", reflexes, 100, NeonBlue)
        Spacer(modifier = Modifier.height(8.dp))
        StatBar("TECH", tech, 100, NeonBlue)
        Spacer(modifier = Modifier.height(8.dp))
        StatBar("STRESS (ALLOSTATIC LOAD)", stress, 100, NeonRed)
        
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = {
                NetworkManager.processIntent(PlayerIntent.EmergencyHeal(25))
            },
            colors = ButtonDefaults.buttonColors(containerColor = NeonRed.copy(alpha = 0.2f)),
            modifier = Modifier.fillMaxWidth().border(1.dp, NeonRed, RoundedCornerShape(4.dp))
        ) {
            Text("EMERGENCY HEAL", color = NeonRed, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = {
                val stressMultiplier = if (mockHeartRate > 120) 2 else 1
                NetworkManager.processIntent(PlayerIntent.InjectStress(stressMultiplier))
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
            modifier = Modifier.fillMaxWidth().border(1.dp, NeonRed, RoundedCornerShape(4.dp))
        ) {
            Text("INJECT STRESS SIMULATION", color = NeonRed, fontSize = 10.sp)
        }
    }
}

@Composable
fun StatBar(label: String, current: Int, max: Int, color: Color) {
    Column {
        Text(label, color = Color.White, fontSize = 14.sp)
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(20.dp)
                .background(Color.DarkGray, RoundedCornerShape(4.dp))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(current.toFloat() / max.toFloat())
                    .fillMaxHeight()
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(color.copy(alpha = 0.5f), color)
                        ),
                        shape = RoundedCornerShape(4.dp)
                    )
            )
        }
        Text("$current/$max", color = color, fontSize = 12.sp, modifier = Modifier.align(Alignment.End))
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
            .border(1.dp, NeonBlue.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
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
                    Text("SNR: $snrResult", color = NeonBlue, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("AUDIBLE RANGE: $acousticRange", color = NeonRed, fontSize = 14.sp)
                    Text("RAYCAST HIT: $raycastMaterial", color = Color.Gray, fontSize = 12.sp)
                } else {
                    Text("WAITING FOR SIGNAL", color = Color.DarkGray, fontSize = 18.sp)
                }
            }
        }
        
        Button(
            onClick = {
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
                .border(2.dp, NeonBlue, RoundedCornerShape(8.dp)),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text(if (isCalculating) "CALCULATING..." else "SOLVE PHYSICS", color = NeonBlue, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
    }
}

@Composable
fun RemoteCommsSection(modifier: Modifier = Modifier) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val nfcManager = context.getSystemService(android.content.Context.NFC_SERVICE) as? android.nfc.NfcManager
    val nfcAdapter = nfcManager?.defaultAdapter
    val hasNfc = nfcAdapter != null
    val nfcEnabled = nfcAdapter?.isEnabled == true

    Column(
        modifier = modifier
            .fillMaxHeight()
            .background(GlassBackground, RoundedCornerShape(8.dp))
            .border(1.dp, NeonBlue.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        Text("INFOSEC KINETIC HACKING", color = Color.Gray, fontSize = 12.sp)
        Spacer(modifier = Modifier.height(16.dp))
        
        if (hasNfc) {
            if (nfcEnabled) {
                Text("NFC HARDWARE: ONLINE", color = NeonBlue, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text("Awaiting physical NFC Air-Gap contact...", color = Color.Gray, fontSize = 12.sp)
            } else {
                Text("NFC HARDWARE: OFFLINE", color = NeonRed, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text("Enable NFC to execute Air-Gap hacks.", color = Color.Gray, fontSize = 12.sp)
            }
        } else {
            Text("NFC HARDWARE: NOT DETECTED", color = NeonRed, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        Text("ADVERSARIAL FASHION & GAIT", color = Color.White, fontSize = 12.sp)
        Text("STATUS: CV DAZZLE ACTIVE", color = NeonBlue, fontSize = 10.sp)
        Text("AI CLASSIFICATION: TOYOTA COROLLA", color = Color.Gray, fontSize = 10.sp)
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
                color = NeonRed,
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

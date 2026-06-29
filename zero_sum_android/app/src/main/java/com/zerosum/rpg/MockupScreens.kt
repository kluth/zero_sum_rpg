package com.zerosum.rpg

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlin.math.roundToInt

val MockupSilkBg = Color(0xFFE8EAF0)
val MockupSilkIndigo = Color(0xFF6366F1)
val MockupSilkTextDark = Color(0xFF333333)

@Composable
fun MedicalDashboardSection(state: MedicalState, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val hapticEngine = remember { EngineProvider.getHaptic(context) }
    val audioEngine = remember { EngineProvider.getAudio(context) }

    LaunchedEffect(state.heartRate) {
        val delayTime = (60000 / state.heartRate.coerceAtLeast(30)).toLong()
        val isCritical = state.heartRate < 50 || state.heartRate > 120
        while(isActive) {
            if (isCritical) {
                hapticEngine.play(HapticEngine.Profile.HEARTBEAT_CRITICAL)
                audioEngine.play(AudioEngine.Profile.FLATLINE_MONITOR) // Or ALARM_LEVEL_1
                delay(delayTime)
            } else {
                hapticEngine.play(HapticEngine.Profile.HEARTBEAT_STEADY)
                audioEngine.play(AudioEngine.Profile.DATA_PING)
                delay(delayTime)
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MockupSilkBg)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text("PARAMEDIC RESPONSE", color = MockupSilkTextDark, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Text("Raised 22px, #333333", color = Color.Gray, fontSize = 12.sp)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("SIMULATION", color = MockupSilkIndigo, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                Text("Inset, Indigo", color = MockupSilkIndigo, fontSize = 12.sp)
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MockupSilkBg, RoundedCornerShape(16.dp))
                .neumorphic(cornerRadius = 16.dp)
                .padding(16.dp)
        ) {
            Text("CALL: MEDICAL EMERGENCY (Critical)", color = MockupSilkTextDark, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Box(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp).height(1.dp).background(Color.LightGray))
            Text("PT: ${state.patientName} | LOCATION: ${state.location}", color = MockupSilkIndigo, fontWeight = FontWeight.Bold, fontSize = 12.sp)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        Text("VITALS", color = MockupSilkTextDark, fontWeight = FontWeight.Bold, modifier = Modifier.align(Alignment.Start))
        Spacer(modifier = Modifier.height(8.dp))
        
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            VitalsCard("Heart Rate", "${state.heartRate}", "BPM", modifier = Modifier.weight(1f))
            Spacer(modifier = Modifier.width(16.dp))
            VitalsCard("Blood Pressure", state.bloodPressure, "mmHg", modifier = Modifier.weight(1f))
        }
        Spacer(modifier = Modifier.height(16.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            VitalsCard("O2 Sat", "${state.o2Sat}", "%", modifier = Modifier.weight(1f))
            Spacer(modifier = Modifier.width(16.dp))
            VitalsCard("Resp Rate", "${state.respRate}", "RPM", modifier = Modifier.weight(1f))
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        Text("TIMELINE", color = MockupSilkTextDark, fontWeight = FontWeight.Bold, modifier = Modifier.align(Alignment.Start))
        Spacer(modifier = Modifier.height(8.dp))
        
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MockupSilkBg, RoundedCornerShape(16.dp))
                .neumorphic(cornerRadius = 16.dp)
                .padding(16.dp)
        ) {
            state.timeline.take(4).forEach { line ->
                val parts = line.split("|")
                if (parts.size == 2) {
                    TimelineRow(parts[0], parts[1])
                }
            }
        }
        
        Spacer(modifier = Modifier.weight(1f))
        
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            ActionSquare("LOG\nTREATMENT", onClick = {
                hapticEngine.play(HapticEngine.Profile.UI_NEOMORPHIC_TAP)
                audioEngine.play(AudioEngine.Profile.SUCCESS_ACTION)
            })
            ActionSquare("CHECKLISTS", onClick = {
                hapticEngine.play(HapticEngine.Profile.UI_NEOMORPHIC_TAP)
            })
            ActionSquare("CONTACT\nHOSP.", onClick = {
                hapticEngine.play(HapticEngine.Profile.UI_NEOMORPHIC_TAP)
                audioEngine.play(AudioEngine.Profile.COMM_LINK_ESTABLISHED)
            })
        }
    }
}

@Composable
fun VitalsCard(title: String, value: String, unit: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .background(MockupSilkBg, RoundedCornerShape(16.dp))
            .neumorphic(cornerRadius = 16.dp)
            .padding(16.dp)
    ) {
        Text(title, color = MockupSilkTextDark, fontSize = 14.sp)
        Row(verticalAlignment = Alignment.Bottom) {
            Text(value, color = MockupSilkTextDark, fontWeight = FontWeight.Bold, fontSize = 24.sp)
            Spacer(modifier = Modifier.width(4.dp))
            Text(unit, color = MockupSilkTextDark, fontSize = 12.sp, modifier = Modifier.padding(bottom = 4.dp))
        }
        Text("Raised #333", color = Color.Gray, fontSize = 10.sp)
    }
}

@Composable
fun TimelineRow(time: String, event: String) {
    Row(modifier = Modifier.padding(vertical = 4.dp)) {
        Text(time, color = MockupSilkTextDark, fontWeight = FontWeight.Bold, modifier = Modifier.width(48.dp))
        Text("|", color = Color.LightGray, modifier = Modifier.padding(horizontal = 8.dp))
        Text(event, color = MockupSilkTextDark)
    }
}

@Composable
fun ActionSquare(text: String, onClick: () -> Unit = {}) {
    var isPressed by remember { mutableStateOf(false) }
    Box(
        modifier = Modifier
            .size(90.dp)
            .background(MockupSilkBg, RoundedCornerShape(16.dp))
            .neumorphic(isPressed = isPressed, cornerRadius = 16.dp)
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = {
                        isPressed = true
                        tryAwaitRelease()
                        isPressed = false
                        onClick()
                    }
                )
            },
        contentAlignment = Alignment.Center
    ) {
        Text(text, color = MockupSilkTextDark, fontWeight = FontWeight.Bold, fontSize = 10.sp, textAlign = TextAlign.Center)
    }
}

@Composable
fun HeroicDispatchMapSection(state: DispatchState, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val hapticEngine = remember { EngineProvider.getHaptic(context) }
    val audioEngine = remember { EngineProvider.getAudio(context) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MockupSilkBg)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("HEROIC DISPATCH", color = MockupSilkIndigo, fontWeight = FontWeight.Bold, fontSize = 20.sp)
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MockupSilkBg, RoundedCornerShape(16.dp))
                .neumorphic(isPressed = true, cornerRadius = 16.dp)
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("ACTIVE SITUATION:", color = Color.Gray, fontSize = 12.sp)
                Text(state.situation, color = MockupSilkIndigo, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("ELAPSED TIME:", color = Color.Gray, fontSize = 12.sp)
                Text(state.elapsedTime, color = MockupSilkTextDark, fontWeight = FontWeight.Bold, fontSize = 18.sp)
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        var mapOffsetX by remember { mutableStateOf(0f) }
        var mapOffsetY by remember { mutableStateOf(0f) }

        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .background(Color(0xFF2C2C30), RoundedCornerShape(16.dp))
                .neumorphic(cornerRadius = 16.dp)
                .pointerInput(Unit) {
                    detectDragGestures { change, dragAmount ->
                        change.consume()
                        mapOffsetX += dragAmount.x
                        mapOffsetY += dragAmount.y
                    }
                }
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val step = 100f
                val startX = mapOffsetX % step
                val startY = mapOffsetY % step
                
                for (x in startX.toInt()..size.width.toInt() step step.toInt()) {
                    drawLine(Color.DarkGray, Offset(x.toFloat(), 0f), Offset(x.toFloat(), size.height))
                }
                for (y in startY.toInt()..size.height.toInt() step step.toInt()) {
                    drawLine(Color.DarkGray, Offset(0f, y.toFloat()), Offset(size.width, y.toFloat()))
                }
            }
            
            // Markers
            state.markers.forEach { marker ->
                MapMarker(
                    label = marker.label, 
                    modifier = Modifier
                        .align(Alignment.Center)
                        .offset(x = (marker.x + mapOffsetX).dp, y = (marker.y + mapOffsetY).dp)
                )
            }
            
            var isRefreshPressed by remember { mutableStateOf(false) }
            Box(
                modifier = Modifier
                    .padding(16.dp)
                    .background(MockupSilkBg, RoundedCornerShape(8.dp))
                    .neumorphic(isPressed = isRefreshPressed, cornerRadius = 8.dp)
                    .align(Alignment.TopEnd)
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onPress = {
                                isRefreshPressed = true
                                hapticEngine.play(HapticEngine.Profile.UI_NEOMORPHIC_TAP)
                                audioEngine.play(AudioEngine.Profile.DATA_PING)
                                tryAwaitRelease()
                                isRefreshPressed = false
                            }
                        )
                    }
                    .padding(8.dp)
            ) {
                Text("REFRESH MAP", color = MockupSilkIndigo, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
            
            // Center pin
            Box(modifier = Modifier.align(Alignment.Center).size(32.dp).background(MockupSilkIndigo, CircleShape))
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MockupSilkBg, RoundedCornerShape(24.dp))
                .neumorphic(cornerRadius = 24.dp)
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            Text("Map", color = MockupSilkIndigo, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            Text("Tasks", color = Color.Gray, fontSize = 12.sp)
            Text("Team", color = Color.Gray, fontSize = 12.sp)
            Text("Profile", color = Color.Gray, fontSize = 12.sp)
            
            var isDeployPressed by remember { mutableStateOf(false) }
            Box(modifier = Modifier
                .background(MockupSilkIndigo, RoundedCornerShape(16.dp))
                .pointerInput(Unit) {
                    detectTapGestures(
                        onPress = {
                            isDeployPressed = true
                            hapticEngine.play(HapticEngine.Profile.UI_NEOMORPHIC_TAP)
                            audioEngine.play(AudioEngine.Profile.SUCCESS_ACTION)
                            tryAwaitRelease()
                            isDeployPressed = false
                        }
                    )
                }
                .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Text("DEPLOY RESOURCE", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
    }
}

@Composable
fun MapMarker(label: String, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val hapticEngine = remember { EngineProvider.getHaptic(context) }
    
    Column(
        modifier = modifier.pointerInput(Unit) {
            detectTapGestures {
                hapticEngine.play(HapticEngine.Profile.UI_NEOMORPHIC_TAP)
            }
        }, 
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(modifier = Modifier.background(MockupSilkBg, RoundedCornerShape(8.dp)).padding(8.dp)) {
            Text(label, color = MockupSilkTextDark, fontSize = 10.sp)
        }
        Spacer(modifier = Modifier.height(4.dp))
        Box(modifier = Modifier.size(12.dp).background(MockupSilkIndigo.copy(alpha = 0.5f), CircleShape))
    }
}

@Composable
fun CommsRadioSection(state: CommsState, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val hapticEngine = remember { EngineProvider.getHaptic(context) }
    val audioEngine = remember { EngineProvider.getAudio(context) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MockupSilkBg)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("CRISIS COMM CENTER", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text("Everyday Hero: Dispatch", color = MockupSilkIndigo, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MockupSilkBg, RoundedCornerShape(16.dp))
                .neumorphic(cornerRadius = 16.dp)
                .padding(16.dp)
        ) {
            Column {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MockupSilkIndigo.copy(alpha = 0.8f), RoundedCornerShape(8.dp))
                        .padding(16.dp)
                ) {
                    Column {
                        Text("ACTIVE CALL: ${state.activeCall}", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        Box(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).height(1.dp).background(Color.LightGray.copy(alpha = 0.3f)))
                        Text("STATUS: ${state.status}", color = Color.LightGray, fontSize = 14.sp)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("ZONE: ${state.zone}", color = Color.White, fontSize = 14.sp)
                            Text("Elapsed: ${state.elapsed}", color = Color.White, fontSize = 14.sp)
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column {
                        var emergencyPressed by remember { mutableStateOf(false) }
                        Box(modifier = Modifier
                            .background(Color(0xFF8B0000), RoundedCornerShape(8.dp))
                            .pointerInput(Unit) {
                                detectTapGestures(
                                    onPress = {
                                        emergencyPressed = true
                                        hapticEngine.play(HapticEngine.Profile.HEAVY_IMPACT)
                                        audioEngine.play(AudioEngine.Profile.ALARM_LEVEL_3)
                                        tryAwaitRelease()
                                        emergencyPressed = false
                                    }
                                )
                            }
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                        ) {
                            Text("EMERGENCY", color = Color.White, fontSize = 12.sp)
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Box(modifier = Modifier.background(MockupSilkIndigo, RoundedCornerShape(8.dp)).padding(horizontal = 16.dp, vertical = 8.dp)) {
                            Text("CHANNEL+", color = Color.White, fontSize = 12.sp)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("145.525 MHz", color = MockupSilkTextDark, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Box(modifier = Modifier.background(MockupSilkIndigo, RoundedCornerShape(8.dp)).padding(horizontal = 16.dp, vertical = 8.dp)) {
                            Text("CHANNEL-", color = Color.White, fontSize = 12.sp)
                        }
                    }
                    
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("PTT", color = MockupSilkTextDark, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        var isPttPressed by remember { mutableStateOf(false) }
                        
                        Box(
                            modifier = Modifier
                                .size(100.dp)
                                .background(MockupSilkBg, CircleShape)
                                .neumorphic(isPressed = isPttPressed, cornerRadius = 50.dp)
                                .pointerInput(Unit) {
                                    detectTapGestures(
                                        onPress = {
                                            isPttPressed = true
                                            hapticEngine.play(HapticEngine.Profile.UI_NEOMORPHIC_TAP)
                                            audioEngine.play(AudioEngine.Profile.RADIO_STATIC_BURST)
                                            tryAwaitRelease()
                                            isPttPressed = false
                                            hapticEngine.play(HapticEngine.Profile.UI_NEOMORPHIC_ELEVATE)
                                        }
                                    )
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Box(modifier = Modifier.size(80.dp).background(if (isPttPressed) Color.Red else MockupSilkIndigo, CircleShape), contentAlignment = Alignment.Center) {
                                Text(if (isPttPressed) "TRANSMITTING" else "HOLD TO\nSPEAK", color = Color.White, textAlign = TextAlign.Center, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("DISPATCH FEED", color = MockupSilkTextDark, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text(state.dispatchFeed, color = MockupSilkTextDark, fontSize = 12.sp)
                    }
                    
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("VOL", color = MockupSilkTextDark, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        var volume by remember { mutableStateOf(65f) }
                        
                        Box(modifier = Modifier
                            .background(MockupSilkBg, RoundedCornerShape(16.dp))
                            .neumorphic(isPressed = true, cornerRadius = 16.dp)
                            .padding(4.dp)
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("+", color = Color.Gray, fontSize = 24.sp, modifier = Modifier.padding(8.dp))
                                Box(modifier = Modifier
                                    .size(30.dp, 60.dp)
                                    .background(MockupSilkIndigo)
                                    .pointerInput(Unit) {
                                        detectDragGestures { change, dragAmount ->
                                            change.consume()
                                            volume -= dragAmount.y
                                            volume = volume.coerceIn(0f, 100f)
                                        }
                                    }
                                )
                                Text("${volume.roundToInt()}%", color = Color.White, fontSize = 10.sp, modifier = Modifier.offset(y = (-16).dp))
                                Text("-", color = Color.Gray, fontSize = 24.sp, modifier = Modifier.padding(8.dp))
                            }
                        }
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        Text("OPERATIONS FEED", color = MockupSilkTextDark, fontWeight = FontWeight.Bold, modifier = Modifier.align(Alignment.Start))
        Spacer(modifier = Modifier.height(8.dp))
        
        state.operationsFeed.take(3).forEach { feed ->
            CommsMessageRow(feed)
        }
        
        Spacer(modifier = Modifier.weight(1f))
        
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MockupSilkBg, RoundedCornerShape(24.dp))
                .neumorphic(cornerRadius = 24.dp)
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            Text("CRISIS", color = Color.Gray, fontSize = 10.sp)
            Text("UNITS", color = Color.Gray, fontSize = 10.sp)
            Text("MAPS", color = MockupSilkIndigo, fontWeight = FontWeight.Bold, fontSize = 10.sp)
            Text("MESSAGES", color = Color.Gray, fontSize = 10.sp)
            Text("SETTINGS", color = Color.Gray, fontSize = 10.sp)
        }
    }
}

@Composable
fun CommsMessageRow(text: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .background(MockupSilkBg, RoundedCornerShape(8.dp))
            .neumorphic(cornerRadius = 8.dp)
            .padding(12.dp)
    ) {
        Text(text, color = MockupSilkTextDark, fontSize = 12.sp)
    }
}

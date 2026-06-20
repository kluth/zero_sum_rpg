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
import kotlinx.coroutines.launch
import org.json.JSONObject
import kotlin.random.Random

val NeonRed = Color(0xFFFF2A2A)
val NeonBlue = Color(0xFF00E5FF)
val DarkBackground = Color(0xFF0A0F14)
val GlassBackground = Color(0x3300E5FF)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        NetworkManager.connect("http://10.0.2.2:3000") // 10.0.2.2 is Android Emulator localhost loopback
        
        // Broadcast character profile
        val profile = JSONObject().apply {
            put("id", "char_1")
            put("name", "KAIRO 'GHOST' CHEN")
            put("role", "CYBER-INFILTRATOR")
            put("hp", 78)
            put("stealth", 85)
        }
        NetworkManager.socket?.emit("updateCharacter", profile)
        
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
                    ZeroSumApp()
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        NetworkManager.disconnect()
    }
}

@Composable
fun ZeroSumApp() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        HeaderSection()
        Spacer(modifier = Modifier.height(16.dp))
        Row(modifier = Modifier.weight(1f)) {
            CharacterSheetSection(modifier = Modifier.weight(1f))
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                DiceRollerSection(modifier = Modifier.weight(1f))
                Spacer(modifier = Modifier.height(16.dp))
                MapGeneratorSection(modifier = Modifier.weight(2f))
            }
            Spacer(modifier = Modifier.width(16.dp))
            RemoteCommsSection(modifier = Modifier.weight(1f))
        }
    }
}

@Composable
fun HeaderSection() {
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
            Text("LIVE SERVER SYNC", color = NeonRed, fontSize = 12.sp, modifier = Modifier.align(Alignment.CenterVertically))
        }
    }
}

@Composable
fun CharacterSheetSection(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxHeight()
            .background(GlassBackground, RoundedCornerShape(8.dp))
            .border(1.dp, NeonBlue.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        Text("CHARACTER SHEET", color = Color.Gray, fontSize = 12.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text("KAIRO 'GHOST' CHEN", color = Color.White, fontWeight = FontWeight.Bold)
        Text("CYBER-INFILTRATOR", color = NeonRed, fontSize = 12.sp)
        
        Spacer(modifier = Modifier.height(24.dp))
        StatBar("HEALTH", 78, 100, NeonBlue)
        Spacer(modifier = Modifier.height(16.dp))
        StatBar("STEALTH", 85, 100, NeonBlue)
        
        Spacer(modifier = Modifier.height(24.dp))
        Text("ASSETS", color = Color.Gray, fontSize = 12.sp)
        Text("• MONOFILAMENT BLADE", color = NeonBlue, fontSize = 14.sp)
        Text("• NETRUNNER RIG", color = NeonBlue, fontSize = 14.sp)
        Text("• CREDITS: 12,500", color = NeonBlue, fontSize = 14.sp)
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
    val coroutineScope = rememberCoroutineScope()
    val gameState by NetworkManager.gameState.collectAsState()
    
    // Check if there are any recent rolls from the network
    val latestNetworkRoll = gameState?.optJSONArray("recentRolls")?.let { rolls ->
        if (rolls.length() > 0) rolls.getJSONObject(0).optInt("result") else null
    }

    var isRolling by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxHeight()
            .background(GlassBackground, RoundedCornerShape(8.dp))
            .border(1.dp, NeonRed.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("3D DICE ROLLER", color = Color.Gray, fontSize = 12.sp, modifier = Modifier.align(Alignment.Start))
        
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            Text(if (isRolling) "ROLLING..." else "D20", color = NeonRed, fontSize = 48.sp, fontWeight = FontWeight.Bold)
        }
        
        Button(
            onClick = {
                coroutineScope.launch {
                    isRolling = true
                    delay(500) // fake animation
                    val result = Random.nextInt(1, 21)
                    NetworkManager.rollDice(result) // emit to server
                    isRolling = false
                }
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
            modifier = Modifier
                .fillMaxWidth()
                .border(2.dp, NeonRed, RoundedCornerShape(8.dp)),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("ROLL", color = NeonRed, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        if (latestNetworkRoll != null) {
            Text("RESULT: $latestNetworkRoll", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        } else {
            Text("READY", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun RemoteCommsSection(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxHeight()
            .background(GlassBackground, RoundedCornerShape(8.dp))
            .border(1.dp, NeonBlue.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        Text("REMOTE COMMS (AGORA RTC)", color = Color.Gray, fontSize = 12.sp)
        Spacer(modifier = Modifier.height(16.dp))
        
        // Real-world this would be an AndroidView wrapping io.agora.rtc.video.VideoCanvas
        VideoFeedCard("PLAYER 2 (RAVEN)", true)
        Spacer(modifier = Modifier.height(8.dp))
        VideoFeedCard("PLAYER 3 (DEX)", false)
        Spacer(modifier = Modifier.height(8.dp))
        VideoFeedCard("DM (NEXUS)", true)
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

package com.zerosum.rpg

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import org.json.JSONObject

// --- Data Models ---
data class RoomData(
    val id: String,
    val tag: String,
    val bounds: JSONObject,
    val metadata: JSONObject
)

data class GridCellData(
    val x: Int,
    val y: Int,
    val type: String,
    val roomId: String?
)

// --- Selective Border Modifier ---
fun Modifier.selectiveBorder(top: Boolean, bottom: Boolean, left: Boolean, right: Boolean, color: Color, strokeWidth: Float): Modifier = this.drawBehind {
    if (top) drawLine(color, Offset(0f, 0f), Offset(size.width, 0f), strokeWidth)
    if (bottom) drawLine(color, Offset(0f, size.height), Offset(size.width, size.height), strokeWidth)
    if (left) drawLine(color, Offset(0f, 0f), Offset(0f, size.height), strokeWidth)
    if (right) drawLine(color, Offset(size.width, 0f), Offset(size.width, size.height), strokeWidth)
}

// --- UI Components ---
@Composable
fun MapGeneratorSection(modifier: Modifier = Modifier) {
    val uiState by NetworkManager.uiState.collectAsStateWithLifecycle()
    
    // Fallback since raw JSON was removed in strict MVI refactor
    val gridJson: JSONObject? = null
    val roomsJson: JSONObject? = null

    Column(
        modifier = modifier
            .fillMaxHeight()
            .background(GlassBackground, RoundedCornerShape(8.dp))
            .selectiveBorder(true, true, true, true, NeonBlue.copy(alpha = 0.3f), 2f)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("TACTICAL MAP UPLINK", color = Color.Gray, fontSize = 12.sp)
        }
        
        Spacer(modifier = Modifier.height(16.dp))

        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("AWAITING INTEL...", color = Color.DarkGray, fontSize = 14.sp)
        }
    }
}

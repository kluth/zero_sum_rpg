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
    val mapState = uiState.map

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

        if (mapState != null && mapState.grid.isNotEmpty()) {
            Text("TARGET: ${mapState.archetype}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text("LAYOUT: GRID-BASED", color = NeonRed, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(12.dp))
            
            val maxGridX = remember(mapState.grid) { mapState.grid.maxOfOrNull { it.x } ?: 9 }
            val maxGridY = remember(mapState.grid) { mapState.grid.maxOfOrNull { it.y } ?: 9 }
            val columnsCount = maxGridX + 1

            val roomMap = remember(mapState.rooms) { mapState.rooms.associateBy { it.id } }
            val gridMap = remember(mapState.grid) { mapState.grid.associateBy { "${it.x},${it.y}" } }

            LazyVerticalGrid(
                columns = GridCells.Fixed(Math.max(1, columnsCount)), 
                modifier = Modifier.fillMaxWidth().aspectRatio(1f),
                horizontalArrangement = Arrangement.spacedBy(0.dp),
                verticalArrangement = Arrangement.spacedBy(0.dp)
            ) {
                val totalCells = columnsCount * (maxGridY + 1)
                items(totalCells) { index ->
                    val x = index % columnsCount
                    val y = index / columnsCount
                    val cell = gridMap["$x,$y"]
                    val room = cell?.roomId?.let { roomMap[it] }
                    
                    val isRevealed = room?.revealed ?: false

                    if (cell != null && isRevealed) {
                        val hasN = gridMap["$x,${y - 1}"]?.roomId?.let { roomMap[it]?.revealed } == true
                        val hasS = gridMap["$x,${y + 1}"]?.roomId?.let { roomMap[it]?.revealed } == true
                        val hasE = gridMap["${x + 1},$y"]?.roomId?.let { roomMap[it]?.revealed } == true
                        val hasW = gridMap["${x - 1},$y"]?.roomId?.let { roomMap[it]?.revealed } == true

                        Box(
                            modifier = Modifier
                                .aspectRatio(1f)
                                .background(NeonBlue.copy(alpha = 0.15f))
                                .selectiveBorder(!hasN, !hasS, !hasW, !hasE, NeonBlue, 4f),
                            contentAlignment = Alignment.Center
                        ) {
                            if (room?.threat == "critical") {
                                Text("!", color = NeonRed, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .aspectRatio(1f)
                                .background(Color(0xFF111111))
                                .selectiveBorder(true, true, true, true, Color.DarkGray.copy(alpha=0.2f), 1f)
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(10.dp).background(NeonRed))
                Spacer(modifier = Modifier.width(8.dp))
                Text("CRITICAL THREAT DETECTED", color = Color.Gray, fontSize = 10.sp)
            }
        } else {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("AWAITING INTEL...", color = Color.DarkGray, fontSize = 14.sp)
            }
        }
    }
}

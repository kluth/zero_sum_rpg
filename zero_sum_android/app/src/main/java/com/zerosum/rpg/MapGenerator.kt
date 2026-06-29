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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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

// --- Colors ---
// SilkCoolGray and SilkIndigo are provided by SilkComponents.kt
private val SilkViolet = Color(0xFF7C3AED)
private val SilkTextDark = Color(0xFF1E293B)
private val SilkTextMuted = Color(0xFF64748B)

// --- Neomorphic Modifiers ---
fun Modifier.neomorphicBlock(
    cornerRadius: Float = 24f,
    blurRadius: Float = 16f,
    offset: Float = 8f
) = this.drawBehind {
    val bgColor = android.graphics.Color.argb(255, 232, 234, 240)
    drawIntoCanvas { canvas ->
        val paint = Paint()
        val frameworkPaint = paint.asFrameworkPaint()

        frameworkPaint.color = bgColor
        frameworkPaint.setShadowLayer(blurRadius, -offset, -offset, android.graphics.Color.WHITE)
        canvas.drawRoundRect(0f, 0f, size.width, size.height, cornerRadius, cornerRadius, paint)

        frameworkPaint.color = bgColor
        frameworkPaint.setShadowLayer(blurRadius, offset, offset, android.graphics.Color.argb(120, 166, 171, 180))
        canvas.drawRoundRect(0f, 0f, size.width, size.height, cornerRadius, cornerRadius, paint)
    }
}

fun Modifier.neomorphicTray(
    cornerRadius: Float = 24f,
    blurRadius: Float = 12f,
    offset: Float = 6f
) = this.drawBehind {
    val bgColor = android.graphics.Color.argb(255, 232, 234, 240)
    drawIntoCanvas { canvas ->
        val paint = Paint()
        val frameworkPaint = paint.asFrameworkPaint()
        
        // Base fill
        frameworkPaint.color = bgColor
        frameworkPaint.style = android.graphics.Paint.Style.FILL
        frameworkPaint.setShadowLayer(0f, 0f, 0f, 0)
        canvas.drawRoundRect(0f, 0f, size.width, size.height, cornerRadius, cornerRadius, paint)
        
        canvas.save()
        val path = android.graphics.Path()
        path.addRoundRect(
            0f, 0f, size.width, size.height,
            cornerRadius, cornerRadius,
            android.graphics.Path.Direction.CW
        )
        canvas.nativeCanvas.clipPath(path)
        
        // Inner shadows via strokes outside the bounds
        frameworkPaint.style = android.graphics.Paint.Style.STROKE
        frameworkPaint.strokeWidth = offset * 2
        
        // Dark inner shadow (top-left)
        frameworkPaint.color = android.graphics.Color.TRANSPARENT
        frameworkPaint.setShadowLayer(blurRadius, offset, offset, android.graphics.Color.argb(120, 166, 171, 180))
        canvas.drawRoundRect(0f, 0f, size.width, size.height, cornerRadius, cornerRadius, paint)
        
        // Light inner shadow (bottom-right)
        frameworkPaint.color = android.graphics.Color.TRANSPARENT
        frameworkPaint.setShadowLayer(blurRadius, -offset, -offset, android.graphics.Color.WHITE)
        canvas.drawRoundRect(0f, 0f, size.width, size.height, cornerRadius, cornerRadius, paint)
        
        canvas.restore()
    }
}

// --- UI Components ---
@Composable
fun MapGeneratorSection(modifier: Modifier = Modifier) {
    val uiState by NetworkManager.uiState.collectAsStateWithLifecycle()
    val mapState = uiState.map

    Column(
        modifier = modifier
            .fillMaxHeight()
            .background(SilkCoolGray)
            .neomorphicBlock(cornerRadius = 32f, blurRadius = 20f, offset = 10f)
            .padding(24.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("DISTRICT SCHEMATIC", color = SilkTextMuted, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 1.sp)
        }
        
        Spacer(modifier = Modifier.height(16.dp))

        if (mapState != null && mapState.grid.isNotEmpty()) {
            Text("SECTOR: ${mapState.archetype}", color = SilkTextDark, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Text("STATUS: PHYSICAL SURVEY", color = SilkIndigo, fontSize = 12.sp, fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(24.dp))
            
            val maxGridX = remember(mapState.grid) { mapState.grid.maxOfOrNull { it.x } ?: 9 }
            val maxGridY = remember(mapState.grid) { mapState.grid.maxOfOrNull { it.y } ?: 9 }
            val columnsCount = maxGridX + 1

            val roomMap = remember(mapState.rooms) { mapState.rooms.associateBy { it.id } }
            val gridMap = remember(mapState.grid) { mapState.grid.associateBy { "${it.x},${it.y}" } }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .neomorphicTray(cornerRadius = 24f, blurRadius = 12f, offset = 6f)
                    .padding(16.dp)
            ) {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(Math.max(1, columnsCount)), 
                    modifier = Modifier.fillMaxSize(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val totalCells = columnsCount * (maxGridY + 1)
                    items(totalCells) { index ->
                        val x = index % columnsCount
                        val y = index / columnsCount
                        val cell = gridMap["$x,$y"]
                        val room = cell?.roomId?.let { roomMap[it] }
                        
                        val isRevealed = room?.revealed ?: false

                        if (cell != null && isRevealed) {
                            Box(
                                modifier = Modifier
                                    .aspectRatio(1f)
                                    .neomorphicBlock(cornerRadius = 12f, blurRadius = 6f, offset = 3f),
                                contentAlignment = Alignment.Center
                            ) {
                                if (room?.threat == "critical") {
                                    Box(
                                        modifier = Modifier
                                            .size(12.dp)
                                            .clip(RoundedCornerShape(50))
                                            .background(SilkIndigo)
                                    )
                                }
                            }
                        } else {
                            Box(
                                modifier = Modifier
                                    .aspectRatio(1f)
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .clip(RoundedCornerShape(50))
                        .background(SilkIndigo)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text("CRISIS HAZARD POINT", color = SilkTextMuted, fontSize = 12.sp, fontWeight = FontWeight.Medium)
            }
        } else {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("SURVEYING DISTRICT...", color = SilkTextMuted, fontSize = 14.sp, fontWeight = FontWeight.Medium)
            }
        }
    }
}

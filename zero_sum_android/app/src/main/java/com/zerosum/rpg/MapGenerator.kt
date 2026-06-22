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
data class RoomNode(
    val x: Int,
    val y: Int,
    val name: String,
    val complication: String,
    val revealedTo: JSONObject,
    val visibleTo: JSONObject,
    val entities: JSONArray
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("x", x)
            put("y", y)
            put("name", name)
            put("complication", complication)
            put("revealedTo", revealedTo)
            put("visibleTo", visibleTo)
            put("entities", entities)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): RoomNode {
            return RoomNode(
                x = json.optInt("x"),
                y = json.optInt("y"),
                name = json.optString("name"),
                complication = json.optString("complication"),
                revealedTo = json.optJSONObject("revealedTo") ?: JSONObject(),
                visibleTo = json.optJSONObject("visibleTo") ?: JSONObject(),
                entities = json.optJSONArray("entities") ?: JSONArray()
            )
        }
    }
}

data class FacilityMap(
    val archetype: String,
    val layoutStructure: String,
    val rooms: List<RoomNode>
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("archetype", archetype)
            put("layoutStructure", layoutStructure)
            val jsonRooms = JSONArray()
            rooms.forEach { jsonRooms.put(it.toJson()) }
            put("rooms", jsonRooms)
        }
    }

    companion object {
        fun fromJson(json: JSONObject?): FacilityMap? {
            if (json == null) return null
            val archetype = json.optString("archetype", "")
            if (archetype.isEmpty()) return null
            val layout = json.optString("layoutStructure", "")
            val roomsArray = json.optJSONArray("rooms") ?: JSONArray()
            val roomsList = mutableListOf<RoomNode>()
            for (i in 0 until roomsArray.length()) {
                roomsList.add(RoomNode.fromJson(roomsArray.getJSONObject(i)))
            }
            return FacilityMap(archetype, layout, roomsList)
        }
    }
}

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
    
    val currentMap = FacilityMap.fromJson(uiState.json?.optJSONObject("map"))

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

        currentMap?.let { map ->
            Text("TARGET: ${map.archetype.uppercase()}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text("LAYOUT: ${map.layoutStructure.uppercase()}", color = NeonRed, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(12.dp))
            
            val roomsList = map.rooms
            
            LazyVerticalGrid(
                columns = GridCells.Fixed(8),
                modifier = Modifier.fillMaxWidth().aspectRatio(1f),
                horizontalArrangement = Arrangement.spacedBy(0.dp),
                verticalArrangement = Arrangement.spacedBy(0.dp)
            ) {
                items(64) { index ->
                    val x = index % 8
                    val y = index / 8
                    val room = roomsList.find { it.x == x && it.y == y }
                    
                    // FOG OF WAR LOGIC: Is it revealed to char_1?
                    val isRevealed = room?.revealedTo?.optBoolean("char_1", false) ?: false
                    val isVisible = room?.visibleTo?.optBoolean("char_1", false) ?: false

                    if (room != null && isRevealed) {
                        // Check neighbors for auto-tiling borders (only check revealed neighbors!)
                        val hasN = roomsList.find { it.x == x && it.y == y - 1 && it.revealedTo.optBoolean("char_1") } != null
                        val hasS = roomsList.find { it.x == x && it.y == y + 1 && it.revealedTo.optBoolean("char_1") } != null
                        val hasE = roomsList.find { it.x == x + 1 && it.y == y && it.revealedTo.optBoolean("char_1") } != null
                        val hasW = roomsList.find { it.x == x - 1 && it.y == y && it.revealedTo.optBoolean("char_1") } != null

                        Box(
                            modifier = Modifier
                                .aspectRatio(1f)
                                .background(NeonBlue.copy(alpha = 0.15f))
                                .selectiveBorder(!hasN, !hasS, !hasW, !hasE, NeonBlue, 4f),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                if (room.complication != "Clear") {
                                    Text("!", color = NeonRed, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                }
                                if (isVisible && room.entities.length() > 0) {
                                    Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                        for (i in 0 until room.entities.length()) {
                                            Box(modifier = Modifier.size(4.dp).background(Color(0xFF00FF00), RoundedCornerShape(2.dp)))
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        // Empty/Fog of War Grid Cell
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
                Text("HOSTILE COMPLICATION DETECTED", color = Color.Gray, fontSize = 10.sp)
            }
        } ?: run {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("AWAITING INTEL...", color = Color.DarkGray, fontSize = 14.sp)
            }
        }
    }
}

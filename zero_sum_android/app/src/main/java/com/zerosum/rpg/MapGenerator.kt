package com.zerosum.rpg

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import org.json.JSONObject
import kotlin.random.Random

// --- Data Models ---
data class RoomNode(
    val id: Int,
    val name: String,
    val complication: String,
    val isObjective: Boolean
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("id", id)
            put("name", name)
            put("complication", complication)
            put("isObjective", isObjective)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): RoomNode {
            return RoomNode(
                id = json.optInt("id"),
                name = json.optString("name"),
                complication = json.optString("complication"),
                isObjective = json.optBoolean("isObjective")
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

// --- Generator Logic ---
object MapGeneratorLogic {
    private val archetypes = listOf(
        "Data Vault", "Executive Skyscraper", "Black-Site Laboratory",
        "Industrial Logistics Hub", "Underground Syndicate Den", "Abandoned Infrastructure"
    )

    private val layouts = listOf(
        "Linear Spoke", "Grid Matrix", "Vertical Descent", "Labyrinthine"
    )

    fun generateMap(): FacilityMap {
        val archetype = archetypes.random()
        val layout = layouts.random()
        val roomCount = Random.nextInt(5, 9)
        
        val rooms = mutableListOf<RoomNode>()
        for (i in 1..roomCount) {
            val isObjective = i == roomCount
            rooms.add(generateRoom(i, isObjective))
        }
        
        return FacilityMap(archetype, layout, rooms)
    }

    private fun generateRoom(id: Int, forceObjective: Boolean): RoomNode {
        val roomTypeRoll = Random.nextInt(1, 21)
        val name = when {
            forceObjective -> "The Vault / Primary Objective"
            roomTypeRoll <= 4 -> "Open-Plan Workspace"
            roomTypeRoll <= 7 -> "Security Checkpoint"
            roomTypeRoll <= 10 -> "Maintenance Corridors"
            roomTypeRoll <= 13 -> "Executive Offices"
            roomTypeRoll <= 16 -> "Server Farm"
            roomTypeRoll <= 18 -> "Breakroom / Cafeteria"
            roomTypeRoll == 19 -> "Power/Generator Room"
            else -> "The Vault / Primary Objective"
        }

        val compRoll = Random.nextInt(1, 11)
        val complication = when {
            compRoll <= 5 -> "Clear"
            compRoll == 6 -> "Automated Turret"
            compRoll == 7 -> "Biometric Lockdown"
            compRoll == 8 -> "Patrol Squad"
            compRoll == 9 -> "Environmental Hazard"
            else -> "Civilian Presence"
        }

        return RoomNode(id, name, complication, forceObjective || roomTypeRoll == 20)
    }
}

// --- UI Components ---
@Composable
fun MapGeneratorSection(modifier: Modifier = Modifier) {
    val gameState by NetworkManager.gameState.collectAsState()
    
    // Parse map from game state
    val currentMap = FacilityMap.fromJson(gameState?.optJSONObject("map"))

    Column(
        modifier = modifier
            .fillMaxHeight()
            .background(GlassBackground, RoundedCornerShape(8.dp))
            .border(1.dp, NeonBlue.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("TACTICAL MAP", color = Color.Gray, fontSize = 12.sp)
            Button(
                onClick = { 
                    val newMap = MapGeneratorLogic.generateMap()
                    NetworkManager.syncMap(newMap.toJson())
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                modifier = Modifier.border(1.dp, NeonBlue, RoundedCornerShape(4.dp)),
                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text("GENERATE", color = NeonBlue, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))

        currentMap?.let { map ->
            Text("TARGET: ${map.archetype.uppercase()}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text("LAYOUT: ${map.layoutStructure.uppercase()}", color = NeonRed, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(12.dp))
            
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(map.rooms) { room ->
                    RoomCard(room)
                }
            }
        } ?: run {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("AWAITING INTEL...", color = Color.DarkGray, fontSize = 14.sp)
            }
        }
    }
}

@Composable
fun RoomCard(room: RoomNode) {
    val borderColor = if (room.isObjective) NeonRed else NeonBlue.copy(alpha = 0.5f)
    val bgColor = if (room.isObjective) NeonRed.copy(alpha = 0.1f) else Color.Transparent

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(bgColor, RoundedCornerShape(4.dp))
            .border(1.dp, borderColor, RoundedCornerShape(4.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "[0${room.id}]",
            color = if (room.isObjective) NeonRed else NeonBlue,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.width(36.dp)
        )
        Column {
            Text(room.name, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            if (room.complication != "Clear") {
                Text("WARN: ${room.complication}", color = NeonRed, fontSize = 10.sp)
            } else {
                Text("STATUS: CLEAR", color = Color.Gray, fontSize = 10.sp)
            }
        }
    }
}

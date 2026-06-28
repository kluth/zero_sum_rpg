package com.zerosum.rpg

import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import org.json.JSONArray
import org.json.JSONObject
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import okhttp3.Response

data class FlatStats(
    val hp_current: Int = 100,
    val hp_max: Int = 100,
    val stress_current: Int = 0,
    val stress_max: Int = 100,
    val stealth_base: Int = 10,
    val stealth_total: Int = 10,
    val snr_threshold_base: Int = 10,
    val snr_threshold_total: Int = 10
)

data class CharacterState(
    val id: String = "char_1",
    val name: String = "KAIRO 'GHOST' CHEN",
    val role: String = "CYBER-INFILTRATOR",
    val stats: FlatStats = FlatStats(),
    val hacking: Int = 90,
    val reflexes: Int = 75,
    val tech: Int = 80
)

data class Roll(
    val player: String = "",
    val result: Int = 0,
    val timestamp: Long = 0L
)

data class MapRoom(
    val id: String,
    val name: String,
    val threat: String,
    val revealed: Boolean
)

data class GridCell(
    val x: Int,
    val y: Int,
    val roomId: String?,
    val material: String = "Concrete" // default solid
)

data class MapState(
    val archetype: String = "UNKNOWN",
    val grid: List<GridCell> = emptyList(),
    val rooms: List<MapRoom> = emptyList()
)

data class PlayerState(
    val character: CharacterState? = null,
    val recentRolls: List<Roll> = emptyList(),
    val map: MapState? = null,
    val dataUsed: Float = 14.2f,
    val dataLimit: Float = 150.0f
)

sealed class PlayerIntent {
    data class EmergencyHeal(val amount: Int) : PlayerIntent()
    data class InjectStress(val stressMultiplier: Int) : PlayerIntent()
    data class RollDice(val result: Int) : PlayerIntent()
    data class JoinSession(val sessionId: String) : PlayerIntent()
    object HostSession : PlayerIntent()
    data class SetupInitialProfile(val charState: CharacterState) : PlayerIntent()
}

object NetworkManager {
    private val database = FirebaseDatabase.getInstance("https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app").reference

    private val _uiState = MutableStateFlow(PlayerState())
    val uiState: StateFlow<PlayerState> = _uiState

    private var sessionId: String = "DEFAULT"
    private var valueEventListener: ValueEventListener? = null
    
    private var webSocket: WebSocket? = null
    private val client = OkHttpClient()

    fun connect(url: String = "") {
        if (url.isNotEmpty()) {
            try {
                val uri = java.net.URI(url)
                val host = uri.host ?: "10.0.2.2"
                val port = if (uri.port != -1) uri.port else 9000
                database.database.useEmulator(host, port)
                
                connectWebSocket(host)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
    
    private fun connectWebSocket(host: String) {
        val request = Request.Builder().url("ws://$host:8080/ws").build()
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val json = JSONObject(text)
                    if (json.has("data_used")) {
                        val used = json.getDouble("data_used").toFloat()
                        _uiState.value = _uiState.value.copy(dataUsed = used)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                t.printStackTrace()
            }
        })
    }
    
    fun pullData(amount: Float) {
        val newUsed = (_uiState.value.dataUsed + amount).coerceAtMost(_uiState.value.dataLimit)
        _uiState.value = _uiState.value.copy(dataUsed = newUsed)
        try {
            val json = JSONObject().apply {
                put("type", "pull_data")
                put("amount", amount)
            }
            webSocket?.send(json.toString())
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun resetState() {
        try {
            database.child("sessions/$sessionId/gameState/map").removeValue()
            database.child("sessions/$sessionId/gameState/recentRolls").removeValue()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun processIntent(intent: PlayerIntent) {
        when (intent) {
            is PlayerIntent.EmergencyHeal -> {
                val currentChar = _uiState.value.character ?: return
                val newHp = Math.min(currentChar.stats.hp_max, currentChar.stats.hp_current + intent.amount)
                database.child("sessions/$sessionId/gameState/characters/${currentChar.id}/stats/hp_current").setValue(newHp)
                logTrauma(currentChar.name, intent.amount)
            }
            is PlayerIntent.InjectStress -> {
                val currentChar = _uiState.value.character ?: return
                val newStress = Math.min(currentChar.stats.stress_max, currentChar.stats.stress_current + (10 * intent.stressMultiplier))
                database.child("sessions/$sessionId/gameState/characters/${currentChar.id}/stats/stress_current").setValue(newStress)
            }
            is PlayerIntent.RollDice -> {
                rollDice(intent.result)
            }
            is PlayerIntent.JoinSession -> {
                joinSession(intent.sessionId)
            }
            is PlayerIntent.HostSession -> {
                hostSession()
            }
            is PlayerIntent.SetupInitialProfile -> {
                val char = intent.charState
                val charData = mapOf(
                    "id" to char.id,
                    "name" to char.name,
                    "role" to char.role,
                    "stats" to mapOf(
                        "hp_current" to char.stats.hp_current,
                        "hp_max" to char.stats.hp_max,
                        "stress_current" to char.stats.stress_current,
                        "stress_max" to char.stats.stress_max,
                        "stealth_base" to char.stats.stealth_base,
                        "stealth_total" to char.stats.stealth_total,
                        "snr_threshold_base" to char.stats.snr_threshold_base,
                        "snr_threshold_total" to char.stats.snr_threshold_total
                    )
                )
                database.child("sessions/$sessionId/gameState/characters/${char.id}").setValue(charData)
            }
        }
    }

    private fun parseCharacterState(map: Map<*, *>): CharacterState? {
        val chars = map["characters"] as? Map<*, *> ?: return null
        val charId = "char_1"
        val rawChar = chars[charId] as? Map<*, *> ?: chars.values.firstOrNull() as? Map<*, *> ?: return null
        val rawId = rawChar["id"] as? String ?: charId
        
        val rawStats = rawChar["stats"] as? Map<*, *>
        val flatStats = FlatStats(
            hp_current = (rawStats?.get("hp_current") as? Number)?.toInt() ?: (rawChar["hp"] as? Number)?.toInt() ?: 100,
            hp_max = (rawStats?.get("hp_max") as? Number)?.toInt() ?: 100,
            stress_current = (rawStats?.get("stress_current") as? Number)?.toInt() ?: (rawChar["stress"] as? Number)?.toInt() ?: 0,
            stress_max = (rawStats?.get("stress_max") as? Number)?.toInt() ?: 100,
            stealth_base = (rawStats?.get("stealth_base") as? Number)?.toInt() ?: (rawChar["stealth"] as? Number)?.toInt() ?: 10,
            stealth_total = (rawStats?.get("stealth_total") as? Number)?.toInt() ?: (rawChar["stealth"] as? Number)?.toInt() ?: 10,
            snr_threshold_base = (rawStats?.get("snr_threshold_base") as? Number)?.toInt() ?: 10,
            snr_threshold_total = (rawStats?.get("snr_threshold_total") as? Number)?.toInt() ?: 10
        )
        
        return CharacterState(
            id = rawId,
            name = rawChar["name"] as? String ?: "KAIRO 'GHOST' CHEN",
            role = rawChar["role"] as? String ?: "CYBER-INFILTRATOR",
            stats = flatStats
        )
    }

    fun hostSession(): String {
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        val newSessionId = (1..6).map { chars.random() }.joinToString("")
        joinSession(newSessionId)
        return newSessionId
    }

    private fun parseMapState(stateMap: Map<*, *>): MapState? {
        val mapData = stateMap["map"] as? Map<*, *> ?: return null
        val archetype = mapData["archetype"] as? String ?: "UNKNOWN"
        val gridList = mutableListOf<GridCell>()
        val roomList = mutableListOf<MapRoom>()

        val rooms = mapData["rooms"] as? Map<*, *>
        rooms?.forEach { (k, v) ->
            val roomId = k as? String ?: return@forEach
            val roomObj = v as? Map<*, *> ?: return@forEach
            val metadata = roomObj["metadata"] as? Map<*, *>
            val revealedTo = metadata?.get("revealedTo") as? Map<*, *>
            val isRevealed = revealedTo?.get("char_1") as? Boolean ?: false
            val threat = metadata?.get("threat") as? String ?: "none"
            roomList.add(MapRoom(roomId, roomId, threat, isRevealed))
        }

        val grid = mapData["grid"] as? Map<*, *>
        grid?.forEach { (k, v) ->
            val keyStr = k as? String ?: return@forEach
            val parts = keyStr.split(",")
            if (parts.size == 2) {
                val x = parts[0].toIntOrNull() ?: 0
                val y = parts[1].toIntOrNull() ?: 0
                val cellObj = v as? Map<*, *>
                val roomId = cellObj?.get("room_id") as? String
                val material = cellObj?.get("material") as? String ?: "Drywall"
                gridList.add(GridCell(x, y, roomId, material))
            }
        }
        return MapState(archetype, gridList, roomList)
    }

    fun joinSession(newSessionId: String) {
        valueEventListener?.let {
            database.child("sessions/$sessionId/gameState").removeEventListener(it)
        }
        sessionId = newSessionId
        _uiState.value = PlayerState(null)
        
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (snapshot.exists()) {
                    try {
                        val stateMap = snapshot.value as? Map<*, *>
                        if (stateMap != null) {
                            val charState = parseCharacterState(stateMap)
                            val mapState = parseMapState(stateMap)
                            _uiState.value = _uiState.value.copy(
                                character = charState,
                                map = mapState
                            )
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }

            override fun onCancelled(error: DatabaseError) {
                error.toException().printStackTrace()
            }
        }
        valueEventListener = listener
        database.child("sessions/$sessionId/gameState").addValueEventListener(listener)
    }

    private fun logTrauma(player: String, amount: Int) {
        val traumaRef = database.child("sessions/$sessionId/gameState/traumaLog").push()
        val names = listOf("ELIAS VANCE", "S. NAKAMURA", "R. VANCE", "M. KLEMENT", "J. DOE", "L. CHEN")
        val ages = (18..75).random()
        val jobs = listOf("MAINTENANCE", "CLERK", "TEACHER", "ENGINEER", "MEDIC", "UNEMPLOYED")
        val family = listOf("SURVIVED BY 2 DAUGHTERS", "NO KNOWN NEXT OF KIN", "SURVIVED BY SPOUSE", "SURVIVED BY 1 SON")
        val victimDossier = "${names.random()}, $ages. ${jobs.random()}. ${family.random()}."
        traumaRef.setValue(mapOf(
            "player" to player,
            "amount" to amount,
            "timestamp" to System.currentTimeMillis(),
            "civilian" to victimDossier
        ))
    }

    private fun rollDice(result: Int) {
        val currentRolls = _uiState.value.recentRolls
        val newRoll = Roll("Ghost", result, System.currentTimeMillis())
        val newRollsList = mutableListOf(newRoll)
        newRollsList.addAll(currentRolls.take(9))
        
        val newRollsMapList = newRollsList.map { roll ->
            mapOf("player" to roll.player, "result" to roll.result, "timestamp" to roll.timestamp)
        }
        
        database.child("sessions/$sessionId/gameState/recentRolls").setValue(newRollsMapList)
    }

    fun disconnect() {
        valueEventListener?.let {
            database.child("sessions/$sessionId/gameState").removeEventListener(it)
        }
        valueEventListener = null
        try {
            webSocket?.close(1000, "App disconnecting")
        } catch (e: Exception) {}
        webSocket = null
        try {
            client.dispatcher.executorService.shutdown()
            client.connectionPool.evictAll()
        } catch (e: Exception) {}
    }

    fun incrementHeatLevel() {
        database.child("sessions/$sessionId/gameState/heatLevel").setValue(com.google.firebase.database.ServerValue.increment(1))
    }
}

package com.zerosum.rpg

import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import org.json.JSONArray
import org.json.JSONObject

data class PlayerState(val json: JSONObject? = null)

object NetworkManager {
    private val database = FirebaseDatabase.getInstance("https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app").reference

    private val _uiState = MutableStateFlow(PlayerState())
    val uiState: StateFlow<PlayerState> = _uiState

    private var sessionId: String = "DEFAULT"
    private var valueEventListener: ValueEventListener? = null

    fun resetState() {
        try {
            database.child("sessions/$sessionId/gameState/map").removeValue()
            database.child("sessions/$sessionId/gameState/recentRolls").removeValue()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun wrapValue(value: Any?): Any? {
        return when (value) {
            is Map<*, *> -> {
                val json = JSONObject()
                for ((k, v) in value) {
                    if (k is String) {
                        json.put(k, wrapValue(v))
                    }
                }
                json
            }
            is List<*> -> {
                val array = JSONArray()
                for (v in value) {
                    array.put(wrapValue(v))
                }
                array
            }
            else -> value
        }
    }

    fun connect(url: String = "") {
        if (url.isNotEmpty()) {
            try {
                val uri = java.net.URI(url)
                val host = uri.host ?: "10.0.2.2"
                val port = if (uri.port != -1) uri.port else 9000
                database.database.useEmulator(host, port)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        // Listener moved to joinSession()
    }

    fun hostSession(): String {
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        val newSessionId = (1..6).map { chars.random() }.joinToString("")
        joinSession(newSessionId)
        return newSessionId
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
                            val json = wrapValue(stateMap) as? JSONObject
                            _uiState.value = PlayerState(json)
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

    fun updateCharacter(profile: JSONObject) {
        val characterId = profile.optString("id").takeIf { it.isNotEmpty() } ?: profile.optString("characterId")
        if (characterId.isNotEmpty()) {
            val charData = mutableMapOf<String, Any>()
            val keys = profile.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                if (key != "id" && key != "characterId") {
                    charData[key] = profile.get(key)
                }
            }
            database.child("sessions/$sessionId/gameState/characters/$characterId").updateChildren(charData)
        }
    }

    fun logTrauma(player: String, amount: Int) {
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

    fun rollDice(result: Int) {
        val currentRolls = _uiState.value.json?.optJSONArray("recentRolls") ?: JSONArray()
        val newRoll = JSONObject().apply {
            put("player", "Ghost")
            put("result", result)
            put("timestamp", System.currentTimeMillis())
        }
        
        val newRollsList = mutableListOf<Map<String, Any>>()
        newRollsList.add(mapOf("player" to "Ghost", "result" to result, "timestamp" to System.currentTimeMillis()))
        
        for (i in 0 until minOf(9, currentRolls.length())) {
            val roll = currentRolls.getJSONObject(i)
            newRollsList.add(mapOf(
                "player" to roll.optString("player"),
                "result" to roll.optInt("result"),
                "timestamp" to roll.optLong("timestamp")
            ))
        }
        
        database.child("sessions/$sessionId/gameState/recentRolls").setValue(newRollsList)
    }

    fun syncMap(mapJson: JSONObject) {
        // Convert JSONObject to Map for Firebase
        val mapData = mapOf(
            "archetype" to mapJson.optString("archetype"),
            "layoutStructure" to mapJson.optString("layoutStructure"),
            "rooms" to mapJson.optJSONArray("rooms")?.let { jsonArray ->
                val list = mutableListOf<Map<String, Any>>()
                for (i in 0 until jsonArray.length()) {
                    val room = jsonArray.getJSONObject(i)
                    list.add(mapOf(
                        "id" to room.optInt("id"),
                        "name" to room.optString("name"),
                        "complication" to room.optString("complication"),
                        "isObjective" to room.optBoolean("isObjective")
                    ))
                }
                list
            }
        )
        database.child("sessions/$sessionId/gameState/map").setValue(mapData)
    }

    fun disconnect() {
        // Firebase handles this automatically, but we can remove listeners if needed
    }

    fun incrementHeatLevel() {
        database.child("sessions/$sessionId/gameState/heatLevel").setValue(com.google.firebase.database.ServerValue.increment(1))
    }
}

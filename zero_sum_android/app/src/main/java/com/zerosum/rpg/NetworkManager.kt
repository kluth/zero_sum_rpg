package com.zerosum.rpg

import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import org.json.JSONArray
import org.json.JSONObject

object NetworkManager {
    private val database = FirebaseDatabase.getInstance("https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app").reference

    private val _gameState = MutableStateFlow<JSONObject?>(null)
    val gameState: StateFlow<JSONObject?> = _gameState

    fun resetState() {
        try {
            database.child("gameState/map").removeValue()
            database.child("gameState/recentRolls").removeValue()
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
        database.child("gameState").addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (snapshot.exists()) {
                    try {
                        val stateMap = snapshot.value as? Map<*, *>
                        if (stateMap != null) {
                            val json = wrapValue(stateMap) as? JSONObject
                            _gameState.value = json
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }

            override fun onCancelled(error: DatabaseError) {
                error.toException().printStackTrace()
            }
        })
    }

    fun updateCharacter(profile: JSONObject) {
        val characterId = profile.optString("id").takeIf { it.isNotEmpty() } ?: profile.optString("characterId")
        if (characterId.isNotEmpty()) {
            val charData = mapOf(
                "name" to profile.optString("name"),
                "role" to profile.optString("role"),
                "hp" to profile.optInt("hp"),
                "stealth" to profile.optInt("stealth")
            )
            database.child("gameState/characters/$characterId").setValue(charData)
        }
    }

    fun rollDice(result: Int) {
        val currentRolls = _gameState.value?.optJSONArray("recentRolls") ?: JSONArray()
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
        
        database.child("gameState/recentRolls").setValue(newRollsList)
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
        database.child("gameState/map").setValue(mapData)
    }

    fun disconnect() {
        // Firebase handles this automatically, but we can remove listeners if needed
    }
}

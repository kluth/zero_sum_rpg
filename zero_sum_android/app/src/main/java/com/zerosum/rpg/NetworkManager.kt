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
    private val database = FirebaseDatabase.getInstance().reference

    private val _gameState = MutableStateFlow<JSONObject?>(null)
    val gameState: StateFlow<JSONObject?> = _gameState

    fun connect(url: String = "") {
        database.child("gameState").addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (snapshot.exists()) {
                    try {
                        val stateMap = snapshot.value as? Map<*, *>
                        if (stateMap != null) {
                            val jsonString = JSONObject(stateMap).toString()
                            _gameState.value = JSONObject(jsonString)
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

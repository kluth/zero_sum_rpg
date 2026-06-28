package com.zerosum.rpg

import android.nfc.cardemulation.HostApduService
import android.os.Bundle
import android.util.Log

class NfcHostCardEmulationService : HostApduService() {

    companion object {
        private const val TAG = "NfcHceService"
        // SELECT APDU command format
        private val SELECT_APDU_HEADER = byteArrayOf(
            0x00.toByte(), // CLA
            0xA4.toByte(), // INS
            0x04.toByte(), // P1
            0x00.toByte()  // P2
        )
        // Expected AID: F0010203040506
        private val AID = byteArrayOf(
            0xF0.toByte(), 0x01.toByte(), 0x02.toByte(), 0x03.toByte(),
            0x04.toByte(), 0x05.toByte(), 0x06.toByte()
        )
        // Success response
        private val SUCCESS_SW = byteArrayOf(0x90.toByte(), 0x00.toByte())
        // Error response
        private val UNKNOWN_CMD_SW = byteArrayOf(0x00.toByte(), 0x00.toByte())
    }

    override fun processCommandApdu(commandApdu: ByteArray, extras: Bundle?): ByteArray {
        Log.d(TAG, "Received APDU: ${commandApdu.toHex()}")

        if (isSelectApdu(commandApdu)) {
            Log.d(TAG, "SELECT APDU received, responding with Success and Identity payload")
            // Payload could be the current player's ID and connection info
            val payload = "ZERO_SUM_NFC_ID_SYNC".toByteArray(Charsets.UTF_8)
            return payload + SUCCESS_SW
        }
        
        return UNKNOWN_CMD_SW
    }

    override fun onDeactivated(reason: Int) {
        Log.d(TAG, "HCE Deactivated: reason=$reason")
    }

    private fun isSelectApdu(apdu: ByteArray): Boolean {
        if (apdu.size < SELECT_APDU_HEADER.size + AID.size) return false
        for (i in SELECT_APDU_HEADER.indices) {
            if (apdu[i] != SELECT_APDU_HEADER[i]) return false
        }
        return true
    }

    private fun ByteArray.toHex(): String = joinToString(separator = "") { eachByte -> "%02x".format(eachByte) }
}

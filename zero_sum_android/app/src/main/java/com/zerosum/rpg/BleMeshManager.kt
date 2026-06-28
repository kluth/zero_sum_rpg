package com.zerosum.rpg

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.*
import android.content.Context
import android.os.ParcelUuid
import android.util.Log
import java.util.UUID

@SuppressLint("MissingPermission")
class BleMeshManager(private val context: Context) {
    private val bluetoothManager: BluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager.adapter
    
    private var bleScanner: BluetoothLeScanner? = null
    private var bleAdvertiser: BluetoothLeAdvertiser? = null

    companion object {
        private const val TAG = "BleMeshManager"
        // Unique UUID for Zero Sum RPG Mesh
        val MESH_SERVICE_UUID: UUID = UUID.fromString("0000B81D-0000-1000-8000-00805F9B34FB")
        val PARCEL_UUID = ParcelUuid(MESH_SERVICE_UUID)
    }

    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult?) {
            super.onScanResult(callbackType, result)
            result?.let {
                val device = it.device
                val rssi = it.rssi
                val scanRecord = it.scanRecord
                val serviceData = scanRecord?.serviceData?.get(PARCEL_UUID)
                
                if (serviceData != null) {
                    val payload = String(serviceData, Charsets.UTF_8)
                    Log.d(TAG, "Discovered Mesh Node: ${device.address}, RSSI: $rssi, Payload: $payload")
                    // Propagate offline state update
                }
            }
        }

        override fun onScanFailed(errorCode: Int) {
            super.onScanFailed(errorCode)
            Log.e(TAG, "BLE Scan Failed: $errorCode")
        }
    }

    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            super.onStartSuccess(settingsInEffect)
            Log.d(TAG, "BLE Advertising started successfully.")
        }

        override fun onStartFailure(errorCode: Int) {
            super.onStartFailure(errorCode)
            Log.e(TAG, "BLE Advertising failed: $errorCode")
        }
    }

    fun startMeshNetworking(playerStatePayload: String) {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            Log.e(TAG, "Bluetooth is disabled or not supported.")
            return
        }

        bleScanner = bluetoothAdapter.bluetoothLeScanner
        bleAdvertiser = bluetoothAdapter.bluetoothLeAdvertiser

        // Start scanning for other nodes
        val scanFilter = ScanFilter.Builder()
            .setServiceUuid(PARCEL_UUID)
            .build()
        val scanSettings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()
        
        bleScanner?.startScan(listOf(scanFilter), scanSettings, scanCallback)
        Log.d(TAG, "BLE Mesh Scanner started.")

        // Start advertising own state
        val advertiseSettings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setConnectable(false)
            .setTimeout(0)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .build()

        // Payload max is very small for BLE advertising (usually 31 bytes minus headers)
        // We will broadcast a truncated payload or hash for offline verification
        val dataBytes = playerStatePayload.toByteArray(Charsets.UTF_8).take(16).toByteArray()
        val advertiseData = AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .setIncludeTxPowerLevel(false)
            .addServiceUuid(PARCEL_UUID)
            .addServiceData(PARCEL_UUID, dataBytes)
            .build()

        bleAdvertiser?.startAdvertising(advertiseSettings, advertiseData, advertiseCallback)
        Log.d(TAG, "BLE Mesh Advertiser started.")
    }

    fun stopMeshNetworking() {
        bleScanner?.stopScan(scanCallback)
        bleAdvertiser?.stopAdvertising(advertiseCallback)
        Log.d(TAG, "BLE Mesh stopped.")
    }
}

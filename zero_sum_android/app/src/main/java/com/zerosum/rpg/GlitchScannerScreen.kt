package com.zerosum.rpg

import android.Manifest
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import kotlin.random.Random

@androidx.annotation.OptIn(androidx.camera.core.ExperimentalGetImage::class)
@Composable
fun GlitchScannerScreen(onBarcodeScanned: (String) -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    var hasCameraPermission by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { granted -> hasCameraPermission = granted }
    )

    LaunchedEffect(Unit) {
        permissionLauncher.launch(Manifest.permission.CAMERA)
    }

    if (!hasCameraPermission) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("CAMERA PERMISSION REQUIRED", color = Color.Red, fontSize = 20.sp)
        }
        return
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AndroidView(
            factory = { ctx ->
                val previewView = PreviewView(ctx)
                val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                cameraProviderFuture.addListener({
                    val cameraProvider = cameraProviderFuture.get()
                    val preview = Preview.Builder().build().also {
                        it.setSurfaceProvider(previewView.surfaceProvider)
                    }

                    val options = BarcodeScannerOptions.Builder()
                        .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                        .build()
                    val scanner = BarcodeScanning.getClient(options)

                    val imageAnalyzer = ImageAnalysis.Builder()
                        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                        .build()
                        .also { analysis ->
                            analysis.setAnalyzer(ContextCompat.getMainExecutor(ctx)) { imageProxy: ImageProxy ->
                                val mediaImage = imageProxy.image
                                if (mediaImage != null) {
                                    val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
                                    scanner.process(image)
                                        .addOnSuccessListener { barcodes ->
                                            for (barcode in barcodes) {
                                                barcode.rawValue?.let { value ->
                                                    onBarcodeScanned(value)
                                                }
                                            }
                                        }
                                        .addOnFailureListener {
                                            Log.e("Scanner", "Barcode scanning failed", it)
                                        }
                                        .addOnCompleteListener {
                                            imageProxy.close()
                                        }
                                } else {
                                    imageProxy.close()
                                }
                            }
                        }

                    val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
                    try {
                        cameraProvider.unbindAll()
                        cameraProvider.bindToLifecycle(
                            lifecycleOwner, cameraSelector, preview, imageAnalyzer
                        )
                    } catch (e: Exception) {
                        Log.e("Scanner", "Use case binding failed", e)
                    }
                }, ContextCompat.getMainExecutor(ctx))
                previewView
            },
            modifier = Modifier.fillMaxSize()
        )

        // Glitch overlay effect
        val infiniteTransition = rememberInfiniteTransition()
        val glitchOffset by infiniteTransition.animateFloat(
            initialValue = 0f,
            targetValue = 100f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 200, easing = LinearEasing),
                repeatMode = RepeatMode.Restart
            )
        )
        val scanlineY by infiniteTransition.animateFloat(
            initialValue = 0f,
            targetValue = 2000f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 3000, easing = LinearEasing),
                repeatMode = RepeatMode.Restart
            )
        )

        Canvas(modifier = Modifier.fillMaxSize()) {
            // Draw static noise lines randomly
            for (i in 0..10) {
                val y = Random.nextFloat() * size.height
                val height = Random.nextFloat() * 10f
                drawRect(
                    color = Color.White.copy(alpha = 0.1f + Random.nextFloat() * 0.1f),
                    topLeft = Offset(0f, y),
                    size = Size(size.width, height)
                )
            }
            
            // Draw scanning line
            drawLine(
                color = TerminalGreen.copy(alpha = 0.8f),
                start = Offset(0f, scanlineY % size.height),
                end = Offset(size.width, scanlineY % size.height),
                strokeWidth = 4.dp.toPx()
            )

            // Draw viewfinder brackets
            val bracketLen = 100f
            val stroke = Stroke(width = 8f)
            val padding = 100f
            
            // Top Left
            drawLine(TerminalGreen, Offset(padding, padding), Offset(padding + bracketLen, padding), strokeWidth = 8f)
            drawLine(TerminalGreen, Offset(padding, padding), Offset(padding, padding + bracketLen), strokeWidth = 8f)
            
            // Top Right
            drawLine(TerminalGreen, Offset(size.width - padding, padding), Offset(size.width - padding - bracketLen, padding), strokeWidth = 8f)
            drawLine(TerminalGreen, Offset(size.width - padding, padding), Offset(size.width - padding, padding + bracketLen), strokeWidth = 8f)
            
            // Bottom Left
            drawLine(TerminalGreen, Offset(padding, size.height - padding), Offset(padding + bracketLen, size.height - padding), strokeWidth = 8f)
            drawLine(TerminalGreen, Offset(padding, size.height - padding), Offset(padding, size.height - padding - bracketLen), strokeWidth = 8f)
            
            // Bottom Right
            drawLine(TerminalGreen, Offset(size.width - padding, size.height - padding), Offset(size.width - padding - bracketLen, size.height - padding), strokeWidth = 8f)
            drawLine(TerminalGreen, Offset(size.width - padding, size.height - padding), Offset(size.width - padding, size.height - padding - bracketLen), strokeWidth = 8f)
        }
    }
}

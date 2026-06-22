package com.zerosum.rpg

import android.Manifest
import android.graphics.Bitmap
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.captureToImage
import androidx.test.rule.GrantPermissionRule
import org.json.JSONObject
import org.junit.Rule
import org.junit.Test
import java.io.File
import java.io.FileOutputStream

class ZeroSumPlaySessionTest {

    @get:Rule
    val permissionRule: GrantPermissionRule = GrantPermissionRule.grant(
        Manifest.permission.WRITE_EXTERNAL_STORAGE,
        Manifest.permission.READ_EXTERNAL_STORAGE
    )

    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    private fun captureScreenshot(filename: String) {
        val bitmap = composeTestRule.onRoot().captureToImage().asAndroidBitmap()
        val context = androidx.test.platform.app.InstrumentationRegistry.getInstrumentation().targetContext
        val dir = File(context.getExternalFilesDir(null), "screenshots")
        if (!dir.exists()) {
            dir.mkdirs()
        }
        val file = File(dir, filename)
        FileOutputStream(file).use { out ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }
    }

    @Test
    fun simulateThreePlaySessions() {
        // --- Play Session 1 ---
        // Verify initial state: Health 78, Stealth 85, AWAITING INTEL...
        composeTestRule.onNodeWithText("78/100").assertExists()
        composeTestRule.onNodeWithText("85/100").assertExists()
        composeTestRule.onNodeWithText("AWAITING INTEL...").assertExists()

        // Update character HP to 92 and Stealth to 95 via NetworkManager.updateCharacter()
        val updatedProfile = JSONObject().apply {
            put("id", "char_1")
            put("name", "KAIRO 'GHOST' CHEN")
            put("role", "CYBER-INFILTRATOR")
            put("hp", 92)
            put("stealth", 95)
        }
        NetworkManager.updateCharacter(updatedProfile)

        // Verify the UI reflects these updates (wait for recomposition)
        composeTestRule.waitUntil(timeoutMillis = 5000) {
            try {
                composeTestRule.onNodeWithText("92/100").assertExists()
                composeTestRule.onNodeWithText("95/100").assertExists()
                true
            } catch (e: AssertionError) {
                false
            }
        }

        // Capture a screenshot play_session_1.png saved to /sdcard/screenshots/
        captureScreenshot("play_session_1.png")

        // --- Play Session 2 ---
        // Click the "ROLL" button
        composeTestRule.onNodeWithText("ROLL").performClick()

        // Advance/wait for recomposition. Verify that the dice roller displays a result (displays "RESULT:")
        composeTestRule.waitUntil(timeoutMillis = 5000) {
            composeTestRule.onAllNodes(hasText("RESULT:", substring = true)).fetchSemanticsNodes().isNotEmpty()
        }

        // Capture a screenshot play_session_2.png saved to /sdcard/screenshots/
        captureScreenshot("play_session_2.png")

        // --- Play Session 3 ---
        // Click the "GENERATE" button
        composeTestRule.onNodeWithText("GENERATE").performClick()

        // Advance/wait for map sync. Verify that the tactical map shows generated details (e.g. TARGET, LAYOUT, and Room [01] card)
        composeTestRule.waitUntil(timeoutMillis = 5000) {
            composeTestRule.onAllNodes(hasText("TARGET:", substring = true)).fetchSemanticsNodes().isNotEmpty() &&
            composeTestRule.onAllNodes(hasText("LAYOUT:", substring = true)).fetchSemanticsNodes().isNotEmpty() &&
            composeTestRule.onAllNodes(hasText("[01]", substring = true)).fetchSemanticsNodes().isNotEmpty()
        }

        // Capture a screenshot play_session_3.png saved to /sdcard/screenshots/
        captureScreenshot("play_session_3.png")
    }
}

package com.telpos

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Handler
import android.os.Looper
import android.telephony.TelephonyManager
import androidx.core.content.ContextCompat
import java.net.HttpURLConnection
import java.net.URL

class CallReceiver : BroadcastReceiver() {

    companion object {
        // Track last call to avoid duplicate sends across multiple broadcasts
        private var lastPhone: String = ""
        private var lastPhoneTime: Long = 0
        private val pendingHandler = Handler(Looper.getMainLooper())
        private var pendingRunnable: Runnable? = null
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
        if (state != TelephonyManager.EXTRA_STATE_RINGING) return

        val hasCallLogPerm = ContextCompat.checkSelfPermission(
            context, Manifest.permission.READ_CALL_LOG
        ) == PackageManager.PERMISSION_GRANTED

        val rawNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)
            ?.takeIf { it.isNotBlank() }

        if (rawNumber != null) {
            // Got the number — cancel any pending delayed send and send now
            pendingRunnable?.let { pendingHandler.removeCallbacks(it) }
            pendingRunnable = null

            // Dedup: don't resend same number within 10 seconds
            val now = System.currentTimeMillis()
            if (rawNumber == lastPhone && now - lastPhoneTime < 10_000) return
            lastPhone = rawNumber
            lastPhoneTime = now

            sendToServerWithRetry(context, rawNumber)

        } else {
            // Number not yet available (Android 9+ two-broadcast pattern)
            // Schedule a send after 2s in case a second broadcast with the number arrives
            pendingRunnable?.let { pendingHandler.removeCallbacks(it) }

            val runnable = Runnable {
                // Still no number after 2s — send as Bilinmeyen only if no real number came
                if (lastPhone.isEmpty() || System.currentTimeMillis() - lastPhoneTime > 10_000) {
                    val unknown = "Bilinmeyen"
                    // Only send if permission is missing (otherwise we'd expect the number)
                    if (!hasCallLogPerm) {
                        PrefsHelper.saveLastCallAttempt(context, "İzin yok: READ_CALL_LOG", false)
                    } else {
                        sendToServerWithRetry(context, unknown)
                    }
                }
            }
            pendingRunnable = runnable
            pendingHandler.postDelayed(runnable, 2000)
        }
    }

    private fun sendToServerWithRetry(context: Context, phoneNumber: String, attempt: Int = 1) {
        Thread {
            val success = trySend(context, phoneNumber)
            if (!success && attempt < 3) {
                Thread.sleep(if (attempt == 1) 2000L else 5000L)
                sendToServerWithRetry(context, phoneNumber, attempt + 1)
            }
            if (attempt == 1) {
                PrefsHelper.saveLastCallAttempt(context, phoneNumber, success)
            }
        }.start()
    }

    private fun trySend(context: Context, phoneNumber: String): Boolean {
        return try {
            val serverUrl = PrefsHelper.getServerUrl(context)
            val url = URL("$serverUrl/api/incoming-call")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Cache-Control", "no-cache")
            connection.doOutput = true
            connection.connectTimeout = 8000
            connection.readTimeout = 8000
            val body = """{"phone":"$phoneNumber"}"""
            connection.outputStream.bufferedWriter().use { it.write(body) }
            val code = connection.responseCode
            connection.disconnect()
            code in 200..299
        } catch (e: Exception) {
            false
        }
    }
}

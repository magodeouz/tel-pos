package com.telpos

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import java.net.HttpURLConnection
import java.net.URL

class CallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
        if (state != TelephonyManager.EXTRA_STATE_RINGING) return

        // EXTRA_INCOMING_NUMBER can be null on Android 9+ without READ_CALL_LOG
        // or on some custom ROMs — fall back to "Bilinmeyen" so server still logs the event
        val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)
            ?.takeIf { it.isNotBlank() }
            ?: "Bilinmeyen"

        sendToServerWithRetry(context, incomingNumber)
    }

    private fun sendToServerWithRetry(context: Context, phoneNumber: String, attempt: Int = 1) {
        Thread {
            val success = trySend(context, phoneNumber)
            if (!success && attempt < 3) {
                // Retry after delay: 2s, 5s
                val delayMs = if (attempt == 1) 2000L else 5000L
                Thread.sleep(delayMs)
                sendToServerWithRetry(context, phoneNumber, attempt + 1)
            }
            // Save last call attempt for debug (visible in MainActivity)
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
            connection.doOutput = true
            connection.connectTimeout = 8000
            connection.readTimeout = 8000
            // Prevent Doze from deferring the request
            connection.setRequestProperty("Cache-Control", "no-cache")

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

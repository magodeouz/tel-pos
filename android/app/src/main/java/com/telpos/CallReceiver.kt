package com.telpos

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import java.net.HttpURLConnection
import java.net.URL

class CallReceiver : BroadcastReceiver() {

    companion object {
        // Simple dedup: same number within 5s = one ring, ignore repeats
        private var lastPhone = ""
        private var lastTime = 0L
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
        if (state != TelephonyManager.EXTRA_STATE_RINGING) return

        val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)
        if (incomingNumber.isNullOrBlank()) return

        // Dedup repeated RINGING broadcasts for the same call
        val now = System.currentTimeMillis()
        if (incomingNumber == lastPhone && now - lastTime < 5000) return
        lastPhone = incomingNumber
        lastTime = now

        // goAsync keeps the receiver alive until our network work finishes
        val pending = goAsync()
        Thread {
            try {
                sendToServerWithRetry(context, incomingNumber)
            } finally {
                pending.finish()
            }
        }.start()
    }

    private fun sendToServerWithRetry(context: Context, phoneNumber: String) {
        var attempt = 0
        while (attempt < 3) {
            if (trySend(context, phoneNumber)) return
            attempt++
            if (attempt < 3) Thread.sleep(if (attempt == 1) 1500L else 3000L)
        }
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

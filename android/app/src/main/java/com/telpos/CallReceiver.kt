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

        val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)
        if (!incomingNumber.isNullOrEmpty()) {
            sendToServer(context, incomingNumber)
        }
    }

    private fun sendToServer(context: Context, phoneNumber: String) {
        Thread {
            try {
                val serverUrl = PrefsHelper.getServerUrl(context)
                val url = URL("$serverUrl/api/incoming-call")
                val connection = url.openConnection() as HttpURLConnection

                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true
                connection.connectTimeout = 5000
                connection.readTimeout = 5000

                val body = """{"phone":"$phoneNumber"}"""
                connection.outputStream.bufferedWriter().use { it.write(body) }
                connection.responseCode
                connection.disconnect()
            } catch (e: Exception) {
                // Silently fail
            }
        }.start()
    }
}

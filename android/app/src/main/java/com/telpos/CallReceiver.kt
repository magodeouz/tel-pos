package com.telpos

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.CallLog
import android.telephony.TelephonyManager
import java.net.HttpURLConnection
import java.net.URL

class CallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
        if (state != TelephonyManager.EXTRA_STATE_RINGING) return

        // Android 9+: EXTRA_INCOMING_NUMBER removed from broadcast
        // Try intent first, fallback to call log query with delay
        val numberFromIntent = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)

        Thread {
            val phoneNumber = if (!numberFromIntent.isNullOrEmpty()) {
                numberFromIntent
            } else {
                // Wait briefly for call log to be updated
                Thread.sleep(800)
                getNumberFromCallLog(context)
            }

            // Send notification even if number is unknown
            sendToServer(context, phoneNumber ?: "Bilinmeyen")
        }.start()
    }

    private fun getNumberFromCallLog(context: Context): String? {
        return try {
            val cursor = context.contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                arrayOf(CallLog.Calls.NUMBER, CallLog.Calls.TYPE, CallLog.Calls.DATE),
                "${CallLog.Calls.TYPE} = ?",
                arrayOf(CallLog.Calls.INCOMING_TYPE.toString()),
                "${CallLog.Calls.DATE} DESC"
            )
            cursor?.use {
                if (it.moveToFirst()) {
                    it.getString(it.getColumnIndexOrThrow(CallLog.Calls.NUMBER))
                } else null
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun sendToServer(context: Context, phoneNumber: String) {
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
    }
}

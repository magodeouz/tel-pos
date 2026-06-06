package com.telpos

import android.content.Context
import android.content.SharedPreferences

object PrefsHelper {
    private const val PREFS_NAME = "tel_pos_prefs"
    private const val KEY_SERVER_URL = "server_url"
    private const val KEY_LAST_CALL_PHONE = "last_call_phone"
    private const val KEY_LAST_CALL_SUCCESS = "last_call_success"
    private const val KEY_LAST_CALL_TIME = "last_call_time"
    private const val DEFAULT_SERVER_URL = "https://tel-pos.oguzakpinar1997.workers.dev"

    private fun getPrefs(ctx: Context): SharedPreferences =
        ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun getServerUrl(ctx: Context): String {
        val saved = getPrefs(ctx).getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL
        // Normalize: strip trailing slash, ensure no duplicate port
        return saved.trimEnd('/')
    }

    fun saveServerUrl(ctx: Context, url: String) {
        getPrefs(ctx).edit().putString(KEY_SERVER_URL, url.trimEnd('/')).apply()
    }

    fun saveLastCallAttempt(ctx: Context, phone: String, success: Boolean) {
        getPrefs(ctx).edit()
            .putString(KEY_LAST_CALL_PHONE, phone)
            .putBoolean(KEY_LAST_CALL_SUCCESS, success)
            .putLong(KEY_LAST_CALL_TIME, System.currentTimeMillis())
            .apply()
    }

    fun getLastCallInfo(ctx: Context): Triple<String, Boolean, Long> {
        val prefs = getPrefs(ctx)
        return Triple(
            prefs.getString(KEY_LAST_CALL_PHONE, "-") ?: "-",
            prefs.getBoolean(KEY_LAST_CALL_SUCCESS, false),
            prefs.getLong(KEY_LAST_CALL_TIME, 0L)
        )
    }
}

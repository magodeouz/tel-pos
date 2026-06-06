package com.telpos

import android.content.Context
import android.content.SharedPreferences

object PrefsHelper {
    private const val PREFS_NAME = "tel_pos_prefs"
    private const val KEY_SERVER_URL = "server_url"
    // Default: CloudFlare Workers (production) — user lokal IP'ye değiştirebilir
    private const val DEFAULT_SERVER_URL = "https://tel-pos.vercel.app"

    private fun getPrefs(ctx: Context): SharedPreferences {
        return ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun getServerUrl(ctx: Context): String {
        return getPrefs(ctx).getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL
    }

    fun saveServerUrl(ctx: Context, url: String) {
        getPrefs(ctx).edit().putString(KEY_SERVER_URL, url).apply()
    }
}

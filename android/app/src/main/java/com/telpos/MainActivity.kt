package com.telpos

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.telpos.databinding.ActivityMainBinding
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private val PERMISSION_REQUEST_CODE = 100

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        requestPhonePermission()
        loadSettings()
        showLastCallStatus()

        binding.buttonSave.setOnClickListener { saveSettings() }
        binding.buttonTest.setOnClickListener { testConnection() }
    }

    override fun onResume() {
        super.onResume()
        showLastCallStatus()
        checkPermissionStatus()
    }

    private fun showLastCallStatus() {
        val (phone, success, time) = PrefsHelper.getLastCallInfo(this)
        if (time == 0L) return

        val timeStr = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date(time))
        val statusText = if (success) "✓ $phone ($timeStr) gönderildi"
                         else "✗ $phone ($timeStr) gönderilemedi!"
        Toast.makeText(this, statusText, Toast.LENGTH_LONG).show()
    }

    private fun requestPhonePermission() {
        val permissions = mutableListOf<String>()
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_PHONE_STATE)
            != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.READ_PHONE_STATE)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_CALL_LOG)
            != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.READ_CALL_LOG)
        }
        if (permissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toTypedArray(), PERMISSION_REQUEST_CODE)
        } else {
            // Both permissions granted
            checkPermissionStatus()
        }
    }

    private fun checkPermissionStatus() {
        val phoneOk = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED
        val callLogOk = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_CALL_LOG) == PackageManager.PERMISSION_GRANTED
        if (!phoneOk || !callLogOk) {
            Toast.makeText(
                this,
                "⚠️ UYARI: READ_CALL_LOG izni olmadan telefon numarası okunamaz! Ayarlar > Uygulamalar > Tel POS > İzinler'den verin.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    private fun loadSettings() {
        var current = PrefsHelper.getServerUrl(this)

        // Migrate old URLs
        if (current.contains("vercel.app") || current.contains("lumoria.tr")) {
            current = "https://tel-pos.oguzakpinar1997.workers.dev"
            PrefsHelper.saveServerUrl(this, current)
        }

        // Parse URL → show host and port separately
        val withoutProto = current.removePrefix("https://").removePrefix("http://")
        val parts = withoutProto.split(":")
        binding.editIP.setText(parts[0])
        binding.editPort.setText(if (parts.size > 1) parts[1] else "443")
    }

    private fun saveSettings() {
        val ip = binding.editIP.text.toString().trim()
        val port = binding.editPort.text.toString().trim()

        if (ip.isEmpty() || port.isEmpty()) {
            Toast.makeText(this, "IP ve Port boş bırakılamaz", Toast.LENGTH_SHORT).show()
            return
        }

        val protocol = if (port == "443") "https" else "http"
        // Don't include :443 for standard HTTPS — keeps URL clean
        val serverUrl = if (port == "443") "$protocol://$ip" else "$protocol://$ip:$port"
        PrefsHelper.saveServerUrl(this, serverUrl)
        Toast.makeText(this, "Ayarlar kaydedildi: $serverUrl", Toast.LENGTH_LONG).show()
    }

    private fun testConnection() {
        val ip = binding.editIP.text.toString().trim()
        val port = binding.editPort.text.toString().trim()

        if (ip.isEmpty() || port.isEmpty()) {
            Toast.makeText(this, "IP ve Port boş bırakılamaz", Toast.LENGTH_SHORT).show()
            return
        }

        val protocol = if (port == "443") "https" else "http"
        val serverUrl = if (port == "443") "$protocol://$ip" else "$protocol://$ip:$port"

        Toast.makeText(this, "Test ediliyor...", Toast.LENGTH_SHORT).show()

        Thread {
            try {
                val url = URL("$serverUrl/api/health")
                val connection = url.openConnection() as HttpURLConnection
                connection.connectTimeout = 5000
                connection.readTimeout = 5000
                val responseCode = connection.responseCode
                connection.disconnect()

                runOnUiThread {
                    if (responseCode == 200) {
                        Toast.makeText(this, "✓ Sunucuya bağlandı ($serverUrl)", Toast.LENGTH_LONG).show()
                    } else {
                        Toast.makeText(this, "✗ Sunucu hatası: HTTP $responseCode", Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this, "✗ Bağlantı başarısız: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }.start()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            val denied = grantResults.indices.filter {
                grantResults[it] != PackageManager.PERMISSION_GRANTED
            }.map { permissions[it] }

            if (denied.isNotEmpty()) {
                Toast.makeText(
                    this,
                    "İzin verilmedi: ${denied.joinToString()}. Aramalar algılanamaz.",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
}

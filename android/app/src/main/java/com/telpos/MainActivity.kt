package com.telpos

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.telpos.databinding.ActivityMainBinding
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private val PERMISSION_REQUEST_CODE = 100

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        requestPhonePermission()
        loadSettings()

        binding.buttonSave.setOnClickListener {
            saveSettings()
        }

        binding.buttonTest.setOnClickListener {
            testConnection()
        }
    }

    private fun requestPhonePermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.READ_PHONE_STATE
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.READ_PHONE_STATE),
                    PERMISSION_REQUEST_CODE
                )
            }
        }
    }

    private fun loadSettings() {
        val serverUrl = PrefsHelper.getServerUrl(this)
        val parts = serverUrl.replace("http://", "").replace("https://", "").split(":")
        if (parts.size >= 2) {
            binding.editIP.setText(parts[0])
            binding.editPort.setText(parts[1])
        } else {
            binding.editIP.setText("tel-pos.vercel.app")
            binding.editPort.setText("443")
        }
    }

    private fun saveSettings() {
        val ip = binding.editIP.text.toString().trim()
        val port = binding.editPort.text.toString().trim()

        if (ip.isEmpty() || port.isEmpty()) {
            Toast.makeText(this, "IP ve Port boş bırakılamaz", Toast.LENGTH_SHORT).show()
            return
        }

        val protocol = if (port == "443") "https" else "http"
        val serverUrl = "$protocol://$ip:$port"
        PrefsHelper.saveServerUrl(this, serverUrl)
        Toast.makeText(this, "Ayarlar kaydedildi", Toast.LENGTH_SHORT).show()
    }

    private fun testConnection() {
        val ip = binding.editIP.text.toString().trim()
        val port = binding.editPort.text.toString().trim()

        if (ip.isEmpty() || port.isEmpty()) {
            Toast.makeText(this, "IP ve Port boş bırakılamaz", Toast.LENGTH_SHORT).show()
            return
        }

        val protocol = if (port == "443") "https" else "http"
        val serverUrl = "$protocol://$ip:$port"

        Thread {
            try {
                val url = URL("$serverUrl/api/printer/status")  // public endpoint
                val connection = url.openConnection() as HttpURLConnection
                connection.connectTimeout = 3000
                connection.readTimeout = 3000
                val responseCode = connection.responseCode
                connection.disconnect()

                runOnUiThread {
                    if (responseCode == 200) {
                        Toast.makeText(this, "✓ Sunucuya bağlandı", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this, "✗ Sunucu hatası: $responseCode", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this, "✗ Bağlantı başarısız: ${e.message}", Toast.LENGTH_SHORT)
                        .show()
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
            if (grantResults.isEmpty() || grantResults[0] != PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "Telefon durumu izni gereklidir", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

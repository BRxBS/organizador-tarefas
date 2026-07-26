package com.anonymous.org

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.util.Log

class CronometroModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "CronometroModule"

    private val tickReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val tempo = intent.getLongExtra(CronometroService.EXTRA_TEMPO, 0L)
            enviarEventoParaRN(tempo)
        }
    }

    init {
        val filter = IntentFilter(CronometroService.BROADCAST_TICK)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactContext.registerReceiver(tickReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            reactContext.registerReceiver(tickReceiver, filter)
        }
    }

    @ReactMethod
    fun iniciar() {
        val intent = Intent(reactContext, CronometroService::class.java).apply {
            action = CronometroService.ACTION_INICIAR
        }
        reactContext.startForegroundService(intent)
        Log.d("CRONOMETRO", "RN chamou iniciar")
    }

    @ReactMethod
    fun pausar() {
        val intent = Intent(reactContext, CronometroService::class.java).apply {
            action = CronometroService.ACTION_PAUSAR
        }
        reactContext.startService(intent)
        Log.d("CRONOMETRO", "RN chamou pausar")
    }

    @ReactMethod
    fun resetar() {
        val intent = Intent(reactContext, CronometroService::class.java).apply {
            action = CronometroService.ACTION_RESETAR
        }
        reactContext.startService(intent)
        Log.d("CRONOMETRO", "RN chamou resetar")
    }

    @ReactMethod
    fun getEstado(promise: com.facebook.react.bridge.Promise) {
        val map = Arguments.createMap().apply {
            putDouble("tempo", CronometroService.tempoDecorrido.toDouble())
            putBoolean("rodando", CronometroService.rodando)
        }
        promise.resolve(map)
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    private fun enviarEventoParaRN(tempo: Long) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("CronometroTick", tempo.toDouble())
    }

    override fun invalidate() {
        try {
            reactContext.unregisterReceiver(tickReceiver)
        } catch (e: Exception) {
            Log.e("CRONOMETRO", "Erro ao desregistrar receiver: ${e.message}")
        }
        super.invalidate()
    }
}
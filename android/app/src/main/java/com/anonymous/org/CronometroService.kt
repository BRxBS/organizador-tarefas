package com.anonymous.org

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.os.Handler
import android.os.Looper
import androidx.core.app.NotificationCompat
import android.util.Log

class CronometroService : Service() {

    companion object {
        const val CHANNEL_ID = "cronometro_channel"
        const val NOTIFICATION_ID = 42
        const val ACTION_INICIAR = "ACTION_INICIAR"
        const val ACTION_PAUSAR = "ACTION_PAUSAR"
        const val ACTION_RESETAR = "ACTION_RESETAR"
        const val BROADCAST_TICK = "com.anonymous.org.CRONOMETRO_TICK"
        const val EXTRA_TEMPO = "extra_tempo_ms"

        var tempoDecorrido: Long = 0L
        var rodando: Boolean = false
    }

    private val handler = Handler(Looper.getMainLooper())
    private var tempoInicio: Long = 0L

    private val ticker = object : Runnable {
        override fun run() {
            if (rodando) {
                tempoDecorrido = System.currentTimeMillis() - tempoInicio
                atualizarNotificacao()
                enviarTickParaRN()
                handler.postDelayed(this, 100)
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        criarCanalNotificacao()

        when (intent?.action) {
            ACTION_INICIAR -> iniciar()
            ACTION_PAUSAR -> pausar()
            ACTION_RESETAR -> resetar()
        }

        return START_NOT_STICKY // não reinicia sozinho se o sistema matar
    }

    private fun iniciar() {
        if (!rodando) {
            rodando = true
            tempoInicio = System.currentTimeMillis() - tempoDecorrido
            startForeground(NOTIFICATION_ID, criarNotificacao())
            handler.post(ticker)
            Log.d("CRONOMETRO", "Iniciado")
        }
    }

    private fun pausar() {
        if (rodando) {
            rodando = false
            handler.removeCallbacks(ticker)
            atualizarNotificacao()
            Log.d("CRONOMETRO", "Pausado em ${tempoDecorrido}ms")
        }
    }

    private fun resetar() {
        rodando = false
        tempoDecorrido = 0L
        handler.removeCallbacks(ticker)
        enviarTickParaRN()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        Log.d("CRONOMETRO", "Resetado")
    }

    private fun enviarTickParaRN() {
        val intent = Intent(BROADCAST_TICK).apply {
            putExtra(EXTRA_TEMPO, tempoDecorrido)
            setPackage(packageName)
        }
        sendBroadcast(intent)
    }

    private fun formatarTempo(ms: Long): String {
        val totalSegundos = ms / 1000
        val horas = totalSegundos / 3600
        val minutos = (totalSegundos % 3600) / 60
        val segundos = totalSegundos % 60
        return if (horas > 0) {
            String.format("%02d:%02d:%02d", horas, minutos, segundos)
        } else {
            String.format("%02d:%02d", minutos, segundos)
        }
    }

    private fun criarNotificacao(): Notification {
        val abrirAppIntent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse("org://screens/cronometro")).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        val abrirAppPendingIntent = PendingIntent.getActivity(
            this, 0, abrirAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val pausarIntent = Intent(this, CronometroService::class.java).apply {
            action = if (rodando) ACTION_PAUSAR else ACTION_INICIAR
        }
        val pausarPendingIntent = PendingIntent.getService(
            this, 1, pausarIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val resetarIntent = Intent(this, CronometroService::class.java).apply {
            action = ACTION_RESETAR
        }
        val resetarPendingIntent = PendingIntent.getService(
            this, 2, resetarIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Cronômetro")
            .setContentText(formatarTempo(tempoDecorrido))
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(abrirAppPendingIntent)
            .addAction(0, if (rodando) "Pausar" else "Continuar", pausarPendingIntent)
            .addAction(0, "Resetar", resetarPendingIntent)
            .setOngoing(rodando)
            .setOnlyAlertOnce(true)
            .build()
    }

    private fun atualizarNotificacao() {
        val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, criarNotificacao())
    }

    private fun criarCanalNotificacao() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Cronômetro",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Notificação do cronômetro em andamento"
            setSound(null, null)
        }
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    override fun onDestroy() {
        rodando = false
        tempoDecorrido = 0L
        handler.removeCallbacks(ticker)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
package com.anonymous.org

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val alarmId = intent.getIntExtra("alarmId", 0)
        Log.d("ALARM_DEBUG", "Alarme $alarmId disparou! Preparando notificação full-screen...")

        val taskId = alarmId / 10
        val alarmUri = Uri.parse("org://screens/alarm?taskId=$taskId")
        val fullScreenIntent = Intent(Intent.ACTION_VIEW, alarmUri).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            setPackage(context.packageName)
        }

        val fullScreenPendingIntent = PendingIntent.getActivity(
            context, alarmId, fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val channelId = "alarm_channel"
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId, "Alarmes", NotificationManager.IMPORTANCE_HIGH
            ).apply {
                setBypassDnd(true)
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("Alarme")
            .setContentText("Toque para abrir")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setContentIntent(fullScreenPendingIntent) // <-- adicione isso: torna a notificação clicável
            .setAutoCancel(true)
            .build()

        notificationManager.notify(alarmId, notification)

        // Reagenda para daqui 7 dias (recorrência semanal)
        val triggerAtMillis = intent.getLongExtra("triggerAtMillis", 0L)
        if (triggerAtMillis > 0) {
            val proximoDisparo = triggerAtMillis + (7 * 24 * 60 * 60 * 1000L)
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val reagendarIntent = Intent(context, AlarmReceiver::class.java).apply {
                putExtra("alarmId", alarmId)
                putExtra("triggerAtMillis", proximoDisparo)
            }
            val reagendarPendingIntent = PendingIntent.getBroadcast(
                context, alarmId, reagendarIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            try {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, proximoDisparo, reagendarPendingIntent)
                Log.d("ALARM_DEBUG", "Alarme $alarmId reagendado para $proximoDisparo")
            } catch (e: SecurityException) {
                Log.e("ALARM_DEBUG", "Erro ao reagendar alarme $alarmId")
            }
        }
    }
}
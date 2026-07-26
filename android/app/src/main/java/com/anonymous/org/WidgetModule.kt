package com.anonymous.org

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context

class WidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "WidgetModule"

    @ReactMethod
    fun updateWidget() {
        Log.d("WIDGET_DEBUG", "Comando do RN chegou no Kotlin!")

        // Atualiza widget 1 (MyWidgetProvider)
        val intent1 = Intent(reactApplicationContext, MyWidgetProvider::class.java)
        intent1.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        val ids1 = AppWidgetManager.getInstance(reactApplicationContext)
            .getAppWidgetIds(ComponentName(reactApplicationContext, MyWidgetProvider::class.java))
        intent1.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids1)
        reactApplicationContext.sendBroadcast(intent1)

        // Atualiza widget 2 (ChecklistWidgetProvider)
        ChecklistWidgetProvider.forcarAtualizacao(reactApplicationContext)
    }

    @ReactMethod
    fun setExactAlarm(timeInMillis: Double, alarmId: Int) {
        val triggerAtMillis = timeInMillis.toLong()
        val alarmManager = reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        val intent = Intent(reactApplicationContext, AlarmReceiver::class.java).apply {
            putExtra("alarmId", alarmId)
            putExtra("triggerAtMillis", triggerAtMillis) // usado pra reagendar +7 dias depois
        }

        val pendingIntent = PendingIntent.getBroadcast(
            reactApplicationContext, alarmId, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
            Log.d("ALARM_DEBUG", "Alarme $alarmId agendado para $triggerAtMillis")
        } catch (e: SecurityException) {
            Log.e("ALARM_DEBUG", "Erro: permissão de alarme exato negada")
        }
    }
    @ReactMethod
    fun cancelAlarm(alarmId: Int) {
        val alarmManager = reactApplicationContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(reactApplicationContext, AlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            reactApplicationContext,
            alarmId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
        pendingIntent.cancel()
        Log.d("ALARM_DEBUG", "Alarme $alarmId cancelado")
    }
}
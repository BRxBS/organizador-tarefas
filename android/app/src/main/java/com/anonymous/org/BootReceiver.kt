package com.anonymous.org

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.d("WIDGET_DEBUG", "Boot detectado — reagendando alarme do widget")

            // Força o onUpdate do widget, que por sua vez chama scheduleNextTransition
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(
                ComponentName(context, MyWidgetProvider::class.java)
            )

            if (ids.isNotEmpty()) {
                val updateIntent = Intent(context, MyWidgetProvider::class.java).apply {
                    action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                    putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                }
                context.sendBroadcast(updateIntent)
            }
        }
    }
}
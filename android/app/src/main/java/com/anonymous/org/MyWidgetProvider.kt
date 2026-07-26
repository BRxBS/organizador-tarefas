package com.anonymous.org

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.widget.RemoteViews
import java.io.File
import java.util.Calendar
import android.content.ComponentName

class MyWidgetProvider : AppWidgetProvider() {

    // ADICIONE ESTA FUNÇÃO:
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        // Se receber o sinal de UPDATE (seja do sistema ou do seu WidgetModule)
        if (intent.action == AppWidgetManager.ACTION_APPWIDGET_UPDATE) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, MyWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

            // Força a chamada do onUpdate manualmente
            onUpdate(context, appWidgetManager, appWidgetIds)
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        Log.d("WIDGET_DEBUG", "onUpdate chamado")
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    // Chamado quando o celular reinicia — reagenda o próximo alarme
    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        Log.d("WIDGET_DEBUG", "onEnabled: primeiro widget adicionado")
        scheduleNextTransition(context)
        solicitarPermissaoAlarme(context)
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.my_widget_layout)

        // 1. DATA DINÂMICA
        val calendar = Calendar.getInstance()
        val diaSemanaNum = calendar.get(Calendar.DAY_OF_WEEK) // 1 = Domingo, 2 = Segunda...
        val diasNomes = arrayOf("DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO")

        // Ajuste: Calendar.DAY_OF_WEEK começa em 1 (Domingo), então subtraímos 1 para o índice do array
        val nomeDiaAtual = diasNomes[diaSemanaNum - 1]
        views.setTextViewText(R.id.widget_dia_semana, nomeDiaAtual)

        // 2. HORA ATUAL
        val horaAtual = String.format("%02d:%02d", calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE))

        // 3. CONFIGURAÇÃO DO BOTÃO (CRONÔMETRO)
        val cronometroIntent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse("org://screens/cronometro")).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val cronometroPendingIntent = PendingIntent.getActivity(
            context, 1, cronometroIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_btn_cronometro, cronometroPendingIntent)

        val db = abrirBanco(context)
        if (db == null) {
            views.setTextViewText(R.id.widget_lista_tarefas, "Erro ao abrir banco")
            appWidgetManager.updateAppWidget(appWidgetId, views)
            return
        }

        try {
            // 4. QUERY CORRIGIDA (Meia-noite + Filtro por Dia da Semana)
            // diaSemanaNum no banco geralmente é 0-6 ou 1-7. Ajuste conforme sua tabela tarefa_dias.
            // Se no seu banco Domingo é 0, use (diaSemanaNum - 1)
            val diaParaQuery = diaSemanaNum - 1

            val cursorGrupo = db.rawQuery(
                """
            SELECT id, nome, hora_inicio, hora_fim 
            FROM grupos 
            WHERE 
                (hora_inicio <= hora_fim AND hora_inicio <= ? AND hora_fim > ?)
                OR
                (hora_inicio > hora_fim AND (hora_inicio <= ? OR hora_fim > ?))
            LIMIT 1
            """,
                arrayOf(horaAtual, horaAtual, horaAtual, horaAtual)
            )

            if (cursorGrupo.moveToFirst()) {
                val grupoId = cursorGrupo.getInt(cursorGrupo.getColumnIndexOrThrow("id"))
                val grupoNome = cursorGrupo.getString(cursorGrupo.getColumnIndexOrThrow("nome"))
                val hInicio = cursorGrupo.getString(cursorGrupo.getColumnIndexOrThrow("hora_inicio"))
                val hFim = cursorGrupo.getString(cursorGrupo.getColumnIndexOrThrow("hora_fim"))

                views.setTextViewText(R.id.widget_nome_grupo, grupoNome.uppercase())
                views.setTextViewText(R.id.widget_horario_grupo, "$hInicio - $hFim")

                // Para a hora atual do sistema em 24h (usar H maiúsculo):
                val calendar = Calendar.getInstance()
                val horaAtual24h = String.format("%02d:%02d",
                    calendar.get(Calendar.HOUR_OF_DAY), // HOUR_OF_DAY é sempre 0-23
                    calendar.get(Calendar.MINUTE)
                )

                // 5. BUSCA TAREFAS DO GRUPO PARA O DIA ATUAL
                val cursorTarefas = db.rawQuery(
                    """
                SELECT t.nome
                FROM tarefas t
                INNER JOIN tarefa_dias td ON td.tarefa_id = t.id
                WHERE t.grupo_id = ? AND td.dia_semana = ?
                ORDER BY t.ordem ASC
                """,
                    arrayOf(grupoId.toString(), diaParaQuery.toString())
                )

                var tarefasTexto = ""
                if (cursorTarefas.moveToFirst()) {
                    do {
                        val nomeT = cursorTarefas.getString(0)
                        tarefasTexto += "• $nomeT\n"
                    } while (cursorTarefas.moveToNext())
                } else {
                    tarefasTexto = "Nenhuma tarefa para hoje."
                }
                views.setTextViewText(R.id.widget_lista_tarefas, tarefasTexto.trimEnd())
                cursorTarefas.close()
            } else {
                // Nenhum grupo ativo
                views.setTextViewText(R.id.widget_nome_grupo, "Intervalo")
                views.setTextViewText(R.id.widget_horario_grupo, "--:--")
                views.setTextViewText(R.id.widget_lista_tarefas, "")
            }
            cursorGrupo.close()

        } catch (e: Exception) {
            Log.e("WIDGET_DEBUG", "Erro: ${e.message}")
        } finally {
            db.close()
        }

        appWidgetManager.updateAppWidget(appWidgetId, views)
        scheduleNextTransition(context)
    }

    // Calcula o próximo horário de transição (inicio ou fim de algum grupo)
    // e agenda um alarme exato para esse momento
    private fun scheduleNextTransition(context: Context) {
        val db = abrirBanco(context) ?: return

        val calendar = Calendar.getInstance()
        val horaAtual = String.format(
            "%02d:%02d",
            calendar.get(Calendar.HOUR_OF_DAY),
            calendar.get(Calendar.MINUTE)
        )

        try {
            // Pega todos os horários de inicio e fim dos grupos,
            // ordenados, e encontra o próximo após agora
            val cursor = db.rawQuery(
                """
                SELECT hora_inicio as horario FROM grupos
                UNION
                SELECT hora_fim as horario FROM grupos
                ORDER BY horario ASC
                """,
                null
            )

            var proximoHorario: String? = null

            if (cursor.moveToFirst()) {
                do {
                    val h = cursor.getString(0)
                    if (h > horaAtual) {
                        proximoHorario = h
                        break
                    }
                } while (cursor.moveToNext())
            }
            cursor.close()

            if (proximoHorario == null) {
                // Todos os horários já passaram hoje — agenda para o primeiro horário de amanhã
                val cursorAmanha = db.rawQuery(
                    """
                    SELECT MIN(hora_inicio) as primeiro FROM grupos
                    """,
                    null
                )
                if (cursorAmanha.moveToFirst()) {
                    proximoHorario = cursorAmanha.getString(0)
                }
                cursorAmanha.close()

                if (proximoHorario == null) {
                    Log.d("WIDGET_DEBUG", "Nenhum grupo cadastrado, alarme não agendado")
                    db.close()
                    return
                }

                // Adiciona 1 dia ao calendário
                calendar.add(Calendar.DAY_OF_YEAR, 1)
            }

            val partes = proximoHorario!!.split(":")
            calendar.set(Calendar.HOUR_OF_DAY, partes[0].toInt())
            calendar.set(Calendar.MINUTE, partes[1].toInt())
            calendar.set(Calendar.SECOND, 0)
            calendar.set(Calendar.MILLISECOND, 0)

            Log.d("WIDGET_DEBUG", "Próxima transição agendada para: $proximoHorario")

            agendarAlarme(context, calendar.timeInMillis)

        } catch (e: Exception) {
            Log.e("WIDGET_DEBUG", "Erro ao calcular próxima transição: ${e.message}")
        } finally {
            db.close()
        }
    }

    private fun agendarAlarme(context: Context, timeInMillis: Long) {
        val alarmManager = context.getSystemService(AlarmManager::class.java) ?: return

        val intent = Intent(context, MyWidgetProvider::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (alarmManager.canScheduleExactAlarms()) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP, timeInMillis, pendingIntent
                )
                Log.d("WIDGET_DEBUG", "Alarme exato agendado")
            } else {
                // Sem permissão: agenda aproximado (pode atrasar alguns minutos)
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP, timeInMillis, pendingIntent
                )
                Log.d("WIDGET_DEBUG", "Alarme aproximado agendado (sem permissão exata)")
                solicitarPermissaoAlarme(context)
            }
        } else {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP, timeInMillis, pendingIntent
            )
        }
    }

    private fun solicitarPermissaoAlarme(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = context.getSystemService(AlarmManager::class.java) ?: return
            if (!alarmManager.canScheduleExactAlarms()) {
                val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
            }
        }
    }

    // Busca o arquivo do banco SQLite nos caminhos possíveis do Expo
    private fun abrirBanco(context: Context): SQLiteDatabase? {
        val dbName = "database.db"
        val path = context.getDatabasePath(dbName).absolutePath
        // O getDatabasePath já resolve o caminho /files/SQLite/ se configurado corretamente no Expo

        val f = File(path)
        if (f.exists()) {
            Log.d("WIDGET_DEBUG", "Banco encontrado em: $path")
            // REMOVA O OPEN_READONLY e use os sinalizadores abaixo para lidar com WAL
            return SQLiteDatabase.openDatabase(
                path,
                null,
                SQLiteDatabase.OPEN_READWRITE // Abrir como RW ajuda o SQLite a sincronizar o log WAL
            )
        }

        // Tenta o caminho alternativo que apareceu no seu log se o de cima falhar
        val pathAlt = "/data/user/0/com.anonymous.org/files/SQLite/database.db"
        if (File(pathAlt).exists()) {
            return SQLiteDatabase.openDatabase(pathAlt, null, SQLiteDatabase.OPEN_READWRITE)
        }

        return null
    }
}
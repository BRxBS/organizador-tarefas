package com.anonymous.org

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.util.Log
import android.widget.RemoteViews
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class ChecklistWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_TOGGLE_CHECK = "com.anonymous.org.ACTION_TOGGLE_CHECK"
        const val EXTRA_TAREFA_ID = "extra_tarefa_id"
        const val EXTRA_GRUPO_ID = "extra_grupo_id"
        const val EXTRA_CHECKED = "extra_checked"

        // Chamado externamente (pelo WidgetModule e pelo BootReceiver)
        fun forcarAtualizacao(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(
                ComponentName(context, ChecklistWidgetProvider::class.java)
            )
            if (ids.isNotEmpty()) {
                val intent = Intent(context, ChecklistWidgetProvider::class.java).apply {
                    action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                    putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                }
                context.sendBroadcast(intent)
            }
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == ACTION_TOGGLE_CHECK) {
            val tarefaId = intent.getIntExtra(EXTRA_TAREFA_ID, -1)
            val grupoId = intent.getIntExtra(EXTRA_GRUPO_ID, -1)
            val estavaChecked = intent.getBooleanExtra(EXTRA_CHECKED, false)

            if (tarefaId != -1 && grupoId != -1) {
                toggleCheck(context, tarefaId, grupoId, estavaChecked)
            }
            // Redesenha todos os widgets após o toggle
            forcarAtualizacao(context)
            return
        }
        super.onReceive(context, intent)
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        Log.d("WIDGET_DEBUG", "ChecklistWidget onUpdate chamado")
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun toggleCheck(
        context: Context,
        tarefaId: Int,
        grupoId: Int,
        estavaChecked: Boolean
    ) {
        val db = abrirBanco(context, readOnly = false) ?: return
        val hoje = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

        try {
            if (estavaChecked) {
                // Estava marcado → desmarca
                db.execSQL(
                    "DELETE FROM tarefa_check_sessao WHERE tarefa_id = ? AND grupo_id = ? AND data = ?",
                    arrayOf(tarefaId, grupoId, hoje)
                )
                Log.d("WIDGET_DEBUG", "Desmarcado: tarefa=$tarefaId grupo=$grupoId")
            } else {
                // Não estava marcado → marca
                db.execSQL(
                    """
                    INSERT OR IGNORE INTO tarefa_check_sessao (tarefa_id, grupo_id, data) 
                    VALUES (?, ?, ?)
                    """,
                    arrayOf(tarefaId, grupoId, hoje)
                )
                Log.d("WIDGET_DEBUG", "Marcado: tarefa=$tarefaId grupo=$grupoId")
            }
        } catch (e: Exception) {
            Log.e("WIDGET_DEBUG", "Erro ao toggle check: ${e.message}")
        } finally {
            db.close()
        }
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_checklist_layout)

        val calendar = Calendar.getInstance()
        val diaSemanaNum = calendar.get(Calendar.DAY_OF_WEEK) - 1
        val diasNomes = arrayOf("DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO")
        val hoje = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

        val horaAtual = String.format(
            "%02d:%02d",
            calendar.get(Calendar.HOUR_OF_DAY),
            calendar.get(Calendar.MINUTE)
        )

        views.setTextViewText(R.id.checklist_dia_semana, diasNomes[diaSemanaNum])

        val db = abrirBanco(context) ?: run {
            views.setTextViewText(R.id.checklist_nome_grupo, "")
            views.setTextViewText(R.id.checklist_horario_grupo, "")
            views.setEmptyView(R.id.checklist_lista, android.R.id.empty)
            appWidgetManager.updateAppWidget(appWidgetId, views)
            return
        }

        try {
            // Busca grupo ativo agora
            val cursorGrupo = db.rawQuery(
                """
                SELECT id, nome, hora_inicio, hora_fim
                FROM grupos
                WHERE hora_inicio <= ? AND hora_fim > ?
                LIMIT 1
                """,
                arrayOf(horaAtual, horaAtual)
            )

            if (!cursorGrupo.moveToFirst()) {
                Log.d("WIDGET_DEBUG", "Checklist: nenhum grupo ativo às $horaAtual")
                views.setTextViewText(R.id.checklist_nome_grupo, "")
                views.setTextViewText(R.id.checklist_horario_grupo, "")
                cursorGrupo.close()
                db.close()

                // Usa RemoteViews de lista vazia com mensagem
                val serviceIntent = Intent(context, ChecklistRemoteViewsService::class.java).apply {
                    putExtra("tarefas_ids", IntArray(0))
                    putExtra("tarefas_nomes", emptyArray<String>())
                    putExtra("tarefas_checks", BooleanArray(0))
                    putExtra("grupo_id", -1)
                }
                views.setRemoteAdapter(R.id.checklist_lista, serviceIntent)
                appWidgetManager.updateAppWidget(appWidgetId, views)
                return
            }

            val grupoId = cursorGrupo.getInt(cursorGrupo.getColumnIndexOrThrow("id"))
            val grupoNome = cursorGrupo.getString(cursorGrupo.getColumnIndexOrThrow("nome"))
            val horaInicio = cursorGrupo.getString(cursorGrupo.getColumnIndexOrThrow("hora_inicio"))
            val horaFim = cursorGrupo.getString(cursorGrupo.getColumnIndexOrThrow("hora_fim"))
            cursorGrupo.close()

            views.setTextViewText(R.id.checklist_nome_grupo, grupoNome.uppercase())
            views.setTextViewText(R.id.checklist_horario_grupo, "$horaInicio - $horaFim")

            // Busca tarefas + estado do check de hoje
            val cursorTarefas = db.rawQuery(
                """
                SELECT 
                    t.id,
                    t.nome,
                    CASE WHEN tcs.tarefa_id IS NOT NULL THEN 1 ELSE 0 END as checked
                FROM tarefas t
                INNER JOIN tarefa_dias td ON td.tarefa_id = t.id
                LEFT JOIN tarefa_check_sessao tcs 
                    ON tcs.tarefa_id = t.id 
                    AND tcs.grupo_id = ? 
                    AND tcs.data = ?
                WHERE t.grupo_id = ? AND td.dia_semana = ?
                ORDER BY t.id ASC
                """,
                arrayOf(grupoId.toString(), hoje, grupoId.toString(), diaSemanaNum.toString())
            )

            val ids = mutableListOf<Int>()
            val nomes = mutableListOf<String>()
            val checks = mutableListOf<Boolean>()

            if (cursorTarefas.moveToFirst()) {
                do {
                    ids.add(cursorTarefas.getInt(0))
                    nomes.add(cursorTarefas.getString(1))
                    checks.add(cursorTarefas.getInt(2) == 1)
                } while (cursorTarefas.moveToNext())
            }
            cursorTarefas.close()

            // Configura o RemoteViewsService (adapter da lista)
            val serviceIntent = Intent(context, ChecklistRemoteViewsService::class.java).apply {
                putExtra("tarefas_ids", ids.toIntArray())
                putExtra("tarefas_nomes", nomes.toTypedArray())
                putExtra("tarefas_checks", checks.toBooleanArray())
                putExtra("grupo_id", grupoId)
            }
            views.setRemoteAdapter(R.id.checklist_lista, serviceIntent)

            // Template de PendingIntent para o clique em cada item
            val clickIntent = Intent(context, ChecklistWidgetProvider::class.java).apply {
                action = ACTION_TOGGLE_CHECK
            }
            val clickPendingIntent = PendingIntent.getBroadcast(
                context, 0, clickIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
            )
            views.setPendingIntentTemplate(R.id.checklist_lista, clickPendingIntent)

        } catch (e: Exception) {
            Log.e("WIDGET_DEBUG", "Checklist erro: ${e.message}")
            views.setTextViewText(R.id.checklist_nome_grupo, "ERRO")
            views.setTextViewText(R.id.checklist_horario_grupo, e.message ?: "")
        } finally {
            db.close()
        }

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun abrirBanco(context: Context, readOnly: Boolean = true): SQLiteDatabase? {
        val dbName = "database.db"
        val caminhos = arrayOf(
            context.getDatabasePath(dbName).absolutePath,
            context.applicationInfo.dataDir + "/databases/SQLite/$dbName",
            context.filesDir.absolutePath + "/SQLite/$dbName",
            context.noBackupFilesDir.absolutePath + "/SQLite/$dbName"
        )
        for (path in caminhos) {
            val f = File(path)
            if (f.exists()) {
                val flag = if (readOnly) SQLiteDatabase.OPEN_READONLY else SQLiteDatabase.OPEN_READWRITE
                return SQLiteDatabase.openDatabase(f.absolutePath, null, flag)
            }
        }
        return null
    }
}
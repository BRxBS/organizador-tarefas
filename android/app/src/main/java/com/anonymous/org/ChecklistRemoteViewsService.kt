package com.anonymous.org

import android.content.Intent
import android.os.Bundle
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import android.graphics.Paint

class ChecklistRemoteViewsService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        return ChecklistFactory(intent)
    }

    inner class ChecklistFactory(private val intent: Intent) : RemoteViewsFactory {

        private var ids: IntArray = IntArray(0)
        private var nomes: Array<String> = emptyArray()
        private var checks: BooleanArray = BooleanArray(0)
        private var grupoId: Int = -1

        override fun onCreate() { carregarDados() }
        override fun onDataSetChanged() { carregarDados() }
        override fun onDestroy() {}

        private fun carregarDados() {
            ids = intent.getIntArrayExtra("tarefas_ids") ?: IntArray(0)
            @Suppress("UNCHECKED_CAST")
            nomes = intent.getStringArrayExtra("tarefas_nomes") ?: emptyArray()
            checks = intent.getBooleanArrayExtra("tarefas_checks") ?: BooleanArray(0)
            grupoId = intent.getIntExtra("grupo_id", -1)
        }

        override fun getCount(): Int = ids.size

        override fun getViewAt(position: Int): RemoteViews {
            val rv = RemoteViews(packageName, R.layout.widget_checklist_item)

            val nome = nomes.getOrNull(position) ?: ""
            val checked = checks.getOrNull(position) ?: false
            val tarefaId = ids.getOrNull(position) ?: -1

            // Texto com ou sem riscado
            rv.setTextViewText(R.id.checklist_item_nome, nome)
            if (checked) {
                rv.setInt(
                    R.id.checklist_item_nome,
                    "setPaintFlags",
                    Paint.STRIKE_THRU_TEXT_FLAG or Paint.ANTI_ALIAS_FLAG
                )
                rv.setTextColor(R.id.checklist_item_nome, 0xFF888888.toInt())
                rv.setImageViewResource(
                    R.id.checklist_item_icone,
                    android.R.drawable.checkbox_on_background
                )
            } else {
                rv.setInt(
                    R.id.checklist_item_nome,
                    "setPaintFlags",
                    Paint.ANTI_ALIAS_FLAG
                )
                rv.setTextColor(R.id.checklist_item_nome, 0xFFEEEEEE.toInt())
                rv.setImageViewResource(
                    R.id.checklist_item_icone,
                    android.R.drawable.checkbox_off_background
                )
            }

            // FillInIntent carrega os extras do clique nesse item específico
            val fillIn = Intent().apply {
                val extras = Bundle().apply {
                    putInt(ChecklistWidgetProvider.EXTRA_TAREFA_ID, tarefaId)
                    putInt(ChecklistWidgetProvider.EXTRA_GRUPO_ID, grupoId)
                    putBoolean(ChecklistWidgetProvider.EXTRA_CHECKED, checked)
                }
                putExtras(extras)
            }
            rv.setOnClickFillInIntent(R.id.checklist_item_container, fillIn)

            return rv
        }

        override fun getLoadingView(): RemoteViews? = null
        override fun getViewTypeCount(): Int = 1
        override fun getItemId(position: Int): Long = ids.getOrNull(position)?.toLong() ?: position.toLong()
        override fun hasStableIds(): Boolean = true
    }
}